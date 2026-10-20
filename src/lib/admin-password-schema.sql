create table if not exists public.gamana_admin_passwords (
  id smallint primary key default 1 check (id = 1),
  password_hash text not null,
  updated_at timestamptz not null default now()
);

alter table public.gamana_admin_passwords enable row level security;
revoke all on table public.gamana_admin_passwords from public, anon, authenticated;
grant select, insert, update on table public.gamana_admin_passwords to service_role;

comment on table public.gamana_admin_passwords is
  'Stores the single admin password as a salted PBKDF2 hash. Never store plain-text passwords.';
