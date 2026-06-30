-- BenefitsFlow operational authentication, authorization, and enrollment layer.
-- Apply after 001_schema.sql and 002_fix_trigger.sql.

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  worker_id TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  primary_role TEXT NOT NULL CHECK (primary_role IN (
    'EMPLOYEE', 'MANAGER', 'BENEFITS_PARTNER', 'HRIS_ANALYST', 'HR_LEADERSHIP'
  )),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.current_app_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT primary_role FROM public.user_profiles WHERE id = auth.uid();
$$;

REVOKE ALL ON FUNCTION public.current_app_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_app_role() TO authenticated;

DROP POLICY IF EXISTS "profiles_read_own" ON public.user_profiles;
CREATE POLICY "profiles_read_own" ON public.user_profiles
  FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "profiles_hr_read" ON public.user_profiles;
CREATE POLICY "profiles_hr_read" ON public.user_profiles
  FOR SELECT USING (
    public.current_app_role() IN ('HRIS_ANALYST', 'HR_LEADERSHIP')
  );

DROP POLICY IF EXISTS "workers_own_data" ON public.workers;
DROP POLICY IF EXISTS "hr_sees_all_workers" ON public.workers;
DROP POLICY IF EXISTS "workers_scoped_read" ON public.workers;
CREATE POLICY "workers_scoped_read" ON public.workers
  FOR SELECT USING (
    auth_user_id = auth.uid()
    OR public.current_app_role() IN ('BENEFITS_PARTNER', 'HRIS_ANALYST', 'HR_LEADERSHIP')
  );

DROP POLICY IF EXISTS "dental_own" ON public.dental_elections;
DROP POLICY IF EXISTS "dental_scoped" ON public.dental_elections;
CREATE POLICY "dental_scoped" ON public.dental_elections
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.workers worker WHERE worker.id = worker_id AND worker.auth_user_id = auth.uid())
    OR public.current_app_role() IN ('BENEFITS_PARTNER', 'HRIS_ANALYST', 'HR_LEADERSHIP')
  );

DROP POLICY IF EXISTS "dependents_own" ON public.dependents;
DROP POLICY IF EXISTS "dependents_scoped" ON public.dependents;
CREATE POLICY "dependents_scoped" ON public.dependents
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.workers worker WHERE worker.id = worker_id AND worker.auth_user_id = auth.uid())
    OR public.current_app_role() IN ('BENEFITS_PARTNER', 'HRIS_ANALYST', 'HR_LEADERSHIP')
  );

DROP POLICY IF EXISTS "inbox_own" ON public.inbox_tasks;
DROP POLICY IF EXISTS "inbox_scoped" ON public.inbox_tasks;
CREATE POLICY "inbox_scoped" ON public.inbox_tasks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.workers worker WHERE worker.id = worker_id AND worker.auth_user_id = auth.uid())
    OR public.current_app_role() IN ('BENEFITS_PARTNER', 'HRIS_ANALYST', 'HR_LEADERSHIP')
  );

DROP POLICY IF EXISTS "accumulators_scoped" ON public.dental_accumulators;
CREATE POLICY "accumulators_scoped" ON public.dental_accumulators
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.workers worker WHERE worker.id = worker_id AND worker.auth_user_id = auth.uid())
    OR public.current_app_role() IN ('BENEFITS_PARTNER', 'HRIS_ANALYST', 'HR_LEADERSHIP')
  );

ALTER TABLE public.dental_elections
  ADD COLUMN IF NOT EXISTS confirmation_number TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS employee_monthly NUMERIC(8,2),
  ADD COLUMN IF NOT EXISTS selected_dependents JSONB NOT NULL DEFAULT '[]'::JSONB;

CREATE TABLE IF NOT EXISTS public.dental_election_dependents (
  election_id UUID NOT NULL REFERENCES public.dental_elections(id) ON DELETE CASCADE,
  dependent_id UUID NOT NULL REFERENCES public.dependents(id) ON DELETE RESTRICT,
  PRIMARY KEY (election_id, dependent_id)
);

