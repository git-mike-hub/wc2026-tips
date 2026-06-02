import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://ydiunjgokejzcvpohjrc.supabase.co",
  "sb_publishable_FG_g9WZEq1ipejUrWYHIRw_PzmGdR1k"
);

const { error: rpcErr } = await supabase.rpc("wipe_match_competition_data");
if (!rpcErr) {
  console.log("Wiped via wipe_match_competition_data().");
  process.exit(0);
}

const { count: deleted, error: delErr } = await supabase
  .from("match_tips")
  .delete({ count: "exact" })
  .neq("id", "00000000-0000-0000-0000-000000000000");
if (delErr) {
  console.error(delErr.message);
  console.error("\nRun supabase/wipe-competition.sql in Supabase SQL Editor first.");
  process.exit(1);
}

const { count: remaining } = await supabase.from("match_tips").select("*", { count: "exact", head: true });
if ((remaining ?? 0) > 0) {
  console.error(`${remaining} tips still remain. Run supabase/wipe-competition.sql in Supabase SQL Editor.`);
  process.exit(1);
}

const { data: withResults } = await supabase.from("matches").select("id").not("result_home", "is", null);
if (withResults?.length) {
  const { error: clearErr } = await supabase
    .from("matches")
    .update({ result_home: null, result_away: null, result_entered_at: null })
    .in("id", withResults.map((m) => m.id));
  if (clearErr) {
    console.error(clearErr.message);
    process.exit(1);
  }
}

console.log(`Done. Deleted ${deleted ?? 0} tips; cleared ${withResults?.length ?? 0} results.`);
