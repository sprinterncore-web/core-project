-- Optional one-time grant for existing students (run in SQL Editor if needed).
-- v10 already adds portal_access / waitlist_submitted_at.

alter table public.profiles
  add column if not exists portal_access boolean default false,
  add column if not exists waitlist_submitted_at timestamptz;

-- Grant portal to students who already completed a real profile (no account_type column in this schema).
update public.profiles
set portal_access = true
where full_name is not null
  and university is not null
  and portal_access = false;
