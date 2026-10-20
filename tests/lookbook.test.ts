import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  collectionBooks,
  getBookPages,
  getBookProducts,
  getBookSummary,
  getCollectionBook,
  getCollectionBooks,
  type CollectionBook,
} from "../src/lib/lookbook";
import {
  getAvailableHotspots,
  getSpreadStart,
} from "../src/lib/lookbook-interactions";
import { products } from "../src/data/legacy-catalog";
import { CartProvider } from "../src/lib/cart";
import {
  HotspotProduct,
  ShoppableImage,
} from "../src/components/lookbook/shoppable-image";

const book = collectionBooks[0];
const selected = getBookProducts(book, products);

test("collection library publishes the real Bay Breeze volume only; unknown collections are absent", () => {
  assert.equal(getCollectionBooks().length, 1);
  assert.equal(getCollectionBook("bay-breeze")?.title, "Bay Breeze");
  assert.equal(getCollectionBook("missing"), undefined);
  assert.equal(getCollectionBook("../bay-breeze"), undefined);
  assert.equal(getCollectionBook("BAY-BREEZE"), undefined);
  const pages = getBookPages(book);
  assert.equal(pages.length, 8);
  assert.equal(pages.length % 2, 0);
  assert.equal(new Set(pages.map((page) => page.id)).size, pages.length);
  assert.ok(pages.every((page) => /^[a-z0-9-]+$/.test(page.id)));
  assert.deepEqual(
    [...new Set(pages.map((page) => page.chapter))],
    ["The feeling", "In the world", "A closer look", "The collection"],
  );
});

test("editorial images exist and mappings identify only collection garments, never accessories", () => {
  for (const page of getBookPages(book)) {
    for (const image of [page.image, page.secondaryImage].filter(Boolean)) {
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
  const duo = book.pages.find((page) => page.id === "in-the-world")!.image!;
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

test("shopping uses only the public catalogue supplied to the book, without fallback prices or products", () => {
  assert.equal(selected.length, 3);
  assert.deepEqual(getBookProducts(book, []), []);
  assert.deepEqual(
    getBookProducts({ ...book, campaignId: "missing" }, products),
    [],
  );
  const current = { ...selected[0], price: 899 };
  assert.deepEqual(getBookProducts(book, [current]), [current]);
  const image = book.pages.find((page) => page.id === "in-the-world")!.image!;
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

test("BTS is hidden until actual approved material is supplied; draft URLs never enter client metadata", () => {
  assert.deepEqual(book.bts, []);
  assert.ok(getBookPages(book).every((page) => page.kind !== "bts"));
  const draft = {
    kind: "image" as const,
    src: "/private-unpublished-sketch.jpg",
    alt: "An original sketch",
    caption: "Owner-supplied sketch",
    approved: false,
  };
  const fixture: CollectionBook = { ...book, bts: [draft] };
  assert.equal(getBookPages(fixture).length, 8);
  assert.ok(!JSON.stringify(getBookSummary(fixture)).includes(draft.src));
  assert.equal(
    getBookPages({ ...fixture, bts: [{ ...draft, approved: true, src: "" }] })
      .length,
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
  const published = getBookPages({ ...book, bts: [draft, approved, film] });
  assert.equal(published.length % 2, 0);
  assert.equal(published.filter((page) => page.kind === "bts").length, 2);
  assert.ok(published.some((page) => page.bts?.captions === film.captions));
  assert.ok(!JSON.stringify(published).includes(draft.src));
  assert.ok(
    published.findIndex((page) => page.kind === "bts") <
      published.findIndex((page) => page.kind === "shop"),
  );
});

test("desktop spreads and mobile pages preserve reading position and stay within boundaries", () => {
  for (let i = 0; i < 8; i++) {
    assert.equal(getSpreadStart(i, false, 8), i);
    assert.equal(getSpreadStart(i, true, 8), Math.floor(i / 2) * 2);
  }
  assert.equal(getSpreadStart(-10, true, 8), 0);
  assert.equal(getSpreadStart(100, true, 8), 6);
  assert.equal(getSpreadStart(100, false, 8), 7);
  assert.equal(getSpreadStart(NaN, false, 8), 0);
  assert.equal(getSpreadStart(0, true, 0), 0);
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
  const image = book.pages.find((page) => page.id === "in-the-world")!.image!;
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

test("reading controls respect reduced motion; public routes do not restore an admin builder", () => {
  const css = readFileSync("src/app/lookbook/lookbook.css", "utf8");
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /animation: none/);
  assert.match(css, /touch-action: pan-y/);
  const page = readFileSync("src/app/lookbook/[collection]/page.tsx", "utf8");
  assert.match(page, /notFound\(\)/);
  assert.match(page, /getBookSummary\(book\)/);
  assert.match(page, /<noscript>/);
});
