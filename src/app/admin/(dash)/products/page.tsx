import Link from "next/link";
import type { AdminProduct } from "@/lib/admin-product";
import { getAllProducts } from "@/lib/catalog-store";
import { isSupabaseConfigured } from "@/lib/supabase";
import { DeleteProduct } from "@/components/admin/delete-product";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false } };

export default async function Products() {
  let products: AdminProduct[] = [];
  let error = "";
  try {
    if (!isSupabaseConfigured())
      throw new Error(
        "Supabase is not configured. Check the server environment variables.",
      );
    products = await getAllProducts();
  } catch (cause) {
    error =
      cause instanceof Error
        ? cause.message
        : typeof cause === "object" && cause !== null && "message" in cause
          ? String(cause.message)
          : "Check the Supabase connection and admin schema.";
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold">Products</h1>
          <p className="mt-2 text-sm text-bone/55">
            Catalogue, variants and print setup.
          </p>
          <p className="mt-2 text-xs text-bone/45">
            Products without a confirmed order SKU are marked Test only. They
            cannot be ordered while checkout is in live mode.
          </p>
          {!error && products.length > 0 && (
            <p className="mt-2 text-xs text-emerald-300">
              Products are being read from Supabase.
            </p>
          )}
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-ember px-5 py-3 text-xs font-semibold text-kalam"
        >
          New product
        </Link>
      </div>
      {error ? (
        <p
          role="alert"
          className="mt-7 rounded border border-ember/30 p-4 text-sm text-ember"
        >
          Could not load products: {error}
        </p>
      ) : products.length === 0 ? (
        <section className="mt-7 rounded-[4px] border border-bone/10 bg-bone/[.03] p-6">
          <h2 className="font-display text-xl">Add your first products</h2>
          <p className="mb-5 mt-2 text-sm text-bone/60">
            Create a product, upload its images, and add pricing and variants to
            start selling.
          </p>
          <Link
            href="/admin/products/new"
            className="inline-block rounded-full bg-ember px-5 py-3 text-xs font-semibold text-kalam"
          >
            Create product
          </Link>
        </section>
      ) : (
        <div className="mt-7 overflow-x-auto rounded-[4px] border border-bone/10">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-bone/[.04] text-xs uppercase text-bone/50">
              <tr>
                {[
                  "Product",
                  "Status",
                  "Line",
                  "Print id",
                  "Variants",
                  "Price",
                  "Actions",
                ].map((x) => (
                  <th key={x} className="p-4">
                    {x}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-bone/10">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image}
                        className="h-12 w-12 rounded object-cover"
                        alt=""
                      />
                      <div>
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="font-medium hover:text-ember"
                        >
                          {p.name}
                        </Link>
                        <p className="text-xs text-bone/45">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="rounded-full border border-bone/10 px-3 py-1 text-[10px]">
                      {p.active === false
                        ? "Draft"
                        : p.variants.some((variant) => !variant.sku.trim())
                          ? "Test only"
                          : "Active"}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="rounded-full border border-bone/10 px-3 py-1 text-[10px]">
                      {p.line}
                    </span>
                  </td>
                  <td className="p-4">{p.printTypeId ?? "—"}</td>
                  <td className="p-4">{p.variants.length}</td>
                  <td className="p-4">₹{p.price.toLocaleString("en-IN")}</td>
                  <td className="p-4">
                    <div className="flex gap-3">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="text-xs text-ember"
                      >
                        Edit
                      </Link>
                      <DeleteProduct id={p.id} name={p.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
