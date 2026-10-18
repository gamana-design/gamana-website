import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { legacyProducts } from "../src/data/legacy-site-content";
import { priceCart, validateCustomer, validatePayment } from "../src/lib/checkout/pricing";
import { paymentMatches, validSignature } from "../src/lib/checkout/signatures";
import type { Product } from "../src/data/catalog";

const product = { ...legacyProducts[0], id: "fixture", price: 1199 };
const items = [
  {
    productSlug: product.slug,
    size: product.variants[0].size,
    color: product.variants[0].color,
    quantity: 1,
  },
];
const customer = {
  fullName: "Test Customer",
  email: "TEST@example.com",
  phone: "+91 98765 43210",
  address1: "123 Test Street",
  address2: "",
  city: "Hyderabad",
  province: "Telangana",
  zip: "500001",
  countryCode: "IN",
};

test("checkout only accepts online payment and rejects COD or missing methods", () => {
  assert.equal(validatePayment("Prepaid"), "Prepaid");
  for (const value of ["COD", "cod", "Cash on delivery", "", null, undefined, {}, 1])
    assert.throws(() => validatePayment(value), /Cash on delivery is not available/);
});

test("shipping is included in server-side totals, in integer paise", () => {
  const quote = priceCart(items, [product]);
  assert.equal(quote.subtotal, 119900);
  assert.equal(quote.shipping, 7900);
  assert.equal(quote.amount, 127800);
  const free = priceCart(items, [{ ...product, price: 1499 }]);
  assert.equal(free.shipping, 0);
  assert.equal(free.amount, 149900);
});

test("ignores client prices and rejects any unavailable line, rather than silently dropping it", () => {
  assert.equal(
    priceCart([{ ...items[0], price: 1, amount: 1 }], [product]).amount,
    127800,
  );
  assert.throws(() =>
    priceCart([...items, { ...items[0], productSlug: "missing" }], [product]),
  );
  const soldOut: Product = {
    ...product,
    variants: product.variants.map((v) => ({ ...v, stock: "out" })),
  };
  assert.throws(() => priceCart(items, [soldOut]));
  assert.throws(() => priceCart([{ ...items[0], size: undefined }], [product]));
});

test("rejects malformed, fractional, excessive, duplicate-over-limit and empty carts", () => {
  for (const quantity of [0, -1, 1.5, 11, "1", NaN])
    assert.throws(() => priceCart([{ ...items[0], quantity }], [product]));
  assert.throws(() =>
    priceCart(
      [
        { ...items[0], quantity: 6 },
        { ...items[0], quantity: 5 },
      ],
      [product],
    ),
  );
  for (const value of [null, {}, [], [null]])
    assert.throws(() => priceCart(value, [product]));
  assert.throws(() => priceCart(items, [{ ...product, price: NaN }]));
});

test("normalises delivery details and validates Indian contact/address data", () => {
  const c = validateCustomer(customer);
  assert.equal(c.email, "test@example.com");
  assert.equal(c.phone, "+919876543210");
  for (const bad of [
    null,
    { ...customer, email: "bad" },
    { ...customer, phone: "1" },
    { ...customer, zip: "000000" },
    { ...customer, countryCode: "US" },
    { ...customer, fullName: 123 },
    { ...customer, address1: "" },
  ])
    assert.throws(() => validateCustomer(bad));
});

test("checkout accepts separate customer names and requires both when provided", () => {
  const { fullName: _legacyName, ...contact } = customer;
  const details = { ...contact, firstName: "  Test  ", lastName: "  Customer  " };
  assert.equal(validateCustomer(details).fullName, "Test Customer");
  assert.equal(
    validateCustomer({ ...details, phone: "9876543210" }).phone,
    "9876543210",
  );
  assert.equal(
    validateCustomer({ ...details, address2: "Near the park" }).address2,
    "Near the park",
  );
  for (const bad of [
    { ...details, firstName: " " },
    { ...details, lastName: "" },
    { ...details, firstName: undefined },
    { ...details, fullName: "Ignored Name", lastName: " " },
    { ...details, lastName: 123 },
    { ...details, phone: "987654321" },
    { ...details, phone: "98765432101" },
  ]) assert.throws(() => validateCustomer(bad));
  // Previously saved sessions using a full name remain valid.
  assert.equal(validateCustomer(customer).fullName, "Test Customer");
});

