-- Company self-serve signup: allow creating companies + reading own company
-- Run in Supabase SQL Editor after schema-v3/v5/v6

drop policy if exists "Authenticated users can create a company" on public.companies;
create policy "Authenticated users can create a company"
  on public.companies for insert
  with check (auth.uid() is not null);

drop policy if exists "Company users can view their company" on public.companies;
create policy "Company users can view their own company"
  on public.companies for select
  using (
    id in (
      select company_id from public.company_users
      where id = auth.uid()
    )
    or public.is_admin()
  );

-- v5 may already define insert on company_users; ensure policy exists
drop policy if exists "Company users can insert their own record" on public.company_users;
drop policy if exists "Users can insert their own company_users row" on public.company_users;
create policy "Users can insert their own company_users row"
  on public.company_users for insert
  with check (auth.uid() = id);

do $$
begin
  raise notice '✅ Schema v6b — company signup RLS policies applied';
end $$;
