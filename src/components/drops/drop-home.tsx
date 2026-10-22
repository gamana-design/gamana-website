import { SHIPPING_HEADLINE } from "@/lib/shipping";
import { BrandName } from "@/components/brand-name";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, Waves } from "lucide-react";
import type { CSSProperties } from "react";
import type { DropCampaign } from "@/lib/drops";
import type { Product } from "@/data/catalog";
import { ProductCard } from "@/components/product-card";
import { NewsletterForm } from "@/components/newsletter-form";
import { PosterDrop } from "./poster-drop";
import { Reveal } from "@/components/reveal";

function RiverLines({ className = "" }: { className?: string }) {
  return <svg aria-hidden="true" viewBox="0 0 600 120" fill="none" className={className}>
    {[0, 18, 36, 54].map((y) => <path key={y} d={`M-20 ${32+y} C100 ${-25+y} 200 ${100+y} 320 ${40+y} S500 ${12+y} 630 ${44+y}`} stroke="currentColor" strokeWidth="1" />)}
  </svg>;
}

export function DropHome({ campaign: c, products }: { campaign: DropCampaign; products: Product[] }) {
  if (c.layout === "poster") return <PosterDrop campaign={c} products={products} />;
  const style = {
    "--drop-paper": c.palette.paper, "--drop-ink": c.palette.ink,
    "--drop-accent": c.palette.accent, "--drop-mist": c.palette.mist,
  } as CSSProperties;
  return <div className={`drop-campaign drop-layout-${c.layout}`} style={style} data-drop={c.id}>
    <section className="bay-hero" aria-labelledby="drop-title">
      <img src={c.heroImage} alt={c.heroAlt} fetchPriority="high" className="bay-hero-image" />
      <div className="bay-hero-wash" />
      <div className="bay-hero-content container-gamana">
        <div className="bay-hero-meta"><span className="label"><BrandName /> / Collection {c.number}</span><span className="label"><i /> Available now</span></div>
        <div className="bay-hero-type"><p className="label">{c.eyebrow}</p><h1 id="drop-title" aria-label={c.name}>{c.name.split(" ").map((word, i) => <span key={word} className={i ? "bay-title-second" : ""}>{word}</span>)}</h1><span className="bay-edition">River notes<br />Edition {c.number} / URBAN</span></div>
        <div className="bay-hero-bottom"><div><p className="bay-headline">{c.headline}</p><p className="bay-hero-description">{c.description}</p><p className="bay-shipping-note">{SHIPPING_HEADLINE} Included in the price.</p></div><Link href="#the-drop" className="drop-button">Explore the drop <ArrowUpRight size={18} strokeWidth={1.5} /></Link></div>
      </div>
      <div className="bay-river-label label"><Waves size={20} strokeWidth={1} /><span>Inspired by the Godavari</span><a href="#river-story" aria-label="Discover the collection story"><ArrowDown size={18} /></a></div>
    </section>

    <div className="drop-strip" aria-label="Collection notes"><span>{c.name} / Collection {c.number}</span><Waves size={22} strokeWidth={1} /><span>Rooted in origin. Made to move.</span><Waves size={22} strokeWidth={1} /><span>From our world, to yours.</span></div>

    <section id="river-story" className="bay-story container-gamana">
      <Reveal className="bay-story-heading"><p className="label">01 / The feeling</p><h2>{c.storyTitle}</h2><RiverLines className="bay-story-lines" /></Reveal>
      <Reveal delay={0.1} className="bay-story-copy"><p>{c.story}</p><a href="#the-drop" className="editorial-link">Wear the feeling <ArrowUpRight size={17} /></a></Reveal>
    </section>

    <section id="the-drop" className="bay-products container-gamana">
      <div className="bay-section-heading"><div><p className="label">02 / The collection</p><h2>A change of pace.</h2></div><p>The Godavari, reimagined.<br />Find your everyday escape.</p></div>
      {products.length ? <div className="bay-product-grid">{products.map((p, i) => <Reveal key={p.id} delay={i * 0.08}><ProductCard product={p} index={i} /></Reveal>)}</div> : <div className="drop-empty"><p>The pieces are being prepared for the shop.</p><Link href="/shop" className="editorial-link">Explore <BrandName /> <ArrowRight size={17} /></Link></div>}
      <div className="bay-collection-link"><Link href="/shop" className="editorial-link">View all available pieces <ArrowUpRight size={17} /></Link><span className="label">Designed to go with you.</span></div>
    </section>

    <section className="bay-editorial" aria-label="Campaign editorial">
      <img src={c.editorialImage} alt={c.editorialAlt} loading="lazy" />
      <div className="bay-editorial-overlay" /><div className="container-gamana bay-editorial-caption"><p className="label">River days / Everyday ways</p><h2>Nowhere to rush.<br />Everywhere to go.</h2><Link href="#the-drop" className="drop-button drop-button-light">Find your piece <ArrowUpRight size={18} /></Link></div>
      <span className="bay-editorial-credit label">{c.name} by <BrandName onDark /></span>
    </section>

    <section className="bay-details container-gamana">
      <div><p className="label">03 / A closer look</p><h2>Home is in<br />the details.</h2><p>Colours borrowed from the river. Stories carried in the print. Discover the artwork behind the collection.</p><Link href="/lookbook" className="editorial-link">Into the lookbook <ArrowUpRight size={17} /></Link></div>
      <figure><img src="/images/brand/godavari-lavender-back.jpg" alt="The Godavari-inspired artwork on the back of the Lavender Dusk tee" loading="lazy" /><figcaption><span>01 / A river-side story</span><span><BrandName /> URBAN</span></figcaption></figure>
      <figure className="bay-detail-offset"><img src="/images/brand/detail-violet-fabric.jpg" alt="Close view of the existing Violet Hour collection print" loading="lazy" /><figcaption><span>02 / Colour in the everyday</span><span>Bay Breeze</span></figcaption></figure>
    </section>

    <section className="bay-signoff"><RiverLines className="bay-signoff-lines" /><div className="container-gamana"><p className="label">From the river, with feeling.</p><h2>{c.closingLine}</h2><Link href="#the-drop" className="drop-button">Shop {c.name} <ArrowUpRight size={18} /></Link><p className="bay-signoff-wordmark"><BrandName /></p></div></section>
    <section className="campaign-newsletter container-gamana"><div><p className="label">The next chapter</p><h2>Be in the know.</h2><p>Join the list for collection news and what comes next.</p></div><div><NewsletterForm source={`drop-${c.id}`} /><p className="newsletter-fineprint">Only the good things. Unsubscribe whenever you like.</p></div></section>
  </div>;
}
