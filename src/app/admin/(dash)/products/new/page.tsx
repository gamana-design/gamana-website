import Link from "next/link";
import { ProductEditor } from "@/components/admin/product-editor";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false } };

export default function NewProduct() {
  return (
    <>
      <Link
        href="/admin/products"
        className="mb-4 inline-block text-xs text-bone/60 hover:text-ember"
      >
        ← Back to products
      </Link>
      <h1 className="mb-6 font-display text-4xl font-bold">New product</h1>
      <ProductEditor />
    </>
  );
}
