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
type ExtraFieldKey =
  | "slug"
  | "compareAt"
  | "badge"
  | "blurb"
  | "qikinkProductId"
  | "qikinkProductType"
  | "skuPrefix"
  | "designCode"
  | "placementSku"
  | "widthInches"
  | "heightInches";

function Section({
  step,
  title,
  hint,
  children,
}: {
  step: string;
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[4px] border border-bone/10 bg-bone/[0.03] p-4 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ember text-sm font-bold text-kalam">
          {step}
        </span>
        <div>
          <h2 className="font-display text-xl">{title}</h2>
          {hint && (
            <p className="mt-1 text-sm leading-relaxed text-bone/60">{hint}</p>
          )}
        </div>
      </div>
      <div className="mt-5 space-y-5">{children}</div>
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
  const [messageRole, setMessageRole] = useState<"alert" | "status">("status");
  const [saving, setSaving] = useState(false);
  const [sizes, setSizes] = useState("");
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
    index: number,
    key: keyof AdminVariant,
    value: string | number | undefined,
  ) {
    set(
      "variants",
      d.variants.map((variant, position) =>
        position === index ? { ...variant, [key]: value } : variant,
      ),
    );
  }

  function extraField(
    label: string,
    key: ExtraFieldKey,
    type = "text",
    placeholder?: string,
  ) {
    return (
      <label className="block text-sm text-bone/75">
        {label}
        <input
          className={input}
          type={type}
          value={d[key] ?? ""}
          placeholder={placeholder}
          min={type === "number" ? 0 : undefined}
          step={type === "number" ? "0.01" : undefined}
          onChange={(event) => {
            const value = event.target.value;
            setDraft((old) =>
              ({
                ...old,
                [key]: type === "number" && value !== "" ? Number(value) : value,
              }) as FormValues,
            );
          }}
        />
      </label>
    );
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setMessage("");
    setMessageRole("status");

    let body;
    try {
      body = validateProductDraft({
        ...d,
        details: d.details.split("\n").filter(Boolean),
        tags: d.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      });
    } catch (error) {
      setMessageRole("alert");
      setMessage(
        error instanceof Error ? error.message : "Please check the product details.",
      );
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(
        d.id ? `/api/admin/products/${d.id}` : "/api/admin/products",
        {
          method: d.id ? "PATCH" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      const result = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(result.error || "Could not save. Please try again.");

      setMessage(
        d.active
          ? missingOrderSkuCount
            ? "Saved. It is in your shop for testing only. Live checkout is blocked until every size has a Qikink-confirmed order SKU."
            : "Saved. It is shown in your shop."
          : "Saved as a draft. Customers cannot see it.",
      );
      if (!d.id) router.replace(`/admin/products/${result.id}`);
      router.refresh();
    } catch (error) {
      setMessageRole("alert");
      setMessage(
        error instanceof Error
          ? error.message
          : "Connection interrupted. Check the product list before trying again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="mx-auto max-w-4xl space-y-5">
      <p className="rounded border border-bone/10 px-4 py-3 text-sm leading-relaxed text-bone/70">
        Follow the four steps. You can save this as a hidden draft and finish it
        later. Customers only see it when you choose “Show in shop.”
      </p>

      <Section
        step="1"
        title="Name and price"
        hint="This is what people see when they shop."
      >
        <label className="block text-sm text-bone/80">
          Product name
          <input
            className={input}
            value={d.name}
            onChange={(event) => {
              const name = event.target.value;
              setDraft((old) => ({
                ...old,
                name,
                slug:
                  !old.id && (!old.slug || old.slug === slugify(old.name))
                    ? slugify(name)
                    : old.slug,
              }));
            }}
            autoComplete="off"
            required
          />
        </label>
        <label className="block text-sm text-bone/80">
          Price (₹)
          <input
            className={input}
            type="number"
            min="0"
            step="0.01"
            value={d.price}
            onChange={(event) =>
              set("price", event.target.value === "" ? 0 : Number(event.target.value))
            }
            required
          />
          <span className="mt-1 block text-xs text-bone/50">
            This price applies to every size. Shipping is free across India.
          </span>
        </label>
        <label className="block text-sm text-bone/80">
          Description for buyers (optional)
          <textarea
            className={input}
            rows={4}
            value={d.description}
            onChange={(event) => set("description", event.target.value)}
            placeholder="What should people know about this product?"
          />
        </label>
      </Section>

      <Section
        step="2"
        title="Add photos"
        hint="Choose a main photo. It is the first picture people see. Photos can be up to 25 MB."
      >
        <div>
          <h3 className="mb-2 text-sm text-bone/80">Main photo</h3>
          <UploadField
            value={d.image}
            onChange={(value) => set("image", value)}
            folder="products"
            label="Main photo"
          />
          <p className="mt-2 text-xs text-bone/50">
            A photo is needed before you can show the product in the shop.
          </p>
        </div>
        <details className="rounded border border-bone/10 p-4">
          <summary className="cursor-pointer text-sm text-bone/80">
            Add more photos (optional)
          </summary>
          <div className="mt-4 space-y-4">
            {d.gallery.map((url, index) => (
              <div className="rounded border border-bone/10 p-3" key={index}>
                <UploadField
                  value={url}
                  onChange={(value) =>
                    set(
                      "gallery",
                      d.gallery.map((old, position) =>
                        position === index ? value : old,
                      ),
                    )
                  }
                  folder="products"
                  label={`Extra photo ${index + 1}`}
                />
                <button
                  type="button"
                  className="mt-2 text-xs text-bone/60 underline"
                  onClick={() =>
                    set(
                      "gallery",
                      d.gallery.filter((_, position) => position !== index),
                    )
                  }
                >
                  Remove this photo
                </button>
              </div>
            ))}
            <button
              type="button"
              className={secondary}
              onClick={() => set("gallery", [...d.gallery, ""])}
            >
              Add another photo
            </button>
          </div>
        </details>
      </Section>

      <Section
        step="3"
        title="Add sizes and colours"
        hint="Add each size you sell in one colour. New sizes start as not for sale. Choose ‘Yes’ when they are ready to sell. You can add another colour later."
      >
        <div className="rounded border border-bone/10 p-4">
          <label className="block text-sm text-bone/80">
            Sizes (use commas, like S, M, L)
            <input
              className={input}
              value={sizes}
              onChange={(event) => setSizes(event.target.value)}
              placeholder="S, M, L"
            />
          </label>
          <label className="mt-4 block text-sm text-bone/80">
            Colour
            <input
              className={input}
              value={color}
              placeholder="For example, White"
              onChange={(event) => setColor(event.target.value)}
            />
          </label>
          <details className="mt-4 rounded border border-bone/10 p-3">
            <summary className="cursor-pointer text-sm text-bone/70">
              Qikink details for these sizes (optional)
            </summary>
            <div className="mt-3 space-y-4">
              <label className="block text-sm text-bone/75">
                Product SKU pattern
                <input
                  aria-label="Product SKU pattern (optional)"
                  className={input}
                  value={template}
                  placeholder="Use {size} if it changes by size"
                  onChange={(event) => setTemplate(event.target.value)}
                />
                <span className="mt-1 block text-xs text-bone/45">
                  Only use a value you have checked with Qikink.
                </span>
              </label>
              <label className="block text-sm text-bone/75">
                Qikink product cost (₹)
                <input
                  className={input}
                  type="number"
                  min="0"
                  step="0.01"
                  value={cost}
                  onChange={(event) => setCost(event.target.value)}
                />
              </label>
              <label className="block text-sm text-bone/75">
                Shared Design SKU
                <textarea
                  className={input}
                  rows={2}
                  value={designSku}
                  onChange={(event) => setDesignSku(event.target.value)}
                  placeholder="Optional"
                />
              </label>
            </div>
          </details>
          <button
            type="button"
            className={`${secondary} mt-4`}
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
                setVariantMessage("Sizes added. Check each one below.");
              } catch (error) {
                setVariantMessage(
                  error instanceof Error
                    ? error.message
                    : "Check the sizes and colour, then try again.",
                );
              }
            }}
          >
            Add these sizes
          </button>
          {variantMessage && (
            <p role="status" className="mt-2 text-sm text-bone/65">
              {variantMessage}
            </p>
          )}
        </div>

        {d.variants.length === 0 ? (
          <p className="text-sm text-bone/55">
            No sizes added yet. You can still save a draft and finish it later.
          </p>
        ) : (
          <div>
            <h3 className="mb-3 text-sm font-semibold">Check the sizes you added</h3>
            <div className="space-y-4">
              {d.variants.map((variant, index) => (
                <fieldset
                  key={index}
                  className="min-w-0 rounded border border-bone/15 p-4"
                >
                  <legend className="px-2 text-sm font-semibold">
                    {variant.color || "Colour not set"} / {variant.size || "Size not set"}
                  </legend>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <label className="text-sm text-bone/75">
                      Size
                      <input
                        className={input}
                        value={variant.size}
                        onChange={(event) =>
                          changeVariant(index, "size", event.target.value)
                        }
                      />
                    </label>
                    <label className="text-sm text-bone/75">
                      Colour
                      <input
                        className={input}
                        value={variant.color}
                        onChange={(event) =>
                          changeVariant(index, "color", event.target.value)
                        }
                      />
                    </label>
                    <label className="text-sm text-bone/75">
                      In stock?
                      <select
                        className={input}
                        value={variant.stock}
                        onChange={(event) =>
                          changeVariant(index, "stock", event.target.value)
                        }
                      >
                        <option value="in">Yes</option>
                        <option value="low">Only a few left</option>
                        <option value="out">No</option>
                      </select>
                    </label>
                  </div>
                  <details className="mt-4 rounded border border-bone/10 p-3">
                    <summary className="cursor-pointer text-sm text-bone/70">
                      Qikink order code (optional while testing)
                    </summary>
                    <label className="mt-3 block text-sm text-bone/75">
                      Confirmed order SKU
                      <input
                        className={input}
                        value={variant.sku}
                        maxLength={50}
                        aria-label={`Confirmed order SKU for ${variant.color} / ${variant.size}`}
                        onChange={(event) =>
                          changeVariant(index, "sku", event.target.value)
                        }
                      />
                    </label>
                    <p className="mt-2 text-xs leading-relaxed text-bone/50">
                      Only enter the exact code Qikink confirmed for this size.
                      Leave it empty for testing. Live checkout blocks this
                      product until every size has its confirmed code.
                    </p>
                  </details>
                  <details className="mt-3 rounded border border-bone/10 p-3">
                    <summary className="cursor-pointer text-sm text-bone/70">
                      Other Qikink details and cost
                    </summary>
                    <div className="mt-3 space-y-4">
                      <label className="block text-sm text-bone/75">
                        Product SKU
                        <input
                          className={input}
                          value={variant.productSku ?? ""}
                          onChange={(event) =>
                            changeVariant(index, "productSku", event.target.value)
                          }
                        />
                      </label>
                      <label className="block text-sm text-bone/75">
                        Store SKU
                        <input
                          className={input}
                          value={variant.storeSku ?? ""}
                          onChange={(event) =>
                            changeVariant(index, "storeSku", event.target.value)
                          }
                        />
                      </label>
                      <label className="block text-sm text-bone/75">
                        Design SKU
                        <textarea
                          className={input}
                          rows={2}
                          value={variant.designSku ?? ""}
                          onChange={(event) =>
                            changeVariant(index, "designSku", event.target.value)
                          }
                        />
                      </label>
                      <label className="block text-sm text-bone/75">
                        Qikink product cost (₹)
                        <input
                          className={input}
                          type="number"
                          min="0"
                          step="0.01"
                          value={variant.productCost ?? ""}
                          onChange={(event) =>
                            changeVariant(
                              index,
                              "productCost",
                              event.target.value === ""
                                ? undefined
                                : Number(event.target.value),
                            )
                          }
                        />
                      </label>
                      <label className="block text-sm text-bone/75">
                        Print method
                        <select
                          className={input}
                          value={variant.printTypeId}
                          onChange={(event) =>
                            changeVariant(
                              index,
                              "printTypeId",
                              Number(event.target.value),
                            )
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
                    className={`${secondary} mt-4`}
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          `Remove ${variant.color} / ${variant.size}? This takes effect when you save.`,
                        )
                      )
                        set(
                          "variants",
                          d.variants.filter((_, position) => position !== index),
                        );
                    }}
                  >
                    Remove this size
                  </button>
                </fieldset>
              ))}
            </div>
          </div>
        )}
      </Section>

      <Section
        step="4"
        title="Choose where to show it"
        hint="Keep it hidden while you are still working, or show it to customers."
      >
        <label className="flex cursor-pointer items-start gap-3 rounded border border-bone/15 p-4">
          <input
            type="radio"
            name="product-visibility"
            checked={!d.active}
            onChange={() => set("active", false)}
            className="mt-1 accent-ember"
          />
          <span>
            <span className="block text-sm font-semibold">Keep hidden</span>
            <span className="mt-1 block text-xs text-bone/55">
              Save it as a draft. Customers cannot see it.
            </span>
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-3 rounded border border-bone/15 p-4">
          <input
            type="radio"
            name="product-visibility"
            checked={d.active}
            onChange={() => set("active", true)}
            className="mt-1 accent-ember"
          />
          <span>
            <span className="block text-sm font-semibold">Show in shop</span>
            <span className="mt-1 block text-xs text-bone/55">
              Customers can see it. Add a main photo, price and at least one size first.
            </span>
          </span>
        </label>

        {d.active && missingOrderSkuCount > 0 && (
          <p
            role="status"
            className="rounded border border-amber-500/25 bg-amber-400/5 p-4 text-sm leading-relaxed text-amber-100"
          >
            For testing only: {missingOrderSkuCount} size
            {missingOrderSkuCount === 1 ? " is" : "s are"} missing a Qikink-confirmed
            order SKU. Test orders are not sent to Qikink. Live checkout blocks
            this product until every size has its confirmed code.
          </p>
        )}

        <details className="rounded border border-bone/10 p-4">
          <summary className="cursor-pointer text-sm text-bone/80">
            More product settings (optional)
          </summary>
          <div className="mt-4 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-bone/75">
                Category
                <select
                  className={input}
                  value={d.category}
                  onChange={(event) =>
                    set("category", event.target.value as FormValues["category"])
                  }
                >
                  {categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </label>
              <label className="block text-sm text-bone/75">
                Collection
                <select
                  className={input}
                  value={d.line}
                  onChange={(event) =>
                    set("line", event.target.value as FormValues["line"])
                  }
                >
                  <option>URBAN</option>
                  <option>CORE</option>
                </select>
              </label>
            </div>
            {extraField("Page address", "slug", "text", "product-name")}
            {extraField("Short description", "blurb")}
            {extraField("Original price (optional)", "compareAt", "number")}
            {extraField("Badge (optional)", "badge", "text", "Drop 01")}
            <label className="block text-sm text-bone/75">
              Details (one per line)
              <textarea
                className={input}
                rows={3}
                value={d.details}
                onChange={(event) => set("details", event.target.value)}
              />
            </label>
            <label className="block text-sm text-bone/75">
              Tags (separate with commas)
              <textarea
                className={input}
                rows={2}
                value={d.tags}
                onChange={(event) => set("tags", event.target.value)}
              />
            </label>
            <div className="flex flex-wrap gap-5">
              <label className="flex items-center gap-2 text-sm text-bone/75">
                <input
                  type="checkbox"
                  checked={d.featured}
                  onChange={(event) => set("featured", event.target.checked)}
                  className="accent-ember"
                />
                Feature this product
              </label>
              <label className="flex items-center gap-2 text-sm text-bone/75">
                <input
                  type="checkbox"
                  checked={d.isNew}
                  onChange={(event) => set("isNew", event.target.checked)}
                  className="accent-ember"
                />
                Mark as new
              </label>
            </div>
            <div>
              <h3 className="mb-2 text-sm text-bone/75">Mockup (optional)</h3>
              <UploadField
                value={d.mockupUrl}
                onChange={(value) => set("mockupUrl", value)}
                folder="mockups"
                label="Product mockup"
              />
              <p className="mt-2 text-xs text-bone/50">
                A mockup is saved separately. Add it as a photo above if you want customers to see it.
              </p>
            </div>
          </div>
        </details>

        <details className="rounded border border-bone/10 p-4">
          <summary className="cursor-pointer text-sm text-bone/80">
            Qikink and print settings (optional)
          </summary>
          <p className="mt-3 text-xs leading-relaxed text-bone/55">
            Only change these if you have the details from Qikink. Product SKU,
            Design SKU, Store SKU and the confirmed order SKU are different
            codes. They are never copied into one another.
          </p>
          <div className="mt-4 space-y-5">
            {extraField("Qikink product ID", "qikinkProductId", "text", "Digits only")}
            {extraField("Qikink product type / model", "qikinkProductType")}
            <label className="block text-sm text-bone/75">
              Default print method for new sizes
              <select
                className={input}
                value={d.printTypeId}
                onChange={(event) => set("printTypeId", Number(event.target.value))}
              >
                {printTypes.map(([id, label]) => (
                  <option value={id} key={id}>
                    {label} · {id}
                  </option>
                ))}
              </select>
            </label>
            <hr className="border-bone/10" />
            {extraField("Legacy SKU prefix", "skuPrefix")}
            {extraField("Legacy design code (max 20)", "designCode")}
            {extraField("Placement (fr/bk/lp/rp/rs/ls)", "placementSku")}
            <div className="grid gap-4 sm:grid-cols-2">
              {extraField("Width (inches)", "widthInches", "number")}
              {extraField("Height (inches)", "heightInches", "number")}
            </div>
            <div>
              <h3 className="mb-2 text-sm">Print-ready design file (optional)</h3>
              <UploadField
                value={d.designUrl}
                onChange={(value) => set("designUrl", value)}
                folder="designs"
                label="Print-ready design file"
                preview={false}
              />
            </div>
          </div>
        </details>

        <button
          disabled={saving}
          className="w-full rounded-full bg-ember px-6 py-3 text-sm font-semibold text-kalam disabled:opacity-50 sm:w-auto sm:min-w-52"
        >
          {saving ? "Saving…" : d.active ? "Save product" : "Save draft"}
        </button>
        <p
          role={messageRole}
          aria-live="polite"
          className="break-words text-sm text-bone/80"
        >
          {message}
        </p>
      </Section>
    </form>
  );
}
