import { NextResponse } from "next/server";
import { validSignature } from "@/lib/checkout/signatures";
import { confirmPayment } from "@/lib/checkout/payments";
import { checkoutError } from "@/lib/checkout/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret)
    return NextResponse.json(
      { error: "Webhook is not configured." },
      { status: 503 },
    );
  const raw = await request.text();
  if (raw.length > 1_000_000)
    return NextResponse.json({ error: "Payload too large." }, { status: 413 });
  if (!validSignature(raw, request.headers.get("x-razorpay-signature"), secret))
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  try {
    const event = JSON.parse(raw);
    if (event.event !== "payment.captured" && event.event !== "order.paid")
      return NextResponse.json({ received: true });
    const payment = event.payload?.payment?.entity;
    if (
      !payment ||
      typeof payment.id !== "string" ||
      !/^pay_[A-Za-z0-9]+$/.test(payment.id) ||
      typeof payment.order_id !== "string" ||
      !/^order_[A-Za-z0-9]+$/.test(payment.order_id)
    )
      return NextResponse.json({ error: "Invalid event." }, { status: 400 });
    await confirmPayment(payment.order_id, payment.id);
    return NextResponse.json({ received: true });
  } catch (error) {
    return checkoutError(error);
  }
}
