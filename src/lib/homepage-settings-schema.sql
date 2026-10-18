create table if not exists public.gamana_homepage_settings (
  id integer primary key check (id = 1),
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.gamana_homepage_settings enable row level security;
