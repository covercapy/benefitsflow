-- Human-readable worker views for Supabase Table Editor and HRIS reporting.

CREATE OR REPLACE VIEW public.vw_worker_directory
WITH (security_invoker = true)
AS
SELECT
  worker.id AS worker_id,
  worker.employee_id,
  CONCAT_WS(' ', COALESCE(worker.preferred_name, worker.first_name), worker.last_name) AS display_name,
  profile.title AS job_title,
  family.name AS job_family,
  organization.name AS organization,
  worker.work_state,
  CONCAT_WS(', ', worker.work_city, worker.work_state) AS work_location,
  REPLACE(worker.employment_type::TEXT, '_', ' ') AS employment_type,
  worker.avg_weekly_hours AS scheduled_weekly_hours,
  worker.employee_category::TEXT AS employee_category,
  worker.benefit_tier::TEXT AS benefit_tier,
  REPLACE(worker.role, '_', ' ') AS security_role,
  worker.hire_date,
  worker.coverage_start_date,
  worker.enrollment_deadline,
  worker.worker_status::TEXT AS worker_status,
  worker.email,
  COALESCE(election.enrollment_status::TEXT, 'NOT_STARTED') AS dental_status,
  COALESCE(plan.plan_name, '—') AS dental_plan,
  election.coverage_tier::TEXT AS dental_coverage_tier
FROM public.workers worker
LEFT JOIN public.job_profiles profile ON profile.id = worker.job_profile_id
LEFT JOIN public.job_families family ON family.id = profile.job_family_id
LEFT JOIN public.organizations organization ON organization.id = worker.organization_id
LEFT JOIN LATERAL (
  SELECT dental_election.*
  FROM public.dental_elections dental_election
  WHERE dental_election.worker_id = worker.id AND dental_election.end_date IS NULL
  ORDER BY dental_election.created_at DESC
  LIMIT 1
) election ON TRUE
LEFT JOIN public.dental_plans plan ON plan.id = election.plan_id;

CREATE OR REPLACE VIEW public.vw_hris_analyst_profiles
WITH (security_invoker = true)
AS
SELECT *
FROM public.vw_worker_directory
WHERE security_role = 'HRIS ANALYST';

COMMENT ON VIEW public.vw_worker_directory IS
  'Readable worker directory joining worker, job, job family, organization, location, eligibility, and security role.';

COMMENT ON VIEW public.vw_hris_analyst_profiles IS
  'HRIS Analyst workers, including the Nathan Song demonstration profile.';

CREATE OR REPLACE VIEW public.vw_dental_accumulator_report
WITH (security_invoker = true)
AS
SELECT
  worker.id AS worker_id,
  CONCAT_WS(' ', COALESCE(worker.preferred_name, worker.first_name), worker.last_name) AS display_name,
  plan.plan_name,
  accumulator.plan_year,
  accumulator.deductible_individual_used,
  plan.deductible_individual,
  accumulator.annual_max_used,
  plan.calendar_year_max,
  accumulator.ortho_lifetime_used,
  plan.ortho_lifetime_max
FROM public.dental_accumulators accumulator
JOIN public.workers worker ON worker.id = accumulator.worker_id
JOIN public.dental_elections election ON election.worker_id = worker.id AND election.end_date IS NULL
JOIN public.dental_plans plan ON plan.id = election.plan_id;
