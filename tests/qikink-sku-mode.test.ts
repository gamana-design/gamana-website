import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(path, "utf8");

test("live orders use Store SKU with Qikink product search enabled", () => {
  const projection = read("src/lib/admin-product.ts");
  assert.match(projection, /sku: "",\s*storeSkuReady: Boolean\(storeSku\?\.trim\(\)\)/);

  const checkout = read("src/app/api/orders/route.ts");
  assert.match(checkout, /getAllProducts\(\)/);
  assert.match(checkout, /\?\.storeSku\?\.trim\(\) \?\? ""/);
  assert.match(checkout, /sku: storeSku/);
  assert.match(checkout, /storeSkuUseCounts\.get\(normalizeStoreSku\(storeSku\)\) !== 1/);
  assert.doesNotMatch(checkout, /resolveSku|QIKINK_SKU_MAP|sku: l\.variant\.sku/);

  const store = read("src/lib/catalog-store.ts");
  assert.match(store, /storeSkuUseCounts\.get\(sku\) === 1/);
  assert.match(store, /select\("product_id, store_sku"\)/);
  assert.match(store, /neq\("product_id", raw\.id\)/);

  const fulfilment = read("src/lib/checkout/fulfilment.ts");
  assert.match(fulfilment, /search_from_my_products: 1/);
  assert.match(fulfilment, /sku: item\.sku/);
});

test("browser cart keeps the supplier code private and treats old carts as test-only", () => {
  const cart = read("src/lib/cart.tsx");
  assert.match(cart, /const storeSkuReady = line\.storeSkuReady === true/);
  assert.match(cart, /testOnly: !storeSkuReady \|\| line\.testOnly === true/);
  assert.match(cart, /sku: ""/);
});

test("Qikink requests using product search disabled use Product SKU", () => {
  const testOrder = read("src/app/api/admin/qikink/route.ts");
  assert.match(testOrder, /search_from_my_products: 0/);
  assert.match(testOrder, /sku: productSku/);
  assert.match(testOrder, /body\.productSku/);
});
