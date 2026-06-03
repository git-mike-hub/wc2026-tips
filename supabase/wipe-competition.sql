-- Use migrate-bracket-format.sql for full setup.
-- This file only runs the fresh-start wipe (after migration).

SELECT wipe_bracket_competition_data();
