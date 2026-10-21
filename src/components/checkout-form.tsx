"use client";

import { motion } from "framer-motion";
import { Check, Loader2, Lock } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { useCart } from "@/lib/cart";
import { brand } from "@/lib/brand";
import { formatINR } from "@/lib/utils";

import { SHIPPING_FEE, SHIPPING_DETAIL } from "@/lib/shipping";
import {
  openRazorpay,
  type PaymentResult,
} from "@/lib/checkout/razorpay-browser";

const PENDING_KEY = "gamana.checkout.payment";
const SESSION_KEY = "gamana.checkout.session";
type PendingPayment = { result: PaymentResult; orderNumber: string };
async function postJSON(url: string, body: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data)
    throw new Error(data?.error || "Could not reach checkout. Please retry.");
  return data;
}

export function CheckoutForm({
  testMode = true,
  onlineEnabled = false,
}: {
  testMode?: boolean;
  onlineEnabled?: boolean;
}) {
  const { lines, subtotal, clear, count } = useCart();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    province: "",
    zip: "",
    countryCode: "IN",
  });
  const [state, setState] = useState<
    "idle" | "loading" | "done" | "error" | "pending"
  >("idle");
  const [error, setError] = useState("");
  const [placed, setPlaced] = useState<{
    orderNumber: string;
    message: string;
    testMode?: boolean;
  } | null>(null);

  function update(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
      if (state === "error") setState("idle");
    };
  }

  const shipping = SHIPPING_FEE;
  const total = subtotal + shipping;
  const testOnlyLines = lines.filter((line) => line.testOnly);
  const liveCheckoutBlocked = !testMode && testOnlyLines.length > 0;

  const busy = useRef(false);
  const [pending, setPending] = useState<PendingPayment | null>(null);
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(PENDING_KEY) || "null");
      if (saved?.result?.razorpay_payment_id && saved?.orderNumber) {
        setPending(saved);
        setState("pending");
      }
    } catch {
      /* private browsing or invalid saved session */
    }
  }, []);

  function finish(data: {
    orderNumber: string;
    message: string;
    testMode?: boolean;
  }) {
    setPlaced(data);
    setPending(null);
    setState("done");
    clear();
    try {
      sessionStorage.removeItem(PENDING_KEY);
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* optional persistence */
    }
  }

  async function verify(saved: PendingPayment) {
    const data = await postJSON("/api/payments/verify", saved.result);
    finish(data);
  }

  async function retryVerification() {
    if (!pending || busy.current) return;
    busy.current = true;
    setState("loading");
    setError("");
    try {
      await verify(pending);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Verification is pending.",
      );
      setState("pending");
    } finally {
      busy.current = false;
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy.current || pending) return;
    if (liveCheckoutBlocked) {
      setError(
        "Live checkout is blocked until every size and colour has its Store SKU from Qikink. Remove this test-only item from your bag to continue.",
      );
      return;
    }
    busy.current = true;
    setState("loading");
    setError("");
    let received: PendingPayment | null = null;
    try {
      const payload = {
        items: lines.map((l) => ({
          productSlug: l.slug,
          size: l.size,
          color: l.color,
          quantity: l.quantity,
        })),
        customer: form,
        payment: "Prepaid",
        expectedAmount: Math.round(total * 100),
      };
      const fingerprint = JSON.stringify(payload);
      let checkoutKey = crypto.randomUUID();
      try {
        const session = JSON.parse(
          sessionStorage.getItem(SESSION_KEY) || "null",
        );
        if (session?.fingerprint === fingerprint && session?.checkoutKey)
          checkoutKey = session.checkoutKey;
        else
          sessionStorage.setItem(
            SESSION_KEY,
            JSON.stringify({ fingerprint, checkoutKey }),
          );
      } catch {
        /* server still validates every request */
      }
      const data = await postJSON("/api/orders", { ...payload, checkoutKey });
      if (data.paid) {
        // A previous callback/webhook already confirmed this exact checkout.
        finish({
          orderNumber: data.orderNumber,
          testMode: data.testMode,
          message: "Payment already received for this order. Do not pay again.",
        });
        return;
      }
      if (!data.razorpay?.orderId)
        throw new Error("Payment session could not be created.");
      const result = await openRazorpay(
        {
          key: data.razorpay.keyId,
          amount: data.razorpay.amount,
          currency: data.razorpay.currency,
          order_id: data.razorpay.orderId,
          name: brand.name,
          description: `Order ${data.orderNumber}`,
          prefill: {
            name: `${form.firstName.trim()} ${form.lastName.trim()}`,
            email: form.email,
            contact: form.phone,
          },
          theme: { color: "#FA6817" },
        },
        () =>
          setError(
            "That payment attempt failed. Retry in Razorpay, or close the window to return to your bag.",
          ),
      );
      received = { result, orderNumber: data.orderNumber };
      setPending(received);
      try {
        sessionStorage.setItem(PENDING_KEY, JSON.stringify(received));
      } catch {
        /* optional persistence */
      }
      await verify(received);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Checkout could not be completed.",
      );
      setState(received ? "pending" : "error");
    } finally {
      busy.current = false;
    }
  }

  if (pending && state !== "done")
    return (
      <div className="mx-auto max-w-xl rounded border border-line bg-bone p-8 text-center">
        <h1 className="font-display text-2xl">Confirming your payment</h1>
        <p className="mt-3 text-muted">
          If your account was debited, do not pay again. We are checking payment
          for order <strong>{pending.orderNumber}</strong>. Payment
          notifications can take a little time.
        </p>
        {error && (
          <p role="alert" className="mt-4 text-sm text-error">
            {error}
          </p>
        )}
        <button
          type="button"
          disabled={state === "loading"}
          onClick={retryVerification}
          className="mt-6 rounded-full bg-kalam px-6 py-3 text-sm text-bone disabled:opacity-50"
        >
          {state === "loading" ? "Verifying…" : "Check payment again"}
        </button>
        <Link
          href={`/track?reference=${pending.orderNumber}`}
          className="mt-5 block text-sm underline"
        >
          Track this order
        </Link>
      </div>
    );

  if (state === "done" && placed) {
    return (
      <div className="mx-auto max-w-xl rounded-[3px] border border-line bg-bone p-9 text-center md:p-12">
        <motion.span
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/12"
        >
          <Check className="h-6 w-6 text-success" strokeWidth={2.2} />
        </motion.span>
        <h1 className="mt-6 font-display text-[1.8rem] font-semibold tracking-[-0.035em]">
          {placed.testMode ? "Test checkout complete" : "Order confirmed"}
        </h1>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">
          {placed.message}
        </p>
        <p className="mt-6 inline-block rounded-full border border-line px-5 py-3 text-[0.82rem] font-medium tracking-[0.08em]">
          {placed.orderNumber}
        </p>
        <p className="mt-4 text-[0.85rem] text-muted">
          Keep this order number for your records.{" "}
          {placed.testMode
            ? "This was a test checkout, not a real purchase."
            : "You can use it to check your order status."}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href={`/track?reference=${placed.orderNumber}`}
            className="rounded-full bg-kalam px-7 py-4 text-[0.76rem] font-medium uppercase tracking-[0.18em] text-bone transition-transform hover:scale-[1.02]"
          >
            Track order
          </Link>
          <Link
            href="/shop"
            className="rounded-full border border-line px-7 py-4 text-[0.76rem] font-medium uppercase tracking-[0.18em] transition-colors hover:border-graphite/40"
          >
            Keep shopping
          </Link>
        </div>
      </div>
    );
  }

  if (count === 0) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h1 className="font-display text-[1.8rem] font-semibold tracking-[-0.035em]">
          Nothing to check out yet
        </h1>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">
          Your bag is empty. Add a piece and come back.
        </p>
        <Link
          href="/shop"
          className="mt-7 inline-block rounded-full bg-kalam px-7 py-4 text-[0.76rem] font-medium uppercase tracking-[0.18em] text-bone transition-transform hover:scale-[1.02]"
        >
          Shop the drop
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-20"
    >
      <div>
        <h1 className="font-display text-[clamp(1.9rem,4.6vw,3rem)] font-semibold tracking-[-0.045em]">
          Delivery details
        </h1>

        {testMode && (
          <p
            role="status"
            className="mt-5 rounded border border-amber-500/30 bg-amber-50 p-4 text-sm text-amber-900"
          >
            Test checkout — payments are simulated. No real print or shipping
            order will be placed.
          </p>
        )}
        {testOnlyLines.length > 0 && (
          <p
            role={liveCheckoutBlocked ? "alert" : "status"}
            className="mt-4 rounded border border-amber-500/30 bg-amber-50 p-4 text-sm text-amber-900"
          >
            {liveCheckoutBlocked
              ? "Live checkout is blocked until every size and colour has its Store SKU from Qikink. Remove the test-only items from your bag to continue."
              : "Your bag contains a test-only product. It can be checked out in test mode, but not as a live order until every size and colour has its Store SKU from Qikink."}
          </p>
        )}
        {!onlineEnabled && (
          <p className="mt-4 text-sm text-muted">
            Online payments are not configured yet. Please check back shortly.
          </p>
        )}
        <fieldset
          disabled={state === "loading"}
          className="mt-9 grid gap-5 sm:grid-cols-2"
        >
          <Field label="First name" htmlFor="firstName">
            <input
              id="firstName"
              name="firstName"
              value={form.firstName}
              onChange={update("firstName")}
              required
              maxLength={50}
              pattern=".*\S.*"
              autoComplete="given-name"
              className="input-base"
              placeholder="First name"
            />
          </Field>
          <Field label="Last name" htmlFor="lastName">
            <input
              id="lastName"
              name="lastName"
              value={form.lastName}
              onChange={update("lastName")}
              required
              maxLength={49}
              pattern=".*\S.*"
              autoComplete="family-name"
              className="input-base"
              placeholder="Last name"
            />
          </Field>
          <Field label="Contact email" htmlFor="email">
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={update("email")}
              required
              autoComplete="email"
              className="input-base"
              placeholder="you@email.com"
            />
          </Field>
          <Field label="Contact number (10 digits)" htmlFor="phone">
            <input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={update("phone")}
              required
              autoComplete="tel-national"
              inputMode="numeric"
              minLength={10}
              maxLength={10}
              pattern="[6-9][0-9]{9}"
              title="Enter your 10-digit Indian mobile number without +91."
              className="input-base"
              placeholder="9876543210"
            />
          </Field>
          <Field
            label="Shipping address"
            htmlFor="address1"
            className="sm:col-span-2"
          >
            <input
              id="address1"
              value={form.address1}
              onChange={update("address1")}
              maxLength={90}
              required
              autoComplete="address-line1"
              className="input-base"
              placeholder="Flat, street, area"
            />
          </Field>
          <Field
            label="Shipping address 2"
            htmlFor="address2"
            className="sm:col-span-2"
            optional
          >
            <input
              id="address2"
              value={form.address2}
              onChange={update("address2")}
              maxLength={90}
              autoComplete="address-line2"
              className="input-base"
              placeholder="Landmark or additional address details"
            />
          </Field>
          <Field label="City" htmlFor="city">
            <input
              id="city"
              value={form.city}
              onChange={update("city")}
              required
              autoComplete="address-level2"
              className="input-base"
              placeholder="Hyderabad"
            />
          </Field>
          <Field label="State" htmlFor="province">
            <input
              id="province"
              value={form.province}
              onChange={update("province")}
              required
              autoComplete="address-level1"
              className="input-base"
              placeholder="Telangana"
            />
          </Field>
          <Field label="Shipping PIN code" htmlFor="zip">
            <input
              id="zip"
              maxLength={6}
              pattern="[1-9][0-9]{5}"
              value={form.zip}
              onChange={update("zip")}
              required
              inputMode="numeric"
              autoComplete="postal-code"
              className="input-base"
              placeholder="500001"
            />
          </Field>
          <Field label="Country" htmlFor="countryCode">
            <select
              id="countryCode"
              value={form.countryCode}
              onChange={update("countryCode")}
              className="input-base cursor-pointer"
            >
              <option value="IN">India</option>
            </select>
          </Field>
        </fieldset>

        <h2 className="mt-12 font-display text-[1.4rem] font-semibold tracking-[-0.035em]">
          Payment
        </h2>
        <p className="mt-5 rounded-[3px] border border-line p-5 text-sm text-muted">
          Pay online by card, UPI or net banking through Razorpay.
        </p>

        {error && (
          <p role="alert" className="mt-6 text-[0.88rem] text-error">
            {error}
          </p>
        )}
      </div>

      {/* Summary */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-[3px] border border-line bg-bone-deep/40 p-7">
          <p className="label text-muted">Order summary</p>
          <ul className="mt-6 space-y-5">
            {lines.map((line) => (
              <li key={line.key} className="flex gap-4">
                <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-[2px] bg-bone-deep">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={line.image}
                    alt={line.name}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-kalam px-1 text-[10px] font-semibold text-bone">
                    {line.quantity}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[0.92rem] font-medium leading-snug">
                    {line.name}
                  </p>
                  <p className="mt-1 text-[0.8rem] text-muted">
                    {line.color} · {line.size}
                  </p>
                  {line.testOnly && (
                    <span className="mt-1 inline-block text-xs text-amber-800">
                      Test only · not for live orders
                    </span>
                  )}
                </div>
                <p className="text-[0.9rem] font-medium tabular-nums">
                  {formatINR(line.price * line.quantity)}
                </p>
              </li>
            ))}
          </ul>

          <dl className="mt-7 space-y-2.5 border-t border-line pt-6 text-[0.9rem]">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="tabular-nums">{formatINR(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Shipping</dt>
              <dd className="tabular-nums">Free · included</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3.5 text-[1.05rem] font-semibold">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatINR(total)}</dd>
            </div>
          </dl>

          <p className="mt-3 text-xs text-muted">{SHIPPING_DETAIL}</p>

          <button
            type="submit"
            disabled={
              state === "loading" || !onlineEnabled || liveCheckoutBlocked
            }
            className="mt-7 flex w-full items-center justify-center gap-2.5 rounded-full bg-kalam py-4 text-[0.76rem] font-medium uppercase tracking-[0.18em] text-bone transition-transform hover:scale-[1.01] disabled:opacity-60"
          >
            {state === "loading" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.8} />
                Processing payment…
              </>
            ) : liveCheckoutBlocked ? (
              "Test-only items can't be ordered live"
            ) : (
              <>
                <Lock className="h-4 w-4" strokeWidth={1.8} />
                Pay securely · {formatINR(total)}
              </>
            )}
          </button>

          <p className="mt-4 text-center text-[0.76rem] leading-relaxed text-muted">
            Secure payments powered by Razorpay. Your order is confirmed only
            after payment verification.
          </p>
        </div>
      </aside>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
  className,
  optional,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  className?: string;
  optional?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className={`block ${className ?? ""}`}>
      <span className="label text-muted">
        {label}
        {optional && (
          <span className="ml-1 normal-case text-muted/60">— optional</span>
        )}
      </span>
      <span className="mt-2.5 block">{children}</span>
    </label>
  );
}
