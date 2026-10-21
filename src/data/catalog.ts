export type ProductLine = "URBAN" | "CORE";
export type ProductCategory = "T-Shirts" | "Hoodies" | "Performance" | "Accessories";

export interface ProductVariant {
  size: string;
  color: string;
  /** Kept for legacy sample data; public products leave this empty. */
  sku: string;
  /** Readiness only; the raw Store SKU stays on the server. */
  storeSkuReady?: boolean;
  printTypeId: number;
  stock: "in" | "low" | "out";
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  line: ProductLine;
  category: ProductCategory;
  price: number;
  compareAt?: number;
  image: string;
  gallery: string[];
  blurb: string;
  description: string;
  details: string[];
  tags: string[];
  badge?: string;
  featured?: boolean;
  isNew?: boolean;
  variants: ProductVariant[];
}

export const categories: ProductCategory[] = [
  "T-Shirts",
  "Hoodies",
  "Performance",
  "Accessories",
];
