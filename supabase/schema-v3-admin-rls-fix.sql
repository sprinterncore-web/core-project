-- Fix admin login: "Admins can view admin list" subqueries public.admins
-- and causes infinite recursion (Postgres 42P17). Run once in SQL Editor.

drop policy if exists "Admins can view admin list" on public.admins;

-- Login / middleware: user reads own row (no recursion)
drop policy if exists "Users can read own admin record" on public.admins;

create policy "Users can read own admin record"
  on public.admins for select
  using (auth.uid() = id);

-- Optional: list all admins in panel without recursion
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admins where id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_admin() to anon;

create policy "Admins can view admin list"
  on public.admins for select
  using (public.is_admin());
