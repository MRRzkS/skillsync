-- Reference schema — DB already provisioned by the team on Supabase.
-- Kept here so the codebase is self-documenting and to re-run locally if needed.

create table if not exists candidate_profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  cv_json jsonb not null,
  created_at timestamp with time zone default now()
);

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
