"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { useCart } from "@/lib/cart";
import { formatINR } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;
const FREE_SHIPPING_AT = 1499;

export function CartDrawer() {
  const { isOpen, close, lines, subtotal, count, setQuantity, remove } = useCart();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const remaining = Math.max(0, FREE_SHIPPING_AT - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_AT) * 100);

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
                  A little space for your next everyday favourite.
                  Explore the current collection and find your piece.
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
                  <p className="text-[0.78rem] text-muted">
                    {remaining > 0 ? (
                      <>
                        <span className="text-graphite">
                          {formatINR(remaining)}
                        </span>{" "}
                        away from free shipping
                      </>
                    ) : (
                      <span className="text-success">
                        Free shipping unlocked
                      </span>
                    )}
                  </p>
                  <div className="mt-2 h-[3px] w-full overflow-hidden rounded-full bg-line">
                    <motion.div
                      className="h-full rounded-full bg-ember"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.6, ease: EASE }}
                    />
                  </div>
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
                    Taxes included. Shipping calculated at checkout.
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
