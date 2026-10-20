import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import nextConfig from "../next.config";

const read = (path: string) => readFileSync(path, "utf8");
const removedSections = [
  "pages",
  "homepage",
  "journal",
  "orders",
  "messages",
  "settings",
];

test("admin contains product management, sign-in and password change only", () => {
  assert.deepEqual(readdirSync("src/app/admin/(dash)").sort(), [
    "layout.tsx",
    "page.tsx",
    "password",
    "products",
  ]);
  assert.match(read("src/app/admin/(dash)/page.tsx"), /redirect\("\/admin\/products"\)/);
  const nav = read("src/components/admin/admin-nav.tsx");
  for (const section of removedSections)
    assert.ok(!nav.includes(`/admin/${section}`));
  assert.ok(nav.includes("/admin/products/new"));
  assert.ok(nav.includes("/admin/password"));
  assert.ok(nav.includes("Change password"));
  assert.ok(nav.includes("/api/admin/logout"));
});

test("website builder and unrelated admin APIs are removed, not just hidden", () => {
  assert.deepEqual(readdirSync("src/app/api/admin").sort(), [
    "login",
    "logout",
    "password",
    "products",
    "qikink",
    "upload",
  ]);
  assert.equal(existsSync("src/components/admin/page-builder.tsx"), false);
  assert.equal(existsSync("src/components/admin/homepage-editor.tsx"), false);
  assert.equal(existsSync("src/components/admin/legacy-content-import.tsx"), false);
  assert.doesNotMatch(read("src/app/api/admin/products/route.ts"), /export async function PUT/);
});

test("new products do not depend on a starter-site migration or an existing product", () => {
  const create = read("src/app/admin/(dash)/products/new/page.tsx");
  assert.match(create, /<ProductEditor\s*\/>/);
  assert.doesNotMatch(create, /getAllProducts|seedFallback|LegacyContentImport|migration/i);
  const list = read("src/app/admin/(dash)/products/page.tsx");
  assert.doesNotMatch(list, /LegacyContentImport|migration/i);
  assert.ok(existsSync("src/app/api/admin/upload/route.ts"));
  assert.match(read("src/components/admin/product-editor.tsx"), /UploadField/);
});

test("old admin section bookmarks redirect to the product list", async () => {
  const redirects = await nextConfig.redirects!();
  for (const section of removedSections) {
    assert.ok(
      redirects.some(
        (rule) =>
          rule.source === `/admin/${section}/:path*` &&
          rule.destination === "/admin/products",
      ),
    );
  }
});

test("public storefront pages and content readers remain available", () => {
  for (const path of [
    "src/app/page.tsx",
    "src/app/about/page.tsx",
    "src/app/lookbook/page.tsx",
    "src/app/shop/page.tsx",
    "src/app/journal/page.tsx",
    "src/app/checkout/page.tsx",
    "src/app/contact/page.tsx",
    "src/app/track/page.tsx",
  ])
    assert.ok(existsSync(path), path);
  assert.match(read("src/lib/site-content.ts"), /export async function getSitePage/);
  assert.match(read("src/lib/site-content.ts"), /export async function getJournalPosts/);
  assert.match(read("src/lib/site-content.ts"), /export async function getSiteSettings/);
  assert.doesNotMatch(
    read("src/lib/site-content.ts"),
    /export async function (saveSitePage|saveJournalPost|deleteJournalPost|saveSiteSettings)/,
  );
});
