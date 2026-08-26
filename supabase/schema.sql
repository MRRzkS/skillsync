-- Reference schema — DB already provisioned by the team on Supabase.
-- Kept here so the codebase is self-documenting and to re-run locally if needed.

create table if not exists candidate_profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  cv_json jsonb not null,
  created_at timestamp with time zone default now(),
  -- Links a CV to the candidate's login account, so /candidate/jobs knows
  -- whose CV to attach to a new application and /candidate can tell whether
  -- someone still needs to build one. Nullable: the 3 pre-existing "Jordan
  -- Alvarez" rows (and any CV built before this column existed) predate
  -- candidate auth and simply have no owner.
  user_id uuid references auth.users(id),
  -- Cached AI STAR-method CV review (lib/ai/cv-star-review.ts), computed once
  -- right after save-cv persists the CV, not regenerated on every visit to
  -- /candidate/cv-review. Null until the background review finishes (or if
  -- it failed) — the review page falls back to generating on the spot then.
  star_review jsonb
);

-- Additive migrations for an already-provisioned DB (run once):
-- alter table candidate_profiles add column if not exists user_id uuid references auth.users(id);
-- alter table candidate_profiles add column if not exists star_review jsonb;

create table if not exists job_vacancies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  jd_text text not null,
  scenarios jsonb not null,
  created_at timestamp with time zone default now()
);

create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references candidate_profiles(id),
  job_id uuid references job_vacancies(id),
  match_score int default 0,
  transcript jsonb,
  status text default 'pending',
  created_at timestamp with time zone default now()
);

-- Auth: distinguishes HR vs Candidate accounts (Supabase Auth's auth.users
-- has no concept of "which side" a user is). Row is created client-side right
-- after signup/first OAuth login, gated by the RLS policies below — not a
-- DB trigger, to keep signup logic in one place (components/auth-form.tsx,
-- app/auth/callback/route.ts).
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('hr', 'candidate')),
  created_at timestamp with time zone default now()
);

alter table profiles enable row level security;

create policy "Users can read own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);
