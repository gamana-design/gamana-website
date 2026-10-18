create table if not exists gamana_products (id uuid primary key default gen_random_uuid(), slug text unique not null, name text not null, line text not null default 'URBAN' check (line in ('URBAN','CORE')), category text not null default 'T-Shirts', price numeric(10,2) not null default 0, compare_at numeric(10,2), image text not null default '', gallery jsonb not null default '[]'::jsonb, blurb text not null default '', description text not null default '', details jsonb not null default '[]'::jsonb, tags jsonb not null default '[]'::jsonb, badge text, featured boolean not null default false, is_new boolean not null default false, print_type_id integer not null default 1, sku_prefix text not null default '', design_code text, design_url text, mockup_url text, placement_sku text not null default 'fr', width_inches numeric(6,2), height_inches numeric(6,2), active boolean not null default true, position integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists gamana_product_variants (id uuid primary key default gen_random_uuid(), product_id uuid not null references gamana_products(id) on delete cascade, size text not null, color text not null, sku text not null, print_type_id integer not null default 1, stock text not null default 'in' check (stock in ('in','low','out')), price numeric(10,2), position integer not null default 0);
create index if not exists gamana_product_variants_product_id_idx on gamana_product_variants(product_id);
create index if not exists gamana_products_active_idx on gamana_products(active);
create table if not exists gamana_admin_log (id uuid primary key default gen_random_uuid(), action text not null, detail text, created_at timestamptz not null default now());
create index if not exists gamana_admin_log_created_at_idx on gamana_admin_log(created_at desc);
insert into storage.buckets(id,name,public) values ('gamana-media','gamana-media',true) on conflict(id) do nothing;
do $$ begin if not exists(select 1 from pg_policies where tablename='objects' and policyname='gamana media public read') then create policy "gamana media public read" on storage.objects for select using(bucket_id='gamana-media'); end if; end $$;

-- Drop-specific homepage copy and switches. Server reads/writes this via the
-- service-role client; no anon policies are required.
create table if not exists public.gamana_homepage_settings (
  id integer primary key check (id = 1),
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.gamana_homepage_settings enable row level security;
