import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import {
  validateProductDraft,
  appendSizeVariants,
  toStorefrontProduct,
} from "../src/lib/admin-product";
import {
  productColumns,
  variantColumns,
  rowToProduct,
} from "../src/lib/admin-product-storage";

const fixture = () => ({
  name: "Fixture AOP Tee",
  slug: "fixture-aop-tee",
  line: "URBAN",
  category: "T-Shirts",
  price: 899,
  compareAt: "",
  image: "",
  active: false,
  printTypeId: 2,
  qikinkProductId: "12345678",
  qikinkProductType: "Unisex AOP Oversized Tee | UA22",
  gallery: [],
  details: [],
  tags: [],
  designUrl: "",
  mockupUrl: "",
  variants: [
    {
      size: "S",
      color: "White",
      sku: "",
      printTypeId: 2,
      stock: "in",
      productSku: "UAopUOs-Wh-S",
      designSku: "Front-Back-Sleeve-Sleeve-Neck",
      storeSku: "v-fixture-small",
      productCost: 378,
    },
  ],
});

test("draft keeps the three Qikink references separate without guessing the order SKU", () => {
  const d = validateProductDraft(fixture());
  assert.equal(d.active, false);
  assert.equal(d.variants![0].sku, "");
  assert.equal(d.variants![0].productSku, "UAopUOs-Wh-S");
  assert.equal(d.variants![0].storeSku, "v-fixture-small");
  assert.equal(d.variants![0].productCost, 378);
  assert.equal(d.image, "");
});

test("product editor uses four plain steps and keeps optional supplier settings out of the way", () => {
  const editor = readFileSync(
    "src/components/admin/product-editor.tsx",
    "utf8",
  );
  for (const label of [
    'title="Name and price"',
    'title="Add photos"',
    'title="Add sizes and colours"',
    'title="Choose where to show it"',
  ]) {
    assert.ok(editor.includes(label), `Missing ${label}`);
  }
  assert.match(editor, /max-w-4xl space-y-5/);
  assert.match(editor, /Qikink and print settings \(optional\)/);
  assert.match(editor, /Other Qikink details and cost/);
  assert.match(editor, /Confirmed order SKU/);
  assert.match(editor, /Qikink order code \(optional while testing\)/);
  assert.match(editor, /Live checkout/i);
  assert.doesNotMatch(editor, /aria-required=\{d\.active\}/);
});

test("active products may omit order SKUs for testing but still need a photo, price and size", () => {
  assert.throws(
    () => validateProductDraft({ ...fixture(), active: true }),
    /main photo/,
  );
  const d = fixture();
  d.image = "https://example.com/cover.jpg";
  const testOnly = validateProductDraft({ ...d, active: true });
  assert.equal(testOnly.active, true);
  assert.equal(testOnly.variants![0].sku, "");

  d.variants[0].sku = "CONFIRMED-S";
  assert.equal(
    validateProductDraft({ ...d, active: true }).variants![0].sku,
    "CONFIRMED-S",
  );
  assert.throws(
    () => validateProductDraft({ ...d, active: true, price: 0 }),
    /price above ₹0/,
  );
  assert.throws(
    () => validateProductDraft({ ...d, active: true, variants: [] }),
    /at least one size/,
  );
});

test("validates money, print methods, identifiers, media links and duplicate variations on server", () => {
  for (const price of [-1, "abc", null, false, 1.234, Infinity])
    assert.throws(() => validateProductDraft({ ...fixture(), price }));
  assert.throws(
    () => validateProductDraft({ ...fixture(), qikinkProductId: "abc" }),
    /digits/,
  );
  assert.throws(
    () => validateProductDraft({ ...fixture(), printTypeId: 4 }),
    /print method/,
  );
  assert.throws(
    () => validateProductDraft({ ...fixture(), image: "javascript:alert(1)" }),
    /HTTPS/,
  );
  const d = fixture();
  d.variants.push({ ...d.variants[0] });
  assert.throws(() => validateProductDraft(d), /added twice/);
  d.variants[1].size = "M";
  assert.throws(() => validateProductDraft(d), /different Store SKU/);
  d.variants[1].storeSku = "v-fixture-medium";
  d.variants[1].productCost = -1;
  assert.throws(() => validateProductDraft(d), /non-negative/);
});

