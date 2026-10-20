"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { categories } from "@/data/catalog";
import { slugify } from "@/lib/utils";
import { UploadField } from "@/components/admin/upload-field";
import {
  appendSizeVariants,
  printTypes,
  validateProductDraft,
  type AdminProduct,
  type AdminVariant,
} from "@/lib/admin-product";

const input =
  "mt-1 w-full rounded-[4px] border border-bone/15 bg-kalam px-3 py-2.5 text-sm text-bone focus:border-ember focus:outline-none";
const secondary =
  "rounded-full border border-bone/20 px-4 py-2 text-xs hover:border-bone/50 disabled:opacity-40";
const empty = {
  name: "",
  slug: "",
  line: "URBAN" as const,
  category: "T-Shirts" as const,
  price: 0,
  compareAt: "" as number | string,
  image: "",
  gallery: [] as string[],
  blurb: "",
  description: "",
  details: "",
  tags: "",
  badge: "",
  featured: false,
  isNew: false,
  active: false,
  variants: [] as AdminVariant[],
  qikinkProductId: "",
  qikinkProductType: "",
  printTypeId: 1,
  skuPrefix: "",
  designCode: "",
  designUrl: "",
  mockupUrl: "",
  placementSku: "fr",
  widthInches: "" as number | string,
  heightInches: "" as number | string,
};
type FormValues = Omit<typeof empty, "line" | "category"> & {
  id?: string;
  line: AdminProduct["line"];
  category: AdminProduct["category"];
};
function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[4px] border border-bone/10 bg-bone/[0.03] p-4 sm:p-6">
      <h2 className="font-display text-xl">{title}</h2>
      {hint && (
        <p className="mt-2 text-sm leading-relaxed text-bone/60">{hint}</p>
      )}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

