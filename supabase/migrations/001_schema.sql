-- ============================================================
-- BenefitsFlow HRIS Lab – Schema Migration 001
-- Ensign Services Inspired | Fictional Data Only
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for provider search

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE employment_type AS ENUM ('FULL_TIME', 'PART_TIME', 'TEMP', 'INTERN', 'CASUAL', 'ON_CALL');
CREATE TYPE benefit_tier AS ENUM ('FULL', 'LIMITED', 'TEMP', 'CASUAL');
CREATE TYPE employee_category AS ENUM ('FAST_TRACK', 'STANDARD');
CREATE TYPE coverage_tier AS ENUM ('EO', 'ES', 'EC', 'EF'); -- Employee Only/Spouse/Children/Family
CREATE TYPE plan_type AS ENUM ('PPO', 'DHMO', 'HMO', 'EPO', 'HDHP');
CREATE TYPE qle_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED');
CREATE TYPE enrollment_status AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'ACTIVE', 'WAIVED', 'EXPIRED');
CREATE TYPE worker_status AS ENUM ('ACTIVE', 'TERMINATED', 'LOA', 'SUSPENDED');
CREATE TYPE dependent_relationship AS ENUM ('SPOUSE', 'DOMESTIC_PARTNER', 'CHILD', 'STEPCHILD', 'ADOPTED_CHILD', 'LEGAL_WARD', 'DISABLED_ADULT_CHILD');
CREATE TYPE doc_status AS ENUM ('PENDING', 'UPLOADED', 'VERIFIED', 'REJECTED');
CREATE TYPE audit_action AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'SUBMIT', 'APPROVE', 'REJECT', 'LOGIN', 'EXPORT');

-- ============================================================
-- ORGANIZATIONS
-- ============================================================

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  org_type TEXT NOT NULL, -- 'SERVICE_CENTER', 'FACILITY', 'REGION'
  parent_id UUID REFERENCES organizations(id),
  location_state TEXT,
  location_city TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- JOB FAMILIES & PROFILES
-- ============================================================

