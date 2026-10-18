import { createHmac, timingSafeEqual } from "node:crypto";

export function validSignature(
  payload: string,
  signature: unknown,
  secret: string,
): boolean {
  if (
    !secret ||
    typeof signature !== "string" ||
    !/^[a-f0-9]{64}$/i.test(signature)
  )
    return false;
  const expected = createHmac("sha256", secret).update(payload).digest();
  return timingSafeEqual(expected, Buffer.from(signature, "hex"));
}

export function paymentMatches(
  payment: {
    id: string;
    order_id: string;
    amount: number;
    currency: string;
    status: string;
    amount_refunded?: number;
  },
  order: { razorpay_order_id: string; amount_paise: number },
  paymentId: string,
) {
  return (
    payment.id === paymentId &&
    payment.order_id === order.razorpay_order_id &&
    payment.amount === order.amount_paise &&
    payment.currency === "INR" &&
    payment.status === "captured" &&
    (payment.amount_refunded ?? 0) === 0
  );
}
