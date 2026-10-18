import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import {
  legacyProducts,
  legacyPages,
  legacyJournalPosts,
  legacySiteSettings,
} from "../src/data/legacy-site-content";

test("starter products are creates, not updates with invalid gm-* UUIDs", () => {
  assert.equal(legacyProducts.length, 7);
  assert.equal(new Set(legacyProducts.map((p) => p.slug)).size, 7);
  for (const product of legacyProducts) {
    assert.equal("id" in product, false);
    assert.ok(product.variants.length > 0);
    for (const variant of product.variants)
      assert.ok(variant.sku && variant.size && variant.color);
  }
});

test("all core pages and journal posts are ready to edit", () => {
  assert.deepEqual(legacyPages.map((p) => p.slug).sort(), [
    "about",
    "checkout",
    "contact",
    "home",
    "journal",
    "lookbook",
    "shop",
    "track",
  ]);
  for (const page of legacyPages) {
    assert.ok(page.active && page.sections.length > 0);
    assert.equal(
      new Set(page.sections.map((s) => s.id)).size,
      page.sections.length,
    );
  }
  assert.equal(legacyJournalPosts.length, 4);
  for (const post of legacyJournalPosts) assert.ok(post.body.length > 0);
});

test("every starter image exists locally; no Storage migration or self-fetch is needed", () => {
  const images = new Set<string>([legacySiteSettings.logoUrl]);
  for (const p of legacyProducts)
    for (const image of [p.image, ...p.gallery]) images.add(image);
  for (const p of legacyJournalPosts) images.add(p.image);
  for (const p of legacyPages)
    for (const s of p.sections) {
      if (s.image) images.add(s.image);
      for (const item of s.items ?? []) if (item.image) images.add(item.image);
    }
  for (const image of images) {
    assert.ok(image.startsWith("/images/"), image);
    assert.ok(
      existsSync(join(process.cwd(), "public", image)),
      `Missing asset: ${image}`,
    );
  }
});

test("SQL recovery import is atomic, duplicate-safe and preserves existing edits", () => {
  const sql = execFileSync(
    process.execPath,
    ["--import", "tsx", "scripts/generate-site-import.ts"],
    { encoding: "utf8" },
  );
  assert.match(sql, /begin;/);
  assert.match(sql, /commit;/);
  assert.match(sql, /pg_advisory_xact_lock/);
  assert.equal(sql.match(/on conflict \(slug\) do nothing/g)?.length, 3);
  assert.match(sql, /excluded.content \|\| gamana_site_settings.content/);
  assert.doesNotMatch(sql, /gm-00[1-7]/);
});
