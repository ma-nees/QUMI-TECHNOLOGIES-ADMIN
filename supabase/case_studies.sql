-- Migration: Create case_studies table for project case studies
create table if not exists public.case_studies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  client text,
  industry text not null default 'Technology',
  problem text not null,
  solution text not null,
  technology text not null,
  result text,
  image_url text,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.case_studies enable row level security;

-- Grants
grant select on public.case_studies to anon, authenticated;
grant select, insert, update, delete on public.case_studies to authenticated;
grant all on public.case_studies to service_role;

-- Policies
create policy "public read case studies" on public.case_studies
  for select to anon, authenticated
  using (is_published = true or auth.role() = 'authenticated');

create policy "admin insert case studies" on public.case_studies
  for insert to authenticated
  with check (true);

create policy "admin update case studies" on public.case_studies
  for update to authenticated
  using (true)
  with check (true);

create policy "admin delete case studies" on public.case_studies
  for delete to authenticated
  using (true);
