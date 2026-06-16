create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  role text,
  country text,
  state text,
  city text,
  education_level text,
  field_of_study text,
  current_year text,
  gender text,
  category text,
  income_range text,
  skills text[],
  interests text[],
  profile_completed boolean default false,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  provider text not null,
  category text not null,
  country text,
  states text[],
  eligible_roles text[],
  eligible_education text[],
  eligible_fields text[],
  eligible_years text[],
  eligible_gender text,
  eligible_category text,
  eligible_income_range text,
  skills text[],
  interests text[],
  deadline text,
  status text default 'active',
  official_url text not null,
  source_domain text not null,
  trust_score int default 0,
  verification_status text default 'verified',
  verification_notes text[],
  description text,
  benefits text[],
  documents_required text[],
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table if not exists public.saved_opportunities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  opportunity_id uuid references public.opportunities(id) on delete cascade,
  status text default 'saved',
  notes text,
  created_at timestamp default now(),
  updated_at timestamp default now(),
  unique(user_id, opportunity_id)
);

create table if not exists public.opportunity_sources (
  id uuid primary key default gen_random_uuid(),
  name text,
  base_url text,
  source_domain text,
  category text,
  trust_level int,
  active boolean default true,
  last_checked_at timestamp,
  created_at timestamp default now()
);

create table if not exists public.opportunity_sync_logs (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.opportunity_sources(id),
  status text,
  found_count int,
  verified_count int,
  rejected_count int,
  notes text,
  created_at timestamp default now()
);

alter table public.profiles enable row level security;
alter table public.opportunities enable row level security;
alter table public.saved_opportunities enable row level security;
alter table public.opportunity_sources enable row level security;
alter table public.opportunity_sync_logs enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can read verified opportunities" on public.opportunities;
create policy "Users can read verified opportunities"
on public.opportunities
for select
using (
  verification_status = 'verified'
  and trust_score >= 80
  and status in ('active', 'upcoming')
);

drop policy if exists "Users can read own saved opportunities" on public.saved_opportunities;
create policy "Users can read own saved opportunities"
on public.saved_opportunities
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own saved opportunities" on public.saved_opportunities;
create policy "Users can insert own saved opportunities"
on public.saved_opportunities
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own saved opportunities" on public.saved_opportunities;
create policy "Users can update own saved opportunities"
on public.saved_opportunities
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own saved opportunities" on public.saved_opportunities;
create policy "Users can delete own saved opportunities"
on public.saved_opportunities
for delete
using (auth.uid() = user_id);

drop policy if exists "Users can read active opportunity sources" on public.opportunity_sources;
create policy "Users can read active opportunity sources"
on public.opportunity_sources
for select
using (active = true);

create index if not exists opportunities_verified_idx
on public.opportunities(verification_status, trust_score, status);

create index if not exists saved_user_idx
on public.saved_opportunities(user_id);

create index if not exists saved_opportunity_idx
on public.saved_opportunities(opportunity_id);