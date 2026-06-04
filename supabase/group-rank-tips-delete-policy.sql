-- Run if saving tips fails with a permission/RLS error on delete.
-- Partial saves need DELETE on tip tables before re-insert.

DROP POLICY IF EXISTS "Public delete group_rank_tips" ON group_rank_tips;
CREATE POLICY "Public delete group_rank_tips" ON group_rank_tips FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public delete third_place_tips" ON third_place_tips;
CREATE POLICY "Public delete third_place_tips" ON third_place_tips FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public delete knockout_tips" ON knockout_tips;
CREATE POLICY "Public delete knockout_tips" FOR DELETE USING (true);
