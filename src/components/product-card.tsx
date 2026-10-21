import { BrandText } from "@/components/brand-name";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Product } from "@/data/catalog";
import { cn, formatINR } from "@/lib/utils";

type ProductCardProps = {
  product: Product;
  index?: number;
  priority?: boolean;
  className?: string;
};

export function ProductCard({
  product,
  index = 0,
  priority = false,
  className,
}: ProductCardProps) {
  const soldOut =
    product.variants.length > 0 &&
    product.variants.every((variant) => variant.stock === "out");
  const testOnly = product.variants.some(
    (variant) => variant.storeSkuReady !== true,
  );

  return (
    <Link
      href={`/product/${product.slug}`}
      className={cn("product-editorial-card group", className)}
    >
      <div className="product-card-image">
        <img
          src={product.image}
          alt={product.name}
          loading={priority ? "eager" : "lazy"}
          className="product-card-primary"
        />
        {product.gallery.find((image) => image !== product.image) && (
          <img
            src={product.gallery.find((image) => image !== product.image)}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="product-card-secondary"
          />
        )}
        <div className="product-card-top">
          <span
            className={`product-line-label ${product.line === "CORE" ? "line-core" : "line-urban"}`}
          >
            {product.line}
          </span>
          <span className="product-card-index">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        {soldOut ? (
          <span className="product-stock">Sold out</span>
        ) : testOnly ? (
          <span className="product-stock">Test only</span>
        ) : product.badge ? (
          <span className="product-stock">{product.badge}</span>
        ) : null}
        <span className="product-card-arrow" aria-hidden="true">
          <ArrowUpRight size={20} strokeWidth={1.4} />
        </span>
      </div>
      <div className="product-card-info">
        <div>
          <p className="product-card-category">
            {product.category} /{" "}
            {new Set(product.variants.map((v) => v.size)).size} sizes
          </p>
          <h3>
            <BrandText>{product.name}</BrandText>
          </h3>
        </div>
        <p className="product-card-price">{formatINR(product.price)}</p>
      </div>
    </Link>
  );
}
