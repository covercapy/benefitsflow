-- Fix: split trigger into BEFORE (field calc) + AFTER (worker_eligibility insert)

DROP TRIGGER IF EXISTS trg_worker_eligibility ON workers;
DROP FUNCTION IF EXISTS sync_worker_eligibility();

-- BEFORE: only sets computed fields on NEW
CREATE OR REPLACE FUNCTION set_worker_eligibility_fields()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_tier benefit_tier;
  v_coverage_start DATE;
  v_deadline DATE;
BEGIN
  IF NEW.avg_weekly_hours >= 32 THEN v_tier := 'FULL';
  ELSIF NEW.avg_weekly_hours >= 30 THEN v_tier := 'LIMITED';
  ELSIF NEW.employment_type IN ('TEMP', 'INTERN') THEN v_tier := 'TEMP';
  ELSE v_tier := 'CASUAL';
  END IF;
  NEW.benefit_tier := v_tier;
  SELECT coverage_start, enrollment_deadline
  INTO v_coverage_start, v_deadline
  FROM calculate_coverage_dates(NEW.hire_date, NEW.employee_category);
  NEW.coverage_start_date := v_coverage_start;
  NEW.enrollment_deadline := v_deadline;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_worker_fields
  BEFORE INSERT OR UPDATE ON workers
  FOR EACH ROW EXECUTE FUNCTION set_worker_eligibility_fields();

-- AFTER: inserts into worker_eligibility (row now exists)
CREATE OR REPLACE FUNCTION sync_worker_eligibility_after()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO worker_eligibility (worker_id, benefit_tier, employee_category, coverage_start_date, enrollment_deadline, is_within_window, days_remaining)
  VALUES (NEW.id, NEW.benefit_tier, NEW.employee_category, NEW.coverage_start_date, NEW.enrollment_deadline,
          CURRENT_DATE <= NEW.enrollment_deadline,
          NEW.enrollment_deadline - CURRENT_DATE)
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
  AFTER INSERT OR UPDATE ON workers
  FOR EACH ROW EXECUTE FUNCTION sync_worker_eligibility_after();
