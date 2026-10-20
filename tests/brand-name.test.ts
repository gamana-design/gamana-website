import test from "node:test";
import { readFileSync } from "node:fs";
import { BRAND_GLYPH_PATH } from "../src/lib/brand-glyph";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BrandGlyph, BrandName, BrandText } from "../src/components/brand-name";
import { BRAND_NAME, BRAND_INITIAL_COLOR, brandContent, brandCopy } from "../src/lib/brand-name";
import { brand, colors } from "../src/lib/brand";

test("canonical display name uses the exact Telugu/Latin spelling and primary colour", () => {
  assert.equal(brand.name, "గMANA");
  assert.equal(BRAND_NAME, brand.name);
  assert.equal(BRAND_INITIAL_COLOR, colors.kalam);
  const markup = renderToStaticMarkup(createElement(BrandName));
  assert.match(markup, /aria-label="గMANA"/);
  assert.match(markup, /class="brand-initial" lang="te" aria-hidden="true"><svg/);
  assert.ok(markup.includes(BRAND_GLYPH_PATH));
  assert.match(markup, /class="sr-only">గ/);
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


test("standalone Telugu glyph is outlined, accessible and uses only existing identity colours", () => {
  const markup = renderToStaticMarkup(createElement(BrandGlyph));
  assert.match(markup, /aria-label="గMANA symbol — గ"/);
  assert.match(markup, /viewBox="0 0 512 512"/);
  assert.match(markup, /<path fill="#0B0B10"/);
  assert.doesNotMatch(markup, /<text|<image|runner|<rect/);
  const onDark = renderToStaticMarkup(createElement(BrandGlyph, { onDark: true }));
  assert.match(onDark, /<rect width="512" height="512" fill="#F5EDDA"/);
  assert.match(onDark, /<path fill="#0B0B10"/);
});


test("standalone SVG matches the shared master and app icons retain the required sizes", () => {
  const svg = readFileSync("public/images/brand/ga-glyph.svg", "utf8");
  assert.ok(svg.includes(`d="${BRAND_GLYPH_PATH}"`));
  assert.match(svg, /fill="#0B0B10"/);
  assert.doesNotMatch(svg, /<text|<image|runner/);
  for (const [name, size] of [["icon", 256], ["apple-icon", 180]] as const) {
    const png = readFileSync(`src/app/${name}.png`);
    assert.equal(png.subarray(1, 4).toString(), "PNG");
    assert.equal(png.readUInt32BE(16), size);
    assert.equal(png.readUInt32BE(20), size);
  }
});
