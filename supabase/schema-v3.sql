-- ─────────────────────────────────────────────
-- ADMINS TABLE
-- ─────────────────────────────────────────────
create table if not exists public.admins (
  id uuid references auth.users(id) on delete cascade primary key,
  created_at timestamptz default now() not null,
  email text not null unique,
  full_name text,
  role text default 'admin'  -- 'admin' | 'super_admin'
);

alter table public.admins enable row level security;

-- Only admins can read the admins table
create policy "Admins can view admin list"
  on public.admins for select
  using (auth.uid() in (select id from public.admins));

-- ─────────────────────────────────────────────
-- COMPANIES TABLE
-- ─────────────────────────────────────────────
create table if not exists public.companies (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamptz default now() not null,
  
  -- Basic info
  company_name text not null,
  company_initial text not null,
  website text,
  industry text,
  stage text not null,        -- 'Pre-Seed' | 'Seed Stage' | 'Series A' | 'Series B' | 'YC W24' etc.
  company_size text,          -- '1-10' | '11-50' | '51-200'
  location text,
  description text,
  
  -- Contact
  contact_name text not null,
  contact_email text not null,
  contact_title text,
  
  -- Status
  status text default 'pending',  -- 'pending' | 'active' | 'inactive'
  call_booked boolean default false,
  call_notes text,               -- notes from the onboarding call
  
  -- Access
  platform_access boolean default false,
  access_granted_at timestamptz
);

alter table public.companies enable row level security;

-- Only admins can do anything with companies
create policy "Admins can manage companies"
  on public.companies for all
  using (auth.uid() in (select id from public.admins));

-- ─────────────────────────────────────────────
-- UPDATE JOB POSTINGS TABLE — add company reference
-- ─────────────────────────────────────────────
alter table public.job_postings
  add column if not exists company_id uuid references public.companies(id),
  add column if not exists notes text,
  add column if not exists created_by uuid references auth.users(id);

-- ─────────────────────────────────────────────
-- INSERT FIRST ADMIN (sprinterncore@gmail.com)
-- Run AFTER the user has signed up through /auth/signup
-- Replace the email below if needed
-- ─────────────────────────────────────────────
insert into public.admins (id, email, full_name, role)
select id, email, 'Sprintern Admin', 'super_admin'
from auth.users
where email = 'sprinterncore@gmail.com'
on conflict (email) do nothing;

-- ─────────────────────────────────────────────
-- Admin RLS for profiles, jobs, matches (panel access)
-- ─────────────────────────────────────────────
create policy "Admins can view all profiles"
  on public.profiles for select
  using (auth.uid() in (select id from public.admins));

create policy "Admins can update all profiles"
  on public.profiles for update
  using (auth.uid() in (select id from public.admins));

create policy "Admins can manage job postings"
  on public.job_postings for all
  using (auth.uid() in (select id from public.admins));

create policy "Admins can manage match results"
  on public.match_results for all
  using (auth.uid() in (select id from public.admins));

create policy "Students can upsert own match results"
  on public.match_results for insert
  with check (auth.uid() = student_id);

create policy "Students can update own match results"
  on public.match_results for update
  using (auth.uid() = student_id);

do $$
begin
  raise notice '✅ Schema v3 applied — admin panel ready';
end $$;
