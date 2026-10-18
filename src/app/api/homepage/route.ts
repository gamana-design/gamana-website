import { NextResponse } from "next/server";
import { getHomepageSettings } from "@/lib/homepage-store";
export const dynamic = "force-dynamic";
export async function GET() { return NextResponse.json(await getHomepageSettings(), { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } }); }
