import "server-only";
import { CheckoutError } from "./pricing";
import { resolveRazorpayConfig } from "./razorpay-config";

export function razorpayConfig() {
  return resolveRazorpayConfig(process.env);
}

export async function razorpayRequest<T>(
  path: string,
  body?: unknown,
): Promise<T> {
  const { keyId, keySecret } = razorpayConfig();
  const response = await fetch(`https://api.razorpay.com/v1/${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) {
    // Never leak gateway credentials, customer data or upstream response bodies.
    console.error(
      "Razorpay API request failed",
      response.status,
      path.split("/")[0],
    );
    throw new CheckoutError(
      "The payment provider could not complete this request. Please retry shortly.",
      502,
    );
  }
  return response.json() as Promise<T>;
}
export type RazorpayOrder = { id: string; amount: number; currency: string };
export type RazorpayPayment = {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
  amount_refunded: number;
};
