import type { Product } from "@/data/catalog";

/** The default shop order is shared by the homepage and shop page. */
export function sortStorefrontProducts(products: readonly Product[]): Product[] {
  return [...products].sort(
    (a, b) =>
      Number(b.featured ?? false) - Number(a.featured ?? false) ||
      a.name.localeCompare(b.name),
  );
}
