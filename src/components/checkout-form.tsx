"use client";

import { motion } from "framer-motion";
import { Check, Loader2, Lock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useCart } from "@/lib/cart";
import { formatINR } from "@/lib/utils";

const FREE_SHIPPING_AT = 1499;
const SHIPPING_FEE = 79;

export function CheckoutForm() {
  const { lines, subtotal, clear, count } = useCart();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    province: "",
    zip: "",
    countryCode: "IN",
  });
  const [payment, setPayment] = useState<"Prepaid" | "COD">("Prepaid");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [placed, setPlaced] = useState<{
    orderNumber: string;
    message: string;
  } | null>(null);

  function update(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
      if (state === "error") setState("idle");
    };
  }

  const shipping = subtotal >= FREE_SHIPPING_AT ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((l) => ({
            productSlug: l.slug,
            size: l.size,
            color: l.color,
            quantity: l.quantity,
          })),
          customer: form,
          payment,
        }),
      });
      const data = (await res.json()) as {
        orderNumber?: string;
        message?: string;
        error?: string;
      };
      if (!res.ok || !data.orderNumber) {
        throw new Error(data.error || "Could not place the order.");
      }
      setPlaced({ orderNumber: data.orderNumber, message: data.message ?? "" });
      setState("done");
      clear();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not place the order. Try again.",
      );
      setState("error");
    }
  }

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
          Order confirmed
        </h1>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">
          {placed.message}
        </p>
        <p className="mt-6 inline-block rounded-full border border-line px-5 py-3 text-[0.82rem] font-medium tracking-[0.08em]">
          {placed.orderNumber}
        </p>
        <p className="mt-4 text-[0.85rem] text-muted">
          A confirmation is on its way to {form.email}. Keep the order number
          handy — you can use it to track the print.
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
      noValidate
    >
      <div>
        <h1 className="font-display text-[clamp(1.9rem,4.6vw,3rem)] font-semibold tracking-[-0.045em]">
          Delivery details
        </h1>

        <div className="mt-9 grid gap-5 sm:grid-cols-2">
          <Field label="Full name" htmlFor="fullName" className="sm:col-span-2">
            <input
              id="fullName"
              value={form.fullName}
              onChange={update("fullName")}
              required
              autoComplete="name"
              className="input-base"
              placeholder="Your name"
            />
          </Field>
          <Field label="Email" htmlFor="email">
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
          <Field label="Phone" htmlFor="phone">
            <input
              id="phone"
              value={form.phone}
              onChange={update("phone")}
              required
              autoComplete="tel"
              className="input-base"
              placeholder="+91 98765 43210"
            />
          </Field>
          <Field label="Address line 1" htmlFor="address1" className="sm:col-span-2">
            <input
              id="address1"
              value={form.address1}
              onChange={update("address1")}
              required
              autoComplete="address-line1"
              className="input-base"
              placeholder="Flat, street, area"
            />
          </Field>
          <Field
            label="Address line 2"
            htmlFor="address2"
            className="sm:col-span-2"
            optional
          >
            <input
              id="address2"
              value={form.address2}
              onChange={update("address2")}
              autoComplete="address-line2"
              className="input-base"
              placeholder="Landmark, city"
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
          <Field label="PIN / ZIP" htmlFor="zip">
            <input
              id="zip"
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
              <option value="US">United States</option>
            </select>
          </Field>
        </div>

        <h2 className="mt-12 font-display text-[1.4rem] font-semibold tracking-[-0.035em]">
          Payment
        </h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            {
              key: "Prepaid" as const,
              title: "Prepaid",
              note: "Pay now by card, UPI or net banking.",
            },
            {
              key: "COD" as const,
              title: "Cash on delivery",
              note: "Pay the courier when it reaches you.",
            },
          ].map((option) => (
            <label
              key={option.key}
              className={`flex cursor-pointer items-start gap-3 rounded-[3px] border p-5 transition-colors ${
                payment === option.key
                  ? "border-kalam bg-kalam/4"
                  : "border-line hover:border-graphite/30"
              }`}
            >
              <input
                type="radio"
                name="payment"
                value={option.key}
                checked={payment === option.key}
                onChange={() => setPayment(option.key)}
                className="mt-1 h-4 w-4 accent-[#0B0B10]"
              />
              <span>
                <span className="block text-[0.95rem] font-medium">
                  {option.title}
                </span>
                <span className="mt-1 block text-[0.85rem] text-muted">
                  {option.note}
                </span>
              </span>
            </label>
          ))}
        </div>

        {state === "error" && (
          <p className="mt-6 text-[0.88rem] text-error">{error}</p>
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
              <dd className="tabular-nums">
                {shipping === 0 ? "Free" : formatINR(shipping)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3.5 text-[1.05rem] font-semibold">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatINR(total)}</dd>
            </div>
          </dl>

          <button
            type="submit"
            disabled={state === "loading"}
            className="mt-7 flex w-full items-center justify-center gap-2.5 rounded-full bg-kalam py-4 text-[0.76rem] font-medium uppercase tracking-[0.18em] text-bone transition-transform hover:scale-[1.01] disabled:opacity-60"
          >
            {state === "loading" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.8} />
                Placing order
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" strokeWidth={1.8} />
                Place order · {formatINR(total)}
              </>
            )}
          </button>

          <p className="mt-4 text-center text-[0.76rem] leading-relaxed text-muted">
            Printed on demand in India and dispatched within about three
            working days. You will get a confirmation email with your order
            number.
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
