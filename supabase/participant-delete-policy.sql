-- Allow admin app to delete participants (bracket tips cascade via FK).
-- Run once in Supabase SQL Editor if Remove fails with a permissions error.

DROP POLICY IF EXISTS "Public delete participants" ON participants;
CREATE POLICY "Public delete participants" ON participants FOR DELETE USING (true);
