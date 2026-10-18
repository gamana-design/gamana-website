"use client";

import { motion } from "framer-motion";
import { Check, Minus, Plus, ShoppingBag, Truck } from "lucide-react";
import { useState } from "react";

import { useCart } from "@/lib/cart";
import type { Product } from "@/data/catalog";
import { cn, formatINR } from "@/lib/utils";

export function ProductDetail({ product }: { product: Product }) {
  const { add } = useCart();
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");

  const activeVariant =
    product.variants.find((v) => v.size === size) ?? product.variants[0];

  function onAdd() {
    if (!size) {
      setError("Choose a size first.");
      return;
    }
    if (activeVariant.stock === "out") {
      setError("That size is sold out.");
      return;
    }
    setError("");
    add(product, activeVariant, qty);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2200);
  }

  const accent = product.line === "URBAN" ? "bg-ember" : "bg-neelam";

  return (
    <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
      {/* Gallery */}
      <div className="lg:sticky lg:top-28 lg:self-start">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[3px] bg-bone-deep">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.gallery[0]}
            alt={product.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute left-4 top-4 flex flex-col items-start gap-2">
            <span
              className={cn(
                "label rounded-full px-3 py-2 text-white",
                accent,
              )}
            >
              {product.line}
            </span>
            {product.badge && (
              <span className="label rounded-full bg-bone/90 px-3 py-2 text-graphite backdrop-blur-sm">
                {product.badge}
              </span>
            )}
          </div>
        </div>
        {product.gallery.length > 1 && (
          <div className="mt-4 grid grid-cols-4 gap-3">
            {product.gallery.map((image, i) => (
              <div
                key={image + i}
                className="aspect-[4/5] overflow-hidden rounded-[2px] bg-bone-deep"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt={`${product.name} view ${i + 1}`}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div>
        <p className="label text-muted">
          {product.line} · {product.category}
        </p>
        <h1 className="mt-4 font-display text-[clamp(2rem,4.6vw,3.2rem)] font-semibold leading-[0.98] tracking-[-0.045em]">
          {product.name}
        </h1>

        <div className="mt-5 flex items-baseline gap-3">
          <span className="font-display text-2xl font-semibold tracking-[-0.03em] tabular-nums">
            {formatINR(product.price)}
          </span>
          {product.compareAt && (
            <span className="text-sm text-muted line-through tabular-nums">
              {formatINR(product.compareAt)}
            </span>
          )}
          <span className="ml-1 text-[0.75rem] text-muted">incl. taxes</span>
        </div>

        <p className="mt-6 text-pretty text-[0.98rem] leading-relaxed text-graphite/80">
          {product.description}
        </p>

        {/* Size */}
        <div className="mt-9">
          <div className="flex items-center justify-between">
            <p className="label text-muted">Size</p>
            <button
              type="button"
              className="link-underline text-[0.78rem] text-muted hover:text-graphite"
            >
              Size guide
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.variants.map((variant) => {
              const selected = size === variant.size;
              const out = variant.stock === "out";
              return (
                <button
                  key={variant.sku}
                  type="button"
                  disabled={out}
                  onClick={() => {
                    setSize(variant.size);
                    setError("");
                  }}
                  className={cn(
                    "label relative min-w-[3.25rem] rounded-full border px-4 py-3 transition-all",
                    selected
                      ? "border-kalam bg-kalam text-bone"
                      : out
                        ? "cursor-not-allowed border-line text-muted/40 line-through"
                        : "border-line text-graphite hover:border-graphite/45",
                  )}
                >
                  {variant.size}
                  {variant.stock === "low" && !out && (
                    <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-ember" />
                  )}
                </button>
              );
            })}
          </div>
          {error && <p className="mt-3 text-[0.82rem] text-error">{error}</p>}
        </div>

        {/* Quantity + add */}
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <div className="flex items-center justify-between rounded-full border border-line px-4 sm:w-36">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
              className="p-2 text-muted transition-colors hover:text-graphite"
            >
              <Minus className="h-4 w-4" strokeWidth={1.8} />
            </button>
            <span className="text-sm tabular-nums">{qty}</span>
            <button
              type="button"
              onClick={() => setQty((q) => Math.min(10, q + 1))}
              aria-label="Increase quantity"
              className="p-2 text-muted transition-colors hover:text-graphite"
            >
              <Plus className="h-4 w-4" strokeWidth={1.8} />
            </button>
          </div>

          <motion.button
            type="button"
            onClick={onAdd}
            whileTap={{ scale: 0.985 }}
            className={cn(
              "flex flex-1 items-center justify-center gap-2.5 rounded-full py-4 text-[0.78rem] font-medium uppercase tracking-[0.18em] transition-colors",
              added ? "bg-success text-white" : "bg-kalam text-bone",
            )}
          >
            {added ? (
              <>
                <Check className="h-4 w-4" strokeWidth={2.2} />
                Added to bag
              </>
            ) : (
              <>
                <ShoppingBag className="h-4 w-4" strokeWidth={1.8} />
                Add to bag — {formatINR(product.price * qty)}
              </>
            )}
          </motion.button>
        </div>

        {/* Fulfilment */}
        <div className="mt-8 flex items-start gap-3 rounded-[3px] border border-line bg-bone-deep/40 p-5">
          <Truck className="mt-0.5 h-4 w-4 shrink-0 text-ember" strokeWidth={1.6} />
          <div>
            <p className="text-[0.88rem] font-medium">
              Printed on demand, dispatched in about three days
            </p>
            <p className="mt-1.5 text-[0.82rem] leading-relaxed text-muted">
              Your piece is printed and packed after you order, then shipped
              across {["India", "USA"].join(" and ")}. Free shipping over ₹1,499.
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="mt-9 divide-y divide-line border-y border-line">
          <DetailBlock title="Details">
            <ul className="space-y-1.5">
              {product.details.map((d) => (
                <li key={d} className="flex gap-2.5">
                  <span className="mt-[0.55rem] h-1 w-1 shrink-0 rounded-full bg-ember" />
                  {d}
                </li>
              ))}
            </ul>
          </DetailBlock>
          <DetailBlock title="Why it exists">
            <p>{product.blurb}</p>
          </DetailBlock>
          <DetailBlock title="Shipping & returns">
            <p>
              Printed and dispatched in roughly three working days. Free
              shipping over ₹1,499. Returns accepted within seven days of
              delivery on unworn pieces with tags attached.
            </p>
          </DetailBlock>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {product.tags.map((tag) => (
            <span
              key={tag}
              className="label rounded-full border border-line px-3 py-2 text-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function DetailBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="label">{title}</span>
        <span className="relative h-3 w-3">
          <span className="absolute left-0 top-1/2 h-px w-3 bg-graphite" />
          <span
            className={cn(
              "absolute left-1/2 top-0 h-3 w-px bg-graphite transition-transform duration-300",
              open ? "scale-y-0" : "scale-y-100",
            )}
          />
        </span>
      </button>
      {open && (
        <div className="pb-5 text-[0.9rem] leading-relaxed text-muted">
          {children}
        </div>
      )}
    </div>
  );
}
