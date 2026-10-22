import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  checkOrderPassword,
  createOrderAccessToken,
  isOrderPasswordConfigured,
  verifyOrderAccessToken,
} from "../src/lib/order-access-crypto";

const password = "private-order-passphrase-42";
const sessionSecret = "test-session-secret-that-is-not-used-in-production";

test("order password must be configured with a private signing secret and a strong length", () => {
  assert.equal(isOrderPasswordConfigured(password, sessionSecret), true);
  assert.equal(isOrderPasswordConfigured(undefined, sessionSecret), false);
  assert.equal(isOrderPasswordConfigured("short", sessionSecret), false);
  assert.equal(isOrderPasswordConfigured("a".repeat(129), sessionSecret), false);
  assert.equal(isOrderPasswordConfigured(password, undefined), false);
});

test("password comparison accepts only an exact match", () => {
  assert.equal(checkOrderPassword(password, password), true);
  assert.equal(checkOrderPassword(`${password} `, password), false);
  assert.equal(checkOrderPassword("wrong-password", password), false);
  assert.equal(checkOrderPassword(undefined, password), false);
  assert.equal(checkOrderPassword("x".repeat(129), password), false);
});

test("signed order-access sessions expire and are invalidated by password or signing-secret changes", () => {
  const now = 1_800_000_000_000;
  const token = createOrderAccessToken(password, sessionSecret, now);

  assert.equal(verifyOrderAccessToken(token, password, sessionSecret, now), true);
  assert.equal(
    verifyOrderAccessToken(token, password, sessionSecret, now + 59 * 60 * 1000),
    true,
  );
  assert.equal(
    verifyOrderAccessToken(token, password, sessionSecret, now + 61 * 60 * 1000),
    false,
  );
  assert.equal(
    verifyOrderAccessToken(token, "another-order-passphrase", sessionSecret, now),
    false,
  );
  assert.equal(
    verifyOrderAccessToken(token, password, "another-session-secret", now),
    false,
  );
  assert.equal(
    verifyOrderAccessToken(`${token}x`, password, sessionSecret, now),
    false,
  );
  assert.equal(verifyOrderAccessToken(token, undefined, sessionSecret, now), false);
});

test("checkout page and order-creation API both require the order password session", () => {
  const checkout = readFileSync("src/app/checkout/page.tsx", "utf8");
  const orders = readFileSync("src/app/api/orders/route.ts", "utf8");
  const accessApi = readFileSync("src/app/api/order-access/route.ts", "utf8");
  assert.match(checkout, /canOrder \? /);
  assert.match(checkout, /<OrderPasswordGate configured=\{orderPasswordConfigured\}/);
  const gate = orders.indexOf("verifyOrderAccessSessionToken(");
  const createOrder = orders.indexOf('db.rpc("gamana_create_checkout"');
  const createPayment = orders.indexOf('razorpayRequest<RazorpayOrder>("orders"');
  assert.ok(gate >= 0 && createOrder > gate && createPayment > gate);
  assert.match(accessApi, /isSameOrigin\(request\)/);
  assert.match(accessApi, /Cache-Control.*no-store/s);
  assert.match(accessApi, /setTimeout\(resolve, 500\)/);
});
