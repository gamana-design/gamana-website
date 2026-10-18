import { NextResponse } from "next/server";
import { CheckoutError } from "./pricing";

export function checkoutError(error: unknown) {
  if (error instanceof CheckoutError)
    return NextResponse.json(
      { error: error.message },
      { status: error.status, headers: { "Cache-Control": "no-store" } },
    );
  console.error(
    "Checkout request failed",
    error instanceof Error ? error.name : "storage/provider error",
  );
  return NextResponse.json(
    {
      error:
        "We could not complete this request. If payment was taken, do not pay again; check your order status or contact us.",
    },
    { status: 503 },
  );
}
