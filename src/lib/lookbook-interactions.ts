import type { Product } from "@/data/catalog";
import type { StoryImage } from "./lookbook";

export function getAvailableHotspots(
  image: StoryImage,
  products: readonly Product[],
) {
  return (image.hotspots ?? []).filter(
    (spot) =>
      Number.isFinite(spot.x) &&
      Number.isFinite(spot.y) &&
      spot.x >= 0 &&
      spot.x <= 100 &&
      spot.y >= 0 &&
      spot.y <= 100 &&
      products.some((product) => product.slug === spot.productSlug),
  );
}

export function getSpreadStart(
  index: number,
  wide: boolean,
  pageCount: number,
) {
  const safe = Math.max(
    0,
    Math.min(
      Math.max(0, pageCount - 1),
      Number.isFinite(index) ? Math.floor(index) : 0,
    ),
  );
  return wide ? Math.floor(safe / 2) * 2 : safe;
}
