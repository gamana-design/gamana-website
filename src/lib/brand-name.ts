import { shippingCopy } from "./shipping";
/** Display branding only. Never apply this to URLs, identifiers, or saved order data. */
export const BRAND_NAME = "గMANA";
// Existing Ember tones: deeper on light surfaces, brighter on dark surfaces.
export const BRAND_INITIAL_COLOR = "#C94A10";
export const BRAND_INITIAL_COLOR_ON_DARK = "#F2691E";

export function brandCopy(text: string): string {
  return shippingCopy(text.replace(/\bGAMANA\b/g, BRAND_NAME));
}

const copyFields = new Set([
  "title", "name", "description", "eyebrow", "body", "text", "buttonLabel",
  "label", "excerpt", "blurb", "imageAlt", "brandName", "footerBlurb",
  "heroDescription", "heroEyebrow", "coreComingSoonText", "announcementItems",
  "details", "tags", "note", "caption",
]);
/** Adapt legacy saved editorial copy on read; never modify the database or link fields. */
export function brandContent<T>(value: T, field = ""): T {
  if (typeof value === "string") return (copyFields.has(field) ? brandCopy(value) : value) as T;
  if (Array.isArray(value)) return value.map(item => brandContent(item, field)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, brandContent(item, key)])) as T;
  }
  return value;
}
