import { GROUP_KEYS } from "../data/groups.js";
import { normalizeGroupSlots } from "./bracket.js";
import { calculateTotalPoints } from "./scoring.js";

export function rowsToGroupRanks(rows) {
  const groupRanks = {};
  (rows || []).forEach((r) => {
    if (!groupRanks[r.group_name]) groupRanks[r.group_name] = [null, null, null, null];
    const pos = r.position - 1;
    if (pos >= 0 && pos < 4) groupRanks[r.group_name][pos] = r.team_name;
  });
  return groupRanks;
}

export function rowsToKnockoutMap(rows) {
  const m = {};
  (rows || []).forEach((r) => {
    m[r.match_num] = r.winner_team;
  });
  return m;
}

function buildGroupRowsFromRanks(groupRanks, extraFields = () => ({})) {
  const rows = [];
  const seen = new Set();
  for (const g of GROUP_KEYS) {
    const slots = normalizeGroupSlots(groupRanks[g]);
    for (let pos = 0; pos < 4; pos++) {
      const team = slots[pos];
      if (!team) continue;
      const key = `${g}:${pos + 1}`;
      if (seen.has(key)) continue;
      seen.add(key);
      rows.push({
        group_name: g,
        team_name: team,
        position: pos + 1,
        ...extraFields(g, pos, team),
      });
    }
  }
  return rows;
}

function buildGroupRankRows(participantId, groupRanks) {
  return buildGroupRowsFromRanks(groupRanks, () => ({ participant_id: participantId }));
}

async function assertNoError(result, label) {
  if (result?.error) {
    const err = new Error(result.error.message || label);
    err.cause = result.error;
    throw err;
  }
}

export async function loadResults(supabase) {
  const [{ data: gr }, { data: th }, { data: ko }] = await Promise.all([
    supabase.from("group_results").select("*"),
    supabase.from("third_place_results").select("group_name"),
    supabase.from("knockout_results").select("*"),
  ]);
  return {
    groups: rowsToGroupRanks(gr),
    thirdGroups: (th || []).map((r) => r.group_name),
    knockout: rowsToKnockoutMap(ko),
  };
}

export async function loadParticipantTips(supabase, participantId) {
  const [{ data: gr }, { data: th }, { data: ko }] = await Promise.all([
    supabase.from("group_rank_tips").select("*").eq("participant_id", participantId),
    supabase.from("third_place_tips").select("*").eq("participant_id", participantId),
    supabase.from("knockout_tips").select("*").eq("participant_id", participantId),
  ]);
  return {
    groupRanks: rowsToGroupRanks(gr),
    thirdGroups: (th || []).map((r) => r.group_name),
    knockout: rowsToKnockoutMap(ko),
  };
}

export async function getParticipantPoints(supabase, participantId, results) {
  const tips = await loadParticipantTips(supabase, participantId);
  const res = results || (await loadResults(supabase));
  return calculateTotalPoints(tips.groupRanks, tips.thirdGroups, tips.knockout, res);
}

export async function saveParticipantTips(supabase, participantId, { groupRanks, thirdGroups, knockout }) {
  await assertNoError(
    await supabase.from("group_rank_tips").delete().eq("participant_id", participantId),
    "Could not clear group tips"
  );
  await assertNoError(
    await supabase.from("third_place_tips").delete().eq("participant_id", participantId),
    "Could not clear third-place tips"
  );
  await assertNoError(
    await supabase.from("knockout_tips").delete().eq("participant_id", participantId),
    "Could not clear knockout tips"
  );

  const groupRows = buildGroupRankRows(participantId, groupRanks);
  if (groupRows.length) {
    await assertNoError(
      await supabase.from("group_rank_tips").insert(groupRows),
      "Could not save group rankings"
    );
  }

  if (thirdGroups?.length) {
    await assertNoError(
      await supabase.from("third_place_tips").insert(
        thirdGroups.map((group_name) => ({ participant_id: participantId, group_name }))
      ),
      "Could not save third-place picks"
    );
  }

  const koRows = Object.entries(knockout || {})
    .filter(([, w]) => w)
    .map(([match_num, winner_team]) => ({
      participant_id: participantId,
      match_num: parseInt(match_num, 10),
      winner_team,
    }));
  if (koRows.length) {
    await assertNoError(
      await supabase.from("knockout_tips").insert(koRows),
      "Could not save knockout picks"
    );
  }
}

export async function saveGroupResults(supabase, groupRanks) {
  await supabase.from("group_results").delete().in("group_name", GROUP_KEYS);
  const rows = buildGroupRowsFromRanks(groupRanks);
  if (rows.length) await supabase.from("group_results").insert(rows);
}

export async function saveThirdResults(supabase, groups) {
  await supabase.from("third_place_results").delete().in("group_name", GROUP_KEYS);
  if (groups?.length) {
    await supabase.from("third_place_results").insert(groups.map((group_name) => ({ group_name })));
  }
}

export async function saveKnockoutResult(supabase, matchNum, winner) {
  await supabase.from("knockout_results").upsert({ match_num: matchNum, winner_team: winner }, { onConflict: "match_num" });
}
