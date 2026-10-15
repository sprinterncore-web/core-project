-- ─────────────────────────────────────────────
-- EXTEND PROFILES TABLE
-- ─────────────────────────────────────────────
alter table public.profiles
  add column if not exists role_type text,           -- 'developer' | 'designer' | 'growth' | 'data'
  add column if not exists hours_per_week integer,   -- 10 | 15 | 20
  add column if not exists availability text,        -- 'immediate' | '2weeks' | 'nextmonth'
  add column if not exists personal_site text,
  add column if not exists onboarding_step integer default 0,
  add column if not exists sprint_score numeric(3,1) default 0,
  add column if not exists profile_status text default 'pending'; 
  -- 'pending' | 'verified' | 'active'

-- ─────────────────────────────────────────────
-- JOB POSTINGS TABLE (filled by team in master panel)
-- ─────────────────────────────────────────────
create table if not exists public.job_postings (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamptz default now() not null,
  
  -- Company info
  company_name text not null,
  company_initial text not null,        -- e.g. "H" for HyperScale
  company_stage text not null,          -- 'Seed Stage' | 'Series A' | 'YC W24' etc.
  company_tags text[] default '{}',     -- e.g. ['LLM Tooling', 'DevTools']
  
  -- Role info
  role_title text not null,
  lead_engineer_name text not null,
  lead_engineer_title text not null,
  
  -- Sprint details
  payout_amount integer not null,       -- in USD, e.g. 3200
  sprint_duration text not null,        -- e.g. '2-Week Scope'
  hours_per_week integer not null,      -- e.g. 15
  milestone_objective text not null,    -- the paragraph description
  tech_stack text[] default '{}',       -- e.g. ['Next.js 14', 'TypeScript', 'LangChain']
  starts_in_days integer not null,      -- e.g. 3
  
  -- Status
  is_active boolean default true,
  role_type text not null               -- 'developer' | 'designer' | 'growth' | 'data'
);

-- RLS for job postings (public read, only service role can write)
alter table public.job_postings enable row level security;

create policy "Anyone can view active job postings"
  on public.job_postings for select
  using (is_active = true);

-- ─────────────────────────────────────────────
-- AI MATCH RESULTS TABLE (Groq fills this later)
-- ─────────────────────────────────────────────
create table if not exists public.match_results (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamptz default now() not null,
  student_id uuid references public.profiles(id) on delete cascade,
  job_posting_id uuid references public.job_postings(id) on delete cascade,
  match_score integer not null,         -- 0-100, e.g. 99
  match_label text not null,            -- 'STACK FIT'
  groq_reasoning text,                  -- Groq's explanation (filled later)
  is_visible boolean default true,
  unique(student_id, job_posting_id)
);

alter table public.match_results enable row level security;

create policy "Students can view their own matches"
  on public.match_results for select
  using (auth.uid() = student_id);

-- ─────────────────────────────────────────────
-- SEED DUMMY JOB POSTINGS (4 cards from the design)
-- ─────────────────────────────────────────────
insert into public.job_postings (
  company_name, company_initial, company_stage, company_tags,
  role_title, lead_engineer_name, lead_engineer_title,
  payout_amount, sprint_duration, hours_per_week,
  milestone_objective, tech_stack, starts_in_days, role_type
) values
(
  'HyperScale AI', 'H', 'YC W24', ARRAY['LLM Tooling', 'DevTools'],
  'Founding Engineer', 'Alex Rivera', 'ex-Stripe',
  3200, '2-Week Scope', 15,
  'Ship Next.js Playground & LangChain Evaluation Dashboard. Build the developer-facing UI and streaming webhook infrastructure with instantaneous telemetry feedback.',
  ARRAY['Next.js 14', 'TypeScript', 'LangChain', 'Tailwind CSS', 'Webhooks'],
  3, 'developer'
),
(
  'Vektor Health', 'V', 'Seed Stage', ARRAY['Clinical Data Flow', 'React'],
  'Frontend Engineer', 'Dr. Elena Rostova', 'CEO & Founder',
  2800, '2-Week Scope', 15,
  'Build patient intake visualization widgets and HIPAA-compliant form builders with Tailwind & React 19. Integrate validation triggers and real-time state synchronization.',
  ARRAY['React 19', 'TypeScript', 'Tailwind CSS', 'HIPAA Forms', 'State Sync'],
  4, 'developer'
),
(
  'Kernel Data', 'K', 'Series A', ARRAY['Observability', 'Next.js'],
  'Full-Stack Engineer', 'Marcus Vance', 'Head of Infrastructure',
  3500, '4-Week Scope', 16,
  'Implement real-time streaming charts, query latency heatmaps, and telemetry pipeline connectors using Next.js Server Components and ClickHouse data stores.',
  ARRAY['Next.js Server Components', 'ClickHouse', 'TypeScript', 'Streaming Charts'],
  7, 'developer'
),
(
  'DualEntry', 'D', 'Seed Stage', ARRAY['Autonomous AI', 'Finance Ops'],
  'Full-Stack Engineer', 'Samuel Vance', 'CTO & Co-Founder',
  3000, '3-Week Scope', 15,
  'Automated invoice parsing agent review dashboard and human-in-the-loop validation interface. Connect Supabase live triggers to OpenAI function call logs.',
  ARRAY['Supabase', 'OpenAI API', 'TypeScript', 'Next.js'],
  5, 'developer'
);

do $$
begin
  raise notice '✅ Sprintern schema v2 applied successfully';
end $$;
