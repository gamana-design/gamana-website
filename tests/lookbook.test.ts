import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  getCollectionProducts,
  getCollectionSummary,
  getPublishedCollection,
  getPublishedCollections,
  getStorySections,
  lookbookCollections,
  type LookbookCollection,
} from "../src/lib/lookbook";
import { getAvailableHotspots } from "../src/lib/lookbook-interactions";
import { products } from "../src/data/legacy-catalog";
import { CartProvider } from "../src/lib/cart";
import { CollectionStory } from "../src/components/lookbook/collection-story";
import {
  HotspotProduct,
  ShoppableImage,
} from "../src/components/lookbook/shoppable-image";

const collection = lookbookCollections[0];
const sections = getStorySections(collection);
const selected = getCollectionProducts(collection, products);

test("lookbook lists the published Bay Breeze collection only; unknown collections are absent", () => {
  assert.equal(getPublishedCollections().length, 1);
  assert.equal(getPublishedCollection("bay-breeze")?.title, "Bay Breeze");
  assert.equal(getPublishedCollection("missing"), undefined);
  assert.equal(getPublishedCollection("../bay-breeze"), undefined);
  assert.equal(getPublishedCollection("BAY-BREEZE"), undefined);
  assert.equal(sections.length, 8);
  assert.equal(
    new Set(sections.map((section) => section.id)).size,
    sections.length,
  );
  assert.ok(sections.every((section) => /^[a-z0-9-]+$/.test(section.id)));
  assert.deepEqual(
    [...new Set(sections.map((section) => section.theme))],
    ["The feeling", "In the world", "A closer look", "The collection"],
  );
});

test("editorial images exist and mappings identify only collection garments, never accessories", () => {
  for (const section of sections) {
    for (const image of [section.image, section.secondaryImage].filter(
      Boolean,
    )) {
      assert.ok(existsSync(`public${image!.src}`));
      assert.ok(image!.alt && image!.caption);
      for (const spot of image!.hotspots ?? []) {
        assert.ok(
          selected.some((product) => product.slug === spot.productSlug),
        );
        assert.ok(spot.x > 0 && spot.x < 100 && spot.y > 0 && spot.y < 100);
      }
    }
  }
  const duo = collection.sections.find(
    (section) => section.id === "in-the-world",
  )!.image!;
  const lavender = duo.hotspots!.find(
    (spot) => spot.productSlug === "godavari-tee-lavender",
  )!;
  const sunset = duo.hotspots!.find(
    (spot) => spot.productSlug === "godavari-tee-sunset",
  )!;
  assert.ok(
    lavender.x < sunset.x,
    "Lavender is on the left in the source photograph",
  );
});

test("shopping uses only the public catalogue supplied to the collection, without fallback prices or products", () => {
  assert.equal(selected.length, 3);
  assert.deepEqual(getCollectionProducts(collection, []), []);
  assert.deepEqual(
    getCollectionProducts({ ...collection, campaignId: "missing" }, products),
    [],
  );
  const current = { ...selected[0], price: 899 };
  assert.deepEqual(getCollectionProducts(collection, [current]), [current]);
  const image = collection.sections.find(
    (section) => section.id === "in-the-world",
  )!.image!;
  assert.equal(getAvailableHotspots(image, [] as typeof products).length, 0);
  assert.equal(getAvailableHotspots(image, selected).length, 2);
  assert.equal(
    getAvailableHotspots(
      {
        ...image,
        hotspots: [
          { productSlug: current.slug, x: -1, y: 50 },
          { productSlug: current.slug, x: 50, y: NaN },
        ],
      },
      [current],
    ).length,
    0,
  );
});

test("BTS is hidden until actual approved material is supplied; draft URLs never enter public metadata", () => {
  assert.deepEqual(collection.bts, []);
  assert.ok(sections.every((section) => section.kind !== "bts"));
  const draft = {
    kind: "image" as const,
    src: "/private-unpublished-sketch.jpg",
    alt: "An original sketch",
    caption: "Owner-supplied sketch",
    approved: false,
  };
  const fixture: LookbookCollection = { ...collection, bts: [draft] };
  assert.equal(getStorySections(fixture).length, 8);
  assert.ok(!JSON.stringify(getCollectionSummary(fixture)).includes(draft.src));
  assert.equal(
    getStorySections({
      ...fixture,
      bts: [{ ...draft, approved: true, src: "" }],
    }).length,
    8,
  );
  const approved = {
    ...draft,
    approved: true,
    src: "/fixture-original-sketch.jpg",
  };
  const film = {
    ...approved,
    kind: "video" as const,
    src: "/fixture-original-film.mp4",
    captions: "/fixture-captions.vtt",
    transcript: "Fixture transcript",
  };
  const published = getStorySections({
    ...collection,
    bts: [draft, approved, film],
  });
  assert.equal(published.filter((section) => section.kind === "bts").length, 2);
  assert.ok(
    published.some((section) => section.bts?.captions === film.captions),
  );
  assert.ok(!JSON.stringify(published).includes(draft.src));
  assert.ok(
    published.findIndex((section) => section.kind === "bts") <
      published.findIndex((section) => section.kind === "shop"),
  );
  assert.ok(!published.some((section) => section.id === "making-notes"));
});

