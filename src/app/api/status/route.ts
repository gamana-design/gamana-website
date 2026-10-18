import { NextResponse } from "next/server";

import { getSupabaseAdmin } from "@/lib/supabase";
import { isConfigured, ping } from "@/lib/qikink";

export const dynamic = "force-dynamic";

/**
 * Integration health for the brand team.
 *
 * Reports whether the two live services the store depends on are actually
 * answering from the server runtime:
 *   - Qikink  → can we get an access token, i.e. can we push print orders
 *   - Supabase → can we write an order / a subscriber
 */
export async function GET() {
  const qikink = isConfigured()
    ? await ping()
    : { ok: false, detail: "credentials-missing" };

  let supabase: { ok: boolean; detail: string } = {
    ok: false,
    detail: "not-configured",
  };

  try {
    const admin = getSupabaseAdmin();
    if (!admin) {
      supabase = { ok: false, detail: "credentials-missing" };
    } else {
      const { error } = await admin
        .from("newsletter_subscribers")
        .select("id", { count: "exact", head: true });
      supabase = error
        ? { ok: false, detail: error.message }
        : { ok: true, detail: "connected" };
    }
  } catch (err) {
    supabase = {
      ok: false,
      detail: err instanceof Error ? err.message : "unreachable",
    };
  }

  const healthy = qikink.ok && supabase.ok;

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      qikink,
      supabase,
      timestamp: new Date().toISOString(),
    },
    {
      status: healthy ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
