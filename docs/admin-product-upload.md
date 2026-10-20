# Adding a product from Qikink

## What the owner does

The editor now follows a simpler product-page flow: **Product**, **Media**, **Variants**, then **Status** and **Organization**. Less-used supplier and print-file fields are tucked into expandable sections; existing values are preserved.

1. Open **Admin → New product**.
2. Enter the title, description and price. The price applies to every size.
3. In **Media**, upload a **Cover photo** and any gallery photos. A gallery image or separate mockup does not replace the cover. Images keep their original quality up to 25 MB; no resizing or compression is applied.
4. In **Variants**, add sizes and a colour. Set availability for each size. If you need them, open **Other Qikink references and cost** to enter Product SKU, Design SKU, Store SKU and supplier cost.
5. **Confirmed order SKU** is different: it is the exact identifier this website sends to Qikink for a live order. The form will not copy Product SKU, Design SKU or Store SKU into it. Ask Qikink which value it expects for your saved variation, then enter that confirmed value for each size. Do not guess.
6. Choose **Draft** or **Active** under **Status**. An Active product needs a cover photo, price above ₹0 and at least one variation. You may leave the order SKU blank while testing. If any variation is missing its confirmed order SKU, the product is marked **Test only**: test checkout can be used while test payments are enabled, but live checkout blocks the whole product until every variation has a confirmed SKU. Test checkout does not send a print or shipping order to Qikink. Keep **Draft** selected if you want the item hidden from the shop.
7. Optional settings such as tags, mockups, Qikink product references and older print-file settings are in the expandable sections on the right.

**Saving a product does not send a Qikink order, charge money, or change payment mode.** There is no real-order button on this upload form. The separate existing admin Qikink API is unchanged.

The CSV discussed with the owner is only a summary. This form does not import it or fill in missing images, variant codes, stock or prices automatically. Any placeholders are examples, not imported values.

## Release notes for the agent / maintainer

- Production storage migration `add_admin_product_upload_fields` was installed on 20 October 2026 for this release. All 7 existing products and 32 variations were verified unchanged using before/after fingerprints of their original fields. No products were imported or orders submitted.
- Before deploying the new form, apply `src/lib/product-upload-schema.sql` to the existing database after the baseline `supabase-admin-schema.sql` tables exist. The migration is additive and repeatable, adds the separate reference columns, and creates `gamana_save_product` for transactional saves. Do not seed or replace the existing catalogue.
- It enables RLS and revokes browser-role access to the two catalogue tables to protect supplier costs. Storefront reads continue through the existing server-side service-role client. Verify any existing policies/integrations before rollout.
- The save function is executable only by `service_role`. The existing authenticated admin routes validate the whole draft before invoking it. It saves the product and variations together or rolls everything back.
- Image files are not sent through the serverless admin route. The authenticated route issues a one-file signed Storage upload ticket; the browser then sends the original file directly to the public `gamana-media` bucket. The service-role key stays server-side. The admin form validates file type and caps files at 25 MB; the Storage bucket enforces the same 25 MB maximum.
- Public catalogue projection excludes supplier costs, Qikink references and admin-only print file settings. The established `sku` field is unchanged; Product SKU and Store SKU do not automatically become fulfilment SKUs.
- Products with any blank confirmed order SKU may be Active for testing. The storefront labels them **Test only**; the order API blocks the whole product in live mode before saving an order or creating a Razorpay order. Test-mode fulfilment exits before Qikink. This uses the existing schema and changes no product data.
- `npm test` includes real in-memory Postgres migration/rollback/access tests. Browser QA used an isolated local database and synthetic products; it did not touch Supabase, Qikink, Razorpay or production records.
- For future fresh installations, apply the storage migration before deploying this form. Do not activate live payments or alter the paused colour scheme.
