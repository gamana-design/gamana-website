"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import Link from "next/link";

export function OrderPasswordGate({
  configured,
}: {
  configured: boolean;
}) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [checking, setChecking] = useState(false);

  async function unlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (checking || !password) return;
    setChecking(true);
    setMessage("");
    try {
      const response = await fetch("/api/order-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.ok)
        throw new Error(data?.error || "Could not check the password. Try again.");
      setPassword("");
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not check the password. Try again.",
      );
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-[3px] border border-line bg-bone-deep/40 p-7 text-center md:p-9">
      <p className="label text-muted">Checkout access</p>
      <h1 className="mt-4 font-display text-2xl font-semibold tracking-[-0.035em]">
        {configured ? "Enter the store password" : "Ordering is paused"}
      </h1>
      {configured ? (
        <>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Enter the password to continue to delivery and payment.
          </p>
          <form onSubmit={unlock} className="mt-6 text-left">
            <label htmlFor="order-password" className="label text-muted">
              Store password
            </label>
            <input
              id="order-password"
              type="password"
              autoComplete="current-password"
              autoCapitalize="none"
              spellCheck={false}
              maxLength={128}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="input-base mt-2.5"
              placeholder="Enter password"
            />
            {message && (
              <p role="alert" className="mt-3 text-sm text-error">
                {message}
              </p>
            )}
            <button
              type="submit"
              disabled={checking || !password}
              className="mt-5 w-full rounded-full bg-kalam px-6 py-4 text-xs font-medium uppercase tracking-[0.18em] text-bone transition-opacity disabled:opacity-50"
            >
              {checking ? "Checking…" : "Continue to checkout"}
            </button>
          </form>
        </>
      ) : (
        <p className="mt-3 text-sm leading-relaxed text-muted">
          We are not taking orders right now. Please check back soon.
        </p>
      )}
      <Link
        href="/shop"
        className="mt-6 inline-block text-sm text-muted underline underline-offset-4 hover:text-graphite"
      >
        Back to the shop
      </Link>
    </div>
  );
}
