-- Idempotent showcase profile: Nathan Song, HRIS Analyst.
-- Run after 002_seed.sql. Re-running updates the same worker instead of duplicating it.

INSERT INTO public.workers (
  id,
  employee_id,
  first_name,
  last_name,
  email,
  hire_date,
  employment_type,
  avg_weekly_hours,
  employee_category,
  job_profile_id,
  organization_id,
  work_state,
  work_city,
  role
)
VALUES (
  '91000000-0000-0000-0000-000000000000',
  'ESI-10000',
  'Nathan',
  'Song',
  'nathan.song@benefitsflow.demo',
  '2024-01-15',
  'FULL_TIME',
  40,
  'FAST_TRACK',
  'c1000000-0000-0000-0000-000000000013',
  'a1000000-0000-0000-0000-000000000009',
  'CA',
  'San Juan Capistrano',
  'HRIS_ANALYST'
)
ON CONFLICT (employee_id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  email = EXCLUDED.email,
  hire_date = EXCLUDED.hire_date,
  employment_type = EXCLUDED.employment_type,
  avg_weekly_hours = EXCLUDED.avg_weekly_hours,
  employee_category = EXCLUDED.employee_category,
  job_profile_id = EXCLUDED.job_profile_id,
  organization_id = EXCLUDED.organization_id,
  work_state = EXCLUDED.work_state,
  work_city = EXCLUDED.work_city,
  role = EXCLUDED.role,
  updated_at = NOW();

SELECT *
FROM public.vw_hris_analyst_profiles
WHERE employee_id = 'ESI-10000';
