import { BrandName } from "@/components/brand-name";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ShopBrowser } from "@/components/shop-browser";
import { getStoreProducts, getHomepageSettings } from "@/lib/homepage-store";
import { getDropSchedule } from "@/lib/drops";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "The Shop", description: "Explore గMANA. Culture-inspired streetwear and everyday performance apparel.", alternates: { canonical: "/shop" } };
export default async function ShopPage() {
  const [products, home] = await Promise.all([getStoreProducts(), getHomepageSettings()]);
  const { active } = getDropSchedule();
  const campaign = active ? { id: active.id, name: active.name, productSlugs: active.productSlugs } : null;
  return <><section className="brand-page-hero"><div className="container-gamana brand-shop-intro"><div><p className="label brand-page-index"><BrandName /> / The shop</p><h1>Everyday, reimagined.</h1><div className="brand-page-hero-copy"><p>Rooted in culture. Made for wherever the day takes you.<br />Find the pieces that feel like you.</p></div></div>{active && <Link href="/#the-drop" className="shop-intro-side"><span className="label">The current chapter</span><span className="mt-2 block text-lg text-graphite">{active.name} ↗</span></Link>}</div></section><Suspense fallback={<div className="container-gamana py-20">Loading the collection…</div>}><ShopBrowser products={products} coreComingSoon={home.coreComingSoon} coreComingSoonText={home.coreComingSoonText} campaign={campaign} /></Suspense></>;
}
