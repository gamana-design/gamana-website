import { NextRequest, NextResponse } from "next/server";
import {
  checkOrderPassword,
  createOrderAccessSessionToken,
  isOrderPasswordConfigured,
  orderAccessCookieName,
  orderAccessCookieOptions,
} from "@/lib/order-access";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

function response(body: { error: string }, status: number) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request))
    return response(
      { error: "Please try again from the checkout page." },
      403,
    );

  if (!isOrderPasswordConfigured())
    return response(
      { error: "Ordering is temporarily paused while access is set up." },
      503,
    );

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 2_048)
    return response({ error: "The request is too large." }, 413);

  const body = await request.json().catch(() => null);
  const password =
    body && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>).password
      : undefined;

  if (!checkOrderPassword(password)) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return response({ error: "That password is not correct." }, 401);
  }

  const result = NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store" } },
  );
  result.cookies.set(
    orderAccessCookieName,
    createOrderAccessSessionToken(),
    orderAccessCookieOptions,
  );
  return result;
}
