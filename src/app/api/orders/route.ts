import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  isOrderPasswordConfigured,
  orderAccessCookieName,
  verifyOrderAccessSessionToken,
} from "@/lib/order-access";
import { getStoreProducts } from "@/lib/homepage-store";
import { getAllProducts } from "@/lib/catalog-store";
import { countStoreSkuUseCounts, normalizeStoreSku } from "@/lib/admin-product";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  CheckoutError,
  ensureLiveOrderSkuReadiness,
  priceCart,
  validateCustomer,
  validatePayment,
} from "@/lib/checkout/pricing";
import { checkoutError } from "@/lib/checkout/http";
import {
  razorpayConfig,
  razorpayRequest,
  type RazorpayOrder,
} from "@/lib/checkout/razorpay";
import { fulfilOrder } from "@/lib/checkout/fulfilment";
import { newOrderReference } from "@/lib/checkout/references";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  if (!isOrderPasswordConfigured())
    return NextResponse.json(
      { error: "Checkout is temporarily paused while access is set up." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  if (
    !verifyOrderAccessSessionToken(
      request.cookies.get(orderAccessCookieName)?.value,
    )
  )
    return NextResponse.json(
      { error: "Enter the store password before placing an order." },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );

  try {
    const body = await request.json().catch(() => {
      throw new CheckoutError("Invalid checkout request.");
    });
    if (!body || typeof body !== "object")
      throw new CheckoutError("Invalid checkout request.");
    const payment = validatePayment(body.payment);
    if (
      typeof body.checkoutKey !== "string" ||
      !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(
        body.checkoutKey,
      )
    )
      throw new CheckoutError(
        "Invalid checkout session. Please refresh and retry.",
      );
    const customer = validateCustomer(body.customer);
    const [storeProducts, adminProducts] = await Promise.all([
      getStoreProducts(),
      getAllProducts(),
    ]);
    const quote = priceCart(body.items, storeProducts);
    if (body.expectedAmount !== quote.amount)
      throw new CheckoutError(
        "Your bag prices have changed. Please refresh your bag before paying.",
        409,
      );
    const mode = process.env.RAZORPAY_MODE ?? "test";
    if (mode !== "live" && mode !== "test")
      throw new CheckoutError("Checkout is not configured.", 503);
    ensureLiveOrderSkuReadiness(quote.lines, mode);
    const config = razorpayConfig();
    if (!process.env.RAZORPAY_WEBHOOK_SECRET)
      throw new CheckoutError(
        "Online payments are not configured yet. Please try again later.",
        503,
      );
    const db = getSupabaseAdmin();
    if (!db)
      throw new CheckoutError("Checkout is temporarily unavailable.", 503);
    const storeSkuUseCounts = countStoreSkuUseCounts(adminProducts);
    const itemRows = quote.lines.map((l) => {
      const storeSku =
        adminProducts
          .find((product) => product.slug === l.product.slug)
          ?.variants.find(
            (variant) =>
              variant.size === l.variant.size &&
              variant.color === l.variant.color,
          )
          ?.storeSku?.trim() ?? "";
      if (
        mode === "live" &&
        (!storeSku || storeSkuUseCounts.get(normalizeStoreSku(storeSku)) !== 1)
      )
        throw new CheckoutError(
          "Live checkout is blocked until every size and colour has its own unique Store SKU from Qikink.",
          409,
        );

      return {
        product_id: l.product.id,
        product_slug: l.product.slug,
        product_name: l.product.name,
        line: l.product.line,
        // Store SKU is read from private admin data, never from the browser.
        sku: storeSku,
        size: l.variant.size,
        color: l.variant.color,
        quantity: l.quantity,
        unit_price: l.unitAmount / 100,
      };
    });
    const fingerprint = createHash("sha256")
      .update(
        JSON.stringify({
          customer,
          payment,
          mode,
          items: itemRows,
          amount: quote.amount,
        }),
      )
      .digest("hex");
    const created = await db.rpc("gamana_create_checkout", {
      p_order: {
        checkout_key: body.checkoutKey,
        request_fingerprint: fingerprint,
        order_number: newOrderReference(),
        email: customer.email,
        full_name: customer.fullName,
        phone: customer.phone,
        address1: customer.address1,
        address2: customer.address2,
        city: customer.city,
        province: customer.province,
        zip: customer.zip,
        payment_gateway: payment,
        payment_mode: mode,
        amount_paise: quote.amount,
        subtotal_paise: quote.subtotal,
        shipping_paise: quote.shipping,
      },
      p_items: itemRows,
    });
    if (created.error || !created.data)
      throw new CheckoutError(
        "Could not start this order. Please retry with the same checkout details, or refresh if you changed your bag.",
        503,
      );
    const read = await db
      .from("orders")
      .select("*")
      .eq("id", created.data)
      .single();
    if (read.error) throw read.error;
    const order = read.data;
    if (order.payment_status === "paid") {
      try {
        await fulfilOrder(order.id);
      } catch {
        console.error("Paid order awaiting fulfilment", order.order_number);
      }
    }
    if (!order.razorpay_order_id) {
      // Only one concurrent request can create/link a gateway order for this checkout.
      const claim = await db
        .from("orders")
        .update({ status: "payment-creating" })
        .eq("id", order.id)
        .eq("status", "payment-pending")
        .is("razorpay_order_id", null)
        .select("id")
        .maybeSingle();
      if (claim.error) throw claim.error;
      if (!claim.data)
        throw new CheckoutError(
          "Your checkout is being prepared. Retry in a moment with the same details.",
          409,
        );
      let gateway: RazorpayOrder;
      try {
        gateway = await razorpayRequest<RazorpayOrder>("orders", {
          amount: order.amount_paise,
          currency: "INR",
          receipt: order.order_number,
          partial_payment: false,
        });
        if (
          !/^order_[a-zA-Z0-9]+$/.test(gateway.id) ||
          gateway.amount !== order.amount_paise ||
          gateway.currency !== "INR"
        )
          throw new Error("Invalid provider order response.");
      } catch (error) {
        // No gateway order has been returned to a payer yet; an unused remote order is safe.
        await db
          .from("orders")
          .update({ status: "payment-pending" })
          .eq("id", order.id)
          .is("razorpay_order_id", null);
        throw error;
      }
      const linked = await db
        .from("orders")
        .update({ razorpay_order_id: gateway.id, status: "payment-pending" })
        .eq("id", order.id)
        .is("razorpay_order_id", null);
      if (linked.error) throw linked.error;
      order.razorpay_order_id = gateway.id;
    }
    return NextResponse.json(
      {
        orderNumber: order.order_number,
        paid: order.payment_status === "paid",
        testMode: mode === "test",
        razorpay: {
          keyId: config.keyId,
          orderId: order.razorpay_order_id,
          amount: order.amount_paise,
          currency: "INR",
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return checkoutError(error);
  }
}
