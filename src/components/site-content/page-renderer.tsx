import { BrandName, BrandText } from "@/components/brand-name";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { SitePage, SiteSection } from "@/lib/site-content";
import { getStoreProducts } from "@/lib/homepage-store";
import { getJournalPosts } from "@/lib/site-content";
import { ProductCard } from "@/components/product-card";
import { NewsletterForm } from "@/components/newsletter-form";

function Body({ text, className = "", onDark = false }: { text?: string; className?: string; onDark?: boolean }) {
  return <div className={className}>{(text ?? "").split("\n").filter(Boolean).map((line, i) => <p key={i} className={i ? "mt-4" : ""}><BrandText onDark={onDark}>{line}</BrandText></p>)}</div>;
}
function SectionHeading({ section }: { section: SiteSection }) {
  return <><p className="brand-section-kicker label opacity-70"><BrandText onDark={section.tone === "dark"}>{section.eyebrow}</BrandText></p>{section.title && <h2 className="mt-5 max-w-4xl font-display text-[clamp(2rem,4.6vw,4.5rem)] leading-[1.04]"><BrandText onDark={section.tone === "dark"}>{section.title}</BrandText></h2>}</>;
}
function PageSection({ section: s, products, posts, index }: { section: SiteSection; products: Awaited<ReturnType<typeof getStoreProducts>>; posts: Awaited<ReturnType<typeof getJournalPosts>>; index: number }) {
  if (!s.visible) return null;
  const tone = s.tone ?? "bone";
  const buttonOnDark = s.type === "cta" || (s.type !== "hero" && tone === "dark");
  const shell = tone === "dark" ? "bg-kalam text-bone" : "bg-bone text-graphite";
  if (s.type === "hero") return <section id={s.id} className="brand-page-hero bg-bone text-graphite"><div className="container-gamana"><p className="brand-page-index label"><BrandName /> / <BrandText>{s.eyebrow || "Everyday, considered"}</BrandText></p><h1><BrandText>{s.title}</BrandText></h1><div className="brand-page-hero-copy"><Body text={s.body} />{s.buttonLabel ? <Link className="editorial-link" href={s.buttonHref ?? "/shop"}><BrandText onDark={buttonOnDark}>{s.buttonLabel}</BrandText><ArrowUpRight size={18} /></Link> : <span className="label text-muted">What grounds you. Moves you.</span>}</div>{s.image && <img className="mt-10 aspect-[21/9] w-full object-cover" src={s.image} alt={s.imageAlt ?? s.title ?? ""} />}</div></section>;
  if (s.type === "products") {
    const list = s.dataSource === "urban" ? products.filter(p => p.line === "URBAN") : s.dataSource === "featured" ? products.filter(p => p.featured) : products;
    return <section id={s.id} className={`${shell} brand-content-section`}><div className="container-gamana"><SectionHeading section={s} /><div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">{list.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}</div></div></section>;
  }
  if (s.type === "journal") return <section id={s.id} className={`${shell} brand-content-section`}><div className="container-gamana"><SectionHeading section={s} /><div className="mt-12 grid gap-x-8 gap-y-14 md:grid-cols-3">{posts.slice(0,6).map((post,i) => <Link key={post.slug} href={`/journal/${post.slug}`} className="group"><div className="overflow-hidden"><img src={post.image} alt={post.title} loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" /></div><div className="mt-5 flex justify-between text-[9px] uppercase tracking-widest text-ember-deep"><p>{post.category}</p><span>0{i+1} ↗</span></div><h3 className="mt-3 font-display text-2xl font-medium leading-tight"><BrandText>{post.title}</BrandText></h3><p className="mt-3 text-xs leading-relaxed opacity-70"><BrandText>{post.excerpt}</BrandText></p></Link>)}</div></div></section>;
  if (s.type === "newsletter") return <section id={s.id} className={`${shell} brand-content-section border-t border-line`}><div className="container-gamana grid items-center gap-12 md:grid-cols-2"><div><SectionHeading section={s} /><Body text={s.body} onDark={tone === "dark"} className="mt-5 text-sm opacity-75" /></div><NewsletterForm tone={tone === "dark" ? "light" : "dark"} source={s.id} /></div></section>;
  if (s.type === "gallery") return <section id={s.id} className={`${shell} brand-content-section`}><div className="container-gamana"><SectionHeading section={s} /><div className="brand-gallery mt-12 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3">{(s.items ?? []).map((item,i) => <figure key={i}>{item.image && <div className="overflow-hidden"><img src={item.image} alt={item.label ?? item.title ?? ""} loading="lazy" className="aspect-[4/5] w-full object-cover transition-transform duration-700 hover:scale-[1.03]" /></div>}<figcaption className="mt-4 border-t border-current/20 pt-3"><p className="text-[9px] uppercase tracking-wider opacity-60">{String(i+1).padStart(2,"0")} / {item.label || "From our world"}</p><h3 className="mt-2 text-base font-medium leading-snug"><BrandText>{item.title}</BrandText></h3>{item.body && <p className="mt-2 text-xs leading-relaxed opacity-70"><BrandText>{item.body}</BrandText></p>}</figcaption></figure>)}</div></div></section>;
  if (s.type === "split") return <section id={s.id} className={`${shell} brand-content-section`}><div className="brand-split-layout container-gamana grid items-center gap-10 lg:grid-cols-2">{s.image && <img src={s.image} alt={s.imageAlt ?? ""} loading="lazy" className="aspect-[4/5] w-full object-cover" />}<div><SectionHeading section={s} /><Body text={s.body} onDark={tone === "dark"} className="mt-7 max-w-xl text-sm leading-[1.9] opacity-75" />{s.buttonLabel && <Link href={s.buttonHref ?? "/shop"} className="editorial-link mt-6"><BrandText onDark={buttonOnDark}>{s.buttonLabel}</BrandText><ArrowRight size={17} /></Link>}</div></div></section>;
  if (s.type === "cta") return <section id={s.id} className="brand-content-section bg-kalam text-bone"><div className="container-gamana text-center"><p className="label text-ember"><BrandText onDark>{s.eyebrow}</BrandText></p><h2 className="mx-auto mt-6 max-w-4xl font-display text-[clamp(2.8rem,6vw,6rem)] leading-none"><BrandText onDark>{s.title}</BrandText></h2><Body text={s.body} onDark className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed opacity-75" />{s.buttonLabel && <Link href={s.buttonHref ?? "/shop"} className="mt-8 inline-flex items-center gap-8 border-b border-bone/60 pb-3 text-xs"><BrandText onDark={buttonOnDark}>{s.buttonLabel}</BrandText><ArrowUpRight size={17} /></Link>}</div></section>;
  return <section id={s.id} className={`${shell} brand-content-section border-b border-line`}><div className="container-gamana grid gap-6 md:grid-cols-[.25fr_1fr_1fr]"><span className="label opacity-50">{String(index).padStart(2, "0")} /</span><div><SectionHeading section={s} /></div><Body text={s.body} onDark={tone === "dark"} className="max-w-xl self-center text-sm leading-[1.9] opacity-75" /></div></section>;
}
export async function PageRenderer({ page }: { page: SitePage }) {
  const needsProducts = page.sections.some(s => s.visible && s.type === "products");
  const needsPosts = page.sections.some(s => s.visible && s.type === "journal");
  const [products, posts] = await Promise.all([needsProducts ? getStoreProducts() : Promise.resolve([]), needsPosts ? getJournalPosts() : Promise.resolve([])]);
  return <>{page.sections.filter(s => s.visible).map((section, index) => <PageSection key={section.id} section={section} products={products} posts={posts} index={index} />)}</>;
}