CREATE TABLE job_families (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE job_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_family_id UUID REFERENCES job_families(id),
  title TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  management_level TEXT, -- 'IC', 'MANAGER', 'DIRECTOR', 'VP', 'C_SUITE'
  flsa_status TEXT DEFAULT 'EXEMPT', -- 'EXEMPT', 'NON_EXEMPT'
  fast_track_benefits BOOLEAN DEFAULT FALSE, -- dept heads, nurses, therapists
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- WORKERS
-- ============================================================

CREATE TABLE workers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id TEXT NOT NULL UNIQUE, -- e.g. ESI-10042
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  preferred_name TEXT,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  hire_date DATE NOT NULL,
  termination_date DATE,
  worker_status worker_status DEFAULT 'ACTIVE',
  employment_type employment_type NOT NULL,
  avg_weekly_hours NUMERIC(5,2) DEFAULT 40,
  benefit_tier benefit_tier,
  employee_category employee_category DEFAULT 'STANDARD',
  job_profile_id UUID REFERENCES job_profiles(id),
  organization_id UUID REFERENCES organizations(id),
  work_state TEXT NOT NULL, -- determines dental carrier
  work_city TEXT,
  manager_id UUID REFERENCES workers(id),
  -- Coverage dates (calculated on hire)
  coverage_start_date DATE,
  enrollment_deadline DATE,
  -- Auth
  auth_user_id UUID UNIQUE, -- links to Supabase auth.users
  role TEXT DEFAULT 'EMPLOYEE', -- 'EMPLOYEE','MANAGER','BENEFITS_PARTNER','HRIS_ANALYST','HR_LEADERSHIP'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DEPENDENTS
-- ============================================================

CREATE TABLE dependents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  relationship dependent_relationship NOT NULL,
  ssn_last4 TEXT, -- fictional only
  has_other_employer_coverage BOOLEAN DEFAULT FALSE,
  disabled_before_26 BOOLEAN DEFAULT FALSE,
  unable_to_self_support BOOLEAN DEFAULT FALSE,
  doc_status doc_status DEFAULT 'PENDING',
  doc_verified_at TIMESTAMPTZ,
  doc_verified_by UUID REFERENCES workers(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DENTAL CARRIERS & PLANS
-- ============================================================

CREATE TABLE dental_carriers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL, -- 'Delta Dental', 'Cigna'
  group_number TEXT,
  phone TEXT,
  website TEXT,
  states_served TEXT[] -- NULL = nationwide
);

CREATE TABLE dental_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_name TEXT NOT NULL,
  plan_type plan_type NOT NULL,
  carrier_id UUID REFERENCES dental_carriers(id),
  states_eligible TEXT[], -- NULL = all states; ['ID','OR','WA'] for Delta Dental PPO
  -- Deductibles
  deductible_individual NUMERIC(8,2),
  deductible_family NUMERIC(8,2),
  -- Maximums
  calendar_year_max NUMERIC(8,2), -- NULL = unlimited
  ortho_lifetime_max NUMERIC(8,2), -- NULL = not covered
  ortho_covered BOOLEAN DEFAULT TRUE,
  -- Cost share (PPO preferred tier)
  prev_diagnostic_pct NUMERIC(5,2) DEFAULT 0, -- preventive/diagnostic employee %
  basic_restorative_pct NUMERIC(5,2) DEFAULT 10,
  major_services_pct NUMERIC(5,2) DEFAULT 40,
  ortho_pct NUMERIC(5,2) DEFAULT 50,
  tmj_pct NUMERIC(5,2) DEFAULT 40,
  -- DHMO: uses copay schedules instead
  is_dhmo BOOLEAN DEFAULT FALSE,
  effective_date DATE NOT NULL DEFAULT '2026-01-01',
  end_date DATE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Monthly premiums by coverage tier
CREATE TABLE dental_premiums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID REFERENCES dental_plans(id),
  coverage_tier coverage_tier NOT NULL,
  employee_monthly NUMERIC(8,2) NOT NULL,
  employer_monthly NUMERIC(8,2) NOT NULL,
  effective_date DATE NOT NULL DEFAULT '2026-01-01'
);

-- ============================================================
-- DHMO PROVIDERS (Mock Data)
-- ============================================================

CREATE TABLE dhmo_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  npi TEXT,
  provider_name TEXT NOT NULL,
  practice_name TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  phone TEXT,
  accepting_new_patients BOOLEAN DEFAULT TRUE,
  languages TEXT[] DEFAULT ARRAY['English'],
  specialties TEXT[] DEFAULT ARRAY['General Dentistry'],
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GIN index for provider search
CREATE INDEX idx_dhmo_providers_city_state ON dhmo_providers(city, state);
CREATE INDEX idx_dhmo_providers_zip ON dhmo_providers(zip);
CREATE INDEX idx_dhmo_providers_name_trgm ON dhmo_providers USING gin(provider_name gin_trgm_ops);

-- ============================================================
-- DENTAL PROCEDURE CODES (ADA CDT)
-- ============================================================

CREATE TABLE dental_procedure_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ada_code TEXT NOT NULL UNIQUE, -- D0120, D1110, etc.
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- 'Diagnostic','Preventive','Basic','Major','Ortho','Perio','Endo','OralSurgery'
  service_class TEXT NOT NULL, -- 'PREV_DIAG','BASIC','MAJOR','ORTHO'
  frequency_limit TEXT, -- '2x per calendar year', 'Once per lifetime per tooth'
  waiting_period_months INT DEFAULT 0,
  typical_fee_low NUMERIC(8,2),
  typical_fee_high NUMERIC(8,2),
  dhmo_copay NUMERIC(8,2), -- fixed copay under DHMO
  notes TEXT
);

-- ============================================================
-- DENTAL ELECTIONS
-- ============================================================

