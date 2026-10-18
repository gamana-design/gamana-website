import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase";
import { CheckoutError } from "./pricing";
import { paymentMatches } from "./signatures";
import {
  razorpayConfig,
  razorpayRequest,
  type RazorpayPayment,
} from "./razorpay";
import { fulfilOrder } from "./fulfilment";

export async function confirmPayment(
  razorpayOrderId: string,
  paymentId: string,
) {
  const db = getSupabaseAdmin();
  if (!db) throw new CheckoutError("Order storage is unavailable.", 503);
  const { data: order, error } = await db
    .from("orders")
    .select("*")
    .eq("razorpay_order_id", razorpayOrderId)
    .single();
  if (error || !order)
    throw new CheckoutError("Payment order was not found.", 404);
  if (
    order.payment_gateway !== "Prepaid" ||
    order.payment_mode !== razorpayConfig().mode
  )
    throw new CheckoutError(
      "Payment environment does not match this order.",
      409,
    );
  const payment = await razorpayRequest<RazorpayPayment>(
    `payments/${encodeURIComponent(paymentId)}`,
  );
  if (
    payment.status === "authorized" &&
    payment.order_id === order.razorpay_order_id
  ) {
    throw new CheckoutError(
      "Payment is awaiting capture. Do not pay again. Check your order status shortly.",
      409,
    );
  }
  if (!paymentMatches(payment, order, paymentId))
    throw new CheckoutError(
      "Payment could not be confirmed for this order.",
      409,
    );
  if (order.razorpay_payment_id && order.razorpay_payment_id !== paymentId)
    throw new CheckoutError(
      "A different payment is already linked to this order.",
      409,
    );
  // The SQL function locks the order and validates amount/currency again atomically.
  const marked = await db.rpc("gamana_mark_payment_paid", {
    p_order_id: order.id,
    p_payment_id: paymentId,
    p_amount: payment.amount,
    p_currency: payment.currency,
  });
  if (marked.error)
    throw new Error(
      "Payment recorded by provider; database reconciliation required.",
    );
  try {
    await fulfilOrder(order.id);
  } catch {
    console.error("Paid order awaiting fulfilment", order.order_number);
  }
  return {
    orderNumber: order.order_number,
    testMode: order.payment_mode === "test",
    message:
      order.payment_mode === "test"
        ? "Test payment successful. No real payment or print order has been placed."
        : "Payment received. Your order is confirmed and awaiting fulfilment.",
  };
}
