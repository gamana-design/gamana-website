import "server-only";
import { brandContent } from "./brand-name";
import { isDesignPreview } from "./design-preview";
import { unstable_cache, revalidateTag } from "next/cache";
import type { Product } from "@/data/catalog";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  validateProductDraft,
  toStorefrontProduct,
  type AdminProduct,
  type ProductDraft,
} from "./admin-product";
export type { ProductDraft } from "./admin-product";
import {
  rowToProduct,
  productColumns,
  variantColumns,
} from "./admin-product-storage";
export { rowToProduct } from "./admin-product-storage";
const readRows = unstable_cache(
  async () => {
    const db = getSupabaseAdmin();
    if (!db) return null;
    const { data, error } = await db
      .from("gamana_products")
      .select("*, gamana_product_variants(*)")
      .order("position")
      .order("position", { referencedTable: "gamana_product_variants" });
    if (error) throw error;
    return data?.length ? data.map(rowToProduct) : null;
  },
  ["gamana-catalogue"],
  { revalidate: 60, tags: ["gamana-products"] },
);
export async function getAllProducts(): Promise<AdminProduct[]> {
  return (await readRows()) ?? [];
}
export async function getProducts(): Promise<Product[]> {
  if (isDesignPreview())
    return brandContent((await import("@/data/legacy-catalog")).products);
  return brandContent(
    (await readRows())
      ?.filter((p) => p.active !== false)
      .map(toStorefrontProduct) ?? [],
  );
}
export async function getProductBySlug(slug: string) {
  return (await getProducts()).find((p) => p.slug === slug);
}
export async function getProductById(id: string) {
  return (await getAllProducts()).find((p) => p.id === id);
}
export async function saveProduct(raw: ProductDraft) {
  const d = validateProductDraft(raw);
  const db = getSupabaseAdmin();
  if (!db)
    throw new Error(
      "Product storage is not connected. Your changes have not been saved.",
    );
  const c = productColumns(d);
  const rows = variantColumns(d);
  const { data, error } = await db.rpc("gamana_save_product", {
    p_product: c,
    p_variants: rows,
    p_id: raw.id ?? null,
  });
  if (error)
    throw new Error(
      error.code === "PGRST202"
        ? "The product form storage update needs to be installed before saving. Nothing has been changed."
        : error.message,
    );
  revalidateTag("gamana-products");
  return data as string;
}
export async function deleteProduct(id: string) {
  const db = getSupabaseAdmin();
  if (!db) throw new Error("Supabase is not configured.");
  const { error } = await db.from("gamana_products").delete().eq("id", id);
  if (error) throw error;
  revalidateTag("gamana-products");
}
export async function logAdminAction(action: string, detail?: string) {
  const db = getSupabaseAdmin();
  if (db)
    await db
      .from("gamana_admin_log")
      .insert({ action, detail: detail ?? null });
}
