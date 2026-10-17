-- Company auth + portal (run in Supabase SQL Editor)

create table if not exists public.company_users (
  id uuid references auth.users(id) on delete cascade primary key,
  created_at timestamptz default now() not null,
  company_id uuid references public.companies(id),
  email text not null,
  full_name text not null,
  title text,
  email_confirmed boolean default false
);

alter table public.company_users enable row level security;

create policy "Company users can view their own record"
  on public.company_users for select
  using (auth.uid() = id);

create policy "Company users can update their own record"
  on public.company_users for update
  using (auth.uid() = id);

create policy "Company users can insert their own record"
  on public.company_users for insert
  with check (auth.uid() = id);

create policy "Admins can manage company users"
  on public.company_users for all
  using (public.is_admin());

alter table public.job_postings
  add column if not exists approval_status text default 'approved',
  add column if not exists submitted_by text default 'admin',
  add column if not exists rejection_reason text;

create policy "Company users can insert their own job postings"
  on public.job_postings for insert
  with check (
    auth.uid() in (
      select cu.id from public.company_users cu
      where cu.company_id = job_postings.company_id
    )
  );

create policy "Company users can view their own company postings"
  on public.job_postings for select
  using (
    auth.uid() in (
      select cu.id from public.company_users cu
      where cu.company_id = job_postings.company_id
    )
  );

create policy "Company users can update own company postings"
  on public.job_postings for update
  using (
    auth.uid() in (
      select cu.id from public.company_users cu
      where cu.company_id = job_postings.company_id
    )
  );

create policy "Company users can view their company"
  on public.companies for select
  using (
    id in (
      select company_id from public.company_users where id = auth.uid()
    )
  );

create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamptz default now() not null,
  type text not null,
  title text not null,
  body text,
  metadata jsonb default '{}',
  read boolean default false
);

alter table public.notifications enable row level security;

create policy "Only admins can view notifications"
  on public.notifications for select
  using (public.is_admin());

create policy "Only admins can update notifications"
  on public.notifications for update
  using (public.is_admin());

create policy "Authenticated can insert portal notifications"
  on public.notifications for insert
  with check (
    auth.uid() is not null
    and type in ('new_job_pending', 'new_company_signup', 'new_student')
  );

create policy "Company users can view matches on their jobs"
  on public.match_results for select
  using (
    job_posting_id in (
      select jp.id
      from public.job_postings jp
      inner join public.company_users cu on cu.company_id = jp.company_id
      where cu.id = auth.uid()
    )
  );

create policy "Company users can view matched student profiles"
  on public.profiles for select
  using (
    id in (
      select mr.student_id
      from public.match_results mr
      join public.job_postings jp on jp.id = mr.job_posting_id
      join public.company_users cu on cu.company_id = jp.company_id
      where cu.id = auth.uid()
    )
  );

do $$
begin
  raise notice '✅ Schema v5 applied — company auth ready';
end $$;
