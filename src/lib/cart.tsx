"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";

import type { Product, ProductVariant } from "@/data/catalog";
import { reconcileCartCatalogue } from "@/lib/cart-catalog";
import { cartLineKey } from "@/lib/cart-line-key";

export interface CartLine {
  key: string;
  productId: string;
  slug: string;
  name: string;
  line: string;
  image: string;
  price: number;
  sku: string;
  storeSkuReady: boolean;
  testOnly: boolean;
  unavailable?: boolean;
  size: string;
  color: string;
  quantity: number;
  maxQuantity: number;
}

interface CartState {
  lines: CartLine[];
}

type CartAction =
  | { type: "add"; line: CartLine }
  | { type: "remove"; key: string }
  | { type: "quantity"; key: string; quantity: number }
  | { type: "clear" }
  | { type: "hydrate"; lines: CartLine[] }
  | { type: "catalogue"; products: Product[] };

export type CartCatalogueRefresh = {
  ok: boolean;
  priceChanged: boolean;
  readinessChanged: boolean;
  hasUnavailable: boolean;
};

const STORAGE_KEY = "gamana.bag.v1";

const CartContext = createContext<{
  lines: CartLine[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  hydrated: boolean;
  refreshCatalogue: () => Promise<CartCatalogueRefresh>;
  open: () => void;
  close: () => void;
  add: (product: Product, variant: ProductVariant, quantity?: number) => void;
  remove: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;
} | null>(null);

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "add": {
      const existing = state.lines.find((l) => l.key === action.line.key);
      if (existing) {
        return {
          lines: state.lines.map((l) =>
            l.key === action.line.key
              ? {
                  ...l,
                  ...action.line,
                  quantity: Math.min(
                    l.quantity + action.line.quantity,
                    action.line.maxQuantity,
                  ),
                }
              : l,
          ),
        };
      }
      return { lines: [...state.lines, action.line] };
    }
    case "remove":
      return { lines: state.lines.filter((l) => l.key !== action.key) };
    case "quantity":
      return {
        lines: state.lines.map((l) =>
          l.key === action.key
            ? {
                ...l,
                quantity: Math.max(0, Math.min(action.quantity, l.maxQuantity)),
              }
            : l,
        ),
      };
    case "clear":
      return { lines: [] };
    case "hydrate":
      return { lines: action.lines };
    case "catalogue":
      return {
        lines: reconcileCartCatalogue(state.lines, action.products).lines,
      };
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { lines: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const currentLines = useRef(state.lines);
  currentLines.current = state.lines;
  const refreshInFlight = useRef<Promise<CartCatalogueRefresh> | null>(null);

  const refreshCatalogue = useCallback(() => {
    if (refreshInFlight.current) return refreshInFlight.current;
    if (!currentLines.current.length)
      return Promise.resolve({
        ok: true,
        priceChanged: false,
        readinessChanged: false,
        hasUnavailable: false,
      });

    const request = (async (): Promise<CartCatalogueRefresh> => {
      try {
        const response = await fetch("/api/products", { cache: "no-store" });
        const data = await response.json().catch(() => null);
        if (!response.ok || !Array.isArray(data?.products))
          throw new Error("Catalogue refresh failed.");
        const products = data.products as Product[];
        const result = reconcileCartCatalogue(currentLines.current, products);
        dispatch({ type: "catalogue", products });
        return { ok: true, ...result };
      } catch {
        return {
          ok: false,
          priceChanged: false,
          readinessChanged: false,
          hasUnavailable: false,
        };
      } finally {
        refreshInFlight.current = null;
      }
    })();

    refreshInFlight.current = request;
    return request;
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartLine[];
        if (Array.isArray(parsed))
          dispatch({
            type: "hydrate",
            lines: parsed.map((line) => {
              const storeSkuReady = line.storeSkuReady === true;
              return {
                ...line,
                key: cartLineKey(line.slug, line.size, line.color),
                // Keep Qikink identifiers out of the browser cart. Old cart
                // entries have no readiness marker, so require a fresh add.
                sku: "",
                storeSkuReady,
                testOnly: !storeSkuReady || line.testOnly === true,
              };
            }),
          });
      }
    } catch {
      // ignore malformed storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.lines));
    } catch {
      // storage unavailable (private mode) — cart stays in memory
    }
  }, [state.lines, hydrated]);

  const add = useCallback(
    (product: Product, variant: ProductVariant, quantity = 1) => {
      dispatch({
        type: "add",
        line: {
          key: cartLineKey(product.slug, variant.size, variant.color),
          productId: product.id,
          slug: product.slug,
          name: product.name,
          line: product.line,
          image: product.image,
          price: product.price,
          sku: "",
          storeSkuReady: product.variants.every(
            (item) => item.storeSkuReady === true,
          ),
          testOnly: product.variants.some(
            (item) => item.storeSkuReady !== true,
          ),
          unavailable: false,
          size: variant.size,
          color: variant.color,
          quantity: Math.min(quantity, 10),
          maxQuantity: 10,
        },
      });
      setIsOpen(true);
    },
    [],
  );

  const remove = useCallback(
    (key: string) => dispatch({ type: "remove", key }),
    [],
  );
  const setQuantity = useCallback(
    (key: string, quantity: number) =>
      dispatch({ type: "quantity", key, quantity }),
    [],
  );
  const clear = useCallback(() => dispatch({ type: "clear" }), []);

  const value = useMemo(() => {
    const count = state.lines.reduce((sum, l) => sum + l.quantity, 0);
    const subtotal = state.lines.reduce(
      (sum, l) => sum + l.quantity * l.price,
      0,
    );
    return {
      lines: state.lines,
      count,
      subtotal,
      isOpen,
      hydrated,
      refreshCatalogue,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      add,
      remove,
      setQuantity,
      clear,
    };
  }, [state.lines, isOpen, hydrated, refreshCatalogue, add, remove, setQuantity, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
