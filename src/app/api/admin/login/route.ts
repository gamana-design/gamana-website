import { NextRequest, NextResponse } from "next/server";
import {
  adminCookieName,
  adminCookieOptions,
  checkAdminPassword,
  createSessionToken,
  isAdminConfigured,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!isAdminConfigured())
    return NextResponse.json(
      { error: "Admin access is not configured." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );

  const body = await req.json().catch(() => null);
  const password =
    body && typeof body === "object" && "password" in body
      ? body.password
      : undefined;

  try {
    if (typeof password !== "string" || !(await checkAdminPassword(password))) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return NextResponse.json(
        { error: "Wrong password." },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Admin sign-in is temporarily unavailable. Please try again." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  const response = NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store" } },
  );
  response.cookies.set(
    adminCookieName,
    await createSessionToken(),
    adminCookieOptions,
  );
  return response;
}
