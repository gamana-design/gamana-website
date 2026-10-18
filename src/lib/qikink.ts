import "server-only";

/**
 * Qikink — print-on-demand fulfilment client.
 *
 * Reference: Qikink API 08-25 (Orders).
 *   POST /api/token        → Accesstoken (1 hour)
 *   POST /api/order/create → create a print + ship order
 *   GET  /api/order/list   → order status / tracking
 *
 * Live base: https://api.qikink.com · Sandbox base: https://sandbox.qikink.com
 * Rate limit: 60 requests / 60 seconds.
 */

export type QikinkEnv = "live" | "sandbox";

export interface QikinkShippingAddress {
  first_name: string;
  last_name?: string;
  address1: string;
  address2?: string;
  phone: string;
  email: string;
  city: string;
  zip: string;
  province: string;
  country_code: string;
}

export interface QikinkDesign {
  design_code: string;
  width_inches?: number | string;
  height_inches?: number | string;
  placement_sku?: "fr" | "bk" | "lp" | "rp" | "rs" | "ls";
  design_link?: string;
  mockup_link?: string;
}

export interface QikinkLineItem {
  /** 1 = pull the design from the Qikink account's My Products. */
  search_from_my_products: 0 | 1;
  print_type_id?: number;
  quantity: string;
  sku: string;
  price: string;
  designs?: QikinkDesign[];
}

export interface QikinkOrderPayload {
  order_number: string;
  qikink_shipping: 0 | 1;
  gateway: "COD" | "Prepaid";
  total_order_value: string;
  line_items: QikinkLineItem[];
  shipping_address?: QikinkShippingAddress;
  add_ons?: {
    box_packing?: number;
    gift_wrap?: number;
    rush_order?: number;
    custom_letter?: number | string;
  }[];
  brand_logo?: string;
}

export interface QikinkOrderResult {
  ok: boolean;
  orderId?: number;
  message?: string;
  error?: string;
}

export interface QikinkOrderRecord {
  order_id: number;
  number: string;
  created_on: string;
  live_date: string;
  status: string;
  shipping_type?: string;
  payment_type?: string;
  delivered_on: string | null;
  total_order_value: string;
  shipping?: QikinkShippingAddress & { awb?: string | null; tracking_link?: string };
  line_items?: { sku: string; quantity: string; price: string }[];
}

const TIMEOUT_MS = 20_000;

function env(): QikinkEnv {
  return process.env.QIKINK_ENV === "sandbox" ? "sandbox" : "live";
}

export function baseUrl(): string {
  return env() === "sandbox"
    ? "https://sandbox.qikink.com"
    : "https://api.qikink.com";
}

export function isConfigured(): boolean {
  return Boolean(
    process.env.QIKINK_CLIENT_ID && process.env.QIKINK_CLIENT_SECRET,
  );
}

/* — token cache ————————————————————————————————————————————— */

let cachedToken: { token: string; expiresAt: number } | null = null;

/** Minimum spacing between outbound Qikink calls (60 req / 60 s budget). */
let lastCallAt = 0;
const MIN_GAP_MS = 1100;

async function throttle() {
  const now = Date.now();
  const wait = lastCallAt + MIN_GAP_MS - now;
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastCallAt = Date.now();
}