CREATE TABLE dental_elections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES dental_plans(id),
  coverage_tier coverage_tier,
  effective_date DATE,
  end_date DATE,
  enrollment_status enrollment_status DEFAULT 'NOT_STARTED',
  waived BOOLEAN DEFAULT FALSE,
  waive_reason TEXT,
  primary_dhmo_provider_id UUID REFERENCES dhmo_providers(id),
  -- Event tracking
  event_type TEXT, -- 'NEW_HIRE', 'QLE', 'OPEN_ENROLLMENT', 'STATUS_CHANGE'
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DENTAL ACCUMULATORS (Per Plan Year)
-- ============================================================

CREATE TABLE dental_accumulators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  plan_year INT NOT NULL,
  deductible_individual_used NUMERIC(8,2) DEFAULT 0,
  deductible_family_used NUMERIC(8,2) DEFAULT 0,
  annual_max_used NUMERIC(8,2) DEFAULT 0,
  ortho_lifetime_used NUMERIC(8,2) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(worker_id, plan_year)
);

-- ============================================================
-- ELIGIBILITY ENGINE
-- ============================================================

CREATE TABLE worker_eligibility (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE UNIQUE,
  benefit_tier benefit_tier NOT NULL,
  employee_category employee_category DEFAULT 'STANDARD',
  coverage_start_date DATE,
  enrollment_deadline DATE,
  -- Computed helpers
  is_within_window BOOLEAN,
  days_remaining INT,
  last_calculated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE qle_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  qle_code TEXT NOT NULL, -- 'QLE_MARRIAGE','QLE_BIRTH', etc.
  event_date DATE NOT NULL,
  election_date DATE,
  coverage_start_date DATE, -- 1st of month after election_date
  deadline DATE, -- event_date + 30 days
  status qle_status DEFAULT 'PENDING',
  documentation_submitted BOOLEAN DEFAULT FALSE,
  notes TEXT,
  approved_by UUID REFERENCES workers(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- VISION ELECTIONS
-- ============================================================

CREATE TABLE vision_elections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  plan_name TEXT DEFAULT 'VSP Choice',
  coverage_tier coverage_tier,
  effective_date DATE,
  end_date DATE,
  enrollment_status enrollment_status DEFAULT 'NOT_STARTED',
  waived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FSA ELECTIONS
-- ============================================================

CREATE TABLE fsa_elections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  fsa_type TEXT NOT NULL, -- 'HEALTH_CARE', 'LIMITED_PURPOSE', 'DEPENDENT_CARE'
  annual_election NUMERIC(8,2) NOT NULL,
  per_paycheck_contribution NUMERIC(8,2),
  plan_year INT NOT NULL,
  effective_date DATE,
  status enrollment_status DEFAULT 'NOT_STARTED',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AUDIT LOG
-- ============================================================

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES workers(id),
  actor_role TEXT,
  action audit_action NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_log_record ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_actor ON audit_log(actor_id, created_at DESC);
CREATE INDEX idx_audit_log_created ON audit_log(created_at DESC);

-- ============================================================
-- INBOX TASKS (Workday-Style)
-- ============================================================

CREATE TABLE inbox_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL, -- 'BENEFIT_CHANGE_NEW_HIRE','BENEFIT_CHANGE_QLE','BENEFIT_CHANGE_OE'
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  status TEXT DEFAULT 'PENDING', -- 'PENDING','IN_PROGRESS','COMPLETED','EXPIRED'
  related_id UUID, -- e.g. qle_event_id or enrollment_id
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ============================================================
-- ENROLLMENT EVENTS (Timeline)
-- ============================================================

CREATE TABLE enrollment_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_date TIMESTAMPTZ DEFAULT NOW(),
  description TEXT,
  metadata JSONB,
  created_by UUID REFERENCES workers(id)
);

-- ============================================================
-- CALCULATED FIELD VIEWS
-- ============================================================

-- Dental carrier by state
CREATE OR REPLACE VIEW vw_worker_dental_carrier AS
SELECT
  w.id AS worker_id,
  w.employee_id,
  w.first_name,
  w.last_name,
  w.work_state,
  CASE
    WHEN w.work_state IN ('ID', 'OR', 'WA') THEN 'Delta Dental'
    ELSE 'Cigna'
  END AS dental_ppo_carrier,
  CASE
    WHEN w.work_state IN ('ID', 'OR', 'WA') THEN '19192'
    ELSE '2499682'
  END AS group_number
FROM workers w
WHERE w.worker_status = 'ACTIVE';

-- Enrollment completion summary
CREATE OR REPLACE VIEW vw_enrollment_summary AS
SELECT
  COUNT(*) FILTER (WHERE we.benefit_tier IN ('FULL','LIMITED','TEMP')) AS total_eligible,
  COUNT(de.id) FILTER (WHERE de.enrollment_status = 'ACTIVE') AS dental_enrolled,
  COUNT(de.id) FILTER (WHERE de.waived = TRUE) AS dental_waived,
  COUNT(de.id) FILTER (WHERE de.plan_id IN (SELECT id FROM dental_plans WHERE is_dhmo = FALSE)) AS dental_ppo_count,
  COUNT(de.id) FILTER (WHERE de.plan_id IN (SELECT id FROM dental_plans WHERE is_dhmo = TRUE)) AS dental_dhmo_count,
  ROUND(
    COUNT(de.id) FILTER (WHERE de.enrollment_status = 'ACTIVE')::NUMERIC /
    NULLIF(COUNT(*) FILTER (WHERE we.benefit_tier IN ('FULL','LIMITED','TEMP')), 0) * 100, 1
  ) AS dental_enrollment_rate_pct
FROM worker_eligibility we
LEFT JOIN dental_elections de ON de.worker_id = we.worker_id AND de.end_date IS NULL;

-- Accumulators with remaining balances
CREATE OR REPLACE VIEW vw_dental_accumulators AS
SELECT
  da.*,
  dp.calendar_year_max,
  dp.ortho_lifetime_max,
  dp.deductible_individual,
  COALESCE(dp.calendar_year_max, 0) - da.annual_max_used AS annual_max_remaining,
  COALESCE(dp.ortho_lifetime_max, 0) - da.ortho_lifetime_used AS ortho_lifetime_remaining,
  COALESCE(dp.deductible_individual, 0) - da.deductible_individual_used AS deductible_remaining,
  da.deductible_individual_used >= COALESCE(dp.deductible_individual, 0) AS deductible_met
FROM dental_accumulators da
JOIN dental_elections de ON de.worker_id = da.worker_id AND de.end_date IS NULL
JOIN dental_plans dp ON dp.id = de.plan_id;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE dental_elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE dependents ENABLE ROW LEVEL SECURITY;
ALTER TABLE dental_accumulators ENABLE ROW LEVEL SECURITY;
ALTER TABLE inbox_tasks ENABLE ROW LEVEL SECURITY;

-- Employees see own data
CREATE POLICY "workers_own_data" ON workers
  FOR SELECT USING (auth.uid() = auth_user_id);

-- HR roles see all workers
CREATE POLICY "hr_sees_all_workers" ON workers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workers w
      WHERE w.auth_user_id = auth.uid()
      AND w.role IN ('BENEFITS_PARTNER','HRIS_ANALYST','HR_LEADERSHIP')
    )
  );