test("payment and webhook HMACs fail closed for forged or malformed signatures", () => {
  const secret = "test-only-fixture-not-a-real-secret";
  const payload = "order_fixture|pay_fixture";
  const signature = createHmac("sha256", secret).update(payload).digest("hex");
  assert.equal(validSignature(payload, signature, secret), true);
  assert.equal(
    validSignature("order_different|pay_fixture", signature, secret),
    false,
  );
  for (const invalid of [
    null,
    undefined,
    42,
    "",
    "a".repeat(63),
    "z".repeat(64),
  ])
    assert.equal(validSignature(payload, invalid, secret), false);
  const raw = '{"event":"payment.captured"}';
  const webhook = createHmac("sha256", secret).update(raw).digest("hex");
  assert.equal(validSignature(raw, webhook, secret), true);
  assert.equal(validSignature(raw + " ", webhook, secret), false);
});

test("only a captured, unrefunded payment for the exact order, amount and currency is accepted", () => {
  const order = { razorpay_order_id: "order_fixture", amount_paise: 127800 };
  const paid = {
    id: "pay_fixture",
    order_id: "order_fixture",
    amount: 127800,
    currency: "INR",
    status: "captured",
    amount_refunded: 0,
  };
  assert.equal(paymentMatches(paid, order, paid.id), true);
  for (const patch of [
    { amount: 1 },
    { order_id: "order_other" },
    { currency: "USD" },
    { status: "authorized" },
    { status: "failed" },
    { amount_refunded: 1 },
    { id: "pay_other" },
  ])
    assert.equal(paymentMatches({ ...paid, ...patch }, order, paid.id), false);
});

test("test mode and unpaid orders cannot trigger live fulfilment", async () => {
  const { fulfilmentAction } =
    await import("../src/lib/checkout/fulfilment-rules");
  const order = {
    payment_gateway: "Prepaid",
    payment_status: "paid",
    payment_mode: "test",
  };
  assert.equal(fulfilmentAction(order), "test");
  assert.equal(fulfilmentAction({ ...order, payment_mode: "live" }), "live");
  assert.equal(
    fulfilmentAction({
      ...order,
      payment_mode: "live",
      payment_status: "pending",
    }),
    "blocked",
  );
  assert.equal(fulfilmentAction({ ...order, payment_mode: null }), "blocked");
  assert.equal(
    fulfilmentAction({
      ...order,
      payment_gateway: "COD",
      payment_status: "cod",
    }),
    "test",
  );
  assert.equal(
    fulfilmentAction({
      ...order,
      payment_gateway: "COD",
      payment_status: "cod",
      payment_mode: "live",
    }),
    "live",
  );
  assert.equal(
    fulfilmentAction({
      ...order,
      payment_gateway: "unknown",
      payment_mode: "live",
    }),
    "blocked",
  );
});

test("order references meet Qikink's length/character rules", async () => {
  const { newOrderReference } = await import("../src/lib/checkout/references");
  const references = Array.from({ length: 100 }, newOrderReference);
  assert.equal(new Set(references).size, references.length);
  for (const reference of references)
    assert.match(reference, /^gm[a-f0-9]{13}$/);
});

test("credential selection defaults to test and never falls back to live keys", async () => {
  const { resolveRazorpayConfig } =
    await import("../src/lib/checkout/razorpay-config");
  const env = {
    RAZORPAY_TEST_KEY_ID: "rzp_test_fixture",
    RAZORPAY_TEST_KEY_SECRET: "fake-test-fixture",
    RAZORPAY_LIVE_KEY_ID: "rzp_live_fixture",
    RAZORPAY_LIVE_KEY_SECRET: "fake-live-fixture",
  };
  assert.deepEqual(resolveRazorpayConfig(env), {
    keyId: "rzp_test_fixture",
    keySecret: "fake-test-fixture",
    mode: "test",
  });
  assert.deepEqual(resolveRazorpayConfig({ ...env, RAZORPAY_MODE: "live" }), {
    keyId: "rzp_live_fixture",
    keySecret: "fake-live-fixture",
    mode: "live",
  });
  assert.throws(() =>
    resolveRazorpayConfig({ ...env, RAZORPAY_TEST_KEY_SECRET: "" }),
  );
  assert.throws(() =>
    resolveRazorpayConfig({ ...env, RAZORPAY_TEST_KEY_ID: "rzp_live_fixture" }),
  );
  assert.throws(() =>
    resolveRazorpayConfig({
      ...env,
      RAZORPAY_MODE: "live",
      RAZORPAY_LIVE_KEY_SECRET: "",
    }),
  );
  assert.throws(() =>
    resolveRazorpayConfig({
      ...env,
      RAZORPAY_MODE: "live",
      RAZORPAY_LIVE_KEY_ID: "rzp_test_fixture",
    }),
  );
  assert.throws(() =>
    resolveRazorpayConfig({ ...env, RAZORPAY_MODE: "invalid" }),
  );
  assert.throws(() =>
    resolveRazorpayConfig({
      RAZORPAY_LIVE_KEY_ID: "rzp_live_fixture",
      RAZORPAY_LIVE_KEY_SECRET: "fake-live-fixture",
    }),
  );
});
