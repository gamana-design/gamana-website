import type { Product } from "@/data/catalog";

type CartLineForCatalogue = {
  productId: string;
  slug: string;
  name: string;
  line: string;
  image: string;
  price: number;
  storeSkuReady: boolean;
  testOnly: boolean;
  unavailable?: boolean;
  size: string;
  color: string;
};

export function reconcileCartCatalogue<T extends CartLineForCatalogue>(
  lines: readonly T[],
  products: readonly Product[],
): {
  lines: T[];
  priceChanged: boolean;
  readinessChanged: boolean;
  hasUnavailable: boolean;
} {
  const bySlug = new Map(products.map((product) => [product.slug, product]));
  let priceChanged = false;
  let readinessChanged = false;
  let hasUnavailable = false;

  const nextLines = lines.map((line) => {
    const product = bySlug.get(line.slug);
    const variant = product?.variants.find(
      (item) => item.size === line.size && item.color === line.color,
    );

    if (
      !product ||
      !variant ||
      variant.stock === "out" ||
      !Number.isFinite(product.price) ||
      product.price <= 0
    ) {
      hasUnavailable = true;
      return { ...line, unavailable: true };
    }

    const testOnly = product.variants.some(
      (item) => item.storeSkuReady !== true,
    );
    const storeSkuReady = !testOnly;
    if (line.price !== product.price) priceChanged = true;
    if (
      line.storeSkuReady !== storeSkuReady ||
      line.testOnly !== testOnly ||
      line.unavailable === true
    )
      readinessChanged = true;

    return {
      ...line,
      productId: product.id,
      name: product.name,
      line: product.line,
      image: product.image,
      price: product.price,
      storeSkuReady,
      testOnly,
      unavailable: false,
    };
  });

  return { lines: nextLines, priceChanged, readinessChanged, hasUnavailable };
}
