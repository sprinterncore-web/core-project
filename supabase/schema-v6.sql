-- Soft delete columns + RLS updates (run in Supabase SQL Editor)

alter table public.profiles
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted boolean default false;

alter table public.companies
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted boolean default false;

alter table public.job_postings
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted boolean default false;

alter table public.company_users
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted boolean default false;

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id and deleted = false);

drop policy if exists "Anyone can view active job postings" on public.job_postings;
create policy "Anyone can view active job postings"
  on public.job_postings for select
  using (is_active = true and deleted = false);

do $$
begin
  raise notice '✅ Schema v6 — soft delete columns added';
end $$;
