import { BrandName } from "@/components/brand-name";
import type { Metadata } from "next";
import Link from "next/link";
import { DropHome } from "@/components/drops/drop-home";
import { getDropProducts, getDropSchedule } from "@/lib/drops";
import { getStoreProducts } from "@/lib/homepage-store";

export const dynamic = "force-dynamic";
export function generateMetadata(): Metadata {
  const { active } = getDropSchedule();
  return { title: active ? `${active.name} — A గMANA Collection` : "గMANA — What Grounds You. Moves You.", description: active?.description, alternates: { canonical: "/" }, openGraph: active ? { title: `${active.name} by గMANA`, description: active.description, images: [active.heroImage] } : undefined };
}
export default async function HomePage() {
  const { active } = getDropSchedule();
  if (!active) return <section className="container-gamana py-28"><p className="label text-ember"><BrandName /> / The next chapter</p><h1 className="mt-6 text-6xl">Something is taking shape.</h1><p className="mt-5 text-muted">Explore the pieces available in the meantime.</p><Link className="brand-button mt-8" href="/shop">Explore the shop</Link></section>;
  return <DropHome campaign={active} products={getDropProducts(active, await getStoreProducts())} />;
}
