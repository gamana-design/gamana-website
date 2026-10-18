"use client";

export type PaymentResult = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};
type Options = {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  handler: (result: PaymentResult) => void;
  modal: { ondismiss: () => void };
};
type RazorpayInstance = {
  open: () => void;
  on: (event: string, handler: () => void) => void;
};
declare global {
  interface Window {
    Razorpay?: new (options: Options) => RazorpayInstance;
  }
}
let loading: Promise<void> | null = null;
export function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve();
  if (loading) return loading;
  loading = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    const timer = setTimeout(() => {
      script.remove();
      loading = null;
      reject(
        new Error("Razorpay could not load. Check your connection and retry."),
      );
    }, 15_000);
    script.onload = () => {
      clearTimeout(timer);
      if (window.Razorpay) resolve();
      else {
        loading = null;
        reject(new Error("Razorpay could not load."));
      }
    };
    script.onerror = () => {
      clearTimeout(timer);
      script.remove();
      loading = null;
      reject(new Error("Razorpay could not load. Please retry."));
    };
    document.head.appendChild(script);
  });
  return loading;
}

export async function openRazorpay(
  options: Omit<Options, "handler" | "modal">,
  onFailure: () => void,
) {
  await loadRazorpay();
  return new Promise<PaymentResult>((resolve, reject) => {
    let completed = false;
    const checkout = new window.Razorpay!({
      ...options,
      handler(result) {
        completed = true;
        resolve(result);
      },
      modal: {
        ondismiss() {
          if (!completed)
            reject(
              new Error(
                "Payment window closed. Your bag is saved; no order is confirmed until payment is verified.",
              ),
            );
        },
      },
    });
    // Razorpay allows retrying a failed attempt inside the same modal.
    checkout.on("payment.failed", onFailure);
    checkout.open();
  });
}
