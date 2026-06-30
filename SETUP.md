# BenefitsFlow – Setup Guide

## 1. Install dependencies

```bash
cd benefitsflow
npm install
```

## 2. Create your Supabase project

1. Go to https://supabase.com → New Project
2. Name it `benefitsflow-hris`
3. Choose a strong database password (save it)
4. Select region: West US (or closest to you)
5. Click **Create new project** — wait ~2 minutes

## 3. Run the schema + seed data

In your Supabase project → **SQL Editor** → click **+New Query**:

**First**, paste and run the full contents of:
```
supabase/migrations/001_schema.sql
```

**Then**, paste and run:
```
supabase/seed/002_seed.sql
```

## 4. Get your API keys

Supabase project → **Settings** → **API**

Copy:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

## 5. Create environment file

```bash
cp .env.local.example .env.local
```

Fill in your keys from step 4.

## 6. Run locally

```bash
npm run dev
```

Open http://localhost:3000 → you'll land on the Dashboard.

## 7. Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Add your 3 environment variables in Vercel project settings → Environment Variables.

---

## What's built

| Page | Route | Description |
|---|---|---|
| Dashboard | `/dashboard` | KPIs, plan distribution chart, enrollment alerts |
| Dental Enrollment | `/enroll/dental` | Full 5-step wizard: plan → provider → dependents → tier → review → confirm |
| Procedure Cost Estimator | `/enroll/estimator` | ADA D-code search, PPO vs DHMO side-by-side cost, freq limit warnings, 4 patient scenarios |
| Workers | `/workers` | Searchable worker table with carrier auto-assignment, deadline urgency, status badges |
| Worker Detail | `/workers/[id]` | Per-worker profile: eligibility, election, accumulators, dependents, timeline |
| Inbox | `/inbox` | Workday-style action items: QLE approvals, doc verification, enrollment tasks, life event submission |
| Reports | `/reports` | Enrollment completion, dental accumulators, carrier export audit, waiver report |
| Audit Log | `/audit` | Immutable change history: who changed what field, old→new value, BP context, IP/session |
| Business Process Center | `/processes` | BP definitions, step routing, actor assignment, active instances — mirrors Workday BP Framework |
| Organizations | `/organizations` | Facility hierarchy with enrollment rate bars, carrier assignment, worker breakdown |
| Vision Enrollment | `/enroll/vision` | VSP Choice plan selector, tier paycheck impact, YTD benefit usage |
| FSA Election | `/enroll/fsa` | Annual election slider, spending estimator, tax savings calc, eligible expenses |

## Architecture highlights for the interview

- **Supabase RLS** – row-level security enforces employee-sees-own-data vs. HR-sees-all
- **Eligibility trigger** – `trg_worker_eligibility` auto-calculates benefit tier, coverage start date, and enrollment deadline on every INSERT/UPDATE to `workers`
- **Audit triggers** – every dental election, dependent, and QLE change is written to `audit_log`
- **State-based carrier branching** – `vw_worker_dental_carrier` view auto-assigns Delta Dental for ID/OR/WA, Cigna for all other states
- **Calculated field views** – `vw_dental_accumulators` exposes deductible remaining, annual max remaining, ortho lifetime remaining
- **Dental enrollment wizard** – 5 steps: plan selection with comparison table, DHMO primary provider picker (searchable), dependent management with surcharge detection, coverage tier with paycheck impact calc, review + submit

## Demo script (10 minutes)

1. **(1 min)** Dashboard → KPI cards, plan distribution pie, state-by-carrier bar chart, deadline alert banners
2. **(1 min)** Workers table → search "Webb", show Delta Dental auto-assigned for OR state, urgency coloring → click through to Worker Detail
3. **(1 min)** Worker Detail → accumulators (Elena Vasquez: annual max hit at $1,500), dependent age-out warning, enrollment timeline
4. **(2.5 min)** Dental Enrollment Wizard → PPO vs DHMO comparison table, DHMO primary provider picker, spouse surcharge alert ($125/check), coverage tier paycheck impact, review + submit
5. **(2 min)** Procedure Cost Estimator → load "Perio Patient" scenario, show SRP 4 quads + perio maintenance, PPO vs DHMO side-by-side, frequency limit warning if cleaning added 3x
6. **(1.5 min)** Inbox → QLE approval task for Marcus Webb (marriage), dependent doc verification alert, "Report Life Event" flow (3-step form)
7. **(1 min)** Reports → Carrier Export Audit tab (Elena Vasquez rejected for missing dependent SSN), Accumulator tab
