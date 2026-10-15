-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  created_at timestamptz default now() not null,
  email text not null,
  full_name text,
  university text,
  graduation_year integer,
  major text,
  linkedin_url text,
  github_url text,
  bio text,
  skills text[] default '{}',
  avatar_url text,
  onboarding_complete boolean default false
);

-- Row Level Security
alter table public.profiles enable row level security;

-- Policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, university, major, graduation_year)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'university',
    new.raw_user_meta_data->>'major',
    (new.raw_user_meta_data->>'graduation_year')::integer
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Print instructions after running
do $$
begin
  raise notice '✅ Sprintern schema created successfully';
  raise notice 'Next: Enable Email provider in Supabase Auth settings';
  raise notice 'Next: Add http://localhost:3000/auth/callback to allowed redirect URLs';
end $$;
