import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductDetail } from "@/components/product-detail";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { getProduct, products } from "@/data/catalog";
import { brand } from "@/lib/brand";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Product not found" };

  return {
    title: product.name,
    description: `${product.blurb} ${brand.name} — ${product.line} line.`,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: `${product.name} — ${brand.name}`,
      description: product.blurb,
      images: [{ url: product.image }],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const related = products
    .filter((p) => p.id !== product.id && p.line === product.line)
    .slice(0, 4);

  return (
    <>
      <div className="container-gamana pt-6">
        <nav aria-label="Breadcrumb" className="label flex items-center gap-2 text-muted">
          <Link href="/" className="hover:text-graphite">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/shop" className="hover:text-graphite">
            Shop
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-graphite">{product.name}</span>
        </nav>
      </div>

      <section className="container-gamana py-8 md:py-12">
        <ProductDetail product={product} />
      </section>

      {related.length > 0 && (
        <section className="border-t border-line bg-bone-deep/40 py-16 md:py-24">
          <div className="container-gamana">
            <Reveal>
              <p className="label text-muted">Complete the rotation</p>
              <h2 className="mt-4 font-display text-[clamp(1.8rem,4.2vw,3rem)] font-semibold tracking-[-0.04em]">
                More from {product.line}
              </h2>
            </Reveal>
            <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
              {related.map((p, i) => (
                <Reveal key={p.id} delay={i * 0.06}>
                  <ProductCard product={p} index={i} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
