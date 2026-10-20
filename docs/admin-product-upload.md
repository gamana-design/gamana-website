# Adding a product from Qikink

## Simple steps for the owner

The product form has four numbered steps. You can save a hidden draft at any time and finish it later.

1. Open **Admin → Add product**. Enter the product name, price and an optional description. That price applies to every size. Shipping across India stays free.
2. Add a **Main photo**. This is the first photo customers see. Photos can be up to 25 MB and keep their original quality. Add more photos only if you want. Upload your own product photos; do not use an image from Qikink as a substitute.
3. Add the sizes and colour you sell. Enter only the sizes you have confirmed; new sizes start as not for sale. Choose **Yes** under **In stock?** only when that size is ready to sell. You can leave the Qikink order code empty while testing.
4. Choose **Keep hidden** to save a draft, or **Show in shop** when you are ready. To show a product, it needs a main photo, a price above ₹0 and at least one size.
5. Press **Save draft** or **Save product**. Check the message under the button to see what happened.

### Qikink codes and testing

The **Qikink order code** is used only for a live order. Enter it only after Qikink confirms the exact code for that size. Product SKU, Design SKU and Store SKU are different codes; the form never copies them into the order code.

A product with any missing confirmed order code is marked **For testing only**. It can be used in test checkout while test payments are enabled, but live checkout blocks the whole product until every size has a confirmed order code. Test checkout does not send a print or shipping order to Qikink. Do not guess the code or submit a real order to check it.

Extra photos, mockups, categories and other less-used product settings are optional. Supplier codes and print-file settings are tucked away under **Qikink and print settings**. Leave those alone unless you have the correct information.

**Saving a product does not send a Qikink order, charge money, or change payment mode.** There is no real-order button on this form. The separate existing admin Qikink API is unchanged.

The CSV discussed with the owner is only a summary. This form does not import it or fill in missing photos, variant codes, stock or prices automatically. Any placeholders are examples, not imported values.

## Release notes for the agent / maintainer

- Production migration `add_admin_password_storage` was installed on 20 October 2026. It created an empty password table, enabled row-level security, denied browser roles access and granted the server role access. The empty table was verified; no password was changed.
- Production storage migration `add_admin_product_upload_fields` was installed on 20 October 2026 for this release. All 7 existing products and 32 variations were verified unchanged using before/after fingerprints of their original fields. No products were imported or orders submitted.
- Before deploying the product form, apply `src/lib/product-upload-schema.sql` to the existing database after the baseline `supabase-admin-schema.sql` tables exist. The migration is additive and repeatable, adds the separate reference columns, and creates `gamana_save_product` for transactional saves. Do not seed or replace the existing catalogue.
- It enables RLS and revokes browser-role access to the two catalogue tables to protect supplier costs. Storefront reads continue through the existing server-side service-role client. Verify any existing policies/integrations before rollout.
- The save function is executable only by `service_role`. The existing authenticated admin routes validate the whole draft before invoking it. It saves the product and variations together or rolls everything back.
- Image files are not sent through the serverless admin route. The authenticated route issues a one-file signed Storage upload ticket; the browser then sends the original file directly to the public `gamana-media` bucket. The service-role key stays server-side. The admin form validates file type and caps files at 25 MB; the Storage bucket enforces the same 25 MB maximum.
- Public catalogue projection excludes supplier costs, Qikink references and admin-only print file settings. The established `sku` field is unchanged; Product SKU and Store SKU do not automatically become fulfilment SKUs.
- Products with any blank confirmed order SKU may be Active for testing. The storefront labels them **Test only**; the order API blocks the whole product in live mode before saving an order or creating a Razorpay order. Test-mode fulfilment exits before Qikink. This uses the existing schema and changes no product data.
- `npm test` includes real in-memory Postgres migration/rollback/access tests. Browser QA used an isolated local database and synthetic products; it did not touch Supabase, Qikink, Razorpay or production records.
- For future fresh installations, apply the storage migration before deploying this form. Do not activate live payments or alter the paused colour scheme.
