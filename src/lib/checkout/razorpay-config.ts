import { CheckoutError } from "./pricing";

/** Select one complete pair. Never fall back to credentials from the other mode. */
export function resolveRazorpayConfig(env: Record<string, string | undefined>) {
  const mode = env.RAZORPAY_MODE ?? "test";
  if (mode !== "test" && mode !== "live") {
    throw new CheckoutError(
      "Online payments are not configured yet. Please try again later.",
      503,
    );
  }
  const prefix = mode === "live" ? "RAZORPAY_LIVE" : "RAZORPAY_TEST";
  const keyId = (env[`${prefix}_KEY_ID`] ?? "").trim();
  const keySecret = (env[`${prefix}_KEY_SECRET`] ?? "").trim();
  if (!keyId.startsWith(`rzp_${mode}_`) || !keySecret) {
    throw new CheckoutError(
      "Online payments are not configured yet. Please try again later.",
      503,
    );
  }
  return { keyId, keySecret, mode };
}
