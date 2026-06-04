-- REQUIRED for Admin → Participants → Remove (bracket tips cascade via FK).
-- Run once: https://supabase.com/dashboard/project/ydiunjgokejzcvpohjrc/sql/new

DROP POLICY IF EXISTS "Public delete participants" ON participants;
CREATE POLICY "Public delete participants" ON participants FOR DELETE USING (true);
