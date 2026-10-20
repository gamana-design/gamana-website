import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dropCampaigns, getDropProducts, getDropSchedule, validateCampaigns, type DropCampaign } from "../src/lib/drops";
import { isDesignPreview } from "../src/lib/design-preview";
import { products } from "../src/data/legacy-catalog";

const baseline = dropCampaigns[0];
const launch = Date.parse("2026-11-01T18:00:00+05:30");
const future: DropCampaign = { ...baseline, id: "test-next-drop", name: "Test campaign", startsAt: "2026-11-01T18:00:00+05:30", layout: "poster" };

test("Bay Breeze is the available baseline, without an invented launch countdown", () => {
  assert.equal(getDropSchedule().active?.name, "Bay Breeze");
  assert.equal(getDropSchedule().nextChange, null);
  assert.equal(baseline.startsAt, null);
  assert.equal(baseline.layout, "river-editorial");
  assert.doesNotThrow(() => validateCampaigns(dropCampaigns));
});

test("scheduled campaign switches at the exact India-time boundary", () => {
  const schedule = [baseline, future];
  assert.equal(getDropSchedule(schedule, launch - 1).active?.id, baseline.id);
  assert.equal(getDropSchedule(schedule, launch - 1).nextChange, launch);
  assert.equal(getDropSchedule(schedule, launch).active?.id, future.id);
  assert.equal(getDropSchedule(schedule, launch + 1).nextChange, null);
  // Registry order must not determine which campaign wins.
  assert.equal(getDropSchedule([future, baseline], launch).active?.id, future.id);
});

test("disabled campaigns do not affect the homepage or its next refresh", () => {
  const disabled = { ...future, enabled: false };
  assert.equal(getDropSchedule([baseline, disabled], launch + 1).active?.id, baseline.id);
  assert.equal(getDropSchedule([baseline, disabled], launch - 1).nextChange, null);
});

test("campaign expiry falls back safely, or displays no campaign if none is active", () => {
  const end = launch + 3600000;
  const timed = { ...future, endsAt: new Date(end).toISOString() };
  assert.equal(getDropSchedule([baseline, timed], launch).nextChange, end);
  assert.equal(getDropSchedule([baseline, timed], end).active?.id, baseline.id);
  assert.equal(getDropSchedule([timed], end).active, null);
  assert.equal(getDropSchedule([timed], launch - 1).active, null);
  assert.equal(getDropSchedule([], launch).active, null);
});

test("ambiguous schedules and invalid dates, colour tokens, and product selections are rejected", () => {
  for (const campaign of [
    { ...future, startsAt: "2026-11-01T18:00:00" },
    { ...future, startsAt: "not-a-date+05:30" },
    { ...future, endsAt: "2026-11-01T17:00:00+05:30" },
    { ...future, palette: { ...future.palette, ink: "url(example.com)" } },
    { ...future, productSlugs: [] },
  ]) assert.throws(() => validateCampaigns([campaign]));
  assert.throws(() => validateCampaigns([baseline, baseline]));
  assert.throws(() => validateCampaigns([future, { ...future, id: "another" }]));
});

test("campaign product selection uses exact real slugs and never includes unrelated products", () => {
  const selected = getDropProducts(baseline, products);
  assert.equal(selected.length, 2);
  assert.deepEqual(baseline.productSlugs, [
    "godavari-tee-sunset",
    "godavari-tee-lavender",
  ]);
  assert.deepEqual(selected.map(p => p.slug), baseline.productSlugs);
  assert.ok(selected.every(p => p.line === "URBAN"));
  assert.deepEqual(getDropProducts(baseline, []), []);
  assert.equal(getDropProducts({ ...baseline, productSlugs: ["missing"] }, products).length, 0);
});

test("campaign images exist, and sample data cannot be used by a production deployment", () => {
  for (const c of dropCampaigns) for (const path of [c.heroImage, c.editorialImage]) assert.ok(existsSync(`public${path}`));
  assert.equal(isDesignPreview({ NODE_ENV: "development", GAMANA_DESIGN_PREVIEW: "1" }), true);
  assert.equal(isDesignPreview({ NODE_ENV: "production", GAMANA_DESIGN_PREVIEW: "1" }), false);
  assert.equal(isDesignPreview({ NODE_ENV: "development" }), false);
  assert.equal(isDesignPreview({ NODE_ENV: "development", GAMANA_DESIGN_PREVIEW: "1", SUPABASE_SERVICE_ROLE_KEY: "test-fixture" }), false);
});

test("redesign preserves online-only checkout and server-side payment validation", () => {
  const checkout = readFileSync("src/components/checkout-form.tsx", "utf8");
  const route = readFileSync("src/app/api/orders/route.ts", "utf8");
  assert.doesNotMatch(checkout, /codEnabled|Place COD order|COD value/);
  assert.match(route, /validatePayment\(body.payment\)/);
  assert.match(checkout, /\/api\/payments\/verify/);
  assert.match(checkout, /First name/);
  assert.match(checkout, /Last name/);
});
