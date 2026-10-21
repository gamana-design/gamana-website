import type { Product } from "@/data/catalog";

import { cartLineKey } from "@/lib/cart-line-key";
import { SHIPPING_FEE } from "@/lib/shipping";
export type Customer = {
  fullName: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  province: string;
  zip: string;
  countryCode: string;
};
export class CheckoutError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

/** Products missing a confirmed Store SKU are test-only, never live-orderable. */
export function ensureLiveOrderSkuReadiness(
  lines: ReadonlyArray<{ product: Product }>,
  mode: "test" | "live",
) {
  if (mode === "test") return;

  const incompleteProducts = new Map<string, string>();
  for (const { product } of lines) {
    if (product.variants.some((variant) => variant.storeSkuReady !== true))
      incompleteProducts.set(product.slug, product.name);
  }
  if (!incompleteProducts.size) return;

  const names = [...incompleteProducts.values()];
  const listedNames = names
    .slice(0, 3)
    .map((name) => `“${name}”`)
    .join(", ");
  const more = names.length > 3 ? ` and ${names.length - 3} more` : "";
  throw new CheckoutError(
    `${listedNames}${more} can only be tested while checkout is in test mode. Live orders are blocked until every size and colour has its unique Store SKU from Qikink. Remove these items to continue with live checkout.`,
    409,
  );
}

/** Store policy: new orders must be paid online, regardless of old COD settings. */
export function validatePayment(value: unknown): "Prepaid" {
  if (value !== "Prepaid")
    throw new CheckoutError(
      "Please pay online. Cash on delivery is not available.",
    );
  return value;
}

const text = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

export function validateCustomer(value: unknown): Customer {
  if (!value || typeof value !== "object")
    throw new CheckoutError("Please enter your delivery details.");
  const c = value as Record<string, unknown>;
  // Keep the existing stored full name compatible with previous checkout sessions.
  // New checkout requests must supply both name fields, never fall back if one is blank.
  const separateNames = "firstName" in c || "lastName" in c;
  const firstName = text(c.firstName, 50).replace(/\s+/g, " ");
  const lastName = text(c.lastName, 49).replace(/\s+/g, " ");
  if (separateNames && (!firstName || !lastName))
    throw new CheckoutError("Please enter your first and last name.");
  const customer: Customer = {
    fullName: separateNames
      ? `${firstName} ${lastName}`
      : text(c.fullName, 100),
    email: text(c.email, 254).toLowerCase(),
    phone: text(c.phone, 20).replace(/[\s()-]/g, ""),
    address1: text(c.address1, 90),
    address2: text(c.address2, 90),
    city: text(c.city, 100),
    province: text(c.province, 100),
    zip: text(c.zip, 10),
    countryCode: text(c.countryCode ?? "IN", 2).toUpperCase(),
  };
  if (customer.fullName.length < 2)
    throw new CheckoutError("Please enter your full name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(customer.email))
    throw new CheckoutError("Please enter a valid email address.");
  if (!/^(?:\+91|91)?[6-9]\d{9}$/.test(customer.phone))
    throw new CheckoutError("Please enter a valid Indian mobile number.");
  if (customer.address1.length < 5 || !customer.city || !customer.province)
    throw new CheckoutError(
      "Please enter your full delivery address, city and state.",
    );
  if (customer.countryCode !== "IN")
    throw new CheckoutError(
      "Delivery is currently available within India only.",
    );
  if (!/^[1-9]\d{5}$/.test(customer.zip))
    throw new CheckoutError("Please enter a valid six-digit PIN code.");
  return customer;
}

export function priceCart(items: unknown, catalogue: Product[]) {
  if (!Array.isArray(items) || !items.length || items.length > 50)
    throw new CheckoutError("Please add between 1 and 50 items to your bag.");
  const seen = new Map<string, number>();
  const lines = items.map((item: unknown) => {
    if (!item || typeof item !== "object")
      throw new CheckoutError("Invalid cart item.");
    const i = item as Record<string, unknown>;
    const product = catalogue.find((p) => p.slug === i.productSlug);
    const variant = product?.variants.find(
      (v) => v.size === i.size && v.color === i.color,
    );
    if (!product || !variant || variant.stock === "out")
      throw new CheckoutError(
        "An item in your bag is unavailable. Please update your bag.",
      );
    if (
      !Number.isInteger(i.quantity) ||
      Number(i.quantity) < 1 ||
      Number(i.quantity) > 10
    )
      throw new CheckoutError("Choose a quantity between 1 and 10.");
    const quantity = Number(i.quantity);
    const key = cartLineKey(product.slug, variant.size, variant.color);
    seen.set(key, (seen.get(key) ?? 0) + quantity);
    if (seen.get(key)! > 10)
      throw new CheckoutError("Maximum 10 of each variant per order.");
    const unitAmount = Math.round(product.price * 100);
    if (!Number.isSafeInteger(unitAmount) || unitAmount <= 0)
      throw new CheckoutError(
        "An item price is unavailable. Please contact us.",
      );
    return { product, variant, quantity, unitAmount };
  });
  const subtotal = lines.reduce((sum, l) => sum + l.unitAmount * l.quantity, 0);
  const shipping = SHIPPING_FEE * 100;
  const amount = subtotal + shipping;
  if (!Number.isSafeInteger(amount) || amount > 100_000_000)
    throw new CheckoutError("Order total exceeds the checkout limit.");
  return { lines, subtotal, shipping, amount };
}
