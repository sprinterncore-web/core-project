-- Applications + interview pipeline (run in Supabase SQL Editor)

create table if not exists public.applications (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamptz default now() not null,
  student_id uuid references public.profiles(id) on delete cascade,
  job_posting_id uuid references public.job_postings(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  pitch text not null,
  resume_link text,
  proposed_slot_1 timestamptz not null,
  proposed_slot_2 timestamptz,
  proposed_slot_3 timestamptz,
  status text default 'pending',
  company_response_at timestamptz,
  decline_reason text,
  confirmed_slot timestamptz,
  deleted boolean default false,
  unique(student_id, job_posting_id)
);

alter table public.applications enable row level security;

create policy "Students can view own applications"
  on public.applications for select
  using (auth.uid() = student_id);

create policy "Students can submit applications"
  on public.applications for insert
  with check (auth.uid() = student_id);

create policy "Students can update own applications"
  on public.applications for update
  using (auth.uid() = student_id);

create policy "Company users can view their applications"
  on public.applications for select
  using (
    company_id in (
      select company_id from public.company_users
      where id = auth.uid()
    )
  );

create policy "Company users can update application status"
  on public.applications for update
  using (
    company_id in (
      select company_id from public.company_users
      where id = auth.uid()
    )
  );

create policy "Admins can manage applications"
  on public.applications for all
  using (public.is_admin());

do $$
begin
  raise notice '✅ Schema v7 — applications table ready';
end $$;
