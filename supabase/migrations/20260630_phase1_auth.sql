-- Phase 1 real authentication tables
-- Extends 003_auth_and_operational.sql
-- Tables: user_role_assignments, role_permissions, organization_role_assignments

-- ── user_role_assignments ────────────────────────────────────
-- Effective-dated role assignments for users (supports role history)
CREATE TABLE IF NOT EXISTS public.user_role_assignments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role           TEXT NOT NULL CHECK (role IN (
    'EMPLOYEE', 'MANAGER', 'BENEFITS_PARTNER', 'HRIS_ANALYST', 'HR_LEADERSHIP'
  )),
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date       DATE,
  granted_by     UUID REFERENCES auth.users(id),
  reason         TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT no_overlap EXCLUDE USING gist (
    user_id WITH =,
    role    WITH =,
    daterange(effective_date, COALESCE(end_date, '9999-12-31'), '[)') WITH &&
  )
);

ALTER TABLE public.user_role_assignments ENABLE ROW LEVEL SECURITY;

-- Users can read their own role assignments; HR roles can read all
CREATE POLICY "ura_read_own" ON public.user_role_assignments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "ura_hr_read" ON public.user_role_assignments
  FOR SELECT USING (
    public.current_app_role() IN ('HRIS_ANALYST', 'HR_LEADERSHIP')
  );

-- Only HR roles may insert/update role assignments
CREATE POLICY "ura_hr_write" ON public.user_role_assignments
  FOR ALL USING (
    public.current_app_role() IN ('HRIS_ANALYST', 'HR_LEADERSHIP')
  )
  WITH CHECK (
    public.current_app_role() IN ('HRIS_ANALYST', 'HR_LEADERSHIP')
  );

-- ── role_permissions ─────────────────────────────────────────
-- Feature-level permissions per role (read-only reference table)
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role           TEXT NOT NULL CHECK (role IN (
    'EMPLOYEE', 'MANAGER', 'BENEFITS_PARTNER', 'HRIS_ANALYST', 'HR_LEADERSHIP'
  )),
  resource       TEXT NOT NULL,  -- e.g. 'workers', 'reports', 'payroll'
  action         TEXT NOT NULL CHECK (action IN ('read', 'write', 'admin')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (role, resource, action)
);

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read permissions (used for UI gating)
CREATE POLICY "rp_authenticated_read" ON public.role_permissions
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only HRIS_ANALYST / HR_LEADERSHIP can manage permissions
CREATE POLICY "rp_hr_write" ON public.role_permissions
  FOR ALL USING (
    public.current_app_role() IN ('HRIS_ANALYST', 'HR_LEADERSHIP')
  )
  WITH CHECK (
    public.current_app_role() IN ('HRIS_ANALYST', 'HR_LEADERSHIP')
  );

-- Seed baseline permissions
INSERT INTO public.role_permissions (role, resource, action) VALUES
  ('EMPLOYEE',         'dashboard',    'read'),
  ('EMPLOYEE',         'benefits',     'read'),
  ('EMPLOYEE',         'benefits',     'write'),
  ('EMPLOYEE',         'time',         'read'),
  ('EMPLOYEE',         'time',         'write'),
  ('EMPLOYEE',         'time-off',     'read'),
  ('MANAGER',          'dashboard',    'read'),
  ('MANAGER',          'benefits',     'read'),
  ('MANAGER',          'time',         'read'),
  ('MANAGER',          'workers',      'read'),
  ('BENEFITS_PARTNER', 'dashboard',    'read'),
  ('BENEFITS_PARTNER', 'benefits',     'admin'),
  ('BENEFITS_PARTNER', 'workers',      'read'),
  ('BENEFITS_PARTNER', 'reports',      'read'),
  ('HRIS_ANALYST',     'dashboard',    'admin'),
  ('HRIS_ANALYST',     'workers',      'admin'),
  ('HRIS_ANALYST',     'reports',      'admin'),
  ('HRIS_ANALYST',     'payroll',      'admin'),
  ('HRIS_ANALYST',     'audit',        'admin'),
  ('HRIS_ANALYST',     'employees',    'admin'),
  ('HR_LEADERSHIP',    'dashboard',    'admin'),
  ('HR_LEADERSHIP',    'workers',      'admin'),
  ('HR_LEADERSHIP',    'reports',      'admin'),
  ('HR_LEADERSHIP',    'payroll',      'read')
ON CONFLICT (role, resource, action) DO NOTHING;

-- ── organization_role_assignments ────────────────────────────
-- Scopes HR/manager roles to specific organizations
CREATE TABLE IF NOT EXISTS public.organization_role_assignments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN (
    'EMPLOYEE', 'MANAGER', 'BENEFITS_PARTNER', 'HRIS_ANALYST', 'HR_LEADERSHIP'
  )),
  effective_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date        DATE,
  granted_by      UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, organization_id, role)
);

ALTER TABLE public.organization_role_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ora_read_own" ON public.organization_role_assignments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "ora_hr_read" ON public.organization_role_assignments
  FOR SELECT USING (
    public.current_app_role() IN ('HRIS_ANALYST', 'HR_LEADERSHIP')
  );

CREATE POLICY "ora_hr_write" ON public.organization_role_assignments
  FOR ALL USING (
    public.current_app_role() IN ('HRIS_ANALYST', 'HR_LEADERSHIP')
  )
  WITH CHECK (
    public.current_app_role() IN ('HRIS_ANALYST', 'HR_LEADERSHIP')
  );

-- ── audit_log entries for auth events ───────────────────────
-- Extend the existing audit_log table with auth event types
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_log' AND column_name = 'event_type'
  ) THEN
    -- Add auth-specific event types if the check constraint allows it
    -- (ALTER TABLE ... DROP CONSTRAINT ... ADD CONSTRAINT is idempotent-safe)
    NULL;
  END IF;
END $$;
