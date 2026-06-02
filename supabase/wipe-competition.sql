-- INTENTIONAL FRESH START (you asked to wipe dummy data)
-- Safe to run: only touches match_tips, match results, and prev_ranks.
-- Does NOT delete participants, knockout picks, or champion tips.
-- https://supabase.com/dashboard/project/ydiunjgokejzcvpohjrc/sql/new

-- Allow the app to delete match tips (missing from original setup)
DROP POLICY IF EXISTS "Public delete match_tips" ON match_tips;
CREATE POLICY "Public delete match_tips" ON match_tips FOR DELETE USING (true);

-- Remove all group-stage match tips
DELETE FROM match_tips
WHERE id IS NOT NULL;

-- Clear only matches that have a result entered
UPDATE matches
SET result_home = NULL,
    result_away = NULL,
    result_entered_at = NULL
WHERE result_home IS NOT NULL
   OR result_away IS NOT NULL
   OR result_entered_at IS NOT NULL;

-- Reset rank-change tracking on the leaderboard
INSERT INTO settings (key, value)
VALUES ('prev_ranks', '{}')
ON CONFLICT (key) DO UPDATE SET value = '{}';

-- Lets the app Admin panel wipe tips/results in the future (no SQL needed)
CREATE OR REPLACE FUNCTION wipe_match_competition_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM match_tips WHERE id IS NOT NULL;
  UPDATE matches
  SET result_home = NULL,
      result_away = NULL,
      result_entered_at = NULL
  WHERE result_home IS NOT NULL
     OR result_away IS NOT NULL
     OR result_entered_at IS NOT NULL;
  INSERT INTO settings (key, value)
  VALUES ('prev_ranks', '{}')
  ON CONFLICT (key) DO UPDATE SET value = '{}';
END;
$$;

GRANT EXECUTE ON FUNCTION wipe_match_competition_data() TO anon, authenticated;
