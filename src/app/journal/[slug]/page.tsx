import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { NewsletterForm } from "@/components/newsletter-form";
import { journal } from "@/data/editorial";
import { journalBodies } from "@/data/journal-content";

export function generateStaticParams() {
  return journal.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = journal.find((p) => p.slug === slug);
  if (!post) return { title: "Not found" };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/journal/${post.slug}` },
    openGraph: { title: post.title, description: post.excerpt, images: [post.image] },
  };
}

export default async function JournalPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = journal.find((p) => p.slug === slug);
  if (!post) notFound();

  const body = journalBodies[post.slug] ?? [];
  const others = journal.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <>
      <article className="bg-bone">
        <header className="container-gamana pt-12 md:pt-20">
          <nav className="label flex items-center gap-2 text-muted">
            <Link href="/journal" className="hover:text-graphite">
              Journal
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-graphite">{post.title}</span>
          </nav>
          <p className="mt-8 flex items-center gap-3 text-[0.72rem] uppercase tracking-[0.16em] text-muted">
            <span className="text-ember">{post.category}</span>
            <span aria-hidden="true">·</span>
            <span>{post.readTime} read</span>
            <span aria-hidden="true">·</span>
            <span>{post.date}</span>
          </p>
          <h1 className="mt-5 max-w-4xl font-display text-[clamp(2.1rem,5.8vw,4.4rem)] font-semibold leading-[0.95] tracking-[-0.048em]">
            {post.title}
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-[1.05rem] leading-relaxed text-muted">
            {post.excerpt}
          </p>
        </header>

        <div className="container-gamana mt-10 md:mt-14">
          <div className="aspect-[16/9] overflow-hidden rounded-[3px] bg-bone-deep">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.image} alt="" className="h-full w-full object-cover" />
          </div>
        </div>

        <div className="container-gamana py-14 md:py-20">
          <div className="mx-auto max-w-2xl">
            {body.map((block, i) => {
              if (block.type === "h") {
                return (
                  <h2
                    key={i}
                    className="mt-12 font-display text-[1.6rem] font-semibold tracking-[-0.035em]"
                  >
                    {block.text}
                  </h2>
                );
              }
              if (block.type === "quote") {
                return (
                  <blockquote
                    key={i}
                    className="my-10 border-l-2 border-ember pl-6 font-display text-[1.35rem] font-medium leading-[1.35] tracking-[-0.03em] text-graphite"
                  >
                    {block.text}
                  </blockquote>
                );
              }
              return (
                <p
                  key={i}
                  className="mt-5 text-[1.02rem] leading-[1.75] text-graphite/85"
                >
                  {block.text}
                </p>
              );
            })}
          </div>
        </div>
      </article>

      <section className="border-t border-line bg-bone-deep/40 py-14 md:py-20">
        <div className="container-gamana">
          <p className="label text-muted">Keep reading</p>
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            {others.map((other) => (
              <Link key={other.slug} href={`/journal/${other.slug}`} className="group block">
                <div className="aspect-[16/9] overflow-hidden rounded-[3px] bg-bone-deep">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={other.image}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
                  />
                </div>
                <p className="mt-4 text-[0.72rem] uppercase tracking-[0.16em] text-ember">
                  {other.category}
                </p>
                <h3 className="mt-2 font-display text-[1.3rem] font-semibold tracking-[-0.03em] transition-opacity group-hover:opacity-70">
                  {other.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ember py-16 text-white md:py-20">
        <div className="container-gamana grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <h2 className="max-w-xl font-display text-[clamp(1.7rem,4.4vw,3rem)] font-bold uppercase leading-[0.95] tracking-[-0.05em]">
            Roots, routes and first access
          </h2>
          <NewsletterForm tone="light" source="journal" />
        </div>
      </section>
    </>
  );
}
