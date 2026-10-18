import Link from "next/link";

import type { Product } from "@/data/catalog";
import { cn, formatINR } from "@/lib/utils";

export function ProductCard({
  product,
  index = 0,
  priority = false,
  className,
}: {
  product: Product;
  index?: number;
  priority?: boolean;
  className?: string;
}) {
  const accent = product.line === "URBAN" ? "text-ember" : "text-neelam";

  return (
    <Link
      href={`/product/${product.slug}`}
      className={cn(
        "group block focus-visible:outline-offset-4",
        className,
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-[2px] bg-bone-deep">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.name}
          loading={priority ? "eager" : "lazy"}
          className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.045]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-kalam/25 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          <span
            className={cn(
              "label rounded-full px-2.5 py-1.5 backdrop-blur-sm",
              product.line === "URBAN"
                ? "bg-ember/95 text-white"
                : "bg-neelam/95 text-white",
            )}
          >
            {product.line}
          </span>
          {product.badge && (
            <span className="label rounded-full bg-bone/90 px-2.5 py-1.5 text-graphite backdrop-blur-sm">
              {product.badge}
            </span>
          )}
        </div>

        {product.variants.some((v) => v.stock === "out") && (
          <div className="absolute inset-x-3 bottom-3 rounded-full bg-kalam/85 py-2 text-center text-[0.68rem] uppercase tracking-[0.16em] text-bone backdrop-blur-sm">
            Sold out
          </div>
        )}
      </div>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-display text-[1.02rem] font-semibold leading-tight tracking-[-0.025em] transition-opacity group-hover:opacity-70">
            {product.name}
          </h3>
          <p className="mt-1 truncate text-[0.82rem] text-muted">
            {product.blurb}
          </p>
        </div>
        <p className="shrink-0 text-[0.95rem] font-medium tabular-nums">
          {formatINR(product.price)}
        </p>
      </div>
      <div className="mt-2 flex items-center gap-2 text-[0.72rem] text-muted">
        <span className={cn("label", accent)}>{product.category}</span>
        <span aria-hidden="true">·</span>
        <span>{product.variants.length} sizes</span>
      </div>
    </Link>
  );
}
