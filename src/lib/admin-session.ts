import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { adminCookieName, verifySessionToken } from "@/lib/admin-auth";
export async function isAdminSignedIn() { const jar = await cookies(); return verifySessionToken(jar.get(adminCookieName)?.value); }
export async function requireAdmin() { return await isAdminSignedIn() ? null : NextResponse.json({ error: "Not signed in." }, { status: 401 }); }
