import type { Product, ProductVariant } from "@/data/catalog";

export type AdminVariant = ProductVariant & {
  productSku?: string;
  designSku?: string;
  storeSku?: string;
  productCost?: number;
};
export type AdminProduct = Omit<Product, "variants"> & {
  variants: AdminVariant[];
  active?: boolean;
  qikinkProductId?: string;
  qikinkProductType?: string;
  printTypeId?: number;
  skuPrefix?: string;
  designCode?: string;
  designUrl?: string;
  mockupUrl?: string;
  placementSku?: string;
  widthInches?: number;
  heightInches?: number;
};
export type ProductDraft = Partial<AdminProduct>;
export const printTypes = [
  [1, "DTG / plain"],
  [2, "All-over print (AOP)"],
  [3, "Embroidery"],
  [5, "Accessories"],
  [6, "Puff print"],
  [7, "Glow in the dark"],
  [12, "Rainbow vinyl"],
  [13, "Gold vinyl"],
  [14, "Silver vinyl"],
  [15, "Reflective grey vinyl"],
  [17, "DTF"],
  [23, "Sublimation"],
] as const;

function text(value: unknown, label: string, max = 2000): string {
  if (value == null) return "";
  if (typeof value !== "string" || value.length > max)
    throw new Error(`${label} must be text, up to ${max} characters.`);
  return value.trim();
}
function money(
  value: unknown,
  label: string,
  optional = false,
): number | undefined {
  if (optional && (value === "" || value == null)) return undefined;
  if (typeof value !== "number" && typeof value !== "string")
    throw new Error(`${label} must be a valid amount.`);
  if (
    value === "" ||
    !Number.isFinite(Number(value)) ||
    Number(value) < 0 ||
    Number(value) > 99999999.99 ||
    Math.abs(Number(value) * 100 - Math.round(Number(value) * 100)) > 0.00001
  )
    throw new Error(
      `${label} must be a non-negative amount with at most two decimal places.`,
    );
  return Number(value);
}
function strings(value: unknown, label: string): string[] {
  if (!Array.isArray(value) || value.some((v) => typeof v !== "string"))
    throw new Error(`${label} must be a list of text entries.`);
  return value.map((v) => text(v, label)).filter(Boolean);
}
function media(value: unknown, label: string): string {
  const v = text(value, label);
  if (!v) return "";
  if (/^\/(?!\/)/.test(v)) return v;
  try {
    if (new URL(v).protocol === "https:") return v;
  } catch {
    /* report below */
  }
  throw new Error(
    `${label} must be an uploaded image, a website path or a public HTTPS link.`,
  );
}

