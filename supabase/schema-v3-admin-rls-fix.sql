-- Run in Supabase SQL Editor if admin login redirect fails (RLS blocks self-check)
drop policy if exists "Users can read own admin record" on public.admins;

create policy "Users can read own admin record"
  on public.admins for select
  using (auth.uid() = id);
