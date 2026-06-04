-- Fix admin "Wipe all tips & results" + run one wipe now.
-- https://supabase.com/dashboard/project/ydiunjgokejzcvpohjrc/sql/new

CREATE OR REPLACE FUNCTION wipe_bracket_competition_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM group_rank_tips WHERE id IS NOT NULL;
  DELETE FROM third_place_tips WHERE id IS NOT NULL;
  DELETE FROM knockout_tips WHERE id IS NOT NULL;
  DELETE FROM group_results WHERE group_name IS NOT NULL;
  DELETE FROM third_place_results WHERE group_name IS NOT NULL;
  DELETE FROM knockout_results WHERE match_num IS NOT NULL;
  INSERT INTO settings (key, value)
  VALUES ('prev_ranks', '{}')
  ON CONFLICT (key) DO UPDATE SET value = '{}';
END;
$$;

GRANT EXECUTE ON FUNCTION wipe_bracket_competition_data() TO anon, authenticated;

SELECT wipe_bracket_competition_data();