test("adding sizes keeps existing edits and codes; no default design/stock/price assumptions from the export", () => {
  const existing = validateProductDraft(fixture()).variants!;
  const added = appendSizeVariants(
    existing,
    "XS,S,M,M",
    "White",
    "UAopUOs-Wh-{size}",
    "Long-Design-SKU",
    "378",
    2,
  );
  assert.deepEqual(added[0], existing[0]);
  assert.equal(added.length, 3);
  assert.equal(added[1].size, "XS");
  assert.equal(added[1].stock, "out", "new sizes stay unavailable until confirmed");
  assert.equal(added[2].productSku, "UAopUOs-Wh-M");
  assert.equal(added[2].sku, "");
  assert.equal(added[2].storeSku, "");
  assert.throws(
    () => appendSizeVariants(existing, "S", "White", "", "", "", 2),
    /already added/,
  );
  assert.throws(
    () => appendSizeVariants(existing, "M", "", "", "", "", 2),
    /Enter a colour/,
  );
});

test("database mapping round-trips reference fields and costs while storefront projection omits them", () => {
  const d = validateProductDraft(fixture());
  const row = {
    ...productColumns(d),
    id: "fixture",
    gamana_product_variants: variantColumns(d),
  };
  const admin = rowToProduct(row);
  assert.equal(admin.qikinkProductId, d.qikinkProductId);
  assert.equal(admin.variants[0].designSku, d.variants![0].designSku);
  assert.equal(admin.variants[0].productCost, 378);
  assert.equal(admin.variants[0].sku, "");
  const publicProduct = toStorefrontProduct(admin);
  const publicJson = JSON.stringify(publicProduct);
  for (const key of [
    "productCost",
    "productSku",
    "designSku",
    "storeSku",
    "qikinkProductId",
    "designUrl",
    "mockupUrl",
  ])
    assert.ok(!publicJson.includes(key));
  assert.equal(publicProduct.price, 899);
  assert.equal(publicProduct.variants[0].sku, "");
  const legacy = rowToProduct({
    ...row,
    qikink_product_id: undefined,
    gamana_product_variants: [
      { size: "M", color: "Bone", sku: "OLD-M", print_type_id: 1, stock: "in" },
    ],
  });
  assert.equal(legacy.variants[0].sku, "OLD-M");
  assert.equal(legacy.variants[0].productCost, undefined);
});

test("POST cannot overwrite an existing product by accepting a supplied ID", () => {
  assert.match(
    readFileSync("src/app/api/admin/products/route.ts", "utf8"),
    /id: undefined/,
  );
});

test("Postgres saves products and references atomically, restricts access, and preserves edits on failure", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      "create role anon; create role authenticated; create role service_role bypassrls;",
    );
    const base = readFileSync(
      "src/lib/supabase-admin-schema.sql",
      "utf8",
    ).split("insert into storage.buckets")[0];
    await db.exec(base);
    const sql = readFileSync("src/lib/product-upload-schema.sql", "utf8");
    await db.exec(sql);
    await db.exec(sql);
    const d = validateProductDraft(fixture());
    const p = productColumns(d),
      variants = variantColumns(d);
    const save = async (
      product = p,
      lines = variants,
      id: string | null = null,
    ) =>
      (
        await db.query<{ id: string }>(
          "select public.gamana_save_product($1::jsonb,$2::jsonb,$3::uuid) as id",
          [JSON.stringify(product), JSON.stringify(lines), id],
        )
      ).rows[0].id;
    const id = await save();
    const read = async () =>
      (
        await db.query<{
          name: string;
          product_cost: string;
          store_sku: string;
          sku: string;
        }>(
          "select p.name,v.product_cost,v.store_sku,v.sku from gamana_products p join gamana_product_variants v on v.product_id=p.id where p.id=$1",
          [id],
        )
      ).rows[0];
    assert.equal((await read()).store_sku, "v-fixture-small");
    assert.equal(Number((await read()).product_cost), 378);
    assert.equal((await read()).sku, "");
    await save({ ...p, name: "Changed name" }, variants, id);
    await assert.rejects(
      save(
        { ...p, name: "Should roll back" },
        [{ ...variants[0], product_cost: -1 }],
        id,
      ),
    );
    assert.equal((await read()).name, "Changed name");
    assert.equal((await read()).store_sku, "v-fixture-small");
    await assert.rejects(
      save({ ...p, slug: "failed-new-product" }, [
        { ...variants[0], product_cost: -1 },
      ]),
    );
    assert.equal(
      (
        await db.query(
          "select * from gamana_products where slug='failed-new-product'",
        )
      ).rows.length,
      0,
    );
    await db.exec("set role anon;");
    await assert.rejects(
      db.query("select product_cost from gamana_product_variants"),
      /permission denied/,
    );
    await assert.rejects(save(), /permission denied/);
    await db.exec("reset role; set role service_role;");
    assert.equal((await read()).name, "Changed name");
  } finally {
    await db.close();
  }
});
