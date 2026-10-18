import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BrandName, BrandText } from "../src/components/brand-name";
import { BRAND_NAME, BRAND_INITIAL_COLOR, brandContent, brandCopy } from "../src/lib/brand-name";
import { brand, colors } from "../src/lib/brand";

test("canonical display name uses the exact Telugu/Latin spelling and primary colour", () => {
  assert.equal(brand.name, "గMANA");
  assert.equal(BRAND_NAME, brand.name);
  assert.equal(BRAND_INITIAL_COLOR, colors.kalam);
  const markup = renderToStaticMarkup(createElement(BrandName));
  assert.match(markup, /aria-label="గMANA"/);
  assert.match(markup, /class="brand-initial" lang="te" aria-hidden="true">గ/);
  assert.match(markup, /class="brand-latin" aria-hidden="true">MANA/);
  assert.doesNotMatch(markup, /GAMANA|\*\*/);
});

test("inline copy renders all old and new brand mentions using the shared lockup", () => {
  const markup = renderToStaticMarkup(createElement(BrandText, { children: "GAMANA / గMANA / GAMANA's story", onDark: true }));
  assert.equal((markup.match(/class="brand-initial"/g) ?? []).length, 3);
  assert.equal((markup.match(/brand-name-on-dark/g) ?? []).length, 3);
  assert.doesNotMatch(markup, /GAMANA/);
  assert.match(markup, /story/);
});

test("read-time editorial spelling changes do not mutate records, URLs, SKUs, or IDs", () => {
  const stored = { title: "About GAMANA", slug: "GAMANA", image: "/images/GAMANA.jpg", buttonHref: "https://example.com/GAMANA", sections: [{ title: "GAMANA in motion", body: "The GAMANA story.", id: "GAMANA", sku: "GAMANA-M" }], email: "team@gamana.design" };
  const display = brandContent(stored);
  assert.equal(display.title, "About గMANA");
  assert.equal(display.sections[0].body, "The గMANA story.");
  assert.equal(display.slug, stored.slug);
  assert.equal(display.image, stored.image);
  assert.equal(display.buttonHref, stored.buttonHref);
  assert.equal(display.sections[0].sku, stored.sections[0].sku);
  assert.equal(display.sections[0].id, stored.sections[0].id);
  assert.equal(display.email, stored.email);
  assert.equal(stored.title, "About GAMANA");
  assert.equal(brandCopy("GAMANA's story"), "గMANA's story");
  assert.equal(brandCopy("@gamana.wear"), "@gamana.wear");
});
