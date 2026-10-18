import { NextResponse } from "next/server";

import { products, resolveSku } from "@/data/catalog";
import { buildOrderNumber, createOrder, isConfigured } from "@/lib/qikink";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

interface IncomingItem {
  productSlug: string;
  size?: string;
  color?: string;
  quantity?: number;
}

interface IncomingCustomer {
  fullName?: string;
  email?: string;
  phone?: string;
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  zip?: string;
  countryCode?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[0-9+\-\s()]{8,18}$/;

export async function POST(request: Request) {
  let body: {
    items?: IncomingItem[];
    customer?: IncomingCustomer;
    payment?: "Prepaid" | "COD";
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const customer = body.customer ?? {};
  const payment = body.payment === "COD" ? "COD" : "Prepaid";
  const items = Array.isArray(body.items) ? body.items : [];

  /* — validation —————————————————————————————————————————————— */

  if (!items.length) {
    return NextResponse.json({ error: "Your bag is empty." }, { status: 400 });
  }
  if (!customer.fullName?.trim()) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (!EMAIL_RE.test(customer.email?.trim() ?? "")) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }
  if (!PHONE_RE.test(customer.phone?.trim() ?? "")) {
    return NextResponse.json(
      { error: "Please enter a valid phone number." },
      { status: 400 },
    );
  }
  if (!customer.address1?.trim() || !customer.city?.trim()) {
    return NextResponse.json(
      { error: "Please enter your delivery address." },
      { status: 400 },
    );
  }
  if (!customer.province?.trim() || !customer.zip?.trim()) {
    return NextResponse.json(
      { error: "Please enter your state and PIN code." },
      { status: 400 },
    );
  }

  /* — resolve lines against the server catalogue ——————————————— */

  const lines = items
    .map((item) => {
      const product = products.find((p) => p.slug === item.productSlug);
      if (!product) return null;
      const variant = product.variants.find(
        (v) =>
          (item.size ? v.size === item.size : true) &&
          (item.color ? v.color === item.color : true),
      );
      if (!variant) return null;
      const quantity = Math.max(
        1,
        Math.min(10, Math.floor(Number(item.quantity) || 1)),
      );
      return {
        product,
        variant,
        quantity,
        sku: resolveSku(product.slug, variant.sku),
        unitPrice: product.price,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  if (!lines.length) {
    return NextResponse.json(
      { error: "None of those items are available." },
      { status: 400 },
    );
  }

  const total = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  const orderNumber = buildOrderNumber("gm");

  const [firstName, ...restName] = customer.fullName!.trim().split(/\s+/);
  const lastName = restName.join(" ") || "Customer";

  /* — persist ————————————————————————————————————————————————— */

  const supabase = getSupabaseAdmin();
  let orderRowId: string | null = null;

  if (supabase) {
    const { data: orderRow, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        email: customer.email!.trim(),
        full_name: customer.fullName!.trim(),
        phone: customer.phone!.trim(),
        address1: customer.address1!.trim().slice(0, 90),
        address2: (customer.address2 ?? "").trim() || null,
        city: customer.city!.trim(),
        province: customer.province!.trim(),
        zip: customer.zip!.trim(),
        country_code: (customer.countryCode ?? "IN").trim().toUpperCase(),
        payment_gateway: payment,
        total_order_value: total,
        status: "placed",
      })
      .select("id")
      .single();

    if (orderError) {
      return NextResponse.json(
        { error: "Could not start the order. Try again shortly." },
        { status: 500 },
      );
    }
    orderRowId = orderRow?.id ?? null;

    await supabase.from("order_items").insert(
      lines.map((l) => ({
        order_id: orderRowId,
        product_id: l.product.id,
        product_slug: l.product.slug,
        product_name: l.product.name,
        line: l.product.line,
        sku: l.sku,
        size: l.variant.size,
        color: l.variant.color,
        quantity: l.quantity,
        unit_price: l.unitPrice,
      })),
    );
  }

  /* — push to Qikink for printing and shipping ———————————————— */

  let fulfilment: "qikink" | "pending" = "pending";
  let fulfilmentMessage =
    "Order received. We are confirming your order and will email you shortly.";

  if (isConfigured()) {
    const result = await createOrder({
      order_number: orderNumber,
      qikink_shipping: 1,
      gateway: payment,
      total_order_value: String(total),
      line_items: lines.map((l) => ({
        // The SKU already exists in the Qikink account's My Products, so the
        // design is resolved from there.
        search_from_my_products: 1,
        quantity: String(l.quantity),
        sku: l.sku,
        price: String(l.unitPrice),
      })),
      shipping_address: {
        first_name: firstName,
        last_name: lastName,
        address1: customer.address1!.trim().slice(0, 90),
        address2: (customer.address2 ?? "").trim(),
        phone: customer.phone!.trim(),
        email: customer.email!.trim(),
        city: customer.city!.trim(),
        zip: customer.zip!.trim(),
        province: customer.province!.trim(),
        country_code: (customer.countryCode ?? "IN").trim().toUpperCase(),
      },
    });

    if (result.ok) {
      fulfilment = "qikink";
      fulfilmentMessage =
        "Order confirmed. Your pieces are being printed and will ship in about three days.";
    }

    if (supabase && orderRowId) {
      await supabase
        .from("orders")
        .update({
          status: result.ok ? "confirmed" : "fulfilment-pending",
          qikink_order_id: result.orderId ?? null,
          qikink_reference: orderNumber,
          qikink_status: result.ok ? "Live" : (result.error ?? "error"),
        })
        .eq("id", orderRowId);
    }

    if (!result.ok) {
      console.error("Qikink order error:", result.error);
    }
  } else if (supabase && orderRowId) {
    await supabase
      .from("orders")
      .update({ status: "awaiting-fulfilment-config" })
      .eq("id", orderRowId);
  }

  return NextResponse.json({
    orderNumber,
    total,
    fulfilment,
    message: fulfilmentMessage,
  });
}
