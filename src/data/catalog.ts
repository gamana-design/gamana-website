/**
 * GAMANA catalogue.
 *
 * Every product carries the Qikink SKU it fulfils from, so an order placed on
 * the site can be pushed straight to `POST /api/order/create` for printing and
 * shipping.
 *
 * SKUs follow Qikink's `<code>-<colour>-<size>` convention. If the live
 * Qikink account uses different codes, set `QIKINK_SKU_MAP` to a JSON object of
 * `{ "<product-slug>": "<sku>" }` in the environment — it overrides the
 * catalogue without a code change.
 */

export type ProductLine = "URBAN" | "CORE";

export type ProductCategory =
  | "T-Shirts"
  | "Hoodies"
  | "Performance"
  | "Accessories";

export interface ProductVariant {
  size: string;
  color: string;
  sku: string;
  printTypeId: number;
  stock: "in" | "low" | "out";
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  line: ProductLine;
  category: ProductCategory;
  price: number;
  compareAt?: number;
  image: string;
  gallery: string[];
  blurb: string;
  description: string;
  details: string[];
  tags: string[];
  badge?: string;
  featured?: boolean;
  isNew?: boolean;
  variants: ProductVariant[];
}

const SIZES = ["S", "M", "L", "XL", "XXL"] as const;

/** Builds the Qikink variant list for a product code + colour code. */
function variants(
  slug: string,
  code: string,
  colorCode: string,
  color: string,
  printTypeId: number,
  sizes: readonly string[] = SIZES,
  lowAt: string[] = [],
): ProductVariant[] {
  return sizes.map((size) => ({
    size,
    color,
    sku: `${code}-${colorCode}-${size}`,
    printTypeId,
    stock: lowAt.includes(size) ? "low" : "in",
  }));
}

