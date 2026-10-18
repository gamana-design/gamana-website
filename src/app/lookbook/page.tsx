import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Reveal } from "@/components/reveal";
import { lookbook, brandArt } from "@/data/editorial";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Lookbook",
  description:
    "URBAN and CORE in motion — the GAMANA lookbook, shot across Hyderabad and the places we train.",
  alternates: { canonical: "/lookbook" },
};

export default function LookbookPage() {
  const urban = lookbook.filter((f) => f.line === "URBAN");
  const core = lookbook.filter((f) => f.line === "CORE");

  return (
    <>
      <section className="bg-kalam pb-16 pt-16 text-bone md:pb-20 md:pt-24">
        <div className="container-gamana">
          <p className="label text-bone/50">Lookbook · Drop 01 — The Godavari Tee</p>
          <h1 className="mt-6 max-w-4xl font-display text-[clamp(2.4rem,7.2vw,6rem)] font-bold uppercase leading-[0.88] tracking-[-0.055em]">
            <span className="block overflow-hidden">
              <span className="block animate-rise [animation-delay:100ms]">
                From gym
              </span>
            </span>
            <span className="block overflow-hidden">
              <span className="block animate-rise [animation-delay:200ms]">
                to <span className="text-ember">street</span>
              </span>
            </span>
          </h1>
          <p className="mt-8 max-w-lg text-pretty text-[0.98rem] leading-relaxed text-bone/70">
            One brand, two hours of the day. The same person, the same
            confidence — different clothes for what the day is asking for.
          </p>
        </div>
      </section>

      {[
        { key: "URBAN" as const, title: "URBAN", kicker: "Everyday streetwear", frames: urban },
        { key: "CORE" as const, title: "CORE", kicker: "Active performance", frames: core },
      ].map((chapter) => (
        <section
          key={chapter.key}
          className={`py-16 md:py-24 ${chapter.key === "CORE" ? "bg-bone-deep/40" : "bg-bone"}`}
        >
          <div className="container-gamana">
            <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p
                  className={`label ${chapter.key === "URBAN" ? "text-ember" : "text-neelam"}`}
                >
                  {chapter.kicker}
                </p>
                <h2 className="mt-3 font-display text-[clamp(2.2rem,6vw,4rem)] font-bold uppercase leading-[0.9] tracking-[-0.05em]">
                  {chapter.title}
                </h2>
              </div>
              <Link
                href={`/shop?line=${chapter.key}`}
                className="link-underline group inline-flex items-center gap-2 text-[0.8rem] font-medium uppercase tracking-[0.16em]"
              >
                Shop {chapter.title}
                <ArrowUpRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  strokeWidth={1.7}
                />
              </Link>
            </Reveal>

            <div className="mt-10 grid grid-cols-2 gap-4 md:mt-14 md:grid-cols-3 md:gap-6">
              {chapter.frames.map((frame, i) => (
                <Reveal
                  key={frame.id}
                  delay={i * 0.06}
                  className={i % 3 === 0 ? "md:row-span-2" : undefined}
                >
                  <figure className="group relative h-full overflow-hidden rounded-[3px] bg-kalam">
                    <div
                      className={
                        i % 3 === 0
                          ? "aspect-[3/5] overflow-hidden"
                          : "aspect-square overflow-hidden"
                      }
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={frame.image}
                        alt={frame.caption}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-kalam/80 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    <figcaption className="absolute inset-x-0 bottom-0 translate-y-2 p-5 text-bone opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                      <p className="text-[0.82rem] font-medium">{frame.caption}</p>
                      <p className="mt-0.5 text-[0.75rem] text-bone/60">
                        {frame.place}
                      </p>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="border-t border-line bg-bone py-16 md:py-24">
        <div className="container-gamana">
          <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="label text-ember">Prints &amp; posters</p>
              <h2 className="mt-3 font-display text-[clamp(2.2rem,6vw,4rem)] font-bold uppercase leading-[0.9] tracking-[-0.05em]">
                The identity
              </h2>
            </div>
            <p className="max-w-sm text-pretty text-[0.92rem] leading-relaxed text-muted">
              The GAMANA wordmark is brush-lettered — magenta, teal, violet and
              gold over a warm paper cream. It is the same hand that drew the
              Godavari graphic.
            </p>
          </Reveal>

          <div className="mt-10 grid grid-cols-2 gap-4 md:mt-14 md:grid-cols-3 md:gap-6">
            {brandArt.map((art, i) => (
              <Reveal key={art.id} delay={i * 0.05}>
                <figure className="group relative h-full overflow-hidden rounded-[3px] bg-bone-deep">
                  <div className="aspect-[4/5] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={art.image}
                      alt={art.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
                    />
                  </div>
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-kalam/85 to-transparent p-5 text-bone">
                    <p className="label text-ember">{art.title}</p>
                    <p className="mt-1.5 text-[0.8rem] leading-snug text-bone/70">
                      {art.note}
                    </p>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ember py-16 text-white md:py-24">
        <div className="container-gamana text-center">
          <Reveal>
            <p className="label text-white/60">Wear it</p>
            <h2 className="mx-auto mt-5 max-w-2xl font-display text-[clamp(2rem,5.4vw,4rem)] font-bold uppercase leading-[0.92] tracking-[-0.05em]">
              Your roots. Your route. Your rules.
            </h2>
            <Link
              href="/shop"
              className="mt-9 inline-block rounded-full bg-bone px-8 py-4 text-[0.78rem] font-medium uppercase tracking-[0.18em] text-kalam transition-transform hover:scale-[1.02]"
            >
              Shop {brand.name}
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