export async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.token;
  }

  const clientId = process.env.QIKINK_CLIENT_ID;
  const clientSecret = process.env.QIKINK_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      "Qikink is not configured. Set QIKINK_CLIENT_ID and QIKINK_CLIENT_SECRET.",
    );
  }

  const body = new URLSearchParams();
  body.append("ClientId", clientId);
  body.append("client_secret", clientSecret);

  await throttle();
  const res = await fetch(`${baseUrl()}/api/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: "no-store",
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Qikink token request failed (${res.status}): ${text}`);
  }

  let data: { Accesstoken?: string; expires_in?: number };
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Qikink token response was not JSON: ${text.slice(0, 200)}`);
  }

  if (!data.Accesstoken) {
    throw new Error("Qikink token response did not include an Accesstoken.");
  }

  cachedToken = {
    token: data.Accesstoken,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
  };
  return cachedToken.token;
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  return {
    "Content-Type": "application/json",
    ClientId: process.env.QIKINK_CLIENT_ID ?? "",
    Accesstoken: token,
  };
}

/* — orders ——————————————————————————————————————————————————— */

/**
 * `order_number` must be ≤ 15 characters, `[a-z0-9_]` only, and unique.
 */
export function buildOrderNumber(prefix = "gm"): string {
  const stamp = Date.now().toString(36).slice(-6);
  const rand = Math.random().toString(36).slice(2, 6);
  return `${prefix}${stamp}${rand}`.slice(0, 15).toLowerCase();
}

export async function createOrder(
  payload: QikinkOrderPayload,
): Promise<QikinkOrderResult> {
  try {
    await throttle();
    const res = await fetch(`${baseUrl()}/api/order/create`, {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });

    const text = await res.text();
    let data: Record<string, unknown> = {};
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text.slice(0, 300) };
    }

    if (!res.ok) {
      return {
        ok: false,
        error:
          (data.error as string) ||
          `Qikink rejected the order (${res.status}).`,
      };
    }

    return {
      ok: true,
      orderId: data.order_id as number | undefined,
      message: data.message as string | undefined,
    };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? `Could not reach Qikink: ${err.message}`
          : "Could not reach Qikink.",
    };
  }
}

export async function listOrders(params: {
  orderReferenceNo?: string;
  pageNo?: number;
  status?: string;
}): Promise<{ ok: boolean; orders: QikinkOrderRecord[]; error?: string }> {
  try {
    const query = new URLSearchParams();
    if (params.orderReferenceNo) {
      query.append("order_reference_no", params.orderReferenceNo);
    }
    if (params.pageNo) query.append("page_no", String(params.pageNo));
    if (params.status) query.append("status", params.status);

    await throttle();
    const res = await fetch(`${baseUrl()}/api/order/list?${query.toString()}`, {
      method: "GET",
      headers: await authHeaders(),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });

    const text = await res.text();
    if (!res.ok) {
      return {
        ok: false,
        orders: [],
        error: `Qikink order list failed (${res.status}).`,
      };
    }

    const data = JSON.parse(text) as {
      data?: QikinkOrderRecord[];
      message?: string;
    };
    return { ok: true, orders: data.data ?? [] };
  } catch (err) {
    return {
      ok: false,
      orders: [],
      error:
        err instanceof Error
          ? `Could not reach Qikink: ${err.message}`
          : "Could not reach Qikink.",
    };
  }
}

/**
 * The published Qikink API is order-scoped, so the storefront catalogue is
 * curated (see `src/data/catalog.ts`). This attempts a live catalogue pull
 * from the endpoints Qikink accounts expose; the caller falls back to the
 * curated set when it does not respond.
 */
export async function tryFetchCatalogue(): Promise<
  { ok: true; products: unknown[] } | { ok: false; reason: string }
> {
  if (!isConfigured()) return { ok: false, reason: "not-configured" };

  const candidates = ["/api/products", "/api/myproducts"];

  for (const path of candidates) {
    try {
      await throttle();
      const res = await fetch(`${baseUrl()}${path}`, {
        method: "GET",
        headers: await authHeaders(),
        signal: AbortSignal.timeout(10_000),
        cache: "no-store",
      });
      if (!res.ok) continue;
      const text = await res.text();
      const data = JSON.parse(text) as
        | { data?: unknown[]; products?: unknown[] }
        | unknown[];
      const list = Array.isArray(data)
        ? data
        : (data.data ?? data.products ?? []);
      if (Array.isArray(list) && list.length > 0) {
        return { ok: true, products: list };
      }
    } catch {
      // try the next candidate
    }
  }

  return { ok: false, reason: "no-catalogue-endpoint" };
}

/** Health probe used by the storefront to show a live-fulfilment badge. */
export async function ping(): Promise<{ ok: boolean; detail: string }> {
  if (!isConfigured()) return { ok: false, detail: "credentials-missing" };
  try {
    const token = await getAccessToken();
    return { ok: Boolean(token), detail: "connected" };
  } catch (err) {
    return {
      ok: false,
      detail: err instanceof Error ? err.message : "unreachable",
    };
  }
}