export const products: Product[] = [
  {
    id: "gm-001",
    slug: "roots-heavyweight-tee",
    name: "Roots Heavyweight Tee",
    line: "URBAN",
    category: "T-Shirts",
    price: 1299,
    image: "/images/products/heavyweight-tee-ink.jpg",
    gallery: [
      "/images/products/heavyweight-tee-ink.jpg",
      "/images/urban-2.jpg",
    ],
    blurb:
      "A 240 GSM staple cut wide and boxy, in a combed cotton that holds its shape wash after wash.",
    description:
      "The piece GAMANA is built on. A 240 GSM combed-cotton tee with a dropped shoulder, a ribbed collar that stays flat, and a boxy body that sits right whether you are on the move or standing still. Screen-printed in Hyderabad, finished and dispatched through our print-on-demand partner.",
    details: [
      "240 GSM combed ring-spun cotton",
      "Boxy fit with dropped shoulders",
      "Ribbed collar, twin-needle hems",
      "Garment-washed for softness",
      "Machine wash cold, tumble dry low",
    ],
    tags: ["heavyweight", "cotton", "oversized", "everyday"],
    badge: "Core piece",
    featured: true,
    variants: variants("roots-heavyweight-tee", "UHTee", "Bk", "Onyx Black", 1, [
      "S",
      "M",
      "L",
      "XL",
      "XXL",
    ], ["S"]),
  },
  {
    id: "gm-002",
    slug: "godavari-oversized-tee",
    name: "Godavari Oversized Tee",
    line: "URBAN",
    category: "T-Shirts",
    price: 1499,
    image: "/images/products/heavyweight-tee-bone.jpg",
    gallery: [
      "/images/products/heavyweight-tee-bone.jpg",
      "/images/urban-1.jpg",
    ],
    blurb:
      "A cultural graphic tee built from our Godavari research — the river, the texture, the light.",
    description:
      "Our first culture-led release. The Godavari-inspired artwork was researched from the river itself — its sandbank texture, the way light sits on the water at dusk — and rebuilt as a hand-drawn graphic rather than borrowed imagery. Printed on bone heavyweight cotton so the artwork reads like ink on paper.",
    details: [
      "220 GSM combed cotton",
      "Relaxed oversized fit",
      "Hand-researched cultural graphic",
      "Water-based DTG print, soft to the touch",
      "Machine wash inside out, cold",
    ],
    tags: ["graphic", "cultural", "godavari", "oversized"],
    badge: "Drop 01",
    featured: true,
    isNew: true,
    variants: variants("godavari-oversized-tee", "UOTee", "Wh", "Bone White", 1, [
      "S",
      "M",
      "L",
      "XL",
      "XXL",
    ]),
  },
  {
    id: "gm-003",
    slug: "route-heavyweight-hoodie",
    name: "Route Heavyweight Hoodie",
    line: "URBAN",
    category: "Hoodies",
    price: 2499,
    image: "/images/products/hoodie.jpg",
    gallery: ["/images/products/hoodie.jpg", "/images/urban-2.jpg"],
    blurb:
      "A 320 GSM fleece hoodie with a double-lined hood — the layer that carries the whole season.",
    description:
      "Built for the in-between hours. A 320 GSM brushed fleece, double-lined hood that holds its shape, ribbed cuffs and hem that do not stretch out, and a kangaroo pocket deep enough to be useful. Heavy enough to wear on its own, structured enough to layer.",
    details: [
      "320 GSM brushed cotton fleece",
      "Double-lined hood with flat drawcords",
      "Ribbed cuffs and hem",
      "Kangaroo pocket",
      "Machine wash cold, dry flat",
    ],
    tags: ["fleece", "hoodie", "winter", "heavyweight"],
    featured: true,
    variants: variants("route-heavyweight-hoodie", "UHHd", "Bk", "Onyx Black", 1, [
      "S",
      "M",
      "L",
      "XL",
      "XXL",
    ], ["XXL"]),
  },
  {
    id: "gm-004",
    slug: "daily-cotton-cap",
    name: "Daily Cotton Cap",
    line: "URBAN",
    category: "Accessories",
    price: 699,
    image: "/images/products/cap.jpg",
    gallery: ["/images/products/cap.jpg"],
    blurb:
      "An unstructured six-panel in washed cotton twill — the one accessory that goes with everything.",
    description:
      "Washed cotton twill, unstructured front, brass adjuster. No logo, no noise. It packs flat, it wears well, and it goes with both lines without thinking about it.",
    details: [
      "Washed cotton twill",
      "Unstructured six-panel crown",
      "Brass strap adjuster",
      "Pre-curved brim",
      "Spot clean",
    ],
    tags: ["accessory", "cap", "cotton"],
    variants: variants("daily-cotton-cap", "UCap", "Bk", "Onyx Black", 5, ["One Size"]),
  },
  {
    id: "gm-005",
    slug: "carry-heavy-canvas-tote",
    name: "Carry Heavy Canvas Tote",
    line: "URBAN",
    category: "Accessories",
    price: 899,
    image: "/images/products/tote.jpg",
    gallery: ["/images/products/tote.jpg"],
    blurb:
      "16 oz natural canvas, bar-tacked handles, deep enough for a laptop and a week of groceries.",
    description:
      "Cut from 16 oz natural canvas with reinforced bar-tack stitching where the handles meet the body. Wide mouth, flat base, and a pocket that fits a phone without hunting for it.",
    details: [
      "16 oz natural cotton canvas",
      "Bar-tacked handle joins",
      "Internal slip pocket",
      "Flat base, 38 × 42 cm",
      "Spot clean, cold wash",
    ],
    tags: ["accessory", "tote", "canvas"],
    variants: variants("carry-heavy-canvas-tote", "UTote", "Be", "Natural Canvas", 5, [
      "One Size",
    ]),
  },
  {
    id: "gm-006",
    slug: "rhythm-performance-tee",
    name: "Rhythm Performance Tee",
    line: "CORE",
    category: "Performance",
    price: 1399,
    image: "/images/products/performance-shirt.jpg",
    gallery: [
      "/images/products/performance-shirt.jpg",
      "/images/core-1.jpg",
    ],
    blurb:
      "A quick-dry training tee that stays light, dry and clean-looking well past the session.",
    description:
      "The CORE workhorse. A lightweight quick-dry knit with a matte, low-sheen finish that keeps its shape through heat and sweat. Flatlock seams sit flat under a pack strap, and the hem is long enough to stay put through a stretch.",
    details: [
      "Quick-dry recycled poly blend, 140 GSM",
      "Flatlock seams, raglan sleeve",
      "UPF 40+ sun protection",
      "Reflective detail at the back hem",
      "Machine wash cold, hang dry",
    ],
    tags: ["quick-dry", "training", "performance", "lightweight"],
    badge: "New",
    featured: true,
    isNew: true,
    variants: variants("rhythm-performance-tee", "CPTee", "Nv", "Deep Navy", 23, [
      "S",
      "M",
      "L",
      "XL",
    ]),
  },
  {
    id: "gm-007",
    slug: "move-training-shorts",
    name: "Move Training Shorts",
    line: "CORE",
    category: "Performance",
    price: 1199,
    image: "/images/products/sweatshorts.jpg",
    gallery: ["/images/products/sweatshorts.jpg", "/images/core-2.jpg"],
    blurb:
      "Ripstop shorts with a zip pocket and a liner that stays where it should.",
    description:
      "Lightweight ripstop with a bonded waistband that does not roll, a zipped side pocket for the things you do not want on the floor, and a short mesh liner that is optional, not obligatory.",
    details: [
      "70D ripstop weave with 4-way stretch",
      "Bonded no-roll waistband",
      "Zipped side pocket",
      "Removable mesh liner",
      "Machine wash cold, no iron",
    ],
    tags: ["shorts", "ripstop", "training", "liner"],
    variants: variants("move-training-shorts", "CPSht", "Ch", "Graphite", 23, [
      "S",
      "M",
      "L",
      "XL",
    ], ["S"]),
  },
  {
    id: "gm-008",
    slug: "core-long-sleeve",
    name: "Core Long Sleeve",
    line: "CORE",
    category: "Performance",
    price: 1899,
    image: "/images/products/performance-shirt.jpg",
    gallery: ["/images/core-2.jpg", "/images/products/performance-shirt.jpg"],
    blurb:
      "A second-skin long sleeve for cool mornings and late finishes — fitted without being tight.",
    description:
      "Cut close without cutting you in. A stretch long sleeve in a smooth performance knit with thumbhole-free cuffs, a flat hem and enough compression to hold a muscle warm through a long session. Styled, it reads as a plain layer.",
    details: [
      "Stretch performance knit, 180 GSM",
      "Slim athletic fit",
      "Flatlock seams",
      "UPF 40+ sun protection",
      "Machine wash cold, hang dry",
    ],
    tags: ["long-sleeve", "performance", "layering"],
    variants: variants("core-long-sleeve", "CPLs", "Ch", "Graphite", 23, [
      "S",
      "M",
      "L",
      "XL",
    ]),
  },
  {
    id: "gm-009",
    slug: "everyday-oversized-tee",
    name: "Everyday Oversized Tee",
    line: "URBAN",
    category: "T-Shirts",
    price: 1199,
    image: "/images/products/oversized-tee.jpg",
    gallery: ["/images/products/oversized-tee.jpg", "/images/urban-1.jpg"],
    blurb:
      "A charcoal drop-shoulder tee with a wide body — the one you reach for without thinking.",
    description:
      "Wide through the chest, long enough to layer over a tee, and cut in a mid-weight cotton that holds a clean line. The everyday answer to the everyday question.",
    details: [
      "200 GSM combed cotton",
      "Drop-shoulder oversized fit",
      "Slightly dropped hem",
      "Twin-needle stitching",
      "Machine wash cold",
    ],
    tags: ["oversized", "cotton", "everyday"],
    variants: variants("everyday-oversized-tee", "UETee", "Ch", "Graphite", 1, [
      "S",
      "M",
      "L",
      "XL",
      "XXL",
    ]),
  },
  {
    id: "gm-010",
    slug: "everyday-performance-hoodie",
    name: "Everyday Performance Hoodie",
    line: "CORE",
    category: "Hoodies",
    price: 2399,
    image: "/images/products/hoodie.jpg",
    gallery: ["/images/products/hoodie.jpg", "/images/core-1.jpg"],
    blurb:
      "A training hoodie that moves like a tee and warms like a layer.",
    description:
      "Built for the warm-up, the walk home and the cool-down. A mid-weight technical fleece with a flat hood, thumbholes and a kangaroo pocket — comfortable enough to keep on through the rest of the day.",
    details: [
      "Mid-weight technical fleece, 240 GSM",
      "Flat hood, no drawcords",
      "Thumbhole cuffs",
      "Kangaroo pocket",
      "Machine wash cold, hang dry",
    ],
    tags: ["hoodie", "performance", "layering"],
    variants: variants(
      "everyday-performance-hoodie",
      "CPHd",
      "Nv",
      "Deep Navy",
      23,
      ["S", "M", "L", "XL"],
    ),
  },
];

export const categories: ProductCategory[] = [
  "T-Shirts",
  "Hoodies",
  "Performance",
  "Accessories",
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getFeatured(limit = 4): Product[] {
  return products.filter((p) => p.featured).slice(0, limit);
}

export function getByLine(line: ProductLine): Product[] {
  return products.filter((p) => p.line === line);
}

/**
 * SKU resolution.
 * `QIKINK_SKU_MAP` lets the live account's real SKU codes replace the
 * catalogue defaults without a redeploy of the catalogue itself.
 */
export function resolveSku(productSlug: string, fallback: string): string {
  const raw = process.env.QIKINK_SKU_MAP;
  if (!raw) return fallback;
  try {
    const map = JSON.parse(raw) as Record<string, string>;
    return map[productSlug] ?? fallback;
  } catch {
    return fallback;
  }
}
