import type { Metadata } from "next";

import { CheckoutForm } from "@/components/checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your GAMANA order.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <section className="bg-bone py-12 md:py-20">
      <div className="container-gamana">
        <CheckoutForm />
      </div>
    </section>
  );
}
