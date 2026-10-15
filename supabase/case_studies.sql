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

-- Seed default case studies
insert into public.case_studies (id, title, client, industry, problem, solution, technology, result, image_url, is_published)
values
(
  'e6c0c2a2-3b24-4f9e-9d22-77e8a9391001',
  'Digital Lending & Automated Underwriting Platform',
  'Apex Financial Services',
  'FinTech',
  'Manual loan origination across 40+ branch offices caused 5 to 7 day processing delays, high overhead, and inconsistent audit trails.',
  'Architected an enterprise web platform with automated credit score computation, multi-tier approval workflows, and instant biometric KYC verification.',
  'React, Node.js, PostgreSQL, Docker, AWS KMS',
  'Reduced average loan turnaround time from 5 days to under 2 hours, processing $18M in quarterly originations with zero compliance violations.',
  'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
  true
),
(
  'e6c0c2a2-3b24-4f9e-9d22-77e8a9391002',
  'Fleet & Real-Time Logistics Telemetry Dispatch',
  'Metro Express Logistics',
  'Logistics',
  'Dispatchers lacked live visibility into 500+ commercial transport vehicles, resulting in route delays, idle fuel waste, and manual phone coordination.',
  'Engineered a low-latency GPS stream processing pipeline, live central dispatcher command console, and offline-resilient mobile apps for fleet drivers.',
  'React Native, Go, AWS IoT Core, Redis, TimescaleDB',
  'Eliminated 28% of route deadhead mileage, cut dispatcher overhead by 40 hours weekly, and achieved a 99.4% on-time delivery metric.',
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
  true
),
(
  'e6c0c2a2-3b24-4f9e-9d22-77e8a9391003',
  'Clinical Patient Records & Teleconsultation Portal',
  'CarePlus Medical Group',
  'Healthcare',
  'Paper-heavy patient charting, long clinic waiting queues, and telephone appointment bottlenecks created administrative friction and patient dissatisfaction.',
  'Developed a secure, HIPAA-compliant patient portal with automated appointment booking, multi-doctor calendar sync, and encrypted lab report delivery.',
  'Next.js, Python, FastAPI, Azure Health Data Services, PostgreSQL',
  'Handling 14,000+ monthly appointments with zero double-bookings, reducing clinic waiting room wait times by 65% in the first quarter of deployment.',
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
  true
)
on conflict (id) do nothing;
