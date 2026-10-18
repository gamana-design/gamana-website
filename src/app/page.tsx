import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { Marquee } from "@/components/marquee";
import { NewsletterForm } from "@/components/newsletter-form";
import { ProductCard } from "@/components/product-card";
import { Reveal, RevealText } from "@/components/reveal";
import { getProducts } from "@/lib/catalog-store";
import { journal, lookbook, brandArt } from "@/data/editorial";
import { brand, lines, values, voice } from "@/lib/brand";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await getProducts();
  const featured = products.filter((p) => p.featured).slice(0, 4);
  const urban = products.filter((p) => p.line === "URBAN").slice(0, 3);
  const core = products.filter((p) => p.line === "CORE").slice(0, 3);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative">
        <div className="absolute inset-0" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/brand/street-sunset.jpg"
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-kalam/85 via-kalam/45 to-kalam" />
        </div>
        <div className="container-gamana relative flex min-h-[calc(100svh-100px)] flex-col justify-end pb-14 pt-36 text-bone md:pb-20">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-ember" />
            <p className="label text-bone/70">
              {brand.base} · Est. {brand.founded}
            </p>
          </div>
          <h1 className="mt-6 font-display text-[clamp(2.9rem,11.5vw,9.5rem)] font-bold uppercase leading-[0.84] tracking-[-0.055em]">
            <span className="block overflow-hidden">
              <span className="block animate-rise [animation-delay:120ms]">
                What grounds
              </span>
            </span>
            <span className="block overflow-hidden">
              <span className="block animate-rise [animation-delay:220ms]">
                you. <span className="text-ember">Moves</span> you.
              </span>
            </span>
          </h1>
          <div className="mt-10 flex flex-col gap-8 border-t border-bone/15 pt-8 md:flex-row md:items-end md:justify-between">
            <div className="animate-rise [animation-delay:420ms]">
              <p className="label text-ember">{brand.drop}</p>
              <p className="mt-3 max-w-md text-pretty text-[0.98rem] leading-relaxed text-bone/70">
                {brand.description} Two lines — URBAN and CORE — built around
                where you came from and where you are going.
              </p>
            </div>
            <div className="flex animate-rise flex-wrap items-center gap-3 [animation-delay:520ms]">
              <Link
                href="/shop"
                className="group inline-flex items-center gap-2.5 rounded-full bg-bone px-7 py-4 text-[0.78rem] font-medium uppercase tracking-[0.18em] text-kalam transition-transform hover:scale-[1.02]"
              >
                Shop the drop
                <ArrowUpRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  strokeWidth={1.7}
                />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2.5 rounded-full border border-bone/30 px-7 py-4 text-[0.78rem] font-medium uppercase tracking-[0.18em] text-bone transition-colors hover:border-bone/70"
              >
                Our story
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Word marquee ─────────────────────────────────────────────── */}
      <section className="border-y border-line bg-bone py-5">
        <Marquee
          items={[...voice.ownWords, ...voice.ownWords]}
          className="font-display text-[0.95rem] font-medium uppercase tracking-[0.12em] text-graphite/45"
        />
      </section>

      {/* ── Two lines ────────────────────────────────────────────────── */}
      <section id="two-lines" className="bg-bone py-20 md:py-28">
        <div className="container-gamana">
          <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="label text-muted">The collection</p>
              <h2 className="mt-4 max-w-2xl font-display text-[clamp(2.1rem,5.4vw,4.2rem)] font-semibold leading-[0.95] tracking-[-0.045em]">
                Two lines. <span className="text-muted">One mindset.</span>
              </h2>
            </div>
            <p className="max-w-sm text-pretty text-[0.95rem] leading-relaxed text-muted">
              URBAN is what you wear when the day is yours. CORE is what you wear
              when you are working at it. Same brand, same mindset, different
              hours.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-5 md:grid-cols-2">
            {lines.map((line, i) => {
              const items = line.key === "URBAN" ? urban : core;
              const image =
                line.key === "URBAN"
                  ? "/images/brand/scene-doorway-duo.jpg"
                  : "/images/core-1.jpg";
              const accent =
                line.key === "URBAN" ? "text-ember" : "text-neelam";
              return (
                <Reveal key={line.key} delay={i * 0.08}>
                  <div className="group relative h-full overflow-hidden rounded-[3px] bg-kalam text-bone">
                    <div className="relative aspect-[4/5] overflow-hidden md:aspect-[3/4]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image}
                        alt={`${line.name} — ${line.kicker}`}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-kalam via-kalam/25 to-transparent" />
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-7 md:p-9">
                      <p className={`label ${accent}`}>{line.kicker}</p>
                      <h3 className="mt-3 font-display text-[clamp(2.2rem,6vw,3.6rem)] font-bold uppercase leading-[0.9] tracking-[-0.05em]">
                        {line.name}
                      </h3>
                      <p className="mt-4 max-w-sm text-pretty text-[0.92rem] leading-relaxed text-bone/70">
                        {line.blurb}
                      </p>

                      <ul className="mt-6 space-y-2">
                        {items.map((p) => (
                          <li key={p.id}>
                            <Link
                              href={`/product/${p.slug}`}
                              className="group/li flex items-center justify-between border-b border-bone/12 py-2.5 text-[0.88rem] text-bone/75 transition-colors hover:border-bone/40 hover:text-bone"
                            >
                              {p.name}
                              <ArrowRight
                                className="h-4 w-4 -translate-x-1 opacity-0 transition-all group-hover/li:translate-x-0 group-hover/li:opacity-100"
                                strokeWidth={1.6}
                              />
                            </Link>
                          </li>
                        ))}
                      </ul>

                      <Link
                        href={line.href}
                        className="mt-7 inline-flex items-center gap-2 rounded-full border border-bone/30 px-6 py-3.5 text-[0.75rem] font-medium uppercase tracking-[0.18em] text-bone transition-colors hover:border-bone/70"
                      >
                        Shop {line.name}
                      </Link>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Featured drop ────────────────────────────────────────────── */}
      <section className="border-t border-line bg-bone-deep/50 py-20 md:py-28">
        <div className="container-gamana">
          <Reveal className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="label text-muted">Drop 01 · {brand.markets.join(" & ")}</p>
              <h2 className="mt-4 font-display text-[clamp(2.1rem,5.4vw,4.2rem)] font-semibold leading-[0.95] tracking-[-0.045em]">
                The first pieces
              </h2>
            </div>
            <Link
              href="/shop"
              className="link-underline group inline-flex items-center gap-2 text-[0.82rem] font-medium uppercase tracking-[0.16em] text-graphite"
            >
              All products
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                strokeWidth={1.6}
              />
            </Link>
          </Reveal>

          <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
            {featured.map((product, i) => (
              <Reveal key={product.id} delay={i * 0.06}>
                <ProductCard product={product} index={i} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Brand art ───────────────────────────────────────────────── */}
      <section className="bg-kalam py-20 text-bone md:py-28">
        <div className="container-gamana">
          <Reveal className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="label text-bone/45">The identity</p>
              <h2 className="mt-4 max-w-2xl font-display text-[clamp(2.1rem,5.4vw,4.2rem)] font-semibold leading-[0.95] tracking-[-0.045em]">
                Drawn by hand, printed on paper.
              </h2>
            </div>
            <p className="max-w-sm text-pretty text-[0.95rem] leading-relaxed text-bone/60">
              The GAMANA wordmark is brush-lettered, not typeset — magenta, teal,
              violet and gold over a warm paper cream. It sits on every tee we
              print and every poster we put up.
            </p>
          </Reveal>

          <div className="mt-12 grid grid-cols-2 gap-4 md:mt-16 md:grid-cols-3 md:gap-6">
            {brandArt.map((art, i) => (
              <Reveal key={art.id} delay={i * 0.05}>
                <figure className="group relative h-full overflow-hidden rounded-[3px] bg-kalam-soft">
                  <div className="aspect-[4/5] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={art.image}
                      alt={art.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
                    />
                  </div>
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-kalam/90 to-transparent p-5">
                    <p className="label text-ember">{art.title}</p>
                    <p className="mt-1.5 text-[0.82rem] leading-snug text-bone/70">
                      {art.note}
                    </p>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Manifesto ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-kalam py-24 text-bone md:py-36">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -left-10 top-10 select-none font-display text-[14rem] font-bold leading-none text-bone/[0.04] md:text-[22rem]"
        >
          “
        </span>
        <div className="container-gamana relative">
          <p className="label text-bone/40">Manifesto</p>
          <p className="mt-8 max-w-5xl font-display text-[clamp(1.9rem,5.6vw,4.4rem)] font-medium leading-[1.06] tracking-[-0.04em]">
            <RevealText text="We make clothing that carries where you came from — and moves with where you are going." />
            <span className="mt-4 block text-ember">
              <RevealText text="Made of home. Made to roam." delay={0.15} />
            </span>
          </p>
          <div className="mt-14 flex flex-wrap gap-x-10 gap-y-4 border-t border-bone/12 pt-8">
            {voice.lines.slice(0, 4).map((line, i) => (
              <Reveal key={line} delay={i * 0.06}>
                <p className="max-w-[15rem] text-[0.92rem] leading-relaxed text-bone/60">
                  “{line}”
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ───────────────────────────────────────────────────── */}
      <section className="bg-bone py-20 md:py-28">
        <div className="container-gamana">
          <Reveal>
            <p className="label text-muted">What we hold to</p>
            <h2 className="mt-4 max-w-3xl font-display text-[clamp(2.1rem,5.4vw,4.2rem)] font-semibold leading-[0.95] tracking-[-0.045em]">
              Three values, and what each one demands of us.
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-px overflow-hidden rounded-[3px] border border-line bg-line md:grid-cols-3">
            {values.map((value, i) => (
              <Reveal key={value.index} delay={i * 0.07}>
                <article className="flex h-full flex-col bg-bone p-8 md:p-10">
                  <p className="label text-ember">{value.index}</p>
                  <h3 className="mt-5 font-display text-[1.55rem] font-semibold leading-tight tracking-[-0.03em]">
                    {value.title}
                  </h3>
                  <p className="mt-4 text-[0.93rem] leading-relaxed text-graphite/80">
                    {value.meaning}
                  </p>
                  <dl className="mt-7 space-y-5 border-t border-line pt-6 text-[0.87rem] leading-relaxed">
                    <div>
                      <dt className="label text-muted">It demands</dt>
                      <dd className="mt-1.5 text-graphite/80">{value.behaviour}</dd>
                    </div>
                    <div>
                      <dt className="label text-muted">It decided</dt>
                      <dd className="mt-1.5 text-graphite/80">{value.decision}</dd>
                    </div>
                  </dl>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Origin ───────────────────────────────────────────────────── */}
      <section className="bg-bone pb-20 md:pb-28">
        <div className="container-gamana">
          <div className="grid items-center gap-10 overflow-hidden rounded-[3px] bg-kalam text-bone lg:grid-cols-2">
            <div className="relative aspect-[5/4] overflow-hidden lg:aspect-auto lg:h-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/brand/scene-lake.jpg"
                alt="The Godavari river at dusk"
                loading="lazy"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-kalam/50 to-transparent" />
            </div>
            <div className="p-9 md:p-14 lg:py-20">
              <Reveal>
                <p className="label text-ember">Origin</p>
                <h2 className="mt-5 font-display text-[clamp(1.8rem,4.2vw,3.2rem)] font-semibold leading-[1.02] tracking-[-0.04em]">
                  Cultural authenticity is a practice, not a print.
                </h2>
                <p className="mt-6 max-w-lg text-pretty text-[0.95rem] leading-relaxed text-bone/70">
                  Our culture is part of our identity, not a design trend. So we
                  research the source rather than borrowing from it — the
                  Godavari-inspired graphic was drawn from the river itself: the
                  sandbank texture, the way light sits on the water at dusk.
                </p>
                <p className="mt-4 max-w-lg text-pretty text-[0.95rem] leading-relaxed text-bone/70">
                  That is the standard for everything we make. If the meaning
                  behind a piece would not survive a conversation with someone
                  who lives it, it does not ship.
                </p>
                <Link
                  href="/about"
                  className="mt-8 inline-flex items-center gap-2 rounded-full border border-bone/30 px-6 py-3.5 text-[0.75rem] font-medium uppercase tracking-[0.18em] text-bone transition-colors hover:border-bone/70"
                >
                  Read our story
                </Link>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── Lookbook strip ───────────────────────────────────────────── */}
      <section className="overflow-hidden border-y border-line bg-bone-deep/40 py-20 md:py-28">
        <div className="container-gamana">
          <Reveal className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="label text-muted">Lookbook</p>
              <h2 className="mt-4 font-display text-[clamp(2.1rem,5.4vw,4.2rem)] font-semibold leading-[0.95] tracking-[-0.045em]">
                From gym to street
              </h2>
            </div>
            <Link
              href="/lookbook"
              className="link-underline group inline-flex items-center gap-2 text-[0.82rem] font-medium uppercase tracking-[0.16em]"
            >
              Full lookbook
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                strokeWidth={1.6}
              />
            </Link>
          </Reveal>
        </div>

        <div className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 md:mt-16 md:px-10">
          {lookbook.map((frame) => (
            <figure
              key={frame.id}
              className="group relative w-[78vw] shrink-0 snap-start overflow-hidden rounded-[3px] bg-kalam sm:w-[46vw] lg:w-[28vw]"
            >
              <div className="aspect-[3/4] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={frame.image}
                  alt={frame.caption}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-kalam/85 via-kalam/10 to-transparent" />
              <figcaption className="absolute inset-x-0 bottom-0 p-6 text-bone">
                <p className="label text-ember">{frame.line}</p>
                <p className="mt-2 text-[0.95rem] font-medium">{frame.caption}</p>
                <p className="mt-1 text-[0.8rem] text-bone/55">{frame.place}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ── Journal ──────────────────────────────────────────────────── */}
      <section className="bg-bone py-20 md:py-28">
        <div className="container-gamana">
          <Reveal className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="label text-muted">Journal</p>
              <h2 className="mt-4 font-display text-[clamp(2.1rem,5.4vw,4.2rem)] font-semibold leading-[0.95] tracking-[-0.045em]">
                Notes from the road
              </h2>
            </div>
            <Link
              href="/journal"
              className="link-underline group inline-flex items-center gap-2 text-[0.82rem] font-medium uppercase tracking-[0.16em]"
            >
              All writing
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                strokeWidth={1.6}
              />
            </Link>
          </Reveal>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {journal.slice(0, 3).map((post, i) => (
              <Reveal key={post.slug} delay={i * 0.07}>
                <Link href={`/journal/${post.slug}`} className="group block">
                  <div className="aspect-[4/3] overflow-hidden rounded-[3px] bg-bone-deep">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.image}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
                    />
                  </div>
                  <div className="mt-5 flex items-center gap-3 text-[0.72rem] uppercase tracking-[0.16em] text-muted">
                    <span className="text-ember">{post.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="mt-2.5 font-display text-[1.35rem] font-semibold leading-tight tracking-[-0.03em] transition-opacity group-hover:opacity-70">
                    {post.title}
                  </h3>
                  <p className="mt-2.5 text-[0.9rem] leading-relaxed text-muted">
                    {post.excerpt}
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Newsletter ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-ember py-20 text-white md:py-28">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-6 top-1/2 hidden -translate-y-1/2 select-none font-display text-[20rem] font-bold leading-none text-white/[0.08] lg:block"
        >
          GAM
        </span>
        <div className="container-gamana relative grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <Reveal>
            <p className="label text-white/60">Stay close</p>
            <h2 className="mt-4 max-w-2xl font-display text-[clamp(2.1rem,5.4vw,4.2rem)] font-bold uppercase leading-[0.92] tracking-[-0.05em]">
              Roots, routes and first access.
            </h2>
            <p className="mt-5 max-w-lg text-pretty text-[0.95rem] leading-relaxed text-white/80">
              Drops, restocks and the occasional note from the studio. No noise,
              no daily blasts.
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <NewsletterForm tone="light" source="home" />
            <p className="mt-4 text-[0.75rem] text-white/60">
              By subscribing you agree to receive marketing email from{" "}
              {brand.name}. Unsubscribe any time.
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
