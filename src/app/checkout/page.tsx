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
      <section className="bg-bone py-12 md:py-20">
        <div className="container-gamana">
          <CheckoutForm
            testMode={process.env.RAZORPAY_MODE !== "live"}
            codEnabled={process.env.CHECKOUT_COD_ENABLED !== "false"}
            onlineEnabled={onlineEnabled}
          />
        </div>
      </section>
    </>
  );
}
