/**
 * Historical catalogue examples used only by the explicit local design preview.
 * These sample SKUs are not live order values. Production live checkout uses
 * the confirmed Store SKU saved for each size-and-colour option in admin.
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
    slug: "godavari-tee-sunset",
    name: "Godavari Tee — Sunset Ember",
    line: "URBAN",
    category: "T-Shirts",
    price: 1499,
    image: "/images/brand/godavari-sunset-front.jpg",
    gallery: [
      "/images/brand/godavari-sunset-front.jpg",
      "/images/brand/godavari-sunset-back.jpg",
      "/images/brand/model-sunset-front.jpg",
      "/images/brand/model-sunset-back.jpg",
    ],
    blurb:
      "The first graphic. A river at dusk, printed across the chest of a 240 GSM boxy tee.",
    description:
      "The piece GAMANA is built on. The Godavari graphic was drawn from the river itself — the way the light sits on the water at dusk, the birds pulling away from the bank, the runner glyph set small at the chest. Front and back are printed, so it reads from both sides. Cut from 240 GSM combed cotton, boxy with a dropped shoulder, printed with a water-based DTG process that stays soft against the skin.",
    details: [
      "240 GSM combed ring-spun cotton",
      "Boxy fit with dropped shoulders",
      "Full front and back print",
      "Water-based DTG, soft to the touch",
      "Garment-washed for softness",
      "Machine wash inside out, cold",
    ],
    tags: ["graphic", "cultural", "godavari", "heavyweight", "drop-01"],
    badge: "Drop 01",
    featured: true,
    isNew: true,
    variants: variants("godavari-tee-sunset", "GDTee", "Or", "Sunset Ember", 1, [
      "S",
      "M",
      "L",
      "XL",
      "XXL",
    ], ["S"]),
  },
  {
    id: "gm-002",
    slug: "godavari-tee-lavender",
    name: "Godavari Tee — Lavender Dusk",
    line: "URBAN",
    category: "T-Shirts",
    price: 1499,
    image: "/images/brand/godavari-lavender-front.jpg",
    gallery: [
      "/images/brand/godavari-lavender-front.jpg",
      "/images/brand/godavari-lavender-back.jpg",
      "/images/brand/model-lavender-front.jpg",
      "/images/brand/model-lavender-back.jpg",
    ],
    blurb:
      "The same river, a different hour — lavender, violet and the same ghat silhouette on the back.",
    description:
      "Lavender Dusk is the Godavari graphic in its quiet register. The sky reads violet and rose, the birds are still there, and the back carries the bridge silhouette in full. Same 240 GSM combed cotton, same boxy body, same drop — a colourway rather than a rerun.",
    details: [
      "240 GSM combed ring-spun cotton",
      "Boxy fit with dropped shoulders",
      "Full front and back print",
      "Water-based DTG, soft to the touch",
      "Garment-washed for softness",
      "Machine wash inside out, cold",
    ],
    tags: ["graphic", "cultural", "godavari", "heavyweight", "drop-01"],
    badge: "Drop 01",
    featured: true,
    isNew: true,
    variants: variants("godavari-tee-lavender", "GDTee", "Lv", "Lavender Dusk", 1, [
      "S",
      "M",
      "L",
      "XL",
      "XXL",
    ]),
  },
  {
    id: "gm-003",
    slug: "godavari-tee-violet",
    name: "Godavari Tee — Violet Hour",
    line: "URBAN",
    category: "T-Shirts",
    price: 1499,
    image: "/images/brand/model-violet.jpg",
    gallery: [
      "/images/brand/model-violet.jpg",
      "/images/brand/detail-violet-collar.jpg",
      "/images/brand/detail-violet-fabric.jpg",
    ],
    blurb:
      "Violet, magenta and the last of the light — the third reading of the same graphic.",
    description:
      "Violet Hour pushes the sunset further, into magenta and deep violet, with the bridge graphic running across the back. Cut on the same 240 GSM boxy body, so it sits exactly where the other two do. The colourway people stop you in the street about.",
    details: [
      "240 GSM combed ring-spun cotton",
      "Boxy fit with dropped shoulders",
      "Full front and back print",
      "Water-based DTG, soft to the touch",
      "Ribbed collar that stays flat",
      "Machine wash inside out, cold",
    ],
    tags: ["graphic", "cultural", "godavari", "heavyweight", "drop-01"],
    badge: "Drop 01",
    featured: true,
    isNew: true,
    variants: variants("godavari-tee-violet", "GDTee", "Vi", "Violet Hour", 1, [
      "S",
      "M",
      "L",
      "XL",
      "XXL",
    ], ["XXL"]),
  },
  {
    id: "gm-004",
    slug: "everyday-oversized-tee",
    name: "Everyday Oversized Tee — Bone",
    line: "URBAN",
    category: "T-Shirts",
    price: 1199,
    image: "/images/products/heavyweight-tee-bone.jpg",
    gallery: [
      "/images/products/heavyweight-tee-bone.jpg",
      "/images/urban-1.jpg",
    ],
    blurb:
      "A 220 GSM bone tee cut wide and boxy — the one you reach for without thinking.",
    description:
      "The blank canvas of the collection. Heavyweight combed cotton in a warm bone, cut wide through the chest with a dropped shoulder and a hem that sits where it should. No graphic, no noise — it works under everything and over nothing.",
    details: [
      "220 GSM combed ring-spun cotton",
      "Oversized drop-shoulder fit",
      "Ribbed collar, twin-needle hems",
      "Pre-shrunk",
      "Machine wash cold, tumble dry low",
    ],
    tags: ["oversized", "cotton", "everyday", "essential"],
    featured: true,
    variants: variants("everyday-oversized-tee", "UETee", "Bn", "Bone", 1, [
      "S",
      "M",
      "L",
      "XL",
      "XXL",
    ]),
  },
  {
    id: "gm-005",
    slug: "rhythm-performance-tee",
    name: "Rhythm Performance Tee",
    line: "CORE",
    category: "Performance",
    price: 1399,
    image: "/images/products/heavyweight-tee-ink.jpg",
    gallery: [
      "/images/products/heavyweight-tee-ink.jpg",
      "/images/core-2.jpg",
      "/images/core-1.jpg",
    ],
    blurb:
      "A quick-dry training tee that stays light, dry and clean-looking well past the session.",
    description:
      "The CORE workhorse. A lightweight quick-dry knit with a matte, low-sheen finish that keeps its shape through heat and sweat. Flatlock seams sit flat under a pack strap, and the hem is long enough to stay put through a stretch. Styled, it still reads as a plain layer.",
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
    variants: variants("rhythm-performance-tee", "CPTee", "On", "Onyx", 23, [
      "S",
      "M",
      "L",
      "XL",
    ]),
  },
  {
    id: "gm-006",
    slug: "move-training-short",
    name: "Move Training Short",
    line: "CORE",
    category: "Performance",
    price: 1199,
    image: "/images/products/training-short.jpg",
    gallery: ["/images/products/training-short.jpg", "/images/core-1.jpg", "/images/core-2.jpg"],
    blurb:
      "Ripstop shorts with a zip pocket and a liner that stays where it should.",
    description:
      "Lightweight ripstop with a bonded waistband that does not roll, a zipped side pocket for the things you do not want on the floor, and a short mesh liner that is optional, not obligatory. Cut to move through a warm-up and still look like it afterwards.",
    details: [
      "70D ripstop weave with 4-way stretch",
      "Bonded no-roll waistband",
      "Zipped side pocket",
      "Removable mesh liner",
      "Machine wash cold, no iron",
    ],
    tags: ["shorts", "ripstop", "training", "liner"],
    variants: variants("move-training-short", "CPSht", "Gr", "Graphite", 23, [
      "S",
      "M",
      "L",
      "XL",
    ], ["S"]),
  },
  {
    id: "gm-007",
    slug: "everyday-performance-hoodie",
    name: "Everyday Performance Hoodie",
    line: "CORE",
    category: "Hoodies",
    price: 2399,
    image: "/images/products/hoodie.jpg",
    gallery: ["/images/products/hoodie.jpg", "/images/urban-2.jpg"],
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
    tags: ["hoodie", "performance", "layering", "fleece"],
    variants: variants(
      "everyday-performance-hoodie",
      "CPHd",
      "On",
      "Onyx",
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
