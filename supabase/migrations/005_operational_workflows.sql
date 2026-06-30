-- Operational QLE, Inbox, audit, reporting, and demo reset workflows.

ALTER TABLE public.qle_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vision_elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fsa_elections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "qle_scoped" ON public.qle_events;
CREATE POLICY "qle_scoped" ON public.qle_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.workers worker WHERE worker.id = worker_id AND worker.auth_user_id = auth.uid())
  OR public.current_app_role() IN ('BENEFITS_PARTNER', 'HRIS_ANALYST', 'HR_LEADERSHIP')
);

DROP POLICY IF EXISTS "audit_hr_read" ON public.audit_log;
CREATE POLICY "audit_hr_read" ON public.audit_log FOR SELECT USING (
  public.current_app_role() IN ('BENEFITS_PARTNER', 'HRIS_ANALYST', 'HR_LEADERSHIP')
);

DROP POLICY IF EXISTS "events_scoped" ON public.enrollment_events;
CREATE POLICY "events_scoped" ON public.enrollment_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.workers worker WHERE worker.id = worker_id AND worker.auth_user_id = auth.uid())
  OR public.current_app_role() IN ('BENEFITS_PARTNER', 'HRIS_ANALYST', 'HR_LEADERSHIP')
);

DROP POLICY IF EXISTS "reference_org_read" ON public.organizations;
CREATE POLICY "reference_org_read" ON public.organizations FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "reference_job_read" ON public.job_profiles;
CREATE POLICY "reference_job_read" ON public.job_profiles FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "reference_family_read" ON public.job_families;
CREATE POLICY "reference_family_read" ON public.job_families FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "vision_scoped" ON public.vision_elections;
CREATE POLICY "vision_scoped" ON public.vision_elections FOR SELECT USING (
  EXISTS (SELECT 1 FROM workers worker WHERE worker.id = worker_id AND worker.auth_user_id = auth.uid())
  OR current_app_role() IN ('BENEFITS_PARTNER','HRIS_ANALYST','HR_LEADERSHIP')
);
DROP POLICY IF EXISTS "fsa_scoped" ON public.fsa_elections;
CREATE POLICY "fsa_scoped" ON public.fsa_elections FOR SELECT USING (
  EXISTS (SELECT 1 FROM workers worker WHERE worker.id = worker_id AND worker.auth_user_id = auth.uid())
  OR current_app_role() IN ('BENEFITS_PARTNER','HRIS_ANALYST','HR_LEADERSHIP')
);

