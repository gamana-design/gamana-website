import type { Metadata } from "next";
import { Suspense } from "react";

import { ShopBrowser } from "@/components/shop-browser";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Shop the drop",
  description:
    "GAMANA Drop 01 — URBAN streetwear and CORE performance apparel. Printed on demand, dispatched across India and the USA.",
  alternates: { canonical: "/shop" },
};

export default function ShopPage() {
  return (
    <>
      <section className="border-b border-line bg-bone-deep/40">
        <div className="container-gamana py-14 md:py-20">
          <p className="label text-muted">Drop 01 · {brand.markets.join(" & ")}</p>
          <h1 className="mt-5 max-w-3xl font-display text-[clamp(2.4rem,7vw,5.2rem)] font-bold uppercase leading-[0.88] tracking-[-0.05em]">
            The shop
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-[0.98rem] leading-relaxed text-muted">
            Every piece is made to order and printed in India, then shipped to
            you. No warehouse, no leftovers, no compromise on the print.
          </p>
        </div>
      </section>

      <Suspense fallback={<div className="container-gamana py-20" />}>
        <ShopBrowser />
      </Suspense>
    </>
  );
}
