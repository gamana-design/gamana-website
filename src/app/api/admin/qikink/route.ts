import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-session";
import {
  ping,
  listOrders,
  createOrder,
} from "@/lib/qikink";
import { logAdminAction } from "@/lib/catalog-store";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const reference = new URL(req.url).searchParams.get("reference");
  if (!reference) return NextResponse.json(await ping());

  const result = await listOrders({ orderReferenceNo: reference });
  if (!result.ok || !result.orders.length) return NextResponse.json(result);

  const qikinkOrder = result.orders[0];
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json(result);

  let query = await db
    .from("orders")
    .select("*, order_items(*)")
    .eq("qikink_reference", reference)
    .maybeSingle();
  if (!query.data)
    query = await db
      .from("orders")
      .select("*, order_items(*)")
      .eq("order_number", reference)
      .maybeSingle();
  const order = query.data;
  if (!order) return NextResponse.json(result);

  const status = String(qikinkOrder.status ?? "Unknown");
  const normalized = status.toLowerCase();
  const dispatched = /ship|dispatch|in transit|out for delivery|delivered/.test(
    normalized,
  );
  const tracking = qikinkOrder.shipping?.tracking_link ?? null;
  const awb = qikinkOrder.shipping?.awb ?? null;
  const updated = await db
    .from("orders")
    .update({
      qikink_status: status,
      ...(dispatched ? { status: "shipped" } : {}),
      ...(tracking ? { tracking_link: tracking } : {}),
      ...(awb ? { awb } : {}),
    })
    .eq("id", order.id);
  return NextResponse.json({ ...result, orderUpdated: !updated.error });
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await req.json();
    const productSku =
      body && typeof body.productSku === "string" ? body.productSku.trim() : "";
    if (!productSku)
      return NextResponse.json(
        { error: "Enter the Product SKU for this Qikink request." },
        { status: 400 },
      );

    const now = Date.now().toString(36);
    const line = {
      // Qikink confirms search=0 looks up Product SKU.
      search_from_my_products: 0 as const,
      print_type_id: Number(body.printTypeId ?? 1),
      quantity: String(body.quantity ?? "1"),
      sku: productSku,
      price: String(body.price ?? "1"),
      designs: [
        {
          design_code: String(body.designCode).slice(0, 20),
          width_inches: Number(body.widthInches ?? 12),
          height_inches: Number(body.heightInches ?? 15),
          placement_sku: body.placementSku ?? "fr",
          design_link: body.designUrl,
          mockup_link: body.mockupUrl,
        },
      ],
    };
    const result = await createOrder({
      order_number: `gmtest${now}`.slice(0, 15),
      qikink_shipping: 1,
      gateway: "Prepaid",
      total_order_value: String(body.price ?? 1),
      line_items: [line],
      shipping_address: {
        first_name: body.firstName ?? "Gamana",
        last_name: body.lastName ?? "Test",
        address1: body.address1 ?? "Test Address",
        phone: body.phone ?? "9999999999",
        email: body.email ?? "test@example.com",
        city: body.city ?? "Hyderabad",
        zip: body.zip ?? "500001",
        province: body.province ?? "Telangana",
        country_code: body.countryCode ?? "IN",
      },
    });
    await logAdminAction(
      "qikink_test_order",
      `${result.ok ? "accepted" : "failed"}: ${result.orderId ?? result.error ?? ""}`,
    );
    return NextResponse.json(result, { status: result.ok ? 200 : 502 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not create test order.",
      },
      { status: 400 },
    );
  }
}