-- Dental elections: employee sees own
CREATE POLICY "dental_own" ON dental_elections
  FOR ALL USING (
    worker_id IN (SELECT id FROM workers WHERE auth_user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM workers w
      WHERE w.auth_user_id = auth.uid()
      AND w.role IN ('BENEFITS_PARTNER','HRIS_ANALYST','HR_LEADERSHIP')
    )
  );

-- Dependents: employee sees own
CREATE POLICY "dependents_own" ON dependents
  FOR ALL USING (
    worker_id IN (SELECT id FROM workers WHERE auth_user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM workers w
      WHERE w.auth_user_id = auth.uid()
      AND w.role IN ('BENEFITS_PARTNER','HRIS_ANALYST','HR_LEADERSHIP')
    )
  );

-- Inbox tasks: own only
CREATE POLICY "inbox_own" ON inbox_tasks
  FOR ALL USING (
    worker_id IN (SELECT id FROM workers WHERE auth_user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM workers w
      WHERE w.auth_user_id = auth.uid()
      AND w.role IN ('BENEFITS_PARTNER','HRIS_ANALYST','HR_LEADERSHIP')
    )
  );

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-calculate coverage start date & enrollment deadline
CREATE OR REPLACE FUNCTION calculate_coverage_dates(
  p_hire_date DATE,
  p_employee_category employee_category
) RETURNS TABLE(coverage_start DATE, enrollment_deadline DATE)
LANGUAGE plpgsql AS $$
BEGIN
  IF p_employee_category = 'FAST_TRACK' THEN
    -- 1st of month after hire (same day if on 1st)
    IF EXTRACT(DAY FROM p_hire_date) = 1 THEN
      coverage_start := p_hire_date;
    ELSE
      coverage_start := DATE_TRUNC('month', p_hire_date)::DATE + INTERVAL '1 month';
    END IF;
  ELSE
    -- 1st of month after 60 days
    coverage_start := DATE_TRUNC('month', p_hire_date + INTERVAL '60 days')::DATE + INTERVAL '1 month';
  END IF;
  enrollment_deadline := p_hire_date + INTERVAL '30 days';
  RETURN NEXT;
