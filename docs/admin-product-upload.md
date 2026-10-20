# Adding a product from Qikink

## What the owner does

1. Open **Admin → New product**.
2. Under **Product details**, enter the product name, description and selling price in rupees. The selling price applies to every size. The page address fills itself in from the name; you can change it.
3. Under **Qikink reference**, copy the **Product ID** from your export and the **product type / model** from Qikink. Choose the correct print method. For an all-over printed product, choose **All-over print (AOP) · 2**.
4. Under **Sizes, colours & Qikink codes**, enter sizes separated by commas and the base colour. Copy a checked Product SKU pattern if available, using `{size}` where the size changes. Optionally enter the shared Design SKU and Qikink product cost. Click **Add sizes**. This keeps existing variations and adds only new size/colour combinations.
5. Check each variation against Qikink's **Product Variations** table:
   - **Product SKU**: copy from the Product SKU column.
   - **Design SKU**: copy the complete artwork/placement string. This is not the older short design code.
   - **Store SKU**: copy the full `v-…` value from the Store SKU column.
   - **Qikink product cost**: your supplier cost, not your customer's selling price. This stays private in admin.
   - **Availability**: set this yourself; it is not automatically checked with Qikink.
   - **Confirmed order SKU**: leave this blank until Qikink confirms which identifier selects the saved printed variation. The form never guesses or copies one of the other codes here. Existing products keep their existing order SKUs.
6. Under **Photos & mockups**, upload the cover, gallery photos and optional mockup yourself. **Add gallery photo** adds another upload slot. A separately uploaded mockup is not automatically shown to customers; add it to the cover/gallery too if needed.
7. Leave **Show in shop** off and click **Save draft** while anything is unfinished. Drafts can be saved without a photo or confirmed order codes.
8. Once ready, add a cover photo, a selling price greater than zero, and a confirmed order SKU for every size. Turn on **Show in shop** and click **Save product**.

**Saving a product does not send a Qikink order, charge money, or change payment mode.** There is no real-order button on this upload form. The separate existing admin Qikink API is unchanged.

The CSV discussed with the owner is only a summary. This form does not import it or fill in missing images, variant codes, stock or prices automatically. Any placeholders are examples, not imported values.

## Release notes for the agent / maintainer

- Production storage migration `add_admin_product_upload_fields` was installed on 20 October 2026 for this release. All 7 existing products and 32 variations were verified unchanged using before/after fingerprints of their original fields. No products were imported or orders submitted.
- Before deploying the new form, apply `src/lib/product-upload-schema.sql` to the existing database after the baseline `supabase-admin-schema.sql` tables exist. The migration is additive and repeatable, adds the separate reference columns, and creates `gamana_save_product` for transactional saves. Do not seed or replace the existing catalogue.
- It enables RLS and revokes browser-role access to the two catalogue tables to protect supplier costs. Storefront reads continue through the existing server-side service-role client. Verify any existing policies/integrations before rollout.
- The save function is executable only by `service_role`. The existing authenticated admin routes validate the whole draft before invoking it. It saves the product and variations together or rolls everything back.
- Public catalogue projection excludes supplier costs, Qikink references and admin-only print file settings. The established `sku` field is unchanged; Product SKU and Store SKU do not automatically become fulfilment SKUs.
- `npm test` includes real in-memory Postgres migration/rollback/access tests. Browser QA used an isolated local database and synthetic products; it did not touch Supabase, Qikink, Razorpay or production records.
- For future fresh installations, apply the storage migration before deploying this form. Do not activate live payments or alter the paused colour scheme.
