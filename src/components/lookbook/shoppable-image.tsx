"use client";

import { ArrowUpRight, ShoppingBag, Sparkle, X } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useId, useRef, useState } from "react";
import type { Product } from "@/data/catalog";
import { BrandText } from "@/components/brand-name";
import { useCart } from "@/lib/cart";
import type { StoryImage } from "@/lib/lookbook";
import { getAvailableHotspots } from "@/lib/lookbook-interactions";
import { SHIPPING_HEADLINE } from "@/lib/shipping";
import { formatINR } from "@/lib/utils";

/** Hotspot positions refer to the uncropped image, not the page or viewport. */
export function ShoppableImage({
  image,
  products,
  eager = false,
}: {
  image: StoryImage;
  products: Product[];
  eager?: boolean;
}) {
  const spots = getAvailableHotspots(image, products);
  const [selected, setSelected] = useState<string | null>(null);
  const frame = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const product = products.find((item) => item.slug === selected);

  function close(restore = true) {
    setSelected(null);
    if (restore) trigger.current?.focus({ preventScroll: true });
  }

  useEffect(() => {
    if (!selected) return;
    panel.current
      ?.querySelector<HTMLButtonElement>("button")
      ?.focus({ preventScroll: true });
    function outside(event: PointerEvent) {
      if (!frame.current?.contains(event.target as Node)) setSelected(null);
    }
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [selected]);

  return (
    <figure className="story-photo">
      <div
        ref={frame}
        className="story-photo-frame"
        onKeyDown={(event) => {
          if (event.key === "Escape" && selected) {
            event.stopPropagation();
            close();
          }
        }}
      >
        <div className="story-photo-canvas">
          <img
            src={image.src}
            alt={image.alt}
            loading={eager ? "eager" : "lazy"}
            draggable={false}
          />
          {spots.map((spot, i) => {
            const item = products.find((p) => p.slug === spot.productSlug)!;
            return (
              <button
                key={`${spot.productSlug}-${i}`}
                type="button"
                className="story-hotspot"
                style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                aria-label={`Shop ${item.name}`}
                aria-expanded={selected === item.slug}
                aria-controls={selected === item.slug ? panelId : undefined}
                onClick={(event) => {
                  trigger.current = event.currentTarget;
                  setSelected(selected === item.slug ? null : item.slug);
                }}
              >
                <Sparkle size={16} fill="currentColor" aria-hidden="true" />
              </button>
            );
          })}
          {!!spots.length && !product && (
            <span className="story-photo-hint">
              <Sparkle size={12} aria-hidden="true" /> Tap a marker to shop the
              piece
            </span>
          )}
        </div>
        {product && (
          <div
            ref={panel}
            id={panelId}
            className="story-product-popover"
            role="dialog"
            aria-label={`Shop ${product.name}`}
          >
            <HotspotProduct
              key={product.slug}
              product={product}
              onClose={close}
            />
          </div>
        )}
      </div>
      <figcaption>{image.caption}</figcaption>
    </figure>
  );
}

export function HotspotProduct({
  product,
  onClose,
}: {
  product: Product;
  onClose: (restore?: boolean) => void;
}) {
  const { add } = useCart();
  const [variantIndex, setVariantIndex] = useState("");
  const [error, setError] = useState("");
  const variant =
    variantIndex === "" ? undefined : product.variants[Number(variantIndex)];
  const soldOut = !product.variants.some((item) => item.stock !== "out");
  const id = useId();
  const select = useRef<HTMLSelectElement>(null);
  return (
    <>
      <div className="story-popover-heading">
        <p className="label">From this story / {product.line}</p>
        <button
          type="button"
          aria-label="Close product details"
          onClick={() => onClose()}
        >
          <X size={17} aria-hidden="true" />
        </button>
      </div>
      <h3>
        <BrandText onDark>{product.name}</BrandText>
      </h3>
      <p className="story-popover-price">
        {formatINR(product.price)}{" "}
        <span>{soldOut ? "Sold out" : "Shipping included"}</span>
      </p>
      <label htmlFor={id}>Choose your size</label>
      <select
        ref={select}
        id={id}
        value={variantIndex}
        disabled={soldOut}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => {
          setVariantIndex(event.target.value);
          setError("");
        }}
      >
        <option value="">
          {soldOut ? "Currently unavailable" : "Select a size"}
        </option>
        {product.variants.map((item, index) => (
          <option
            key={`${item.sku}-${index}`}
            value={index}
            disabled={item.stock === "out"}
          >
            {item.size} · {item.color}
            {item.stock === "out" ? " — sold out" : ""}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${id}-error`} className="story-popover-error" role="alert">
          {error}
        </p>
      )}
      <button
        className="story-quick-add"
        type="button"
        disabled={soldOut}
        onClick={() => {
          if (!variant || variant.stock === "out") {
            setError("Choose an available size first.");
            select.current?.focus();
            return;
          }
          add(product, variant);
          onClose(false);
        }}
      >
        <ShoppingBag size={15} aria-hidden="true" />
        {soldOut ? "Sold out" : "Add to bag"}
      </button>
      <Link className="story-spec-link" href={`/product/${product.slug}`}>
        View the piece & full details{" "}
        <ArrowUpRight size={13} aria-hidden="true" />
      </Link>
      <p className="story-popover-shipping">{SHIPPING_HEADLINE}</p>
    </>
  );
}
