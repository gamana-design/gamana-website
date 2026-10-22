"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, Truck, X } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { SHIPPING_HEADLINE, SHIPPING_DETAIL } from "@/lib/shipping";
import { useCart } from "@/lib/cart";
import { formatINR } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

export function CartDrawer() {
  const {
    isOpen,
    close,
    lines,
    subtotal,
    count,
    setQuantity,
    remove,
    hydrated,
    refreshCatalogue,
  } = useCart();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && hydrated) void refreshCatalogue();
  }, [isOpen, hydrated, refreshCatalogue]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={close}
            className="fixed inset-0 z-[90] bg-kalam/55 backdrop-blur-[3px]"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.55, ease: EASE }}
            className="fixed right-0 top-0 z-[95] flex h-full w-full max-w-[27rem] flex-col bg-bone shadow-2xl"
            role="dialog"
            aria-label="Shopping bag"
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.6} />
                <span className="label">
                  Your bag {count > 0 ? `(${count})` : ""}
                </span>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close bag"
                className="rounded-full border border-line p-2 transition-colors hover:border-graphite/40"
              >
                <X className="h-4 w-4" strokeWidth={1.6} />
              </button>
            </div>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
                <p className="font-display text-xl font-semibold tracking-[-0.03em]">
                  Your bag is empty
                </p>
                <p className="max-w-[16rem] text-sm leading-relaxed text-muted">
                  A little space for your next everyday favourite. Explore the
                  current collection and find your piece.
                </p>
                <Link
                  href="/shop"
                  onClick={close}
                  className="label rounded-full bg-kalam px-7 py-3.5 text-bone transition-transform hover:scale-[1.02]"
                >
                  Shop the drop
                </Link>
              </div>
            ) : (
              <>
                <div className="border-b border-line px-6 py-4">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <Truck size={17} aria-hidden="true" />
                    {SHIPPING_HEADLINE}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-muted">
                    {SHIPPING_DETAIL}
                  </p>
                </div>

                <ul className="flex-1 overflow-y-auto px-6">
                  {lines.map((line) => (
                    <li
                      key={line.key}
                      className="flex gap-4 border-b border-line py-5 last:border-0"
                    >
                      <Link
                        href={`/product/${line.slug}`}
                        onClick={close}
                        className="relative h-28 w-24 shrink-0 overflow-hidden rounded-sm bg-bone-deep"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={line.image}
                          alt={line.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </Link>
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="label text-muted">{line.line}</p>
                            <Link
                              href={`/product/${line.slug}`}
                              onClick={close}
                              className="mt-1 block font-display text-[0.98rem] font-semibold tracking-[-0.02em] hover:underline"
                            >
                              {line.name}
                            </Link>
                            <p className="mt-1 text-[0.78rem] text-muted">
                              {line.color} · {line.size}
                            </p>
                            {line.testOnly && (
                              <span className="mt-1 inline-block text-xs text-amber-800">
                                Test only · not for live orders
                              </span>
                            )}
                            {line.unavailable && (
                              <span className="mt-1 inline-block text-xs text-error">
                                No longer available · remove to continue
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => remove(line.key)}
                            aria-label={`Remove ${line.name}`}
                            className="text-muted transition-colors hover:text-error"
                          >
                            <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                          </button>
                        </div>
                        <div className="mt-auto flex items-end justify-between pt-3">
                          <div className="flex items-center rounded-full border border-line">
                            <button
                              type="button"
                              onClick={() =>
                                setQuantity(line.key, line.quantity - 1)
                              }
                              aria-label="Decrease quantity"
                              className="p-1.5 text-muted transition-colors hover:text-graphite"
                            >
                              <Minus className="h-3.5 w-3.5" strokeWidth={2} />
                            </button>
                            <span className="w-7 text-center text-sm tabular-nums">
                              {line.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setQuantity(line.key, line.quantity + 1)
                              }
                              aria-label="Increase quantity"
                              className="p-1.5 text-muted transition-colors hover:text-graphite"
                            >
                              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                            </button>
                          </div>
                          <p className="text-sm font-medium tabular-nums">
                            {formatINR(line.price * line.quantity)}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-line px-6 py-6">
                  <div className="flex items-baseline justify-between">
                    <span className="label text-muted">Subtotal</span>
                    <span className="font-display text-xl font-semibold tracking-[-0.03em] tabular-nums">
                      {formatINR(subtotal)}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[0.75rem] text-muted">
                    Taxes and shipping included. The price you see is the price
                    you pay.
                  </p>
                  <Link
                    href="/checkout"
                    onClick={close}
                    className="mt-5 block rounded-full bg-kalam py-4 text-center text-[0.8rem] font-medium uppercase tracking-[0.18em] text-bone transition-transform hover:scale-[1.01]"
                  >
                    Checkout
                  </Link>
                  <Link
                    href="/shop"
                    onClick={close}
                    className="mt-3 block text-center text-[0.8rem] text-muted underline underline-offset-4 hover:text-graphite"
                  >
                    Continue shopping
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
