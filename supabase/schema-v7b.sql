-- Fix company access to applications + applicant profiles (run in SQL Editor)

drop policy if exists "Company users can view their applications"
  on public.applications;

create policy "Company users can view their applications"
  on public.applications for select
  using (
    company_id in (
      select cu.company_id
      from public.company_users cu
      where cu.id = auth.uid()
        and cu.company_id is not null
    )
  );

drop policy if exists "Company users can update application status"
  on public.applications;

create policy "Company users can update application status"
  on public.applications for update
  using (
    company_id in (
      select cu.company_id
      from public.company_users cu
      where cu.id = auth.uid()
        and cu.company_id is not null
    )
  );

-- Nested student:profiles(*) on applications requires this (additive RLS policy)
drop policy if exists "Company users can view applicant profiles"
  on public.profiles;

create policy "Company users can view applicant profiles"
  on public.profiles for select
  using (
    id in (
      select a.student_id
      from public.applications a
      where a.company_id in (
        select cu.company_id
        from public.company_users cu
        where cu.id = auth.uid()
          and cu.company_id is not null
      )
    )
  );

do $$
begin
  raise notice '✅ Schema v7b — company applications RLS fixed';
end $$;
