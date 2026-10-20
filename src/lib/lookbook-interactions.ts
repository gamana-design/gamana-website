import type { Product } from "@/data/catalog";
import type { StoryImage } from "./lookbook";

/** Keep product markers aligned with the original, uncropped editorial photograph. */
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
