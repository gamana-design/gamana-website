import "server-only";
import { cookies } from "next/headers";
import {
  ORDER_ACCESS_COOKIE_NAME,
  ORDER_ACCESS_TTL_MS,
  checkOrderPassword as checkPassword,
  createOrderAccessToken,
  isOrderPasswordConfigured as checkConfiguration,
  verifyOrderAccessToken,
} from "@/lib/order-access-crypto";

export const orderAccessCookieName = ORDER_ACCESS_COOKIE_NAME;

export function isOrderPasswordConfigured() {
  return checkConfiguration(
    process.env.ORDER_PASSWORD,
    process.env.ADMIN_SESSION_SECRET,
  );
}

export function checkOrderPassword(candidate: unknown) {
  return checkPassword(candidate, process.env.ORDER_PASSWORD);
}

export function createOrderAccessSessionToken() {
  return createOrderAccessToken(
    process.env.ORDER_PASSWORD,
    process.env.ADMIN_SESSION_SECRET,
  );
}

export function verifyOrderAccessSessionToken(token?: string) {
  return verifyOrderAccessToken(
    token,
    process.env.ORDER_PASSWORD,
    process.env.ADMIN_SESSION_SECRET,
  );
}

export async function hasOrderAccess() {
  const jar = await cookies();
  return verifyOrderAccessSessionToken(
    jar.get(orderAccessCookieName)?.value,
  );
}

export const orderAccessCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: ORDER_ACCESS_TTL_MS / 1000,
};
