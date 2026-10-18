"use client";

import { Loader2, PackageSearch, Truck } from "lucide-react";
import { useState } from "react";

const STATUS_STEPS = [
  "Order received",
  "Being printed",
  "Packed and ready",
  "Shipped",
  "Delivered",
];

function normaliseStatus(status: string): number {
  const s = status.toLowerCase();
  if (s.includes("deliver")) return 4;
  if (s.includes("transit") || s.includes("dispatch") || s.includes("out for delivery") || s.includes("manifested")) return 3;
  if (s.includes("print") || s.includes("qc") || s.includes("stitch") || s.includes("pick")) return 1;
  if (s.includes("live") || s.includes("open") || s.includes("hold")) return 0;
  return 0;
}

export function TrackForm() {
  const [reference, setReference] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    reference: string;
    status: string;
    payment: string | null;
    total: number | null;
    placedAt: string | null;
    trackingLink: string | null;
    awb: string | null;
  } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ref = reference.trim();
    if (!ref) return;
    setState("loading");
    setError("");

    try {
      const res = await fetch(`/api/orders/track?reference=${encodeURIComponent(ref)}`);
      const data = (await res.json()) as {
        order?: typeof result;
        error?: string;
      };
      if (!res.ok || !data.order) {
        throw new Error(data.error || "We could not find that order.");
      }
      setResult(data.order);
      setState("done");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "We could not find that order.",
      );
      setState("error");
    }
  }

  const step = result ? normaliseStatus(result.status) : -1;

  return (
    <div>
      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          value={reference}
          onChange={(e) => {
            setReference(e.target.value);
            if (state === "error") setState("idle");
          }}
          placeholder="Order number, e.g. gm1a2b3c4d5"
          aria-label="Order number"
          className="input-base flex-1"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="inline-flex items-center justify-center gap-2.5 rounded-full bg-kalam px-8 py-4 text-[0.76rem] font-medium uppercase tracking-[0.18em] text-bone transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {state === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.8} />
          ) : (
            <PackageSearch className="h-4 w-4" strokeWidth={1.7} />
          )}
          Track
        </button>
      </form>

      {state === "error" && (
        <p className="mt-4 text-[0.88rem] text-error">{error}</p>
      )}

      {state === "done" && result && (
        <div className="mt-8 rounded-[3px] border border-line bg-bone p-7 md:p-9">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="label text-muted">Order</p>
              <p className="mt-2 font-display text-2xl font-semibold tracking-[-0.03em]">
                {result.reference}
              </p>
            </div>
            <div className="text-right">
              <p className="label text-muted">Status</p>
              <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-ember/10 px-3.5 py-1.5 text-[0.8rem] font-medium text-ember">
                <Truck className="h-3.5 w-3.5" strokeWidth={1.8} />
                {result.status}
              </p>
            </div>
          </div>

          <ol className="mt-9 space-y-0">
            {STATUS_STEPS.map((label, i) => {
              const done = i <= step;
              return (
                <li key={label} className="flex items-center gap-4">
                  <span className="flex flex-col items-center">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] ${
                        done
                          ? "border-ember bg-ember text-white"
                          : "border-line bg-bone text-muted/50"
                      }`}
                    >
                      {i + 1}
                    </span>
                    {i < STATUS_STEPS.length - 1 && (
                      <span
                        className={`h-9 w-px ${i < step ? "bg-ember" : "bg-line"}`}
                      />
                    )}
                  </span>
                  <span
                    className={`text-[0.92rem] ${done ? "text-graphite" : "text-muted/60"}`}
                  >
                    {label}
                  </span>
                </li>
              );
            })}
          </ol>

          <dl className="mt-9 grid gap-5 border-t border-line pt-6 sm:grid-cols-3">
            <div>
              <dt className="label text-muted">Payment</dt>
              <dd className="mt-1.5 text-[0.92rem]">{result.payment ?? "—"}</dd>
            </div>
            <div>
              <dt className="label text-muted">Total</dt>
              <dd className="mt-1.5 text-[0.92rem] tabular-nums">
                {result.total != null ? `₹${result.total.toLocaleString("en-IN")}` : "—"}
              </dd>
            </div>
            <div>
              <dt className="label text-muted">AWB</dt>
              <dd className="mt-1.5 text-[0.92rem]">{result.awb ?? "—"}</dd>
            </div>
          </dl>

          {result.trackingLink && (
            <a
              href={result.trackingLink}
              target="_blank"
              rel="noreferrer noopener"
              className="link-underline mt-7 inline-block text-[0.85rem] font-medium uppercase tracking-[0.14em]"
            >
              Track with courier
            </a>
          )}
        </div>
      )}
    </div>
  );
}
