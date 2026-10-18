import { NextResponse } from "next/server";

import { getProducts } from "@/lib/catalog-store";
import { isConfigured, ping, tryFetchCatalogue } from "@/lib/qikink";

export const dynamic = "force-dynamic";

/**
 * Storefront catalogue + fulfilment health.
 *
 * The published Qikink API is order-scoped — there is no catalogue endpoint —
 * so the curated catalogue in `src/data/catalog.ts` is the source of truth.
 * This route still attempts a live catalogue pull, and separately reports
 * whether the Qikink API itself answers (i.e. whether orders can be pushed),
 * so the storefront can show an honest fulfilment status.
 */
export async function GET() {
  const products = await getProducts();
  let source: "qikink" | "curated" = "curated";
  let qikinkCatalogueAvailable = false;
  let fulfilment: { connected: boolean; detail: string } = {
    connected: false,
    detail: "not-configured",
  };

  if (isConfigured()) {
    const [catalogue, health] = await Promise.all([
      tryFetchCatalogue(),
      ping(),
    ]);
    qikinkCatalogueAvailable = catalogue.ok;
    if (catalogue.ok) source = "qikink";
    fulfilment = { connected: health.ok, detail: health.detail };
  }

  return NextResponse.json(
    {
      source,
      qikinkCatalogueAvailable,
      fulfilment,
      count: products.length,
      products,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    },
  );
}
