/** User-facing message for save failures (Supabase / network). */
export function formatSaveError(err) {
  const msg = [err?.message, err?.cause?.message].filter(Boolean).join(" ");
  if (
    /group_rank_tips|third_place_tips|knockout_tips|group_results|knockout_results/i.test(msg) &&
    /schema cache|could not find|does not exist|relation.*does not exist/i.test(msg)
  ) {
    return (
      "Bracket database tables are missing. In Supabase → SQL Editor, run the full script " +
      "supabase/migrate-bracket-format.sql on this project, then save again."
    );
  }
  return msg || "Error saving. Try again.";
}
