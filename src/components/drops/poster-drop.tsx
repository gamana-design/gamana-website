import { BrandName } from "@/components/brand-name";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CSSProperties } from "react";
import type { DropCampaign } from "@/lib/drops";
import type { Product } from "@/data/catalog";
import { ProductCard } from "@/components/product-card";
import { NewsletterForm } from "@/components/newsletter-form";

/** A structurally independent campaign, not Bay Breeze with a recoloured banner. */
export function PosterDrop({ campaign: c, products }: { campaign: DropCampaign; products: Product[] }) {
  const style = { "--drop-paper": c.palette.paper, "--drop-ink": c.palette.ink, "--drop-accent": c.palette.accent, "--drop-mist": c.palette.mist } as CSSProperties;
  return <div className="drop-campaign drop-layout-poster" style={style} data-drop={c.id}>
    <section className="poster-hero container-gamana"><div className="poster-label"><p className="label">Collection {c.number} / {c.eyebrow}</p><p className="label">Available now</p></div><h1>{c.name}</h1><img src={c.heroImage} alt={c.heroAlt} fetchPriority="high" /><div><h2>{c.headline}</h2><p>{c.description}</p><Link className="drop-button" href="#the-drop">Explore the drop <ArrowUpRight size={18} /></Link></div></section>
    <section id="the-drop" className="poster-products container-gamana"><div className="poster-label"><h2>The collection.</h2><span className="label"><BrandName /> / {c.name}</span></div>{products.length ? <div className="poster-product-grid">{products.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}</div> : <p className="py-20">The collection is being prepared for the shop.</p>}</section>
    <section className="poster-story"><div className="container-gamana"><div><p className="label">Behind the collection</p><h2>{c.storyTitle}</h2><p>{c.story}</p><Link className="editorial-link" href="/lookbook">Explore the lookbook <ArrowUpRight size={17} /></Link></div><img src={c.editorialImage} alt={c.editorialAlt} loading="lazy" /></div></section>
    <section className="poster-close container-gamana"><p className="label">{c.name} by <BrandName /></p><h2>{c.closingLine}</h2><Link href="#the-drop" className="drop-button">Shop the collection <ArrowUpRight size={18} /></Link></section>
    <section className="campaign-newsletter container-gamana"><div><p className="label">Stay connected</p><h2>The next chapter starts here.</h2></div><NewsletterForm source={`drop-${c.id}`} /></section>
  </div>;
}