export function ProductEditor({ product }: { product?: AdminProduct }) {
  const router = useRouter();
  const [d, setDraft] = useState<FormValues>(() => ({
    ...empty,
    ...product,
    compareAt: product?.compareAt ?? "",
    widthInches: product?.widthInches ?? "",
    heightInches: product?.heightInches ?? "",
    badge: product?.badge ?? "",
    details: product?.details.join("\n") ?? "",
    tags: product?.tags.join(", ") ?? "",
    active: product?.active ?? false,
    featured: product?.featured ?? false,
    isNew: product?.isNew ?? false,
  }));
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [sizes, setSizes] = useState("XS, S, M, L, XL, XXL");
  const [color, setColor] = useState("");
  const [template, setTemplate] = useState("");
  const [designSku, setDesignSku] = useState("");
  const [cost, setCost] = useState("");
  const [variantMessage, setVariantMessage] = useState("");
  function set<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setDraft((old) => ({ ...old, [key]: value }));
  }
  function changeVariant(
    i: number,
    key: keyof AdminVariant,
    value: string | number | undefined,
  ) {
    set(
      "variants",
      d.variants.map((v, j) => (j === i ? { ...v, [key]: value } : v)),
    );
  }
  function field(
    label: string,
    key:
      | "name"
      | "slug"
      | "price"
      | "compareAt"
      | "badge"
      | "blurb"
      | "qikinkProductId"
      | "qikinkProductType"
      | "skuPrefix"
      | "designCode"
      | "placementSku"
      | "widthInches"
      | "heightInches",
    type = "text",
    placeholder?: string,
  ) {
    return (
      <label className="block text-xs text-bone/75">
        {label}
        <input
          className={input}
          type={type}
          value={d[key] ?? ""}
          placeholder={placeholder}
          min={type === "number" ? 0 : undefined}
          step={type === "number" ? "0.01" : undefined}
          onChange={(e) => {
            const value = e.target.value;
            if (key === "name")
              setDraft((old) => ({
                ...old,
                name: value,
                slug:
                  !old.id && (!old.slug || old.slug === slugify(old.name))
                    ? slugify(value)
                    : old.slug,
              }));
            else
              setDraft((old) => ({
                ...old,
                [key]:
                  type === "number" && value !== "" ? Number(value) : value,
              }));
          }}
        />
      </label>
    );
  }
  async function save(e: FormEvent) {
    e.preventDefault();
    if (saving) return;
    setMessage("");
    let body;
    try {
      body = validateProductDraft({
        ...d,
        details: d.details.split("\n").filter(Boolean),
        tags: d.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "Please check the product details.",
      );
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(
        d.id ? `/api/admin/products/${d.id}` : "/api/admin/products",
        {
          method: d.id ? "PATCH" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      const result = await res.json();
      if (!res.ok)
        throw new Error(result.error || "Could not save. Please try again.");
      setMessage(
        d.active
          ? "Saved. This product is visible in the shop."
          : "Draft saved. This product is hidden from the shop.",
      );
      if (!d.id) router.replace(`/admin/products/${result.id}`);
      router.refresh();
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : "Connection interrupted. Check the product list before trying again.",
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <form
      onSubmit={save}
      className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]"
    >
      <div className="min-w-0 space-y-5">
        <Section
          title="1. Product details"
          hint="These are the details customers see. Enter prices in rupees."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {field("Product name", "name", "text", "Bay Breeze Oversized Tee")}
            {field(
              "Page address (slug)",
              "slug",
              "text",
              "bay-breeze-oversized-tee",
            )}
            <label className="text-xs text-bone/75">
              Line
              <select
                className={input}
                value={d.line}
                onChange={(e) =>
                  set("line", e.target.value as FormValues["line"])
                }
              >
                <option>URBAN</option>
                <option>CORE</option>
              </select>
            </label>
            <label className="text-xs text-bone/75">
              Category
              <select
                className={input}
                value={d.category}
                onChange={(e) =>
                  set("category", e.target.value as FormValues["category"])
                }
              >
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            {field("Selling price (₹)", "price", "number")}
            {field("Original price (₹, optional)", "compareAt", "number")}
            {field("Badge (optional)", "badge", "text", "Drop 01")}
            {field("Short description", "blurb")}
          </div>
          <p className="text-xs text-bone/50">
            The selling price applies to every size below. Qikink costs are
            recorded separately and are not shown to customers.
          </p>
          <label className="block text-xs text-bone/75">
            Description
            <textarea
              className={input}
              rows={4}
              value={d.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-xs text-bone/75">
              Details (one per line)
              <textarea
                className={input}
                rows={3}
                value={d.details}
                onChange={(e) => set("details", e.target.value)}
              />
            </label>
            <label className="text-xs text-bone/75">
              Tags (separate with commas)
              <textarea
                className={input}
                rows={3}
                value={d.tags}
                onChange={(e) => set("tags", e.target.value)}
              />
            </label>
          </div>
        </Section>
        <Section
          title="2. Qikink reference"
          hint="Copy these from the Qikink export or dashboard. Reference codes are saved for you; they do not automatically change how orders are sent."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {field(
              "Qikink product ID",
              "qikinkProductId",
              "text",
              "e.g. 64930938",
            )}
            {field(
              "Qikink product type / model",
              "qikinkProductType",
              "text",
              "e.g. Unisex AOP Oversized Tee | UA22",
            )}
            <label className="text-xs text-bone/75">
              Print method (default for new sizes)
              <select
                aria-label="Print method (default for new sizes)"
                className={input}
                value={d.printTypeId}
                onChange={(e) => set("printTypeId", Number(e.target.value))}
              >
                {printTypes.map(([id, label]) => (
                  <option value={id} key={id}>
                    {label} · {id}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </Section>
        <Section
          title="3. Sizes, colours & Qikink codes"
          hint="Keep Product SKU, Design SKU and Store SKU separate, just like the Qikink variation table. “White” can be the base garment colour even when the finished print is colourful."
        >
          <div className="rounded border border-bone/10 p-4">
            <h3 className="text-sm font-semibold">
              Add several sizes together
            </h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="text-xs text-bone/75">
                Sizes (separate with commas)
                <input
                  className={input}
                  value={sizes}
                  onChange={(e) => setSizes(e.target.value)}
                />
              </label>
              <label className="text-xs text-bone/75">
                Base colour
                <input
                  className={input}
                  value={color}
                  placeholder="e.g. White"
                  onChange={(e) => setColor(e.target.value)}
                />
              </label>
              <label className="text-xs text-bone/75">
                Product SKU pattern (optional)
                <input
                  aria-label="Product SKU pattern (optional)"
                  className={input}
                  value={template}
                  placeholder="e.g. UAopUOs-Wh-{size}"
                  onChange={(e) => setTemplate(e.target.value)}
                />
                <span className="mt-1 block text-bone/45">
                  Only use a pattern you have checked against Qikink.
                </span>
              </label>
              <label className="text-xs text-bone/75">
                Qikink product cost (₹, optional)
                <input
                  className={input}
                  type="number"
                  min="0"
                  step="0.01"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                />
              </label>
            </div>
            <label className="mt-3 block text-xs text-bone/75">
              Shared Design SKU (optional)
              <textarea
                className={input}
                rows={2}
                value={designSku}
                onChange={(e) => setDesignSku(e.target.value)}
                placeholder="Paste the full Design SKU, including all placements"
              />
            </label>
            <button
              type="button"
              className={`${secondary} mt-3`}
              onClick={() => {
                try {
                  set(
                    "variants",
                    appendSizeVariants(
                      d.variants,
                      sizes,
                      color,
                      template,
                      designSku,
                      cost,
                      d.printTypeId,
                    ),
                  );
                  setVariantMessage(
                    "Sizes added. Existing variations were kept unchanged.",
                  );
                } catch (e) {
                  setVariantMessage(
                    e instanceof Error ? e.message : "Check sizes and colour.",
                  );
                }
              }}
            >
              Add sizes
            </button>
            <p role="status" className="mt-2 text-xs text-bone/60">
              {variantMessage}
            </p>
          </div>
          {!d.variants.length && (
            <p className="text-sm text-bone/50">
              No variations yet. Add sizes above, or save a draft and finish
              later.
            </p>
          )}
          {d.variants.map((v, i) => (
            <fieldset
              key={i}
              className="min-w-0 rounded border border-bone/15 p-4"
            >
              <legend className="px-2 text-sm font-semibold">
                Variation {i + 1} · {v.color} / {v.size}
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    ["Size", "size"],
                    ["Base colour", "color"],
                    ["Product SKU", "productSku"],
                    ["Store SKU", "storeSku"],
                  ] as const
                ).map(([label, key]) => (
                  <label className="text-xs text-bone/75" key={key}>
                    {label}
                    <input
                      className={input}
                      value={v[key] ?? ""}
                      onChange={(e) => changeVariant(i, key, e.target.value)}
                    />
                  </label>
                ))}
                <label className="text-xs text-bone/75 sm:col-span-2">
                  Design SKU
                  <textarea
                    className={input}
                    rows={2}
                    value={v.designSku ?? ""}
                    onChange={(e) =>
                      changeVariant(i, "designSku", e.target.value)
                    }
                  />
                </label>
                <label className="text-xs text-bone/75">
                  Qikink product cost (₹)
                  <input
                    className={input}
                    type="number"
                    min="0"
                    step="0.01"
                    value={v.productCost ?? ""}
                    onChange={(e) =>
                      changeVariant(
                        i,
                        "productCost",
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value),
                      )
                    }
                  />
                </label>
                <label className="text-xs text-bone/75">
                  Availability
                  <select
                    className={input}
                    value={v.stock}
                    onChange={(e) => changeVariant(i, "stock", e.target.value)}
                  >
                    <option value="in">Available</option>
                    <option value="low">Low stock</option>
                    <option value="out">Unavailable</option>
                  </select>
                </label>
                <label className="text-xs text-bone/75">
                  Print method
                  <select
                    className={input}
                    value={v.printTypeId}
                    onChange={(e) =>
                      changeVariant(i, "printTypeId", Number(e.target.value))
                    }
                  >
                    {printTypes.map(([id, label]) => (
                      <option value={id} key={id}>
                        {label} · {id}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs text-bone/75">
                  Confirmed order SKU
                  <input
                    className={input}
                    value={v.sku}
                    maxLength={50}
                    onChange={(e) => changeVariant(i, "sku", e.target.value)}
                  />
                </label>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-bone/50">
                Leave Confirmed order SKU blank until Qikink confirms which code
                selects your saved printed product. Neither Product SKU nor
                Store SKU is copied here automatically. Existing order SKUs are
                preserved.
              </p>
              <button
                className={`${secondary} mt-3`}
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      `Remove ${v.color} / ${v.size} from this form? This takes effect only when you save.`,
                    )
                  )
                    set(
                      "variants",
                      d.variants.filter((_, j) => j !== i),
                    );
                }}
              >
                Remove variation
              </button>
            </fieldset>
          ))}
        </Section>
      </div>
      <div className="min-w-0 space-y-5">
        <Section
          title="4. Photos & mockups"
          hint="Upload your own files; nothing is fetched from Qikink. Files keep their original quality, up to 25 MB each."
        >
          <div>
            <h3 className="mb-2 text-xs text-bone/75">Cover photo</h3>
            <UploadField
              value={d.image}
              onChange={(v) => set("image", v)}
              folder="products"
              label="Cover photo"
            />
          </div>
          <div className="space-y-3">
            <h3 className="text-xs text-bone/75">Gallery photos</h3>
            {d.gallery.map((url, i) => (
              <div className="rounded border border-bone/10 p-3" key={i}>
                <UploadField
                  value={url}
                  onChange={(v) =>
                    set(
                      "gallery",
                      d.gallery.map((old, j) => (i === j ? v : old)),
                    )
                  }
                  folder="products"
                  label={`Gallery photo ${i + 1}`}
                />
                <button
                  type="button"
                  className="mt-2 text-xs text-bone/60 underline"
                  onClick={() =>
                    set(
                      "gallery",
                      d.gallery.filter((_, j) => i !== j),
                    )
                  }
                >
                  Remove gallery photo {i + 1}
                </button>
              </div>
            ))}
            <button
              type="button"
              className={secondary}
              onClick={() => set("gallery", [...d.gallery, ""])}
            >
              Add gallery photo
            </button>
          </div>
          <div>
            <h3 className="mb-2 text-xs text-bone/75">Mockup (optional)</h3>
            <UploadField
              value={d.mockupUrl}
              onChange={(v) => set("mockupUrl", v)}
              folder="mockups"
              label="Product mockup"
            />
          </div>
          <p className="text-xs text-bone/50">
            The mockup is saved separately. Add it as a cover or gallery photo
            too if you want customers to see it.
          </p>
        </Section>
        <Section title="5. Visibility & save">
          <label className="flex items-start gap-3 text-sm">
            <input
              className="mt-1 accent-ember"
              type="checkbox"
              checked={d.active}
              onChange={(e) => set("active", e.target.checked)}
            />
            <span>
              Show in shop
              <span className="mt-1 block text-xs text-bone/50">
                Off means draft. Drafts can be saved before you upload photos or
                confirm order SKUs.
              </span>
            </span>
          </label>
          <div className="flex flex-wrap gap-4">
            {(
              [
                ["Featured product", "featured"],
                ["Mark as new", "isNew"],
              ] as const
            ).map(([label, key]) => (
              <label key={key} className="text-xs">
                <input
                  type="checkbox"
                  checked={d[key]}
                  onChange={(e) => set(key, e.target.checked)}
                  className="mr-2 accent-ember"
                />
                {label}
              </label>
            ))}
          </div>
          <p className="text-xs leading-relaxed text-bone/50">
            Saving does not send an order to Qikink. Payment settings are not
            changed.
          </p>
          <button
            disabled={saving}
            className="w-full rounded-full bg-ember px-6 py-3 text-sm font-semibold text-kalam disabled:opacity-50"
          >
            {saving ? "Saving…" : d.active ? "Save product" : "Save draft"}
          </button>
          <p
            role="status"
            aria-live="polite"
            className="break-words text-sm text-bone/80"
          >
            {message}
          </p>
        </Section>
        <details className="rounded border border-bone/10 p-4">
          <summary className="cursor-pointer text-sm">
            Advanced: existing print-file settings
          </summary>
          <p className="mt-3 text-xs leading-relaxed text-bone/50">
            These older settings are separate from the dashboard Design SKU
            above. Keep existing values unless you intend to replace them. This
            form does not submit printing orders.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {field("Legacy SKU prefix", "skuPrefix")}
            {field("Legacy design code (max 20)", "designCode")}
            {field("Placement (fr/bk/lp/rp/rs/ls)", "placementSku")}
            {field("Width (inches)", "widthInches", "number")}
            {field("Height (inches)", "heightInches", "number")}
          </div>
          <div className="mt-4">
            <h3 className="mb-2 text-xs">Print-ready design file (optional)</h3>
            <UploadField
              value={d.designUrl}
              onChange={(v) => set("designUrl", v)}
              folder="designs"
              label="Print-ready design file"
              preview={false}
            />
          </div>
        </details>
      </div>
    </form>
  );
}
