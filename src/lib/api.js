import { GROUP_KEYS } from "../data/groups.js";
import { MATCHES } from "../data/matches.js";
import { isBracketTipsComplete, normalizeGroupSlots } from "./bracket.js";
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

const PREV_RANKS_KEY = "prev_ranks";

export const RANK_BASELINE_SQL_HINT =
  "Run supabase/settings-policies.sql in the Supabase SQL editor (fixes rank arrows).";

function normalizeRankMap(rankMap) {
  const out = {};
  for (const [id, rank] of Object.entries(rankMap || {})) {
    out[String(id)] = Number(rank);
  }
  return out;
}

function parseRankBaselineValue(value) {
  if (value == null || value === "") return {};
  let raw = value;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      return {};
    }
  }
  if (raw && typeof raw === "object" && raw.v === 2 && raw.baseline) {
    return normalizeRankMap(raw.baseline);
  }
  return normalizeRankMap(raw);
}

/** Current leaderboard position by participant id (1 = first). */
export async function computeParticipantRankMap(supabase) {
  const { data: parts } = await supabase.from("participants").select("id");
  const res = await loadResults(supabase);
  const scores = await Promise.all(
    (parts || []).map(async (p) => ({
      id: String(p.id),
      total: (await getParticipantPoints(supabase, p.id, res)).total,
    }))
  );
  scores.sort((a, b) => b.total - a.total || a.id.localeCompare(b.id));
  const rankMap = {};
  scores.forEach((p, i) => {
    rankMap[p.id] = i + 1;
  });
  return rankMap;
}

export async function loadRankBaseline(supabase) {
  const { data, error } = await supabase.from("settings").select("value").eq("key", PREV_RANKS_KEY).maybeSingle();
  if (error || !data?.value) return {};
  return parseRankBaselineValue(data.value);
}

/** @deprecated alias */
export const loadPrevRanks = loadRankBaseline;

/** Standings to compare against (ranks before the latest Admin scoring save). */
export async function persistRankBaseline(supabase, rankMap) {
  const payload = { v: 2, baseline: normalizeRankMap(rankMap) };
  await assertNoError(
    await supabase.from("settings").upsert(
      { key: PREV_RANKS_KEY, value: JSON.stringify(payload) },
      { onConflict: "key" }
    ),
    "Could not save rank baseline"
  );
}

/** @deprecated alias */
export const persistPrevRanks = persistRankBaseline;

export function countRankMovements(beforeMap, afterMap) {
  const ids = new Set([...Object.keys(beforeMap), ...Object.keys(afterMap)]);
  let moved = 0;
  for (const id of ids) {
    if (beforeMap[id] !== afterMap[id]) moved += 1;
  }
  return moved;
}

/** Leaderboard rows with rank, points, and change vs stored baseline. */
export async function buildLeaderboardRows(supabase, { includeChampionPick = false } = {}) {
  const { data: parts } = await supabase.from("participants").select("id,name,is_admin").order("name");
  const res = await loadResults(supabase);
  const baseline = await loadRankBaseline(supabase);
  const hasBaseline = Object.keys(baseline).length > 0;

  let championByParticipant = null;
  if (includeChampionPick) {
    const { data: koRows } = await supabase
      .from("knockout_tips")
      .select("participant_id, winner_team")
      .eq("match_num", MATCHES.final.num);
    championByParticipant = {};
    for (const r of koRows || []) {
      championByParticipant[String(r.participant_id)] = r.winner_team;
    }
  }

  const rows = await Promise.all(
    (parts || []).map(async (p) => ({
      id: String(p.id),
      name: p.name,
      is_admin: p.is_admin,
      total: (await getParticipantPoints(supabase, p.id, res)).total,
    }))
  );
  rows.sort((a, b) => b.total - a.total || a.id.localeCompare(b.id));

  return rows.map((p, i) => {
    const rank = i + 1;
    const prevRank = baseline[p.id];
    let change = null;
    if (hasBaseline && prevRank != null) {
      change = prevRank - rank;
    }
    const championPick = includeChampionPick ? championByParticipant?.[p.id] || null : null;
    return { ...p, rank, prevRank: prevRank ?? null, change, hasBaseline, championPick };
  });
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
  await assertNoError(
    await supabase
      .from("knockout_results")
      .upsert({ match_num: matchNum, winner_team: winner }, { onConflict: "match_num" }),
    "Could not save knockout result"
  );
}

/** Map participant id → true when group, third, and knockout tips are all complete. */
export async function loadParticipantsBracketReady(supabase) {
  const [{ data: gr }, { data: th }, { data: ko }] = await Promise.all([
    supabase.from("group_rank_tips").select("participant_id, group_name, team_name, position"),
    supabase.from("third_place_tips").select("participant_id, group_name"),
    supabase.from("knockout_tips").select("participant_id, match_num, winner_team"),
  ]);

  const tipsById = {};
  const ensure = (id) => {
    if (!tipsById[id]) {
      tipsById[id] = { groupRanks: {}, thirdGroups: [], knockout: {} };
    }
    return tipsById[id];
  };

  (gr || []).forEach((r) => {
    const t = ensure(r.participant_id);
    if (!t.groupRanks[r.group_name]) t.groupRanks[r.group_name] = [null, null, null, null];
    const pos = r.position - 1;
    if (pos >= 0 && pos < 4) t.groupRanks[r.group_name][pos] = r.team_name;
  });
  (th || []).forEach((r) => ensure(r.participant_id).thirdGroups.push(r.group_name));
  (ko || []).forEach((r) => {
    ensure(r.participant_id).knockout[r.match_num] = r.winner_team;
  });

  const ready = {};
  for (const [id, tips] of Object.entries(tipsById)) {
    ready[id] = isBracketTipsComplete(tips.groupRanks, tips.thirdGroups, tips.knockout);
  }
  return ready;
}

const WIPE_SENTINEL_UUID = "00000000-0000-0000-0000-000000000000";

/** Clear all bracket tips, admin results, and rank baseline (participants unchanged). */
export async function wipeBracketCompetitionData(supabase) {
  const { error: rpcError } = await supabase.rpc("wipe_bracket_competition_data");
  if (!rpcError) return;

  const tables = [
    ["group_rank_tips", "id", WIPE_SENTINEL_UUID],
    ["third_place_tips", "id", WIPE_SENTINEL_UUID],
    ["knockout_tips", "id", WIPE_SENTINEL_UUID],
    ["group_results", "group_name", ""],
    ["third_place_results", "group_name", ""],
    ["knockout_results", "match_num", -1],
  ];
  for (const [table, col, sentinel] of tables) {
    await assertNoError(
      await supabase.from(table).delete().neq(col, sentinel),
      `Could not clear ${table}`
    );
  }
  try {
    await persistRankBaseline(supabase, {});
  } catch {
    await supabase.from("settings").upsert({ key: PREV_RANKS_KEY, value: "{}" }, { onConflict: "key" });
  }
}
