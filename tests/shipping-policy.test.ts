import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { SHIPPING_FEE, SHIPPING_HEADLINE, shippingCopy } from "../src/lib/shipping";
import { brandContent } from "../src/lib/brand-name";

const read = (path: string) => readFileSync(path, "utf8");

test("shared shipping policy has no fee or minimum-spend qualification", () => {
  assert.equal(SHIPPING_FEE, 0);
  assert.equal(SHIPPING_HEADLINE, "Free shipping across India. Always.");
  for (const file of ["src/components/site-header.tsx", "src/components/cart-drawer.tsx", "src/components/checkout-form.tsx", "src/components/product-detail.tsx", "src/lib/homepage-store.ts"]) {
    assert.doesNotMatch(read(file), /FREE_SHIPPING_AT|1,499|1499|away from free shipping|Free shipping unlocked|Shipping calculated at checkout/i, file);
  }
  assert.match(read("src/components/checkout-form.tsx"), /const shipping = SHIPPING_FEE/);
  assert.match(read("src/lib/checkout/pricing.ts"), /const shipping = SHIPPING_FEE \* 100/);
});

test("legacy shipping display claims follow current policy without changing stored identifiers or orders", () => {
  for (const copy of ["Free shipping in India on orders ₹1,499+", "Free shipping across India over ₹1,499", "Free shipping on orders ₹1,499 and above", "Free shipping over ₹1,499"]) {
    const updated = shippingCopy(copy);
    assert.match(updated, /Free shipping across India\. Always/);
    assert.doesNotMatch(updated, /1,499|1499|over |above|orders/);
  }
  const stored = { body: "GAMANA. Free shipping across India over ₹1,499", slug: "shipping-over-1499", href: "/orders/1499", shipping_paise: 7900 };
  const shown = brandContent(stored);
  assert.equal(shown.body, "గMANA. Free shipping across India. Always");
  assert.equal(shown.slug, stored.slug);
  assert.equal(shown.href, stored.href);
  assert.equal(shown.shipping_paise, 7900);
  assert.ok(stored.body.includes("over ₹1,499"));
});

test("both reusable wordmark masters are outlined, accessible and keep the approved palette", () => {
  for (const name of ["gamana-lockup", "gamana-lockup-dark"]) {
    const svg = read(`public/images/brand/${name}.svg`);
    assert.match(svg, /గMANA — glyph-first wordmark/);
    assert.match(svg, /<path/);
    assert.match(svg, /#0B0B10/);
    assert.match(svg, /#F5EDDA/);
    assert.doesNotMatch(svg, /<text|<image|http[s]?:\/\/(?!www.w3.org)/);
  }
});

test("social shares use the glyph-first 1200 by 630 PNG rather than a page URL", () => {
  const image = readFileSync("public/images/brand/gamana-social.png");
  assert.equal(image.readUInt32BE(16), 1200);
  assert.equal(image.readUInt32BE(20), 630);
  const layout = read("src/app/layout.tsx");
  assert.match(layout, /card: "summary_large_image"/);
  assert.equal((layout.match(/absoluteUrl\("\/images\/brand\/gamana-social.png"\)/g) ?? []).length, 2);
});