/** Shared client/server validation. Saved references never silently become order SKUs. */
export function validateProductDraft(raw: unknown): ProductDraft {
  if (!raw || typeof raw !== "object" || Array.isArray(raw))
    throw new Error("Please enter product details.");
  const d = raw as Record<string, unknown>;
  const name = text(d.name, "Product name", 200);
  const slug = text(d.slug, "Page address", 200);
  if (!name || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
    throw new Error(
      "Enter a product name and a page address using lowercase words separated by hyphens.",
    );
  const qikinkProductId = text(d.qikinkProductId, "Qikink product ID", 50);
  if (qikinkProductId && !/^\d+$/.test(qikinkProductId))
    throw new Error("Qikink product ID must contain digits only.");
  if (d.line !== "URBAN" && d.line !== "CORE")
    throw new Error("Choose URBAN or CORE.");
  if (
    !["T-Shirts", "Hoodies", "Performance", "Accessories"].includes(
      String(d.category),
    )
  )
    throw new Error("Choose a product category.");
  const printTypeId = Number(d.printTypeId ?? 1);
  if (!printTypes.some(([id]) => id === printTypeId))
    throw new Error("Choose a supported print method.");
  if (!Array.isArray(d.variants) || d.variants.length > 200)
    throw new Error("Enter up to 200 size and colour variations.");
  const seen = new Set<string>();
  const orderSkus = new Set<string>();
  const storeSkus = new Set<string>();
  const variants: AdminVariant[] = d.variants.map((raw, i) => {
    if (!raw || typeof raw !== "object")
      throw new Error(`Check variation ${i + 1}.`);
    const v = raw as Record<string, unknown>;
    const size = text(v.size, "Size", 50),
      color = text(v.color, "Colour", 100);
    if (!size || !color)
      throw new Error(`Enter a size and colour for variation ${i + 1}.`);
    const key = `${size.toLowerCase()}\0${color.toLowerCase()}`;
    if (seen.has(key))
      throw new Error(`The ${color} / ${size} variation is listed twice.`);
    seen.add(key);
    const sku = text(v.sku, "Confirmed order SKU", 50);
    const storeSku = text(v.storeSku, "Store SKU", 200);
    if (sku && orderSkus.has(sku))
      throw new Error("Each variation needs a different confirmed order SKU.");
    if (storeSku && storeSkus.has(storeSku))
      throw new Error("Each variation needs a different Store SKU.");
    if (sku) orderSkus.add(sku);
    if (storeSku) storeSkus.add(storeSku);
    if (!["in", "low", "out"].includes(String(v.stock)))
      throw new Error(`Choose availability for ${color} / ${size}.`);
    const type = Number(v.printTypeId ?? printTypeId);
    if (!printTypes.some(([id]) => id === type))
      throw new Error(
        `Choose a supported print method for ${color} / ${size}.`,
      );
    return {
      size,
      color,
      sku,
      printTypeId: type,
      stock: v.stock as AdminVariant["stock"],
      productSku: text(v.productSku, "Product SKU", 200),
      designSku: text(v.designSku, "Design SKU"),
      storeSku,
      productCost: money(v.productCost, "Qikink product cost", true),
    };
  });
  const price = money(d.price, "Selling price")!;
  const image = media(d.image, "Cover photo");
  const active = d.active === true;
  if (active) {
    const missing: string[] = [];
    if (!image) missing.push("a cover photo");
    if (price <= 0) missing.push("a selling price above ₹0");
    if (!variants.length) missing.push("at least one variation");
    if (missing.length) {
      throw new Error(
        `Can't show this product in the shop yet. Missing: ${missing.join("; ")}. Add the missing details, or save it as a draft while you finish the listing.`,
      );
    }
  }
  return {
    name,
    slug,
    line: d.line,
    category: d.category as Product["category"],
    price,
    compareAt: money(d.compareAt, "Original price", true),
    image,
    gallery: strings(d.gallery ?? [], "Gallery").map((v) =>
      media(v, "Gallery photo"),
    ),
    blurb: text(d.blurb, "Short description"),
    description: text(d.description, "Description", 20000),
    details: strings(d.details ?? [], "Details"),
    tags: strings(d.tags ?? [], "Tags"),
    badge: text(d.badge, "Badge", 100),
    active,
    featured: d.featured === true,
    isNew: d.isNew === true,
    qikinkProductId,
    qikinkProductType: text(d.qikinkProductType, "Qikink product type", 200),
    printTypeId,
    variants,
    skuPrefix: text(d.skuPrefix, "Legacy SKU prefix", 200),
    designCode: text(d.designCode, "Legacy design code", 20),
    designUrl: media(d.designUrl, "Design file"),
    mockupUrl: media(d.mockupUrl, "Mockup"),
    placementSku: text(d.placementSku, "Placement", 10) || "fr",
    widthInches: money(d.widthInches, "Print width", true),
    heightInches: money(d.heightInches, "Print height", true),
  };
}

/** Do not expose supplier costs or admin-only references through public catalogue reads. */
export function toStorefrontProduct(p: AdminProduct): Product {
  const {
    id,
    slug,
    name,
    line,
    category,
    price,
    compareAt,
    image,
    gallery,
    blurb,
    description,
    details,
    tags,
    badge,
    featured,
    isNew,
  } = p;
  return {
    id,
    slug,
    name,
    line,
    category,
    price,
    compareAt,
    image,
    gallery,
    blurb,
    description,
    details,
    tags,
    badge,
    featured,
    isNew,
    variants: p.variants.map(({ size, color, sku, printTypeId, stock }) => ({
      size,
      color,
      sku,
      printTypeId,
      stock,
    })),
  };
}

export function appendSizeVariants(
  existing: AdminVariant[],
  sizes: string,
  color: string,
  template: string,
  designSku: string,
  cost: string,
  printTypeId: number,
): AdminVariant[] {
  if (!color.trim())
    throw new Error("Enter a base colour before adding sizes.");
  const unique = new Set(
    existing.map((v) => `${v.size.toLowerCase()}\0${v.color.toLowerCase()}`),
  );
  const additions: AdminVariant[] = [];
  const productCost = money(cost, "Qikink product cost", true);
  for (const size of sizes
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)) {
    const key = `${size.toLowerCase()}\0${color.trim().toLowerCase()}`;
    if (unique.has(key)) continue;
    unique.add(key);
    additions.push({
      size,
      color: color.trim(),
      sku: "",
      productSku: template.replaceAll("{size}", size),
      designSku,
      storeSku: "",
      productCost,
      printTypeId,
      stock: "in",
    });
  }
  if (!additions.length)
    throw new Error(
      "Enter new sizes, separated by commas. Existing variations are kept unchanged.",
    );
  return [...existing, ...additions];
}
