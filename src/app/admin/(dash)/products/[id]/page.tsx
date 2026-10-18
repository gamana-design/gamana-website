import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/catalog-store";
import { ProductEditor } from "@/components/admin/product-editor";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false } };

export default async function EditProduct({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  )
    notFound();
  const product = await getProductById(id);
  if (!product) notFound();
  return (
    <>
      <Link
        href="/admin/products"
        className="mb-4 inline-block text-xs text-bone/60 hover:text-ember"
      >
        ← Back to products
      </Link>
      <h1 className="mb-6 font-display text-4xl font-bold">Edit product</h1>
      <ProductEditor product={product} />
    </>
  );
}
