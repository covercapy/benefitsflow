-- Time Sessions: logs every clock-in / clock-out punch
-- Run this in your Supabase SQL Editor before using Time Clock features

CREATE TABLE IF NOT EXISTS time_sessions (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id       text        NOT NULL,
  display_name    text,
  clock_in        timestamptz NOT NULL DEFAULT now(),
  clock_out       timestamptz,
  duration_minutes integer,       -- filled on clock-out
  pay_period      text,           -- e.g. '2026-07-01/2026-07-15'
  created_at      timestamptz DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_ts_worker   ON time_sessions(worker_id);
CREATE INDEX IF NOT EXISTS idx_ts_period   ON time_sessions(pay_period);
CREATE INDEX IF NOT EXISTS idx_ts_clock_in ON time_sessions(clock_in DESC);

-- RLS: workers see their own punches; authorized HR roles see all punches.
ALTER TABLE time_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_demo" ON time_sessions;
DROP POLICY IF EXISTS "time_sessions_read" ON time_sessions;
DROP POLICY IF EXISTS "time_sessions_insert" ON time_sessions;
DROP POLICY IF EXISTS "time_sessions_update" ON time_sessions;

CREATE POLICY "time_sessions_read" ON time_sessions
  FOR SELECT USING (
    worker_id = (SELECT profile.worker_id FROM user_profiles profile WHERE profile.id = auth.uid())
    OR current_app_role() IN ('BENEFITS_PARTNER', 'HRIS_ANALYST', 'HR_LEADERSHIP')
  );

CREATE POLICY "time_sessions_insert" ON time_sessions
  FOR INSERT WITH CHECK (
    worker_id = (SELECT profile.worker_id FROM user_profiles profile WHERE profile.id = auth.uid())
  );

CREATE POLICY "time_sessions_update" ON time_sessions
  FOR UPDATE USING (
    worker_id = (SELECT profile.worker_id FROM user_profiles profile WHERE profile.id = auth.uid())
  ) WITH CHECK (
    worker_id = (SELECT profile.worker_id FROM user_profiles profile WHERE profile.id = auth.uid())
  );
