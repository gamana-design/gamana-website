-- GAMANA — database schema
-- Run once against the Supabase project (davgdipioxtgaasoehpb).

create extension if not exists "pgcrypto";

-- Newsletter sign-ups -------------------------------------------------------
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  line text,
  source text default 'website',
  created_at timestamptz not null default now()
);

-- Contact messages ----------------------------------------------------------
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  handled boolean not null default false,
  created_at timestamptz not null default now()
);

-- Orders --------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  email text not null,
  full_name text not null,
  phone text not null,
  address1 text not null,
  address2 text,
  city text not null,
  province text not null,
  zip text not null,
  country_code text not null default 'IN',
  payment_gateway text not null default 'Prepaid' check (payment_gateway in ('COD','Prepaid')),
  total_order_value numeric(10,2) not null,
  status text not null default 'placed',
  qikink_order_id bigint,
  qikink_reference text,
  qikink_status text,
  tracking_link text,
  awb text,
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null,
  product_slug text not null,
  product_name text not null,
  line text,
  sku text not null,
  size text,
  color text,
  quantity int not null default 1,
  unit_price numeric(10,2) not null
);

create table if not exists public.product_feedback (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null,
  email text,
  rating int check (rating between 1 and 5),
  body text,
  created_at timestamptz not null default now()
);

-- Indexes -------------------------------------------------------------------
create index if not exists orders_email_idx on public.orders (email);
create index if not exists orders_created_idx on public.orders (created_at desc);
create index if not exists order_items_order_idx on public.order_items (order_id);
create index if not exists contact_created_idx on public.contact_messages (created_at desc);

-- Row level security -------------------------------------------------------
alter table public.newsletter_subscribers enable row level security;
alter table public.contact_messages enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.product_feedback enable row level security;

-- Server-side writes use the service role, which bypasses RLS. These policies
-- keep the anon key read-only and deny anything that is not an admin.
drop policy if exists "newsletter_no_anon" on public.newsletter_subscribers;
create policy "newsletter_no_anon" on public.newsletter_subscribers for all to anon using (false) with check (false);

drop policy if exists "contact_no_anon" on public.contact_messages;
create policy "contact_no_anon" on public.contact_messages for all to anon using (false) with check (false);

drop policy if exists "orders_no_anon" on public.orders;
create policy "orders_no_anon" on public.orders for all to anon using (false) with check (false);

drop policy if exists "order_items_no_anon" on public.order_items;
create policy "order_items_no_anon" on public.order_items for all to anon using (false) with check (false);

drop policy if exists "feedback_no_anon" on public.product_feedback;
create policy "feedback_no_anon" on public.product_feedback for all to anon using (false) with check (false);