function renderCard(product: (typeof products)[number]) {
  return renderToStaticMarkup(
    createElement(
      CartProvider,
      null,
      createElement(HotspotProduct, { product, onClose: () => {} }),
    ),
  );
}

test("hotspot product card uses current INR prices, a required variant choice, full details and free shipping", () => {
  const markup = renderCard({ ...selected[0], price: 899 });
  assert.match(markup, /₹899/);
  assert.doesNotMatch(markup, /₹1,499|\$|PDF|Water.Repellent/);
  assert.match(markup, /Choose your size/);
  assert.match(markup, /Select a size/);
  assert.match(markup, /Add to bag/);
  assert.match(markup, /Free shipping across India/);
  assert.ok(markup.includes(`/product/${selected[0].slug}`));
});

test("sold-out variants are disabled and an entirely sold-out card cannot quick-add", () => {
  const product = {
    ...selected[0],
    variants: selected[0].variants.map((variant) => ({
      ...variant,
      stock: "out" as const,
    })),
  };
  const markup = renderCard(product);
  assert.match(markup, /Currently unavailable/);
  assert.match(markup, /<select[^>]*disabled/);
  assert.match(markup, /class="story-quick-add"[^>]*disabled/);
  assert.doesNotMatch(markup, />Add to bag</);
});

test("photo markers are accessible buttons and absent products leave a purely editorial photograph", () => {
  const image = collection.sections.find(
    (section) => section.id === "in-the-world",
  )!.image!;
  const render = (catalogue: typeof products) =>
    renderToStaticMarkup(
      createElement(
        CartProvider,
        null,
        createElement(ShoppableImage, { image, products: catalogue }),
      ),
    );
  const markup = render(selected);
  assert.equal((markup.match(/class="story-hotspot"/g) ?? []).length, 2);
  assert.match(markup, /aria-label="Shop Godavari Tee/);
  assert.match(markup, /aria-expanded="false"/);
  const unavailable = render([]);
  assert.doesNotMatch(
    unavailable,
    /class="story-hotspot"|Tap a marker|role="dialog"/,
  );
  assert.ok(unavailable.includes(image.src));
});

test("Shop the Look is the centered sticky focal point, with story copy flowing around it", () => {
  const markup = renderToStaticMarkup(
    createElement(
      CartProvider,
      null,
      createElement(CollectionStory, {
        collection: getCollectionSummary(collection),
        sections,
        products: selected,
      }),
    ),
  );
  assert.match(markup, /Shop the Look/);
  assert.match(markup, /Some places/);
  assert.match(markup, /A change/);
  assert.match(markup, /story-photo-feature/);
  assert.match(markup, /story-beat-left/);
  assert.match(markup, /story-beat-right/);
  assert.match(markup, /href="\/product\//);
  assert.doesNotMatch(
    markup,
    /storybook|Open the book|Previous pages|page-turn/,
  );
  const css = readFileSync("src/app/lookbook/lookbook.css", "utf8");
  assert.match(css, /\.story-feature-sticky\s*\{[^}]*position:\s*sticky/s);
  assert.match(css, /\.story-flow\s*\{[^}]*grid-template-columns/s);
  assert.match(css, /@media \(max-width: 1199px\)/);
  assert.match(css, /prefers-reduced-motion: reduce/);
});

test("collection story remains readable without JavaScript, including when products are unavailable", () => {
  const renderStory = (catalogue: typeof products) =>
    renderToStaticMarkup(
      createElement(
        CartProvider,
        null,
        createElement(CollectionStory, {
          collection: getCollectionSummary(collection),
          sections,
          products: catalogue,
        }),
      ),
    );
  const markup = renderStory(selected);
  assert.match(markup, /Some places/);
  assert.match(markup, /story-no-script/);
  assert.match(markup, /Product links are listed below/);
  assert.match(markup, /href="\/product\//);
  const unavailable = renderStory([]);
  assert.match(unavailable, /The story is still here to enjoy/);
  assert.doesNotMatch(unavailable, /Tap a marker|class="story-hotspot"/);
  const page = readFileSync("src/app/lookbook/[collection]/page.tsx", "utf8");
  assert.match(page, /notFound\(\)/);
  assert.match(page, /getCollectionSummary\(entry\)/);
  assert.doesNotMatch(page, /display:\s*none/);
});
