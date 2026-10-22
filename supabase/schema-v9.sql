-- Update profiles table for students
alter table public.profiles
  add column if not exists resume_url text,
  -- Google Drive or uploaded file URL
  add column if not exists supplemental_interests text,
  -- "Describe additional interests / areas of interest"
  add column if not exists required_major boolean default false;

-- Update companies table for founders
alter table public.companies
  add column if not exists team_size text,
  -- '1-5' | '6-15' | '16-50' | '50+'
  add column if not exists pitch_deck_url text,
  add column if not exists linkedin_url text,
  add column if not exists funding_stage text,
  -- 'Pre-Seed' | 'Seed' | 'Series A' | 'Series B' | 'Bootstrapped' | 'YC'
  add column if not exists founder_name text,
  add column if not exists founder_title text,
  -- 'Founder' | 'Co-Founder' | 'CEO' | 'CTO'
  add column if not exists onboarding_complete boolean default false,
  add column if not exists onboarding_step integer default 0;

-- University list table
create table if not exists public.universities (
  id serial primary key,
  name text not null unique,
  domain text,   -- e.g. 'berkeley.edu'
  country text default 'US'
);

-- Seed top US universities
insert into public.universities (name, domain) values
  ('UC Berkeley', 'berkeley.edu'),
  ('Stanford University', 'stanford.edu'),
  ('MIT', 'mit.edu'),
  ('Harvard University', 'harvard.edu'),
  ('Carnegie Mellon University', 'cmu.edu'),
  ('UCLA', 'ucla.edu'),
  ('UC San Diego', 'ucsd.edu'),
  ('University of Michigan', 'umich.edu'),
  ('Georgia Tech', 'gatech.edu'),
  ('University of Texas at Austin', 'utexas.edu'),
  ('Cornell University', 'cornell.edu'),
  ('Columbia University', 'columbia.edu'),
  ('NYU', 'nyu.edu'),
  ('USC', 'usc.edu'),
  ('University of Washington', 'uw.edu'),
  ('Purdue University', 'purdue.edu'),
  ('University of Illinois', 'illinois.edu'),
  ('Duke University', 'duke.edu'),
  ('Northwestern University', 'northwestern.edu'),
  ('Yale University', 'yale.edu'),
  ('Princeton University', 'princeton.edu'),
  ('Penn State', 'psu.edu'),
  ('University of Chicago', 'uchicago.edu'),
  ('Boston University', 'bu.edu'),
  ('Northeastern University', 'northeastern.edu'),
  ('UC Davis', 'ucdavis.edu'),
  ('UC Santa Barbara', 'ucsb.edu'),
  ('UC Irvine', 'uci.edu'),
  ('UT Dallas', 'utdallas.edu'),
  ('Arizona State University', 'asu.edu'),
  ('University of Florida', 'ufl.edu'),
  ('Ohio State University', 'osu.edu'),
  ('Indiana University', 'indiana.edu'),
  ('Rutgers University', 'rutgers.edu'),
  ('Virginia Tech', 'vt.edu'),
  ('University of Maryland', 'umd.edu'),
  ('University of Minnesota', 'umn.edu'),
  ('Rice University', 'rice.edu'),
  ('Vanderbilt University', 'vanderbilt.edu'),
  ('Emory University', 'emory.edu'),
  ('Georgetown University', 'georgetown.edu'),
  ('University of Notre Dame', 'nd.edu'),
  ('Tufts University', 'tufts.edu'),
  ('University of Virginia', 'virginia.edu'),
  ('Wake Forest University', 'wfu.edu'),
  ('Lehigh University', 'lehigh.edu'),
  ('Other', null)
on conflict (name) do nothing;

-- RLS for universities (public read)
alter table public.universities enable row level security;
create policy "Anyone can read universities"
  on public.universities for select using (true);

do $$
begin
  raise notice '✅ Schema v9 applied';
end $$;
