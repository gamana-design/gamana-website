import test from "node:test";
import assert from "node:assert/strict";
import { legacyProducts } from "../src/data/legacy-site-content";
import { reconcileCartCatalogue } from "../src/lib/cart-catalog";
import type { CartLine } from "../src/lib/cart";
import type { Product } from "../src/data/catalog";

const sourceProduct: Product = {
  ...legacyProducts[0],
  id: "product-current",
  price: 1299,
  variants: legacyProducts[0].variants.map((variant) => ({
    ...variant,
    sku: "",
    storeSkuReady: true,
  })),
};
const variant = sourceProduct.variants[0];
const savedLine: CartLine = {
  key: `${sourceProduct.slug}::${variant.color}::${variant.size}`,
  productId: "old-product-id",
  slug: sourceProduct.slug,
  name: "Old product name",
  line: "URBAN",
  image: "/old-photo.jpg",
  price: 899,
  sku: "",
  storeSkuReady: false,
  testOnly: true,
  size: variant.size,
  color: variant.color,
  quantity: 1,
  maxQuantity: 10,
};

test("reconciles saved cart prices and display details from the current catalogue", () => {
  const result = reconcileCartCatalogue([savedLine], [sourceProduct]);

  assert.equal(result.priceChanged, true);
  assert.equal(result.readinessChanged, true);
  assert.equal(result.hasUnavailable, false);
  assert.equal(result.lines[0].price, 1299);
  assert.equal(result.lines[0].name, sourceProduct.name);
  assert.equal(result.lines[0].image, sourceProduct.image);
  assert.equal(result.lines[0].productId, sourceProduct.id);
  assert.equal(result.lines[0].testOnly, false);
  assert.equal(result.lines[0].unavailable, false);
});

test("marks removed or sold-out cart variations unavailable without silently deleting them", () => {
  const removed = reconcileCartCatalogue([savedLine], []);
  assert.equal(removed.hasUnavailable, true);
  assert.equal(removed.lines.length, 1);
  assert.equal(removed.lines[0].unavailable, true);

  const soldOutProduct: Product = {
    ...sourceProduct,
    variants: sourceProduct.variants.map((item, index) =>
      index === 0 ? { ...item, stock: "out" } : item,
    ),
  };
  const soldOut = reconcileCartCatalogue([savedLine], [soldOutProduct]);
  assert.equal(soldOut.hasUnavailable, true);
  assert.equal(soldOut.lines[0].unavailable, true);
});

test("leaves the cart unchanged when the current product price has not changed", () => {
  const currentLine = { ...savedLine, price: sourceProduct.price, testOnly: false, storeSkuReady: true };
  const result = reconcileCartCatalogue([currentLine], [sourceProduct]);
  assert.equal(result.priceChanged, false);
  assert.equal(result.readinessChanged, false);
  assert.equal(result.lines[0].price, sourceProduct.price);
});
