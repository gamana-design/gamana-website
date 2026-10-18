"use client";

import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { ProductCard } from "@/components/product-card";
import {
  categories,
  type Product,
  type ProductCategory,
  type ProductLine,
} from "@/data/catalog";
import { cn } from "@/lib/utils";

type SortKey = "featured" | "new" | "price-asc" | "price-desc" | "name";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "featured", label: "Featured" },
  { key: "new", label: "Newest" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
  { key: "name", label: "Alphabetical" },
];

export function ShopBrowser({ products, coreComingSoon = false, coreComingSoonText }: { products: Product[]; coreComingSoon?: boolean; coreComingSoonText?: string }) {
  const router = useRouter();
  const params = useSearchParams();

  const line = (params.get("line") as ProductLine | null) ?? null;
  const category = (params.get("category") as ProductCategory | null) ?? null;
  const sort = (params.get("sort") as SortKey | null) ?? "featured";
  const [filtersOpen, setFiltersOpen] = useState(false);

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`/shop${next.toString() ? `?${next.toString()}` : ""}`, {
      scroll: false,
    });
  }

  const results = useMemo(() => {
    let list = [...products];
    if (line) list = list.filter((p) => p.line === line);
    if (category) list = list.filter((p) => p.category === category);

    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "name":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "new":
        list.sort((a, b) => Number(b.isNew ?? false) - Number(a.isNew ?? false));
        break;
      default:
        list.sort(
          (a, b) =>
            Number(b.featured ?? false) - Number(a.featured ?? false) ||
            a.name.localeCompare(b.name),
        );
    }
    return list;
  }, [products, line, category, sort]);

  const hasFilters = Boolean(line || category);

  return (
    <div>
      {/* Filter bar */}
      <div className="sticky top-[68px] z-30 border-y border-line bg-bone/90 backdrop-blur-xl md:top-[76px]">
        <div className="container-gamana flex items-center gap-3 overflow-x-auto py-3.5 no-scrollbar">
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            className="label flex shrink-0 items-center gap-2 rounded-full border border-line px-4 py-2.5 transition-colors hover:border-graphite/40 lg:hidden"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.8} />
            Filters
          </button>

          <div className="hidden shrink-0 items-center gap-2 lg:flex">
            <FilterPill
              active={!line}
              onClick={() => setParam("line", null)}
            >
              All
            </FilterPill>
            <FilterPill
              active={line === "URBAN"}
              onClick={() => setParam("line", line === "URBAN" ? null : "URBAN")}
              accent="ember"
            >
              URBAN
            </FilterPill>
            <FilterPill
              active={line === "CORE"}
              onClick={() => setParam("line", line === "CORE" ? null : "CORE")}
              accent="neelam"
            >
              CORE
            </FilterPill>
          </div>

          <span className="hidden h-5 w-px shrink-0 bg-line lg:block" />

          <div className="flex shrink-0 items-center gap-2">
            {categories.map((c) => (
              <FilterPill
                key={c}
                active={category === c}
                onClick={() =>
                  setParam("category", category === c ? null : c)
                }
                subtle
              >
                {c}
              </FilterPill>
            ))}
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-3 pl-3">
            <label className="label hidden items-center gap-2 text-muted md:flex">
              Sort
              <select
                value={sort}
                onChange={(e) => setParam("sort", e.target.value)}
                className="cursor-pointer bg-transparent text-graphite outline-none"
              >
                {SORTS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      {/* Mobile filter sheet */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="overflow-hidden border-b border-line bg-bone-deep/40 lg:hidden"
          >
            <div className="container-gamana space-y-5 py-6">
              <div>
                <p className="label text-muted">Line</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <FilterPill active={!line} onClick={() => setParam("line", null)}>
                    All
                  </FilterPill>
                  <FilterPill
                    active={line === "URBAN"}
                    onClick={() => setParam("line", line === "URBAN" ? null : "URBAN")}
                    accent="ember"
                  >
                    URBAN
                  </FilterPill>
                  <FilterPill
                    active={line === "CORE"}
                    onClick={() => setParam("line", line === "CORE" ? null : "CORE")}
                    accent="neelam"
                  >
                    CORE
                  </FilterPill>
                </div>
              </div>
              <div>
                <p className="label text-muted">Category</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <FilterPill
                      key={c}
                      active={category === c}
                      onClick={() =>
                        setParam("category", category === c ? null : c)
                      }
                      subtle
                    >
                      {c}
                    </FilterPill>
                  ))}
                </div>
              </div>
              <div>
                <p className="label text-muted">Sort</p>
                <select
                  value={sort}
                  onChange={(e) => setParam("sort", e.target.value)}
                  className="mt-3 w-full rounded-sm border border-line bg-bone px-4 py-3 text-sm outline-none"
                >
                  {SORTS.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <div className="container-gamana py-10 md:py-14">
        <div className="flex items-center justify-between">
          <p className="label text-muted">
            {results.length} {results.length === 1 ? "piece" : "pieces"}
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={() => router.replace("/shop", { scroll: false })}
              className="label flex items-center gap-1.5 text-muted transition-colors hover:text-graphite"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} />
              Clear
            </button>
          )}
        </div>

        {results.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-display text-2xl font-semibold tracking-[-0.03em]">
              {line === "CORE" && coreComingSoon ? "CORE is coming soon" : "Nothing here yet"}
            </p>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted">
              {line === "CORE" && coreComingSoon ? (coreComingSoonText || "We’re developing the first CORE performance pieces. Check back for the next drop.") : "That combination is not in the current drop. Try another line or category."}
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-3 xl:grid-cols-4">
            {results.map((product, i) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: Math.min(i * 0.04, 0.4) }}
              >
                <ProductCard product={product} index={i} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterPill({
  children,
  active,
  onClick,
  accent,
  subtle,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  accent?: "ember" | "neelam";
  subtle?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "label shrink-0 rounded-full border px-4 py-2.5 transition-all",
        active
          ? accent === "ember"
            ? "border-ember bg-ember text-white"
            : accent === "neelam"
              ? "border-neelam bg-neelam text-white"
              : "border-kalam bg-kalam text-bone"
          : subtle
            ? "border-line bg-transparent text-muted hover:border-graphite/35 hover:text-graphite"
            : "border-line bg-transparent text-graphite/70 hover:border-graphite/40 hover:text-graphite",
      )}
    >
      {children}
    </button>
  );
}
