# Existing storefront content

The admin panel is product-only: list products, create a product, upload images,
and edit or delete existing products. `/admin` opens `/admin/products`.

Website builder, homepage settings, journal editing, global settings, orders,
and messages are not exposed in the admin UI or admin API. Old admin section
URLs redirect to Products. Product creation does not require a starter-site
migration. Product image uploads still use the private, authenticated admin
upload endpoint and the public `gamana-media` bucket.

Existing website content is preserved in Supabase and continues to render on
the public site. Removing the admin builder does not delete site pages, journal
posts, global settings, catalogue records, or media.

## Developer-only content recovery

The starter catalogue and page copy remain in `src/data/legacy-site-content.ts`
for recovery; they are not a website builder or an admin feature. To generate a
transactional, non-destructive SQL recovery import:

```sh
npm ci
npm run import:sql --silent > /tmp/gamana-site-import.sql
```

Review the generated SQL before running it in the correct project's Supabase
SQL editor, after applying `src/lib/supabase-admin-schema.sql`. No credentials
are included. Existing slugs and settings are preserved. The storefront cache
may take up to 60 seconds to reflect external database changes.

Bundled starter images use `/images/` paths from `public/images`. Keep those
assets in future deployments. New product and replacement images can be
uploaded through the product editor.
