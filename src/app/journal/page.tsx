import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Reveal } from "@/components/reveal";
import { journal } from "@/data/editorial";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Notes from the GAMANA studio — process, product decisions and the ideas behind the brand.",
  alternates: { canonical: "/journal" },
};

export default function JournalPage() {
  const [lead, ...rest] = journal;

  return (
    <>
      <section className="border-b border-line bg-bone-deep/40">
        <div className="container-gamana py-14 md:py-20">
          <p className="label text-muted">Journal</p>
          <h1 className="mt-5 max-w-3xl font-display text-[clamp(2.4rem,7vw,5.2rem)] font-bold uppercase leading-[0.88] tracking-[-0.05em]">
            Notes from the road
          </h1>
        </div>
      </section>

      <section className="bg-bone py-14 md:py-20">
        <div className="container-gamana">
          <Reveal>
            <Link href={`/journal/${lead.slug}`} className="group block">
              <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-14">
                <div className="aspect-[4/3] overflow-hidden rounded-[3px] bg-bone-deep">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={lead.image}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-3 text-[0.72rem] uppercase tracking-[0.16em] text-muted">
                    <span className="text-ember">{lead.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{lead.readTime}</span>
                  </div>
                  <h2 className="mt-4 font-display text-[clamp(1.8rem,4.4vw,3.1rem)] font-semibold leading-[1.02] tracking-[-0.04em] transition-opacity group-hover:opacity-70">
                    {lead.title}
                  </h2>
                  <p className="mt-4 max-w-lg text-pretty text-[0.98rem] leading-relaxed text-muted">
                    {lead.excerpt}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 text-[0.8rem] font-medium uppercase tracking-[0.16em]">
                    Read
                    <ArrowUpRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      strokeWidth={1.7}
                    />
                  </span>
                </div>
              </div>
            </Link>
          </Reveal>

          <div className="mt-16 grid gap-10 border-t border-line pt-14 md:grid-cols-3">
            {rest.map((post, i) => (
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
    </>
  );
}
