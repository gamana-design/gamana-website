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
  const missingOrderSkuCount = d.variants.filter(
    (variant) => !variant.sku.trim(),
  ).length;
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
          ? missingOrderSkuCount
            ? "Saved for testing. This product is visible in the shop, but live orders are blocked until every variation has a Qikink-confirmed order SKU."
            : "Saved. This product is visible in the shop."
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
      className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]"
    >
      <div className="min-w-0 space-y-5">
        <Section
          title="Product"
          hint="Add the product title, description, price and customer-facing photos."
        >
          {field("Title", "name", "text", "Bay Breeze Oversized Tee")}
          <label className="block text-xs text-bone/75">
            Description
            <textarea
              className={input}
              rows={6}
              value={d.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            {field("Price (₹)", "price", "number")}
            {field("Compare-at price (optional)", "compareAt", "number")}
          </div>
          <p className="text-xs text-bone/50">
            The price applies to every size. Shipping stays free across India.
          </p>
        </Section>

        <Section
          title="Media"
          hint="The cover photo appears first in the shop. Gallery photos follow it. Files keep their original quality, up to 25 MB each."
        >
          <div className="grid gap-5 lg:grid-cols-2">
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
                    Remove photo {i + 1}
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
          </div>
        </Section>

        <Section
          title={`Variants${d.variants.length ? ` · ${d.variants.length}` : ""}`}
          hint="Add sizes and colours. Order SKUs are optional for test items; live orders stay blocked until every variation has its confirmed Qikink SKU."
        >
          <div className="rounded border border-bone/10 p-4">
            <h3 className="text-sm font-semibold">Add variants</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="text-xs text-bone/75">
                Sizes (separate with commas)
                <input
                  className={input}
                  value={sizes}
                  onChange={(e) => setSizes(e.target.value)}
                  placeholder="XS, S, M, L, XL"
                />
              </label>
              <label className="text-xs text-bone/75">
                Colour
                <input
                  className={input}
                  value={color}
                  placeholder="e.g. White"
                  onChange={(e) => setColor(e.target.value)}
                />
              </label>
            </div>
            <details className="mt-4 rounded border border-bone/10 p-3">
              <summary className="cursor-pointer text-xs text-bone/70">
                Optional Qikink details for these new sizes
              </summary>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="text-xs text-bone/75">
                  Product SKU pattern
                  <input
                    aria-label="Product SKU pattern (optional)"
                    className={input}
                    value={template}
                    placeholder="Use {size} if it changes by size"
                    onChange={(e) => setTemplate(e.target.value)}
                  />
                  <span className="mt-1 block text-bone/45">
                    Only enter a value checked against Qikink.
                  </span>
                </label>
                <label className="text-xs text-bone/75">
                  Qikink product cost (₹)
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
                Shared Design SKU
                <textarea
                  className={input}
                  rows={2}
                  value={designSku}
                  onChange={(e) => setDesignSku(e.target.value)}
                  placeholder="Optional: full artwork/placement code"
                />
              </label>
            </details>
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
                    "Variants added. Existing variants were kept unchanged.",
                  );
                } catch (e) {
                  setVariantMessage(
                    e instanceof Error
                      ? e.message
                      : "Check the sizes and colour.",
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
              No variants added yet. Drafts can be saved and finished later.
            </p>
          )}
          {d.variants.map((v, i) => (
            <fieldset
              key={i}
              className="min-w-0 rounded border border-bone/15 p-4"
            >
              <legend className="px-2 text-sm font-semibold">
                {v.color} / {v.size}
              </legend>
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="text-xs text-bone/75">
                  Size
                  <input
                    className={input}
                    value={v.size}
                    onChange={(e) => changeVariant(i, "size", e.target.value)}
                  />
                </label>
                <label className="text-xs text-bone/75">
                  Colour
                  <input
                    className={input}
                    value={v.color}
                    onChange={(e) => changeVariant(i, "color", e.target.value)}
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
              </div>
              <label className="mt-3 block text-xs text-bone/75">
                Confirmed order SKU
                <input
                  className={input}
                  value={v.sku}
                  maxLength={50}
                  aria-label={`Confirmed order SKU for ${v.color} / ${v.size}`}
                  onChange={(e) => changeVariant(i, "sku", e.target.value)}
                />
              </label>
              <p className="mt-2 text-xs leading-relaxed text-bone/50">
                This is the code sent to Qikink for a live order. It is not
                copied from Product SKU, Design SKU or Store SKU. Leave it blank
                while testing; live orders stay blocked until Qikink confirms
                which code to use for every variation.
              </p>
              <details className="mt-4 rounded border border-bone/10 p-3">
                <summary className="cursor-pointer text-xs text-bone/70">
                  Other Qikink references and cost
                </summary>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="text-xs text-bone/75">
                    Product SKU
                    <input
                      className={input}
                      value={v.productSku ?? ""}
                      onChange={(e) =>
                        changeVariant(i, "productSku", e.target.value)
                      }
                    />
                  </label>
                  <label className="text-xs text-bone/75">
                    Store SKU
                    <input
                      className={input}
                      value={v.storeSku ?? ""}
                      onChange={(e) =>
                        changeVariant(i, "storeSku", e.target.value)
                      }
                    />
                  </label>
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
                </div>
              </details>
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
                Remove variant
              </button>
            </fieldset>
          ))}
        </Section>
      </div>

      <aside className="min-w-0 space-y-5">
        <Section title="Status">
          <label className="block text-xs text-bone/75">
            Product status
            <select
              className={input}
              value={d.active ? "active" : "draft"}
              onChange={(e) => set("active", e.target.value === "active")}
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
            </select>
          </label>
          <p className="text-xs leading-relaxed text-bone/55">
            Active products appear in the shop. A cover photo, price above ₹0,
            and at least one variation are still required. If any variation is
            missing its confirmed order SKU, the whole product stays test-only
            and live checkout blocks it until every SKU is confirmed.
          </p>
          {d.active && missingOrderSkuCount > 0 && (
            <p
              role="status"
              className="rounded border border-amber-500/25 bg-amber-400/5 p-3 text-xs leading-relaxed text-amber-100"
            >
              Test only: {missingOrderSkuCount} variation
              {missingOrderSkuCount === 1 ? " is" : "s are"} missing a confirmed
              order SKU. When test checkout is enabled, you can test this
              product; the test order will not be sent to Qikink. Live checkout
              will block this product until every variation has its confirmed
              SKU.
            </p>
          )}
          <div className="flex flex-wrap gap-4">
            <label className="text-xs">
              <input
                type="checkbox"
                checked={d.featured}
                onChange={(e) => set("featured", e.target.checked)}
                className="mr-2 accent-ember"
              />
              Featured
            </label>
            <label className="text-xs">
              <input
                type="checkbox"
                checked={d.isNew}
                onChange={(e) => set("isNew", e.target.checked)}
                className="mr-2 accent-ember"
              />
              New
            </label>
          </div>
          <button
            disabled={saving}
            className="w-full rounded-full bg-ember px-6 py-3 text-sm font-semibold text-kalam disabled:opacity-50"
          >
            {saving ? "Saving…" : d.active ? "Save product" : "Save draft"}
          </button>
          <p
            role={message.startsWith("Can't show") ? "alert" : "status"}
            aria-live="polite"
            className="break-words text-sm text-bone/80"
          >
            {message}
          </p>
        </Section>

        <Section title="Organization">
          <label className="text-xs text-bone/75">
            Category
            <select
              className={input}
              value={d.category}
              onChange={(e) =>
                set("category", e.target.value as FormValues["category"])
              }
            >
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>
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
        </Section>

        <details className="rounded-[4px] border border-bone/10 bg-bone/[0.03] p-4 sm:p-6">
          <summary className="cursor-pointer font-display text-lg">
            More product details
          </summary>
          <div className="mt-4 space-y-4">
            {field("Page address", "slug", "text", "product-name")}
            {field("Short description", "blurb")}
            {field("Badge (optional)", "badge", "text", "Drop 01")}
            <label className="block text-xs text-bone/75">
              Details (one per line)
              <textarea
                className={input}
                rows={3}
                value={d.details}
                onChange={(e) => set("details", e.target.value)}
              />
            </label>
            <label className="block text-xs text-bone/75">
              Tags (separate with commas)
              <textarea
                className={input}
                rows={2}
                value={d.tags}
                onChange={(e) => set("tags", e.target.value)}
              />
            </label>
            <div>
              <h3 className="mb-2 text-xs text-bone/75">Mockup (optional)</h3>
              <UploadField
                value={d.mockupUrl}
                onChange={(v) => set("mockupUrl", v)}
                folder="mockups"
                label="Product mockup"
              />
              <p className="mt-2 text-xs text-bone/50">
                A mockup is saved separately. Add it as cover or gallery media
                if you want customers to see it.
              </p>
            </div>
          </div>
        </details>

        <details className="rounded-[4px] border border-bone/10 bg-bone/[0.03] p-4 sm:p-6">
          <summary className="cursor-pointer font-display text-lg">
            Qikink product details
          </summary>
          <p className="mt-3 text-xs leading-relaxed text-bone/55">
            Optional reference information. These fields do not decide which
            order SKU is sent to Qikink.
          </p>
          <div className="mt-4 space-y-4">
            {field(
              "Qikink product ID",
              "qikinkProductId",
              "text",
              "Digits only",
            )}
            {field("Qikink product type / model", "qikinkProductType")}
            <label className="block text-xs text-bone/75">
              Default print method for new variants
              <select
                aria-label="Default print method for new variants"
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
        </details>

        <details className="rounded-[4px] border border-bone/10 bg-bone/[0.03] p-4 sm:p-6">
          <summary className="cursor-pointer font-display text-lg">
            Advanced print-file settings
          </summary>
          <p className="mt-3 text-xs leading-relaxed text-bone/55">
            These older settings are separate from the Design SKU above. Keep
            existing values unless you mean to replace them. Saving does not
            submit a printing order.
          </p>
          <div className="mt-4 space-y-4">
            {field("Legacy SKU prefix", "skuPrefix")}
            {field("Legacy design code (max 20)", "designCode")}
            {field("Placement (fr/bk/lp/rp/rs/ls)", "placementSku")}
            {field("Width (inches)", "widthInches", "number")}
            {field("Height (inches)", "heightInches", "number")}
            <div>
              <h3 className="mb-2 text-xs">
                Print-ready design file (optional)
              </h3>
              <UploadField
                value={d.designUrl}
                onChange={(v) => set("designUrl", v)}
                folder="designs"
                label="Print-ready design file"
                preview={false}
              />
            </div>
          </div>
        </details>
      </aside>
    </form>
  );
}
