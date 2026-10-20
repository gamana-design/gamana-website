import "server-only";
import { verifyAdminPasswordHash } from "@/lib/admin-password-crypto";
import { getSupabaseAdmin } from "@/lib/supabase";

const COOKIE = "gamana_admin_session";
const PASSWORD_TABLE = "gamana_admin_passwords";
const TTL = 12 * 60 * 60 * 1000;
const enc = new TextEncoder();

type AdminPasswordRecord = {
  password_hash: string;
  updated_at: string;
};

function base64url(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function constantTimeEqual(left: string, right: string) {
  const a = enc.encode(left);
  const b = enc.encode(right);
  let difference = a.length ^ b.length;
  for (let index = 0; index < Math.max(a.length, b.length); index++)
    difference |= (a[index] ?? 0) ^ (b[index] ?? 0);
  return difference === 0;
}

async function sign(payload: string) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("Admin session secret is not configured.");
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return base64url(
    new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(payload))),
  );
}

export function isAdminConfigured() {
  const hasPasswordSource = Boolean(
    process.env.ADMIN_PASSWORD ||
      (process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.SUPABASE_SERVICE_ROLE_KEY),
  );
  return hasPasswordSource && Boolean(process.env.ADMIN_SESSION_SECRET);
}

export async function getAdminPasswordRecord(): Promise<AdminPasswordRecord | null> {
  const db = getSupabaseAdmin();
  if (!db) return null;

  const { data, error } = await db
    .from(PASSWORD_TABLE)
    .select("password_hash, updated_at")
    .eq("id", 1)
    .maybeSingle();

  // Before the migration is applied, keep the existing environment password usable.
  if (error?.code === "PGRST205" || error?.code === "42P01") return null;
  if (error) throw new Error("Could not read the admin password.");
  return data;
}

export async function checkAdminPassword(candidate: string) {
  const record = await getAdminPasswordRecord();
  if (record) return verifyAdminPasswordHash(candidate, record.password_hash);

  const environmentPassword = process.env.ADMIN_PASSWORD ?? "";
  return Boolean(environmentPassword) &&
    constantTimeEqual(candidate, environmentPassword);
}

export async function createSessionToken() {
  const issuedAt = Date.now();
  const expiresAt = issuedAt + TTL;
  const payload = `${issuedAt}.${expiresAt}`;
  return `${payload}.${await sign(payload)}`;
}

export async function verifySessionToken(token?: string) {
  if (!token || !isAdminConfigured()) return false;

  const parts = token.split(".");
  let issuedAt = 0;
  let expiresAt: string | undefined;
  let payload: string | undefined;
  let signature: string | undefined;

  if (parts.length === 2) {
    // Accept older sessions until a stored password is set; a password change
    // invalidates them because their issue time is treated as zero.
    [expiresAt, signature] = parts;
    payload = expiresAt;
  } else if (parts.length === 3) {
    const [issuedAtText, expiryText, tokenSignature] = parts;
    if (!/^\d+$/.test(issuedAtText ?? "")) return false;
    issuedAt = Number(issuedAtText);
    expiresAt = expiryText;
    signature = tokenSignature;
    payload = `${issuedAtText}.${expiryText}`;
  } else {
    return false;
  }

  if (
    !/^\d+$/.test(expiresAt ?? "") ||
    Number(expiresAt) <= Date.now() ||
    !signature ||
    !payload
  )
    return false;

  try {
    const expected = await sign(payload);
    if (!constantTimeEqual(signature, expected)) return false;

    const record = await getAdminPasswordRecord();
    if (record) {
      const changedAt = Date.parse(record.updated_at);
      if (!Number.isFinite(changedAt) || issuedAt <= changedAt) return false;
    }
    return true;
  } catch {
    return false;
  }
}

export const adminCookieName = COOKIE;
export const adminCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: TTL / 1000,
};
