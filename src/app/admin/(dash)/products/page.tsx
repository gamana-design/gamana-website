import Link from "next/link";
import type { AdminProduct } from "@/lib/admin-product";
import { getAllProducts } from "@/lib/catalog-store";
import { isSupabaseConfigured } from "@/lib/supabase";
import { DeleteProduct } from "@/components/admin/delete-product";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false } };

export default async function Products() {
  let products: AdminProduct[] = [];
  let error = false;
  try {
    if (!isSupabaseConfigured()) throw new Error("Product storage is not set up.");
    products = await getAllProducts();
  } catch {
    error = true;
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold">Products</h1>
          <p className="mt-2 text-sm text-bone/55">
            Add and change the products customers can buy.
          </p>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-bone/45">
            Items marked “For testing only” can be tried in test mode. Live
            checkout will not accept them until every size has a Qikink-confirmed
            order code.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-ember px-5 py-3 text-xs font-semibold text-kalam"
        >
          Add product
        </Link>
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-7 rounded border border-ember/30 p-4 text-sm text-ember"
        >
          Products could not load. Refresh this page. If the problem continues,
          please ask for help.
        </p>
      ) : products.length === 0 ? (
        <section className="mt-7 rounded-[4px] border border-bone/10 bg-bone/[.03] p-6">
          <h2 className="font-display text-xl">Add your first product</h2>
          <p className="mb-5 mt-2 text-sm text-bone/60">
            Enter a name and price, add a photo, then choose the sizes you sell.
          </p>
          <Link
            href="/admin/products/new"
            className="inline-block rounded-full bg-ember px-5 py-3 text-xs font-semibold text-kalam"
          >
            Add product
          </Link>
        </section>
      ) : (
        <div className="mt-7 overflow-x-auto rounded-[4px] border border-bone/10">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="bg-bone/[.04] text-xs uppercase text-bone/50">
              <tr>
                {["Product", "Shop status", "Price", "Sizes / colours", "Actions"].map(
                  (heading) => (
                    <th key={heading} className="p-4">
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-bone/10">
              {products.map((product) => {
                const testOnly = product.variants.some(
                  (variant) => !variant.sku.trim(),
                );
                const status =
                  product.active === false
                    ? "Hidden"
                    : testOnly
                      ? "For testing only"
                      : "In shop";
                return (
                  <tr key={product.id}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {product.image ? (
                          <img
                            src={product.image}
                            className="h-12 w-12 rounded object-cover"
                            alt=""
                          />
                        ) : (
                          <span className="grid h-12 w-12 place-items-center rounded bg-bone/5 text-xs text-bone/40">
                            No photo
                          </span>
                        )}
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="font-medium hover:text-ember"
                        >
                          {product.name}
                        </Link>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="rounded-full border border-bone/10 px-3 py-1 text-[10px]">
                        {status}
                      </span>
                    </td>
                    <td className="p-4">₹{product.price.toLocaleString("en-IN")}</td>
                    <td className="p-4">{product.variants.length}</td>
                    <td className="p-4">
                      <div className="flex gap-3">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="text-xs text-ember"
                        >
                          Change
                        </Link>
                        <DeleteProduct id={product.id} name={product.name} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
