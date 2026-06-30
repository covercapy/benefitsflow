-- ============================================================
-- BenefitsFlow — Auth & Profile Tables
-- Run this in your Supabase SQL editor (Project > SQL Editor)
-- ============================================================

-- user_profiles: links Supabase auth users to worker records
create table if not exists public.user_profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  worker_id     text not null,          -- e.g., 'ESI-10001'
  display_name  text not null,
  primary_role  text not null,          -- EMPLOYEE | MANAGER | BENEFITS_PARTNER | HRIS_ANALYST | HR_LEADERSHIP
  created_at    timestamptz default now()
);

alter table public.user_profiles enable row level security;

-- Users can read their own profile
create policy "users can read own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

-- HRIS Analysts can read all profiles (for impersonation / View As)
create policy "hris analyst can read all profiles"
  on public.user_profiles for select
  using (
    exists (
      select 1 from public.user_profiles p
      where p.id = auth.uid() and p.primary_role = 'HRIS_ANALYST'
    )
  );

-- ============================================================
-- dental_elections: persisted enrollment decisions
-- ============================================================
create table if not exists public.dental_elections (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id),
  worker_id           text not null,
  plan_id             text not null,          -- 'PPO' | 'DHMO' | 'WAIVE'
  plan_name           text not null,
  coverage_tier       text not null,          -- 'EO' | 'ES' | 'EC' | 'EF'
  monthly_premium     numeric(8,2),
  effective_date      date,
  confirmation_number text unique not null,
  status              text not null default 'ACTIVE',  -- ACTIVE | WAIVED | CANCELLED
  dependents          jsonb default '[]',
  submitted_at        timestamptz default now(),
  created_at          timestamptz default now()
);

alter table public.dental_elections enable row level security;

-- Employees see only their own elections
create policy "users see own elections"
  on public.dental_elections for select
  using (auth.uid() = user_id);

create policy "users insert own elections"
  on public.dental_elections for insert
  with check (auth.uid() = user_id);

-- HR roles see all elections
create policy "hr sees all elections"
  on public.dental_elections for select
  using (
    exists (
      select 1 from public.user_profiles p
      where p.id = auth.uid()
        and p.primary_role in ('HRIS_ANALYST', 'BENEFITS_PARTNER', 'HR_LEADERSHIP')
    )
  );

-- ============================================================
-- audit_events: every action creates a row here
-- ============================================================
create table if not exists public.audit_events (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id),
  actor_name    text,
  action        text not null,   -- e.g. 'DENTAL_ENROLLMENT_SUBMITTED'
  target_type   text,            -- e.g. 'dental_election'
  target_id     text,
  details       jsonb default '{}',
  created_at    timestamptz default now()
);

alter table public.audit_events enable row level security;

-- HRIS Analysts and Benefits Partners see all audit events
create policy "hr sees audit events"
  on public.audit_events for select
  using (
    exists (
      select 1 from public.user_profiles p
      where p.id = auth.uid()
        and p.primary_role in ('HRIS_ANALYST', 'BENEFITS_PARTNER', 'HR_LEADERSHIP')
    )
  );

-- Users can insert audit events (writes happen server-side via service role ideally)
create policy "authenticated users insert audit events"
  on public.audit_events for insert
  with check (auth.uid() = user_id);
