import type { Metadata } from "next";

import { TrackForm } from "@/components/track-form";

export const metadata: Metadata = {
  title: "Track your order",
  description:
    "Live fulfilment status for GAMANA orders — printing, packing and courier tracking.",
  alternates: { canonical: "/track" },
};

export default function TrackPage() {
  return (
    <>
      <section className="border-b border-line bg-bone-deep/40">
        <div className="container-gamana py-14 md:py-20">
          <p className="label text-muted">Order status</p>
          <h1 className="mt-5 max-w-3xl font-display text-[clamp(2.4rem,7vw,5.2rem)] font-bold uppercase leading-[0.88] tracking-[-0.05em]">
            Track your order
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-[0.98rem] leading-relaxed text-muted">
            Enter the order number from your confirmation email. It updates as
            soon as your piece moves from print to courier.
          </p>
        </div>
      </section>

      <section className="bg-bone py-14 md:py-20">
        <div className="container-gamana max-w-3xl">
          <TrackForm />

          <div className="mt-14 grid gap-8 border-t border-line pt-10 sm:grid-cols-3">
            {[
              {
                h: "Where is my number?",
                p: "It is in the subject line of your confirmation email, and starts with “gm”. It looks like gm1a2b3c4d5.",
              },
              {
                h: "How long does it take?",
                p: "Everything is printed on demand, so most orders ship within three working days. The status above tells you exactly where yours is.",
              },
              {
                h: "Something looks wrong",
                p: "Write to us and we will sort it out — we can see the same fulfilment record you are looking at.",
              },
            ].map((item) => (
              <div key={item.h}>
                <h2 className="font-display text-[1.05rem] font-semibold tracking-[-0.025em]">
                  {item.h}
                </h2>
                <p className="mt-2.5 text-[0.88rem] leading-relaxed text-muted">
                  {item.p}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
