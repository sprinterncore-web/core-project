-- Student sprint profile extensions (run in Supabase SQL Editor)

alter table public.profiles
  add column if not exists skill_proofs jsonb default '[]',
  add column if not exists availability_hours jsonb default '{}',
  add column if not exists sprint_pitch text,
  add column if not exists best_project_url text,
  add column if not exists best_project_name text;

do $$
begin
  raise notice '✅ Schema v8 — profile extensions added';
end $$;
