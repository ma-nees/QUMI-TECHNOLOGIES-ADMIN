-- ==============================================================================
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/plbxmimzojtxoehxwmuz/sql/new
-- ==============================================================================

-- 1. Create table if not exists
create table if not exists public.company_settings (
  id integer primary key default 1,
  email text,
  location text,
  mobile_number text,
  twitter_url text,
  linkedin_url text,
  facebook_url text,
  instagram_url text,
  reddit_url text,
  threads_url text,
  created_at timestamptz not null default now()
);

-- 2. Ensure all columns exist
alter table public.company_settings add column if not exists email text;
alter table public.company_settings add column if not exists location text;
alter table public.company_settings add column if not exists mobile_number text;
alter table public.company_settings add column if not exists twitter_url text;
alter table public.company_settings add column if not exists linkedin_url text;
alter table public.company_settings add column if not exists facebook_url text;
alter table public.company_settings add column if not exists instagram_url text;
alter table public.company_settings add column if not exists reddit_url text;
alter table public.company_settings add column if not exists threads_url text;

-- 3. Upsert default contact details into row 1
insert into public.company_settings (id, email, location, mobile_number)
values (1, 'hello@qumi.tech', 'Kathmandu, Nepal', '+977 1-0000000')
on conflict (id) do update set
  email = excluded.email,
  location = excluded.location,
  mobile_number = excluded.mobile_number;

-- 4. Enable Row Level Security (RLS)
alter table public.company_settings enable row level security;

-- 5. Grant permissions to roles
grant select on public.company_settings to anon, authenticated;
grant select, insert, update on public.company_settings to authenticated;
grant all on public.company_settings to service_role;

-- 6. Setup Policies (safe to re-run multiple times)
drop policy if exists "public read company settings" on public.company_settings;
create policy "public read company settings" on public.company_settings
  for select to anon, authenticated
  using (true);

drop policy if exists "admin update company settings" on public.company_settings;
create policy "admin update company settings" on public.company_settings
  for update to authenticated
  using (true)
  with check (true);

drop policy if exists "admin insert company settings" on public.company_settings;
create policy "admin insert company settings" on public.company_settings
  for insert to authenticated
  with check (true);
