import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { sortStorefrontProducts } from "../src/lib/product-order";
import type { Product } from "../src/data/catalog";

const product = (slug: string, name: string, featured = false) =>
  ({ slug, name, featured }) as Product;

test("homepage and the default shop view use one shared catalogue order", () => {
  const products = [
    product("z-last", "Zulu"),
    product("b-featured", "Bravo", true),
    product("a-featured", "Alpha", true),
  ];
  assert.deepEqual(
    sortStorefrontProducts(products).map((item) => item.slug),
    ["a-featured", "b-featured", "z-last"],
  );

  const home = readFileSync("src/app/page.tsx", "utf8");
  const shop = readFileSync("src/app/shop/page.tsx", "utf8");
  const browser = readFileSync("src/components/shop-browser.tsx", "utf8");
  assert.match(home, /sortStorefrontProducts\(await getStoreProducts\(\)\)/);
  assert.doesNotMatch(home, /getDropProducts/);
  assert.match(shop, /getStoreProducts\(\)/);
  assert.match(browser, /sortStorefrontProducts\(list\)/);
});

test("the public catalogue endpoint cannot keep stale prices in an edge cache", () => {
  const route = readFileSync("src/app/api/products/route.ts", "utf8");
  assert.match(route, /"Cache-Control": "no-store"/);
});
