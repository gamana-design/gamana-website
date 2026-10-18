import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout-form";
import { PageRenderer } from "@/components/site-content/page-renderer";
import { getSitePage } from "@/lib/site-content";
import { razorpayConfig } from "@/lib/checkout/razorpay";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};
export default async function CheckoutPage() {
  const page = await getSitePage("checkout");
  let onlineEnabled = false;
  try {
    razorpayConfig();
    onlineEnabled = Boolean(process.env.RAZORPAY_WEBHOOK_SECRET);
  } catch {
    /* fail closed until configured */
  }
  return (
    <>
      {page && <PageRenderer page={page} />}
      <section className="checkout-brand bg-bone py-8 md:py-12">
        <div className="container-gamana">
          <nav aria-label="Checkout steps" className="checkout-stage"><span>01 / Your bag</span><span aria-hidden="true" /><span className="current" aria-current="step">02 / Delivery & payment</span></nav>
          <CheckoutForm
            testMode={process.env.RAZORPAY_MODE !== "live"}
            onlineEnabled={onlineEnabled}
          />
        </div>
      </section>
    </>
  );
}
