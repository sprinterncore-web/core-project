-- ─────────────────────────────────────────────
-- COMPANY WAITLIST TABLE (no auth account)
-- ─────────────────────────────────────────────
create table if not exists public.company_waitlist (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamptz default now() not null,

  -- Contact
  first_name text not null,
  last_name text not null,
  email text not null unique,
  founder_title text not null,

  -- Company
  company_name text not null,
  team_size text not null,
  website text,
  linkedin_url text,

  -- Sprint scope
  project_type text not null,
  skills text[] default '{}',
  requires_specific_major boolean default false,
  required_major text,
  sprint_duration text not null,
  payout_amount integer,
  hours_per_week integer,
  reporting_to text,
  additional_context text,

  -- Status
  status text default 'waitlist',
  -- 'waitlist' | 'contacted' | 'onboarded'
  notes text,
  calendly_booked boolean default false
);

alter table public.company_waitlist enable row level security;

-- Only admins can read/write waitlist
create policy "Admins can manage company waitlist"
  on public.company_waitlist for all
  using (auth.uid() in (select id from public.admins));

-- Anyone can insert (public signup)
create policy "Anyone can submit to waitlist"
  on public.company_waitlist for insert
  with check (true);

-- ─────────────────────────────────────────────
-- ADD WAITLIST FLAG TO STUDENT PROFILES
-- ─────────────────────────────────────────────
alter table public.profiles
  add column if not exists portal_access boolean default false,
  add column if not exists waitlist_submitted_at timestamptz;

-- Existing users who completed onboarding get access
update public.profiles
  set portal_access = true
  where onboarding_complete = true
  and portal_access = false;

-- ─────────────────────────────────────────────
-- NOTIFICATIONS: waitlist types
-- ─────────────────────────────────────────────
drop policy if exists "Authenticated can insert portal notifications" on public.notifications;

create policy "Authenticated can insert portal notifications"
  on public.notifications for insert
  with check (
    auth.uid() is not null
    and type in (
      'new_job_pending',
      'new_company_signup',
      'new_student',
      'new_student_waitlist',
      'new_company_waitlist'
    )
  );

create policy "Anyone can insert company waitlist notifications"
  on public.notifications for insert
  with check (type = 'new_company_waitlist');

do $$
begin
  raise notice '✅ Schema v10 — waitlist tables ready';
end $$;