ALTER TABLE public.dental_election_dependents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "election_dependents_scoped" ON public.dental_election_dependents;
CREATE POLICY "election_dependents_scoped" ON public.dental_election_dependents
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM public.dental_elections election
      JOIN public.workers worker ON worker.id = election.worker_id
      WHERE election.id = election_id
        AND (
          worker.auth_user_id = auth.uid()
          OR public.current_app_role() IN ('BENEFITS_PARTNER', 'HRIS_ANALYST', 'HR_LEADERSHIP')
        )
    )
  );

CREATE OR REPLACE FUNCTION public.submit_dental_enrollment(
  p_plan_choice TEXT,
  p_coverage_tier coverage_tier DEFAULT NULL,
  p_provider_id UUID DEFAULT NULL,
  p_dependent_ids UUID[] DEFAULT ARRAY[]::UUID[],
  p_waive_reason TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_worker workers%ROWTYPE;
  v_plan dental_plans%ROWTYPE;
  v_election_id UUID;
  v_confirmation TEXT;
  v_monthly NUMERIC(8,2) := 0;
  v_effective_date DATE;
  v_invalid_dependents INT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT * INTO v_worker
  FROM workers
  WHERE auth_user_id = auth.uid() AND worker_status = 'ACTIVE'
  FOR UPDATE;

  IF NOT FOUND THEN RAISE EXCEPTION 'No active worker is linked to this account'; END IF;
  IF v_worker.benefit_tier NOT IN ('FULL', 'LIMITED') THEN RAISE EXCEPTION 'Worker is not eligible for dental benefits'; END IF;
  IF v_worker.enrollment_deadline IS NULL OR CURRENT_DATE > v_worker.enrollment_deadline THEN
    RAISE EXCEPTION 'Enrollment window is closed';
  END IF;
  IF p_plan_choice NOT IN ('PPO', 'DHMO', 'WAIVE') THEN RAISE EXCEPTION 'Invalid plan choice'; END IF;
  IF p_plan_choice <> 'WAIVE' AND p_coverage_tier IS NULL THEN RAISE EXCEPTION 'Coverage tier is required'; END IF;

  SELECT COUNT(*) INTO v_invalid_dependents
  FROM UNNEST(COALESCE(p_dependent_ids, ARRAY[]::UUID[])) selected_id
  WHERE NOT EXISTS (
    SELECT 1 FROM dependents dependent
    WHERE dependent.id = selected_id AND dependent.worker_id = v_worker.id
  );
  IF v_invalid_dependents > 0 THEN RAISE EXCEPTION 'One or more dependents do not belong to this worker'; END IF;

  IF p_plan_choice <> 'WAIVE' THEN
    SELECT plan.* INTO v_plan
    FROM dental_plans plan
    WHERE plan.plan_type::TEXT = p_plan_choice
      AND plan.active
      AND (plan.states_eligible IS NULL OR v_worker.work_state = ANY(plan.states_eligible))
    ORDER BY (plan.states_eligible IS NOT NULL) DESC
    LIMIT 1;
    IF NOT FOUND THEN RAISE EXCEPTION 'No eligible dental plan was found'; END IF;

    IF p_plan_choice = 'DHMO' AND p_provider_id IS NULL THEN RAISE EXCEPTION 'A primary DHMO provider is required'; END IF;
    IF p_provider_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM dhmo_providers provider
      WHERE provider.id = p_provider_id AND provider.accepting_new_patients
    ) THEN RAISE EXCEPTION 'Selected provider is unavailable'; END IF;

    SELECT premium.employee_monthly INTO v_monthly
    FROM dental_premiums premium
    WHERE premium.plan_id = v_plan.id AND premium.coverage_tier = p_coverage_tier
    ORDER BY premium.effective_date DESC LIMIT 1;
    IF v_monthly IS NULL THEN RAISE EXCEPTION 'Premium configuration is missing'; END IF;
  END IF;

  IF EXISTS (
    SELECT 1 FROM dental_elections election
    WHERE election.worker_id = v_worker.id
      AND election.enrollment_status IN ('SUBMITTED', 'ACTIVE', 'WAIVED')
      AND election.end_date IS NULL
  ) THEN RAISE EXCEPTION 'A completed dental election already exists'; END IF;

  v_confirmation := 'BF-' || UPPER(SUBSTRING(REPLACE(gen_random_uuid()::TEXT, '-', '') FROM 1 FOR 12));
  v_effective_date := DATE_TRUNC('month', CURRENT_DATE)::DATE + INTERVAL '1 month';

  INSERT INTO dental_elections (
    worker_id, plan_id, coverage_tier, effective_date, enrollment_status,
    waived, waive_reason, primary_dhmo_provider_id, event_type, submitted_at,
    confirmation_number, employee_monthly, selected_dependents
  ) VALUES (
    v_worker.id,
    CASE WHEN p_plan_choice = 'WAIVE' THEN NULL ELSE v_plan.id END,
    CASE WHEN p_plan_choice = 'WAIVE' THEN NULL ELSE p_coverage_tier END,
    CASE WHEN p_plan_choice = 'WAIVE' THEN NULL ELSE v_effective_date END,
    CASE WHEN p_plan_choice = 'WAIVE' THEN 'WAIVED'::enrollment_status ELSE 'SUBMITTED'::enrollment_status END,
    p_plan_choice = 'WAIVE', p_waive_reason,
    CASE WHEN p_plan_choice = 'DHMO' THEN p_provider_id ELSE NULL END,
    'NEW_HIRE', NOW(), v_confirmation, v_monthly, TO_JSONB(COALESCE(p_dependent_ids, ARRAY[]::UUID[]))
  ) RETURNING id INTO v_election_id;

  INSERT INTO dental_election_dependents (election_id, dependent_id)
  SELECT v_election_id, dependent_id
  FROM UNNEST(COALESCE(p_dependent_ids, ARRAY[]::UUID[])) dependent_id;

  UPDATE inbox_tasks
  SET status = 'COMPLETED', completed_at = NOW(), related_id = v_election_id
  WHERE worker_id = v_worker.id
    AND task_type IN ('BENEFIT_CHANGE_NEW_HIRE', 'BENEFIT_CHANGE_QLE', 'BENEFIT_CHANGE_OE')
    AND status IN ('PENDING', 'IN_PROGRESS');

  INSERT INTO enrollment_events (worker_id, event_type, description, metadata, created_by)
  VALUES (
    v_worker.id, 'DENTAL_ENROLLMENT_SUBMITTED',
    CASE WHEN p_plan_choice = 'WAIVE' THEN 'Dental coverage waived' ELSE 'Dental election submitted' END,
    JSONB_BUILD_OBJECT('election_id', v_election_id, 'confirmation_number', v_confirmation, 'plan_choice', p_plan_choice),
    v_worker.id
  );

  INSERT INTO audit_log (actor_id, actor_role, action, table_name, record_id, new_values)
  VALUES (
    v_worker.id, v_worker.role, 'SUBMIT', 'dental_elections', v_election_id,
    JSONB_BUILD_OBJECT('confirmation_number', v_confirmation, 'plan_choice', p_plan_choice, 'coverage_tier', p_coverage_tier)
  );

  RETURN JSONB_BUILD_OBJECT(
    'success', TRUE,
    'election_id', v_election_id,
    'confirmation_number', v_confirmation,
    'effective_date', CASE WHEN p_plan_choice = 'WAIVE' THEN NULL ELSE v_effective_date END,
    'monthly_premium', v_monthly
  );
END;
$$;

REVOKE ALL ON FUNCTION public.submit_dental_enrollment(TEXT, coverage_tier, UUID, UUID[], TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_dental_enrollment(TEXT, coverage_tier, UUID, UUID[], TEXT) TO authenticated;
