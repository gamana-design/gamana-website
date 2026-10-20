import { NextRequest, NextResponse } from "next/server";
import {
  adminCookieName,
  adminCookieOptions,
  checkAdminPassword,
} from "@/lib/admin-auth";
import { hashAdminPassword, isStrongAdminPassword } from "@/lib/admin-password-crypto";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

function isSameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(req.url).origin;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production")
    return NextResponse.json(
      { error: "Password changes are only available on the live admin site." },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );

  if (!isSameOrigin(req))
    return NextResponse.json(
      { error: "Please try again from the admin page." },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );

  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const contentLength = Number(req.headers.get("content-length") ?? "0");
  if (contentLength > 20_000)
    return NextResponse.json(
      { error: "The request is too large." },
      { status: 413, headers: { "Cache-Control": "no-store" } },
    );

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object")
    return NextResponse.json(
      { error: "Please fill in all three password boxes." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );

  const { currentPassword, newPassword, confirmPassword } = body;
  if (
    typeof currentPassword !== "string" ||
    currentPassword.length === 0 ||
    currentPassword.length > 1024 ||
    typeof newPassword !== "string" ||
    typeof confirmPassword !== "string"
  )
    return NextResponse.json(
      { error: "Please fill in all three password boxes." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );

  if (!isStrongAdminPassword(newPassword))
    return NextResponse.json(
      { error: "Choose a new password with 12 to 128 characters." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  if (newPassword !== confirmPassword)
    return NextResponse.json(
      { error: "The two new passwords do not match." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  if (newPassword === currentPassword)
    return NextResponse.json(
      { error: "Choose a password you are not using now." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );

  try {
    if (!(await checkAdminPassword(currentPassword))) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return NextResponse.json(
        { error: "The current password is not right." },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      );
    }

    const db = getSupabaseAdmin();
    if (!db)
      return NextResponse.json(
        { error: "Password changes are not set up yet. Please contact support." },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );

    const passwordHash = await hashAdminPassword(newPassword);
    const { error } = await db.from("gamana_admin_passwords").upsert(
      {
        id: 1,
        password_hash: passwordHash,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
    if (error) throw new Error("Could not save the new password.");
  } catch {
    return NextResponse.json(
      { error: "The password could not be changed. Please try again." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  const response = NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store" } },
  );
  response.cookies.set(adminCookieName, "", {
    ...adminCookieOptions,
    maxAge: 0,
    expires: new Date(0),
  });
  return response;
}
