import { NextResponse } from "next/server";

import { products } from "@/data/catalog";
import { isConfigured, tryFetchCatalogue } from "@/lib/qikink";

export const dynamic = "force-dynamic";

/**
 * Storefront catalogue.
 *
 * The published Qikink API is order-scoped, so the curated catalogue is the
 * source of truth. This route attempts a live pull from the account and
 * reports which source was used, so the storefront can show an honest
 * fulfilment status.
 */
export async function GET() {
  let source: "qikink" | "curated" = "curated";
  let qikinkReachable = false;

  if (isConfigured()) {
    const live = await tryFetchCatalogue();
    qikinkReachable = live.ok;
    if (live.ok) source = "qikink";
  }

  return NextResponse.json(
    {
      source,
      qikinkReachable,
      count: products.length,
      products,
    },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
  );
}
