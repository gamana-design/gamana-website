import { createHmac, timingSafeEqual } from "node:crypto";

export const ORDER_ACCESS_COOKIE_NAME = "gamana_order_access";
export const ORDER_ACCESS_TTL_MS = 60 * 60 * 1000;
export const ORDER_PASSWORD_MIN_LENGTH = 12;
export const ORDER_PASSWORD_MAX_LENGTH = 128;

export function isOrderPasswordConfigured(
  password: string | undefined,
  sessionSecret: string | undefined,
): boolean {
  return (
    typeof password === "string" &&
    password.length >= ORDER_PASSWORD_MIN_LENGTH &&
    password.length <= ORDER_PASSWORD_MAX_LENGTH &&
    Boolean(sessionSecret)
  );
}

export function checkOrderPassword(
  candidate: unknown,
  expected: string | undefined,
): boolean {
  if (
    typeof candidate !== "string" ||
    typeof expected !== "string" ||
    candidate.length === 0 ||
    candidate.length > ORDER_PASSWORD_MAX_LENGTH
  )
    return false;

  const candidateBytes = Buffer.from(candidate, "utf8");
  const expectedBytes = Buffer.from(expected, "utf8");
  return (
    candidateBytes.length === expectedBytes.length &&
    timingSafeEqual(candidateBytes, expectedBytes)
  );
}

function signingKey(password: string, sessionSecret: string) {
  return createHmac("sha256", sessionSecret)
    .update(`gamana-order-access-key:v1:${password}`)
    .digest();
}

function signature(expiresAt: number, password: string, sessionSecret: string) {
  return createHmac("sha256", signingKey(password, sessionSecret))
    .update(`v1:${expiresAt}`)
    .digest("base64url");
}

export function createOrderAccessToken(
  password: string | undefined,
  sessionSecret: string | undefined,
  now = Date.now(),
): string {
  if (
    typeof password !== "string" ||
    typeof sessionSecret !== "string" ||
    !isOrderPasswordConfigured(password, sessionSecret)
  )
    throw new Error("Order password is not configured.");

  const expiresAt = Math.floor(now / 1000) + ORDER_ACCESS_TTL_MS / 1000;
  return `${expiresAt}.${signature(expiresAt, password, sessionSecret)}`;
}

export function verifyOrderAccessToken(
  token: string | undefined,
  password: string | undefined,
  sessionSecret: string | undefined,
  now = Date.now(),
): boolean {
  if (
    !token ||
    typeof password !== "string" ||
    typeof sessionSecret !== "string" ||
    !isOrderPasswordConfigured(password, sessionSecret)
  )
    return false;

  const parts = token.split(".");
  if (
    parts.length !== 2 ||
    !/^\d+$/.test(parts[0] ?? "") ||
    !/^[A-Za-z0-9_-]{43}$/.test(parts[1] ?? "")
  )
    return false;

  const expiresAt = Number(parts[0]);
  const nowSeconds = Math.floor(now / 1000);
  if (
    !Number.isSafeInteger(expiresAt) ||
    expiresAt <= nowSeconds ||
    expiresAt > nowSeconds + ORDER_ACCESS_TTL_MS / 1000 + 1
  )
    return false;

  try {
    const expected = Buffer.from(
      signature(expiresAt, password, sessionSecret),
      "base64url",
    );
    const actual = Buffer.from(parts[1] ?? "", "base64url");
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}
