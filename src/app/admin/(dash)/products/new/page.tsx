import Link from "next/link";
import { ProductEditor } from "@/components/admin/product-editor";
import { LegacyContentImport } from "@/components/admin/legacy-content-import";
import { getAllProducts } from "@/lib/catalog-store";
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false } };
export default async function NewProduct() {
  const products = await getAllProducts();
  const seedFallback = products.length === 0;
  if (seedFallback) return <section className="max-w-2xl rounded-[4px] border border-bone/10 bg-bone/[0.03] p-7"><p className="label text-ember">Catalogue not synced</p><h1 className="mt-3 font-display text-3xl font-bold">Migrate the current catalogue first</h1><p className="mt-3 text-sm leading-relaxed text-bone/60">The seven starter products are currently only the storefront fallback. Run the one-time site migration first. It uploads the existing images and imports the products into Supabase, so the full catalogue stays together in the database.</p><div className="mt-5 flex items-center gap-4"><LegacyContentImport/><Link href="/admin/products" className="text-xs text-bone/60">Back to products</Link></div></section>;
  return <><h1 className="mb-6 font-display text-4xl font-bold">New product</h1><ProductEditor /></>;
}
