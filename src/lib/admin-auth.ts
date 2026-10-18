const COOKIE = "gamana_admin_session";
const TTL = 12 * 60 * 60 * 1000;
const enc = new TextEncoder();
function base64url(bytes: Uint8Array) { return btoa(String.fromCharCode(...bytes)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_"); }
async function sign(payload: string) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("Admin session secret is not configured.");
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return base64url(new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(payload))));
}
export function isAdminConfigured() { return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET); }
export async function checkAdminPassword(candidate: string) {
  const a = enc.encode(candidate), b = enc.encode(process.env.ADMIN_PASSWORD ?? "");
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  return diff === 0 && Boolean(process.env.ADMIN_PASSWORD);
}
export async function createSessionToken() { const exp = Date.now() + TTL; const payload = String(exp); return `${payload}.${await sign(payload)}`; }
export async function verifySessionToken(token?: string) {
  if (!token || !isAdminConfigured()) return false;
  const [exp, sig, ...rest] = token.split(".");
  if (rest.length || !/^\d+$/.test(exp ?? "") || Number(exp) <= Date.now() || !sig) return false;
  try { const expected = await sign(exp); const a = enc.encode(sig), b = enc.encode(expected); let d = a.length ^ b.length; for (let i=0;i<Math.max(a.length,b.length);i++) d |= (a[i]??0)^(b[i]??0); return d === 0; } catch { return false; }
}
export const adminCookieName = COOKIE;
export const adminCookieOptions = { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: TTL / 1000 };
