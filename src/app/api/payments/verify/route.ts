import { NextResponse } from "next/server";
import { validSignature } from "@/lib/checkout/signatures";
import { CheckoutError } from "@/lib/checkout/pricing";
import { razorpayConfig } from "@/lib/checkout/razorpay";
import { confirmPayment } from "@/lib/checkout/payments";
import { checkoutError } from "@/lib/checkout/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const data = await request.json().catch(() => null);
    if (
      !data ||
      typeof data.razorpay_order_id !== "string" ||
      !/^order_[A-Za-z0-9]+$/.test(data.razorpay_order_id) ||
      typeof data.razorpay_payment_id !== "string" ||
      !/^pay_[A-Za-z0-9]+$/.test(data.razorpay_payment_id)
    )
      throw new CheckoutError("Invalid payment response.");
    const { keySecret } = razorpayConfig();
    if (
      !validSignature(
        `${data.razorpay_order_id}|${data.razorpay_payment_id}`,
        data.razorpay_signature,
        keySecret,
      )
    )
      throw new CheckoutError("Payment signature verification failed.", 400);
    return NextResponse.json(
      await confirmPayment(data.razorpay_order_id, data.razorpay_payment_id),
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return checkoutError(error);
  }
}