CREATE OR REPLACE FUNCTION public.submit_qle(
  p_qle_code TEXT,
  p_event_date DATE,
  p_notes TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_worker workers%ROWTYPE;
  v_qle_id UUID;
  v_task_id UUID;
  v_deadline DATE;
BEGIN
  SELECT * INTO v_worker FROM workers
  WHERE auth_user_id = auth.uid() AND worker_status = 'ACTIVE';
  IF NOT FOUND THEN RAISE EXCEPTION 'No active worker is linked to this account'; END IF;
  IF p_qle_code NOT IN ('QLE_MARRIAGE','QLE_BIRTH_ADOPTION','QLE_DIVORCE','QLE_DEPENDENT_LOSS','QLE_EMPLOYMENT_CHANGE','QLE_MOVE') THEN
    RAISE EXCEPTION 'Unsupported qualifying life event';
  END IF;
  IF p_event_date > CURRENT_DATE OR p_event_date < CURRENT_DATE - 30 THEN
    RAISE EXCEPTION 'Event date must be within the previous 30 days';
  END IF;
  v_deadline := p_event_date + 30;

  INSERT INTO qle_events (worker_id, qle_code, event_date, deadline, status, notes)
  VALUES (v_worker.id, p_qle_code, p_event_date, v_deadline, 'PENDING', p_notes)
  RETURNING id INTO v_qle_id;

  INSERT INTO inbox_tasks (worker_id, task_type, title, description, due_date, status, related_id)
  VALUES (v_worker.id, 'BENEFIT_CHANGE_QLE', 'Qualifying Life Event Review',
    'Benefits Partner review required before the enrollment window opens.', v_deadline, 'PENDING', v_qle_id)
  RETURNING id INTO v_task_id;

  INSERT INTO audit_log (actor_id, actor_role, action, table_name, record_id, new_values)
  VALUES (v_worker.id, v_worker.role, 'SUBMIT', 'qle_events', v_qle_id,
    JSONB_BUILD_OBJECT('qle_code', p_qle_code, 'event_date', p_event_date, 'deadline', v_deadline));

  RETURN JSONB_BUILD_OBJECT('success', TRUE, 'qle_id', v_qle_id, 'task_id', v_task_id, 'deadline', v_deadline);
END;
$$;

CREATE OR REPLACE FUNCTION public.review_qle(
  p_qle_id UUID,
  p_decision TEXT,
  p_reason TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_actor workers%ROWTYPE;
  v_qle qle_events%ROWTYPE;
BEGIN
  IF public.current_app_role() NOT IN ('BENEFITS_PARTNER', 'HRIS_ANALYST', 'HR_LEADERSHIP') THEN
    RAISE EXCEPTION 'Benefits administration role required';
  END IF;
  IF p_decision NOT IN ('APPROVED', 'REJECTED') THEN RAISE EXCEPTION 'Invalid decision'; END IF;
  SELECT * INTO v_actor FROM workers WHERE auth_user_id = auth.uid();
  SELECT * INTO v_qle FROM qle_events WHERE id = p_qle_id AND status = 'PENDING' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Pending QLE not found'; END IF;

  UPDATE qle_events SET
    status = p_decision::qle_status,
    approved_by = CASE WHEN p_decision = 'APPROVED' THEN v_actor.id ELSE NULL END,
    approved_at = CASE WHEN p_decision = 'APPROVED' THEN NOW() ELSE NULL END,
    rejection_reason = CASE WHEN p_decision = 'REJECTED' THEN p_reason ELSE NULL END,
    updated_at = NOW()
  WHERE id = p_qle_id;

  UPDATE inbox_tasks SET status = 'COMPLETED', completed_at = NOW()
  WHERE related_id = p_qle_id AND task_type = 'BENEFIT_CHANGE_QLE';

  INSERT INTO audit_log (actor_id, actor_role, action, table_name, record_id, new_values)
  VALUES (v_actor.id, public.current_app_role(),
    CASE WHEN p_decision = 'APPROVED' THEN 'APPROVE'::audit_action ELSE 'REJECT'::audit_action END,
    'qle_events', p_qle_id, JSONB_BUILD_OBJECT('status', p_decision, 'reason', p_reason));

  RETURN JSONB_BUILD_OBJECT('success', TRUE, 'qle_id', p_qle_id, 'status', p_decision);
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_inbox_task(p_task_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_task inbox_tasks%ROWTYPE; v_worker_id UUID;
BEGIN
  SELECT id INTO v_worker_id FROM workers WHERE auth_user_id = auth.uid();
  SELECT * INTO v_task FROM inbox_tasks WHERE id = p_task_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Task not found'; END IF;
  IF v_task.worker_id <> v_worker_id AND public.current_app_role() NOT IN ('BENEFITS_PARTNER','HRIS_ANALYST','HR_LEADERSHIP') THEN
    RAISE EXCEPTION 'Task is outside your scope';
  END IF;
  UPDATE inbox_tasks SET status = 'COMPLETED', completed_at = NOW() WHERE id = p_task_id;
  RETURN JSONB_BUILD_OBJECT('success', TRUE, 'task_id', p_task_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.submit_vision_election(p_tier coverage_tier, p_waived BOOLEAN DEFAULT FALSE)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_worker_id UUID; v_election_id UUID;
BEGIN
  SELECT id INTO v_worker_id FROM workers WHERE auth_user_id = auth.uid() AND worker_status = 'ACTIVE';
  IF v_worker_id IS NULL THEN RAISE EXCEPTION 'Active worker required'; END IF;
  UPDATE vision_elections SET end_date = CURRENT_DATE WHERE worker_id = v_worker_id AND end_date IS NULL;
  INSERT INTO vision_elections (worker_id, plan_name, coverage_tier, effective_date, enrollment_status, waived)
  VALUES (v_worker_id, 'VSP Choice', CASE WHEN p_waived THEN NULL ELSE p_tier END,
    CASE WHEN p_waived THEN NULL ELSE DATE_TRUNC('year', CURRENT_DATE)::DATE + INTERVAL '1 year' END,
    CASE WHEN p_waived THEN 'WAIVED'::enrollment_status ELSE 'SUBMITTED'::enrollment_status END, p_waived)
  RETURNING id INTO v_election_id;
  RETURN JSONB_BUILD_OBJECT('success', TRUE, 'election_id', v_election_id);
END; $$;

CREATE OR REPLACE FUNCTION public.submit_fsa_election(p_annual_election NUMERIC, p_plan_year INT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_worker_id UUID; v_election_id UUID;
BEGIN
  SELECT id INTO v_worker_id FROM workers WHERE auth_user_id = auth.uid() AND worker_status = 'ACTIVE';
  IF v_worker_id IS NULL THEN RAISE EXCEPTION 'Active worker required'; END IF;
  IF p_annual_election < 0 OR p_annual_election > 3300 THEN RAISE EXCEPTION 'Election must be between $0 and $3,300'; END IF;
  DELETE FROM fsa_elections WHERE worker_id = v_worker_id AND fsa_type = 'HEALTH_CARE' AND plan_year = p_plan_year;
  INSERT INTO fsa_elections (worker_id, fsa_type, annual_election, per_paycheck_contribution, plan_year, effective_date, status)
  VALUES (v_worker_id, 'HEALTH_CARE', p_annual_election, ROUND(p_annual_election / 26, 2), p_plan_year,
    MAKE_DATE(p_plan_year, 1, 1), 'SUBMITTED') RETURNING id INTO v_election_id;
  RETURN JSONB_BUILD_OBJECT('success', TRUE, 'election_id', v_election_id, 'per_paycheck', ROUND(p_annual_election / 26, 2));
END; $$;

REVOKE ALL ON FUNCTION public.submit_qle(TEXT, DATE, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.review_qle(UUID, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.complete_inbox_task(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_qle(TEXT, DATE, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.review_qle(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_inbox_task(UUID) TO authenticated;
REVOKE ALL ON FUNCTION public.submit_vision_election(coverage_tier, BOOLEAN) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.submit_fsa_election(NUMERIC, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_vision_election(coverage_tier, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_fsa_election(NUMERIC, INT) TO authenticated;