END;
$$;

-- Auto-populate eligibility on worker insert/update
CREATE OR REPLACE FUNCTION sync_worker_eligibility()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_tier benefit_tier;
  v_category employee_category;
  v_coverage_start DATE;
  v_deadline DATE;
BEGIN
  -- Determine benefit tier
  IF NEW.avg_weekly_hours >= 32 THEN
    v_tier := 'FULL';
  ELSIF NEW.avg_weekly_hours >= 30 THEN
    v_tier := 'LIMITED';
  ELSIF NEW.employment_type IN ('TEMP', 'INTERN') THEN
    v_tier := 'TEMP';
  ELSE
    v_tier := 'CASUAL';
  END IF;

  -- Update worker tier
  NEW.benefit_tier := v_tier;

  -- Calculate dates
  SELECT coverage_start, enrollment_deadline
  INTO v_coverage_start, v_deadline
  FROM calculate_coverage_dates(NEW.hire_date, NEW.employee_category);

  NEW.coverage_start_date := v_coverage_start;
  NEW.enrollment_deadline := v_deadline;

  -- Upsert eligibility record
  INSERT INTO worker_eligibility (worker_id, benefit_tier, employee_category, coverage_start_date, enrollment_deadline, is_within_window, days_remaining)
  VALUES (NEW.id, v_tier, NEW.employee_category, v_coverage_start, v_deadline,
          CURRENT_DATE <= v_deadline,
          v_deadline - CURRENT_DATE)
  ON CONFLICT (worker_id) DO UPDATE
    SET benefit_tier = EXCLUDED.benefit_tier,
        coverage_start_date = EXCLUDED.coverage_start_date,
        enrollment_deadline = EXCLUDED.enrollment_deadline,
        is_within_window = EXCLUDED.is_within_window,
        days_remaining = EXCLUDED.days_remaining,
        last_calculated_at = NOW();

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_worker_eligibility
  BEFORE INSERT OR UPDATE ON workers
  FOR EACH ROW EXECUTE FUNCTION sync_worker_eligibility();

-- Audit trigger
CREATE OR REPLACE FUNCTION audit_trigger_fn()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (action, table_name, record_id, old_values)
    VALUES ('DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (action, table_name, record_id, old_values, new_values)
    VALUES ('UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (action, table_name, record_id, new_values)
    VALUES ('CREATE', TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER audit_dental_elections
  AFTER INSERT OR UPDATE OR DELETE ON dental_elections
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

CREATE TRIGGER audit_dependents
  AFTER INSERT OR UPDATE OR DELETE ON dependents
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

CREATE TRIGGER audit_qle_events
  AFTER INSERT OR UPDATE OR DELETE ON qle_events
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();
