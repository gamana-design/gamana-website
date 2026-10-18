import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase";
import { createOrder, isConfigured } from "@/lib/qikink";
import { fulfilmentAction } from "./fulfilment-rules";

/** Durable compare-and-set: browser callbacks and webhook retries cannot both submit.
 * A timeout/crash after submission needs operator reconciliation, not a blind retry.
 */
export async function fulfilOrder(id: string) {
  const db = getSupabaseAdmin();
  if (!db) throw new Error("Order storage is unavailable.");
  const { data: order, error } = await db
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .single();
  if (error) throw error;
  const action = fulfilmentAction(order);
  if (action === "blocked") return;
  if (action === "test") {
    const result = await db
      .from("orders")
      .update({ fulfilment_status: "test", status: "test-confirmed" })
      .eq("id", id)
      .eq("fulfilment_status", "pending");
    if (result.error) throw result.error;
    return; // Test payments NEVER reach Qikink, even when live credentials are configured.
  }
  if (!isConfigured()) return; // Remains pending for reconciliation after configuration.
  const { data: claimed, error: claimError } = await db
    .from("orders")
    .update({ fulfilment_status: "submitting" })
    .eq("id", id)
    .eq("fulfilment_status", "pending")
    .select("id")
    .maybeSingle();
  if (claimError) throw claimError;
  if (!claimed) return;
  try {
    const [firstName, ...last] = order.full_name.split(/\s+/);
    const result = await createOrder({
      order_number: order.order_number,
      qikink_shipping: 1,
      gateway: order.payment_gateway,
      total_order_value: String(order.total_order_value),
      line_items: order.order_items.map(
        (item: { sku: string; quantity: number; unit_price: number }) => ({
          search_from_my_products: 1,
          quantity: String(item.quantity),
          sku: item.sku,
          price: String(item.unit_price),
        }),
      ),
      shipping_address: {
        first_name: firstName,
        last_name: last.join(" ") || "Customer",
        address1: order.address1,
        address2: order.address2 ?? "",
        phone: order.phone,
        email: order.email,
        city: order.city,
        province: order.province,
        zip: order.zip,
        country_code: order.country_code,
      },
    });
    const updated = await db
      .from("orders")
      .update({
        fulfilment_status: result.ok ? "submitted" : "review",
        status: result.ok ? "confirmed" : "fulfilment-pending",
        qikink_order_id: result.orderId ?? null,
        qikink_reference: order.order_number,
        qikink_status: result.ok ? "Live" : "Needs fulfilment review",
      })
      .eq("id", id);
    if (updated.error) throw updated.error;
  } catch {
    const review = await db
      .from("orders")
      .update({ fulfilment_status: "review", status: "fulfilment-pending" })
      .eq("id", id);
    console.error(
      "Fulfilment needs reconciliation for order",
      order.order_number,
      review.error ? "(status update failed)" : "",
    );
    // Payment is still successful. Do not tell a paid customer to pay again.
  }
}
