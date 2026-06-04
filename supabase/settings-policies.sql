-- REQUIRED for leaderboard rank arrows (prev_ranks) and tips lock toggle.
-- Run once: https://supabase.com/dashboard/project/ydiunjgokejzcvpohjrc/sql/new
-- Run if rank baseline (prev_ranks) or tips_locked cannot be saved/read.
-- Requires: CREATE TABLE settings (key TEXT PRIMARY KEY, value TEXT);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read settings" ON settings;
CREATE POLICY "Public read settings" ON settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert settings" ON settings;
CREATE POLICY "Public insert settings" ON settings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update settings" ON settings;
CREATE POLICY "Public update settings" ON settings FOR UPDATE USING (true);
