-- ============================================================
-- WC 2026 — Bracket tables (NON-DESTRUCTIVE)
-- Use this if Supabase warns about destructive ops and you only
-- need the new bracket tables. Does NOT drop old match_tips etc.
-- https://supabase.com/dashboard/project/ydiunjgokejzcvpohjrc/sql/new
-- ============================================================

CREATE TABLE IF NOT EXISTS group_rank_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  group_name TEXT NOT NULL,
  team_name TEXT NOT NULL,
  position INT NOT NULL CHECK (position BETWEEN 1 AND 4),
  points_earned NUMERIC(8,2) DEFAULT 0,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (participant_id, group_name, position)
);

CREATE TABLE IF NOT EXISTS third_place_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  group_name TEXT NOT NULL,
  points_earned NUMERIC(8,2) DEFAULT 0,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (participant_id, group_name)
);

CREATE TABLE IF NOT EXISTS knockout_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  match_num INT NOT NULL,
  winner_team TEXT NOT NULL,
  points_earned NUMERIC(8,2) DEFAULT 0,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (participant_id, match_num)
);

CREATE TABLE IF NOT EXISTS group_results (
  group_name TEXT NOT NULL,
  team_name TEXT NOT NULL,
  position INT NOT NULL CHECK (position BETWEEN 1 AND 4),
  entered_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (group_name, position)
);

CREATE TABLE IF NOT EXISTS third_place_results (
  group_name TEXT PRIMARY KEY,
  entered_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS knockout_results (
  match_num INT PRIMARY KEY,
  winner_team TEXT NOT NULL,
  entered_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE group_rank_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE third_place_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE knockout_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE third_place_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE knockout_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read group_rank_tips" ON group_rank_tips;
CREATE POLICY "Public read group_rank_tips" ON group_rank_tips FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert group_rank_tips" ON group_rank_tips;
CREATE POLICY "Public insert group_rank_tips" ON group_rank_tips FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public update group_rank_tips" ON group_rank_tips;
CREATE POLICY "Public update group_rank_tips" ON group_rank_tips FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Public delete group_rank_tips" ON group_rank_tips;
CREATE POLICY "Public delete group_rank_tips" ON group_rank_tips FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public read third_place_tips" ON third_place_tips;
CREATE POLICY "Public read third_place_tips" ON third_place_tips FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert third_place_tips" ON third_place_tips;
CREATE POLICY "Public insert third_place_tips" ON third_place_tips FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public update third_place_tips" ON third_place_tips;
CREATE POLICY "Public update third_place_tips" ON third_place_tips FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Public delete third_place_tips" ON third_place_tips;
CREATE POLICY "Public delete third_place_tips" ON third_place_tips FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public read knockout_tips" ON knockout_tips;
CREATE POLICY "Public read knockout_tips" ON knockout_tips FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert knockout_tips" ON knockout_tips;
CREATE POLICY "Public insert knockout_tips" ON knockout_tips FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public update knockout_tips" ON knockout_tips;
CREATE POLICY "Public update knockout_tips" ON knockout_tips FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Public delete knockout_tips" ON knockout_tips;
CREATE POLICY "Public delete knockout_tips" ON knockout_tips FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public read group_results" ON group_results;
CREATE POLICY "Public read group_results" ON group_results FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert group_results" ON group_results;
CREATE POLICY "Public insert group_results" ON group_results FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public update group_results" ON group_results;
CREATE POLICY "Public update group_results" ON group_results FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Public delete group_results" ON group_results;
CREATE POLICY "Public delete group_results" ON group_results FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public read third_place_results" ON third_place_results;
CREATE POLICY "Public read third_place_results" ON third_place_results FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert third_place_results" ON third_place_results;
CREATE POLICY "Public insert third_place_results" ON third_place_results FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public delete third_place_results" ON third_place_results;
CREATE POLICY "Public delete third_place_results" ON third_place_results FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public read knockout_results" ON knockout_results;
CREATE POLICY "Public read knockout_results" ON knockout_results FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert knockout_results" ON knockout_results;
CREATE POLICY "Public insert knockout_results" ON knockout_results FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public update knockout_results" ON knockout_results;
CREATE POLICY "Public update knockout_results" ON knockout_results FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Public delete knockout_results" ON knockout_results;
CREATE POLICY "Public delete knockout_results" ON knockout_results FOR DELETE USING (true);

CREATE OR REPLACE FUNCTION wipe_bracket_competition_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM group_rank_tips;
  DELETE FROM third_place_tips;
  DELETE FROM knockout_tips;
  DELETE FROM group_results;
  DELETE FROM third_place_results;
  DELETE FROM knockout_results;
  INSERT INTO settings (key, value)
  VALUES ('prev_ranks', '{}')
  ON CONFLICT (key) DO UPDATE SET value = '{}';
END;
$$;

GRANT EXECUTE ON FUNCTION wipe_bracket_competition_data() TO anon, authenticated;
