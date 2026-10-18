import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { Marquee } from "@/components/marquee";
import { NewsletterForm } from "@/components/newsletter-form";
import { Reveal, RevealText } from "@/components/reveal";
import { brand, colors, values, voice } from "@/lib/brand";

export const metadata: Metadata = {
  title: "About",
  description:
    "GAMANA brings culture, fashion and performance together through apparel that reflects where we come from and moves with where we are going.",
  alternates: { canonical: "/about" },
};

const timeline = [
  {
    year: "2026",
    title: "GAMANA is founded in Hyderabad",
    body: "Sri Sai Shivani Kaligotla builds the brand around a single belief: culture should be in the clothes, not on top of them.",
  },
  {
    year: "2026",
    title: "Two lines, one mindset",
    body: "URBAN and CORE launch together — everyday streetwear and active performance under one roof, so people stop buying from three brands for one life.",
  },
  {
    year: "2026",
    title: "Drop 01 — the Godavari study",
    body: "The first graphic is researched from the river itself. Sandbank texture, dusk light, and a print that means something to the people who live there. It ships in three colourways: Sunset Ember, Lavender Dusk and Violet Hour.",
  },
  {
    year: "Next",
    title: "India and the USA",
    body: "Printed on demand from India, shipped to both markets, with the same standard of fit, finish and finish-line precision in every piece.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Header */}
      <section className="relative overflow-hidden bg-kalam pb-20 pt-16 text-bone md:pb-28 md:pt-24">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-8 -top-6 select-none font-telugu text-[16rem] font-medium leading-none text-bone/[0.05] md:text-[24rem]"
        >
          {brand.nameTelugu}
        </span>
        <div className="container-gamana relative">
          <p className="label text-bone/50">About {brand.name}</p>
          <h1 className="mt-6 max-w-5xl font-display text-[clamp(2.4rem,7.2vw,6rem)] font-bold uppercase leading-[0.88] tracking-[-0.055em]">
            <span className="block overflow-hidden">
              <span className="block animate-rise [animation-delay:100ms]">
                Where culture
              </span>
            </span>
            <span className="block overflow-hidden">
              <span className="block animate-rise [animation-delay:200ms]">
                meets <span className="text-ember">everyday</span> style
              </span>
            </span>
            <span className="block overflow-hidden">
              <span className="block animate-rise [animation-delay:300ms]">
                and performance
              </span>
            </span>
          </h1>
          <p className="mt-9 max-w-xl text-pretty text-[1.02rem] leading-relaxed text-bone/70">
            {brand.description}
          </p>
        </div>
      </section>

      {/* Mission / Vision */}
      <section className="bg-bone py-20 md:py-28">
        <div className="container-gamana grid gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <p className="label text-muted">Mission</p>
            <p className="mt-6 font-display text-[clamp(1.5rem,3.4vw,2.3rem)] font-medium leading-[1.18] tracking-[-0.035em]">
              GAMANA brings culture, fashion, and performance together through
              apparel that reflects where we come from and moves with where
              we&rsquo;re going. We create clothing that connects people to
              their roots while expressing who they are.
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="label text-muted">Vision</p>
            <p className="mt-6 font-display text-[clamp(1.5rem,3.4vw,2.3rem)] font-medium leading-[1.18] tracking-[-0.035em]">
              To build a movement-led apparel brand that brings cultural identity
              into modern fashion and inspires people to carry their roots
              wherever life takes them.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Marquee band */}
      <section className="border-y border-line bg-ember py-6 text-white">
        <Marquee
          slow
          reverse
          items={voice.lines}
          separator="—"
          className="font-display text-[1.05rem] font-medium uppercase tracking-[0.06em]"
        />
      </section>

      {/* Positioning */}
      <section className="bg-bone py-20 md:py-28">
        <div className="container-gamana">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
            <Reveal>
              <div className="relative aspect-[4/5] overflow-hidden rounded-[3px] bg-bone-deep">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/brand/campaign-duo.jpg"
                  alt="GAMANA Drop 01 campaign — Sunset Ember and Lavender Dusk"
                  className="h-full w-full object-cover"
                />
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="label text-muted">Positioning</p>
              <p className="mt-6 font-display text-[clamp(1.6rem,3.6vw,2.5rem)] font-medium leading-[1.14] tracking-[-0.035em]">
                For style-conscious people who want their clothing to reflect
                how they live and move, GAMANA is a contemporary apparel brand
                that brings culture, fashion, and performance together, through
                its URBAN streetwear and CORE activewear lines.
              </p>
              <p className="mt-7 text-[0.98rem] leading-relaxed text-muted">
                Out loud: GAMANA is where culture meets everyday style and
                performance. Whether you&rsquo;re heading out or getting
                active, we create apparel that lets you express yourself and
                move your way.
              </p>

              <dl className="mt-10 divide-y divide-line border-y border-line text-[0.9rem]">
                <div className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
                  <dt className="label text-muted">Who it is for</dt>
                  <dd className="text-graphite/85">
                    Style-conscious young adults, roughly 18–35, who value
                    self-expression, enjoy streetwear, and care about fitness,
                    movement, or an active lifestyle.
                  </dd>
                </div>
                <div className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
                  <dt className="label text-muted">The job</dt>
                  <dd className="text-graphite/85">
                    Find versatile apparel that expresses personal style, feels
                    comfortable throughout the day, and fits the lifestyle —
                    from everyday outings to workouts.
                  </dd>
                </div>
                <div className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
                  <dt className="label text-muted">Who it is not for</dt>
                  <dd className="text-graphite/85">
                    People looking only for the lowest price, trend-driven
                    designs with no personal connection, or performance claims
                    without any care about fit, quality or design.
                  </dd>
                </div>
              </dl>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Brand identity */}
      <section className="border-y border-line bg-bone-deep/40 py-20 md:py-28">
        <div className="container-gamana">
          <Reveal>
            <p className="label text-muted">Brand identity</p>
            <h2 className="mt-4 max-w-3xl font-display text-[clamp(2rem,5.2vw,3.8rem)] font-semibold leading-[0.96] tracking-[-0.045em]">
              A wordmark you can hear in a room.
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            <Reveal>
              <div className="rounded-[3px] bg-bone p-8 md:p-12">
                <div className="mx-auto max-w-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/brand/logo-wordmark.png"
                    alt="GAMANA — the brush-lettered wordmark"
                    className="w-full"
                  />
                </div>
                <p className="mt-9 text-center font-telugu text-[0.95rem] tracking-[0.35em] text-muted">
                  {brand.nameTelugu}
                </p>
                <p className="mt-6 text-center label text-muted">
                  {brand.category}
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <p className="text-pretty text-[0.98rem] leading-relaxed text-muted">
                The wordmark is brush-lettered, not typeset — magenta, teal,
                violet and gold, brushed across a warm paper cream. The running
                figure above it is the same hand, reduced to a mark.
              </p>
              <p className="mt-4 text-pretty text-[0.98rem] leading-relaxed text-muted">
                The palette comes from the clothes themselves. Ember is the
                sunset on the Godavari Tee, lavender is the same river a
                different hour later, and the rest of the spectrum is what
                happens when you push those two colours a little further.
              </p>

              <ul className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-[3px] border border-line bg-line sm:grid-cols-3">
                {[
                  { name: "Kalam Ink", hex: colors.kalam },
                  { name: "Godavari Ember", hex: colors.ember },
                  { name: "Sunset Gold", hex: colors.sunset },
                  { name: "Lavender Dusk", hex: colors.lavender },
                  { name: "Violet", hex: colors.violet },
                  { name: "Magenta", hex: colors.magenta },
                  { name: "Teal", hex: colors.teal },
                  { name: "Neelam", hex: colors.neelam },
                  { name: "Bone", hex: colors.bone },
                ].map((swatch) => (
                  <li key={swatch.name} className="bg-bone">
                    <div
                      className="h-14 w-full"
                      style={{ backgroundColor: swatch.hex }}
                      aria-hidden="true"
                    />
                    <div className="px-3 py-3">
                      <p className="text-[0.76rem] font-medium leading-tight">
                        {swatch.name}
                      </p>
                      <p className="mt-0.5 text-[0.68rem] uppercase tracking-[0.12em] text-muted">
                        {swatch.hex}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-kalam py-20 text-bone md:py-28">
        <div className="container-gamana">
          <Reveal>
            <p className="label text-bone/40">What we hold to</p>
            <h2 className="mt-5 max-w-3xl font-display text-[clamp(2rem,5.2vw,3.8rem)] font-semibold leading-[0.96] tracking-[-0.045em]">
              Three values. Each one changed how we build.
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-px overflow-hidden rounded-[3px] bg-bone/12 md:grid-cols-3">
            {values.map((value, i) => (
              <Reveal key={value.index} delay={i * 0.07}>
                <article className="flex h-full flex-col bg-kalam p-8 md:p-10">
                  <p className="label text-ember">{value.index}</p>
                  <h3 className="mt-5 font-display text-[1.5rem] font-semibold leading-tight tracking-[-0.03em]">
                    {value.title}
                  </h3>
                  <p className="mt-4 text-[0.93rem] leading-relaxed text-bone/70">
                    {value.meaning}
                  </p>
                  <dl className="mt-7 space-y-5 border-t border-bone/12 pt-6 text-[0.87rem] leading-relaxed">
                    <div>
                      <dt className="label text-bone/35">It demands</dt>
                      <dd className="mt-1.5 text-bone/70">{value.behaviour}</dd>
                    </div>
                    <div>
                      <dt className="label text-bone/35">It decided</dt>
                      <dd className="mt-1.5 text-bone/70">{value.decision}</dd>
                    </div>
                  </dl>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-bone py-20 md:py-28">
        <div className="container-gamana">
          <Reveal>
            <p className="label text-muted">The road so far</p>
            <h2 className="mt-4 font-display text-[clamp(2rem,5.2vw,3.8rem)] font-semibold tracking-[-0.045em]">
              2026 and counting
            </h2>
          </Reveal>
          <ol className="mt-12 divide-y divide-line border-y border-line">
            {timeline.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.05} as="li">
                <div className="grid gap-3 py-7 sm:grid-cols-[7rem_1fr] sm:gap-8">
                  <p className="label text-ember">{item.year}</p>
                  <div>
                    <h3 className="font-display text-[1.3rem] font-semibold tracking-[-0.03em]">
                      {item.title}
                    </h3>
                    <p className="mt-2.5 max-w-2xl text-[0.93rem] leading-relaxed text-muted">
                      {item.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Founder */}
      <section className="border-t border-line bg-bone-deep/40 py-20 md:py-28">
        <div className="container-gamana">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:gap-20">
            <Reveal>
              <p className="label text-muted">Founder</p>
              <h2 className="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-semibold leading-[0.98] tracking-[-0.045em]">
                {brand.owner}
              </h2>
              <p className="mt-6 max-w-lg text-pretty text-[0.98rem] leading-relaxed text-muted">
                GAMANA started with a question that kept coming back: why do we
                have to buy one brand for the street and another for the gym?
                The answer was a brand that takes culture seriously without
                taking itself too seriously — rooted, but never stuck in the
                past.
              </p>
              <Link
                href="/contact"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-kalam px-7 py-4 text-[0.76rem] font-medium uppercase tracking-[0.18em] text-bone transition-transform hover:scale-[1.02]"
              >
                Talk to us
                <ArrowUpRight className="h-4 w-4" strokeWidth={1.7} />
              </Link>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[3px] bg-line">
                {[
                  { k: "Founded", v: brand.founded },
                  { k: "Base", v: "Hyderabad, India" },
                  { k: "Markets", v: "India, USA" },
                  { k: "Lines", v: "URBAN × CORE" },
                  { k: "Drop 01", v: "The Godavari Tee" },
                  { k: "Colourways", v: "Sunset · Lavender · Violet" },
                ].map((stat) => (
                  <div key={stat.k} className="bg-bone p-7">
                    <p className="label text-muted">{stat.k}</p>
                    <p className="mt-3 font-display text-[1.15rem] font-semibold tracking-[-0.025em]">
                      {stat.v}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Practical info */}
      <section className="bg-bone py-20 md:py-28" id="shipping">
        <div className="container-gamana">
          <div className="grid gap-10 md:grid-cols-3">
            <Reveal>
              <h2 className="font-display text-[1.4rem] font-semibold tracking-[-0.03em]">
                Shipping
              </h2>
              <p className="mt-3 text-[0.9rem] leading-relaxed text-muted">
                Everything is printed on demand and dispatched in roughly three
                working days. Free shipping across India over ₹1,499. Tracked
                delivery to the USA as well.
              </p>
            </Reveal>
            <Reveal delay={0.06}>
              <h2 className="font-display text-[1.4rem] font-semibold tracking-[-0.03em]">
                Sizing
              </h2>
              <p className="mt-3 text-[0.9rem] leading-relaxed text-muted">
                URBAN pieces are cut relaxed; CORE pieces are cut close without
                being tight. If you are between sizes, size up for URBAN and
                stay true for CORE.
              </p>
            </Reveal>
            <Reveal delay={0.12}>
              <h2 className="font-display text-[1.4rem] font-semibold tracking-[-0.03em]">
                Returns
              </h2>
              <p className="mt-3 text-[0.9rem] leading-relaxed text-muted">
                Seven days from delivery, on unworn pieces with tags attached.
                Write to us and we will sort it out — no forms, no friction.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-ember py-16 text-white md:py-20">
        <div className="container-gamana grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <p className="label text-white/60">Stay close</p>
            <h2 className="mt-4 max-w-xl font-display text-[clamp(1.7rem,4.4vw,3rem)] font-bold uppercase leading-[0.95] tracking-[-0.05em]">
              Roots, routes and first access
            </h2>
          </div>
          <div>
            <NewsletterForm tone="light" source="about" />
          </div>
        </div>
      </section>
    </>
  );
}
