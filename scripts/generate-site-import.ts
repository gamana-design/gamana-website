/** Run with `npm run import:sql --silent` and execute in the Supabase SQL editor.
 * Uses the same bundled content as the admin importer. No credentials required.
 */
import {
  legacyProducts,
  legacyPages,
  legacyJournalPosts,
  legacySiteSettings,
} from "../src/data/legacy-site-content";

const json = (value: unknown) =>
  `$gamana$${JSON.stringify(value)}$gamana$::jsonb`;
const productRows = legacyProducts.map((p, position) => ({
  slug: p.slug,
  name: p.name,
  line: p.line,
  category: p.category,
  price: p.price,
  compare_at: p.compareAt ?? null,
  image: p.image,
  gallery: p.gallery,
  blurb: p.blurb,
  description: p.description,
  details: p.details,
  tags: p.tags,
  badge: p.badge ?? null,
  featured: p.featured ?? false,
  is_new: p.isNew ?? false,
  active: true,
  position,
  print_type_id: p.printTypeId,
  variants: p.variants,
}));
console.log(`-- Non-destructive, transactional starter-content import. Safe to rerun.
begin;
select pg_advisory_xact_lock(hashtext('gamana-site-import'));
with seed as (
  select * from jsonb_to_recordset(${json(productRows)}) as p(
    slug text, name text, line text, category text, price numeric, compare_at numeric,
    image text, gallery jsonb, blurb text, description text, details jsonb, tags jsonb,
    badge text, featured boolean, is_new boolean, active boolean, position integer, print_type_id integer, variants jsonb
  )
), inserted as (
  insert into public.gamana_products (slug,name,line,category,price,compare_at,image,gallery,blurb,description,details,tags,badge,featured,is_new,active,position,print_type_id)
  select slug,name,line,category,price,compare_at,image,gallery,blurb,description,details,tags,badge,featured,is_new,active,position,print_type_id from seed
  on conflict (slug) do nothing returning id,slug
)
insert into public.gamana_product_variants (product_id,size,color,sku,print_type_id,stock,position)
select i.id,v.item->>'size',v.item->>'color',v.item->>'sku',(v.item->>'printTypeId')::integer,v.item->>'stock',v.ordinality::integer-1
from inserted i join seed s using(slug) cross join lateral jsonb_array_elements(s.variants) with ordinality as v(item,ordinality);
insert into public.gamana_site_pages (slug,title,description,sections,active)
select slug,title,description,sections,active from jsonb_to_recordset(${json(legacyPages)}) as p(slug text,title text,description text,sections jsonb,active boolean)
on conflict (slug) do nothing;
insert into public.gamana_journal_posts (slug,title,excerpt,category,read_time,published_at,image,body,active,position)
select slug,title,excerpt,category,read_time,published_at,image,body,active,position from jsonb_to_recordset(${json(legacyJournalPosts)}) as j(slug text,title text,excerpt text,category text,read_time text,published_at date,image text,body jsonb,active boolean,position integer)
on conflict (slug) do nothing;
insert into public.gamana_site_settings (id,content)
values (1, ${json(legacySiteSettings)} || jsonb_build_object('migrationCompletedAt',now()))
on conflict (id) do update set content = excluded.content || gamana_site_settings.content,
updated_at = now();
commit;`);
