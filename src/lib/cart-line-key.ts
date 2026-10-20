/** Stable identity for a cart variant, including products whose SKU is pending. */
export function cartLineKey(productSlug: string, size: string, color: string) {
  return JSON.stringify([productSlug, size, color]);
}
