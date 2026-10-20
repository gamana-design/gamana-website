import type { AdminProduct, ProductDraft } from "./admin-product";
type ProductRow = Record<string, any>;
export function rowToProduct(row: ProductRow): AdminProduct {
  const variants = (row.gamana_product_variants ?? row.variants ?? []).map(
    (v: ProductRow) => ({
      size: v.size,
      color: v.color,
      sku: v.sku,
      printTypeId: v.print_type_id,
      stock: v.stock,
      productSku: v.product_sku ?? "",
      designSku: v.design_sku ?? "",
      storeSku: v.store_sku ?? "",
      productCost: v.product_cost == null ? undefined : Number(v.product_cost),
    }),
  );
  return {
    qikinkProductId: row.qikink_product_id ?? "",
    qikinkProductType: row.qikink_product_type ?? "",
    id: row.id,
    active: row.active !== false,
    printTypeId: row.print_type_id ?? 1,
    skuPrefix: row.sku_prefix ?? "",
    designCode: row.design_code ?? undefined,
    designUrl: row.design_url ?? undefined,
    mockupUrl: row.mockup_url ?? undefined,
    placementSku: row.placement_sku ?? "fr",
    widthInches:
      row.width_inches == null ? undefined : Number(row.width_inches),
    heightInches:
      row.height_inches == null ? undefined : Number(row.height_inches),
    slug: row.slug,
    name: row.name,
    line: row.line,
    category: row.category,
    price: Number(row.price),
    ...(row.compare_at != null ? { compareAt: Number(row.compare_at) } : {}),
    image: row.image,
    gallery: row.gallery ?? [],
    blurb: row.blurb,
    description: row.description,
    details: row.details ?? [],
    tags: row.tags ?? [],
    ...(row.badge ? { badge: row.badge } : {}),
    featured: row.featured,
    isNew: row.is_new,
    variants,
  };
}
export function productColumns(d: ProductDraft) {
  return {
    qikink_product_id: d.qikinkProductId || null,
    qikink_product_type: d.qikinkProductType || null,
    slug: d.slug,
    name: d.name,
    line: d.line ?? "URBAN",
    category: d.category ?? "T-Shirts",
    price: d.price ?? 0,
    compare_at: d.compareAt ?? null,
    image: d.image ?? "",
    gallery: d.gallery ?? [],
    blurb: d.blurb ?? "",
    description: d.description ?? "",
    details: d.details ?? [],
    tags: d.tags ?? [],
    badge: d.badge ?? null,
    featured: d.featured ?? false,
    is_new: d.isNew ?? false,
    print_type_id: d.printTypeId ?? 1,
    sku_prefix: d.skuPrefix ?? "",
    design_code: d.designCode ?? null,
    design_url: d.designUrl ?? null,
    mockup_url: d.mockupUrl ?? null,
    placement_sku: d.placementSku ?? "fr",
    width_inches: d.widthInches ?? null,
    height_inches: d.heightInches ?? null,
    active: d.active ?? true,
    updated_at: new Date().toISOString(),
  };
}
export function variantColumns(d: ProductDraft) {
  return (d.variants ?? []).map((v) => ({
    size: v.size,
    color: v.color,
    sku: v.sku,
    print_type_id: v.printTypeId ?? d.printTypeId ?? 1,
    stock: v.stock ?? "in",
    product_sku: v.productSku || null,
    design_sku: v.designSku || null,
    store_sku: v.storeSku || null,
    product_cost: v.productCost ?? null,
  }));
}
