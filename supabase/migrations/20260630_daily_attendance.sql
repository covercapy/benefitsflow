CREATE TABLE IF NOT EXISTS daily_attendance (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  work_date date NOT NULL,
  worker_id text NOT NULL,
  display_name text,
  first_clock_in timestamptz NOT NULL,
  last_clock_out timestamptz,
  total_minutes integer NOT NULL DEFAULT 0,
  shift_count integer NOT NULL DEFAULT 1,
  pay_period text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(work_date, worker_id)
);

CREATE INDEX IF NOT EXISTS idx_da_worker ON daily_attendance(worker_id);
CREATE INDEX IF NOT EXISTS idx_da_date ON daily_attendance(work_date DESC);
CREATE INDEX IF NOT EXISTS idx_da_period ON daily_attendance(pay_period);

ALTER TABLE daily_attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_demo" ON daily_attendance FOR ALL USING (true) WITH CHECK (true);
