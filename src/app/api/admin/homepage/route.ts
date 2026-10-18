import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-session";
import { getHomepageSettings, saveHomepageSettings } from "@/lib/homepage-store";

export const dynamic = "force-dynamic";
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  return NextResponse.json(await getHomepageSettings());
}
export async function PATCH(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await request.json();
    return NextResponse.json(await saveHomepageSettings(body));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save homepage." }, { status: 400 });
  }
}
