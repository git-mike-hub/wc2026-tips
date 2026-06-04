import { MATCHES } from "../data/matches.js";
import { THIRD_PLACE_COMBOS } from "../data/thirdPlaceCombos.js";
import { R32_NUM_TO_IDX } from "../data/r32NumToIdx.js";
import { THIRD_PLACE_MATCH_SLOTS } from "../data/thirdPlaceMatchSlots.js";
import { GROUPS, GROUP_KEYS } from "../data/groups.js";

export function getThirdPlaceAssignments(advancingThirdGroups) {
  const key = [...advancingThirdGroups].sort().join("");
  return THIRD_PLACE_COMBOS[key] || null;
}

export function getTeamFromDescriptor(desc, groupRankings) {
  const pos = parseInt(desc.charAt(0), 10) - 1;
  const group = desc.charAt(1);
  return groupRankings[group]?.[pos] || null;
}

export function getThirdPlaceTeamForMatch(matchNum, assignments, groupRankings) {
  if (!assignments?.length) return null;
  const idx = THIRD_PLACE_MATCH_SLOTS[matchNum];
  if (idx === undefined) return null;
  const group = assignments[idx].replace("3", "");
  return groupRankings[group]?.[2] || null;
}

export function resolveR32MatchTeams(match, groupRankings, advancingThirdGroups) {
  const assignments = getThirdPlaceAssignments(advancingThirdGroups);
  const t1 =
    match.teams[0] === "3rd"
      ? getThirdPlaceTeamForMatch(match.num, assignments, groupRankings)
      : getTeamFromDescriptor(match.teams[0], groupRankings);
  const t2 =
    match.teams[1] === "3rd"
      ? getThirdPlaceTeamForMatch(match.num, assignments, groupRankings)
      : getTeamFromDescriptor(match.teams[1], groupRankings);
  return [t1, t2];
}

/** All knockout fixtures with teams resolved from group picks + knockout winners entered so far. */
export function getLiveFixtures(groupRankings, advancingThirdGroups, winnersByNum = {}) {
  const w = { ...winnersByNum };
  const out = [];

  const pushMatch = (round, m, teamA, teamB, descA, descB, feedFrom) => {
    out.push({
      round,
      matchNum: m.num,
      date: m.date,
      city: m.city,
      teamA,
      teamB,
      descA: descA ?? null,
      descB: descB ?? null,
      feedFrom: feedFrom ?? null,
      label: `M${m.num}`,
    });
  };

  for (const m of MATCHES.r32) {
    const [teamA, teamB] = resolveR32MatchTeams(m, groupRankings, advancingThirdGroups);
    pushMatch("r32", m, teamA, teamB, m.teams[0], m.teams[1]);
  }

  const chain = [
    { round: "r16", defs: MATCHES.r16, prior: MATCHES.r32 },
    { round: "quarters", defs: MATCHES.quarters, prior: MATCHES.r16 },
    { round: "semis", defs: MATCHES.semis, prior: MATCHES.quarters },
  ];

  for (const { round, defs, prior } of chain) {
    const priorNums = prior.map((pm) => pm.num);
    for (const m of defs) {
      const [iA, iB] = m.from;
      pushMatch(round, m, w[priorNums[iA]] || null, w[priorNums[iB]] || null, null, null, [
        priorNums[iA],
        priorNums[iB],
      ]);
    }
  }

  const s0 = MATCHES.semis[0].num;
  const s1 = MATCHES.semis[1].num;
  const sf0 = out.find((f) => f.matchNum === s0);
  const sf1 = out.find((f) => f.matchNum === s1);
  const loser = (sf, num) => {
    if (!sf?.teamA || !sf?.teamB || !w[num]) return null;
    return w[num] === sf.teamA ? sf.teamB : sf.teamA;
  };

  pushMatch("third", MATCHES.third, loser(sf0, s0), loser(sf1, s1), null, null, [s0, s1]);
  pushMatch("final", MATCHES.final, w[s0] || null, w[s1] || null, null, null, [s0, s1]);

  return out;
}

export const BRACKET_ROUND_ORDER = [
  { key: "r32", label: "Round of 32" },
  { key: "r16", label: "Round of 16" },
  { key: "quarters", label: "Quarter-finals" },
  { key: "semis", label: "Semi-finals" },
  { key: "third", label: "Third-place" },
  { key: "final", label: "Final" },
];

export function getKnockoutRoundsMeta() {
  return BRACKET_ROUND_ORDER;
}

export function roundIsComplete(round, allFixtures, winners) {
  const rf = allFixtures.filter((f) => f.round === round);
  return rf.length > 0 && rf.every((f) => f.teamA && f.teamB && winners[f.matchNum]);
}

export function getPredictedFinalists(winnersByNum) {
  return [winnersByNum[MATCHES.semis[0].num], winnersByNum[MATCHES.semis[1].num]].filter(Boolean);
}

export function getPredictedChampion(knockout) {
  return knockout?.[MATCHES.final.num] || null;
}

/** Semi winners + champion (bonus picks), in bracket order. */
export function getTop3BracketPicks(knockout) {
  const w = knockout || {};
  return [
    w[MATCHES.semis[0].num] || null,
    w[MATCHES.semis[1].num] || null,
    w[MATCHES.final.num] || null,
  ];
}

export function getThirdPlaceTeamsFromGroups(groupRankings) {
  return GROUP_KEYS.map((g) => {
    const slots = normalizeGroupSlots(groupRankings[g]);
    return { group: g, team: slots[2] };
  }).filter((x) => x.team);
}

/** Four slots per group: index 0 = 1st … index 3 = 4th (null = unfilled). */
export function normalizeGroupSlots(order) {
  const slots = [null, null, null, null];
  if (!order?.length) return slots;

  const hasGap = order.slice(0, 4).some((t, i) => !t && order.slice(i + 1, 4).some(Boolean));
  if (hasGap) {
    for (let i = 0; i < 4; i++) {
      if (order[i]) slots[i] = order[i];
    }
    return slots;
  }

  order.filter(Boolean).slice(0, 4).forEach((team, i) => {
    slots[i] = team;
  });
  return slots;
}

export function applyAutoFourthSlot(slots, group) {
  const s = [...normalizeGroupSlots(slots)];
  if (s.filter(Boolean).length === 3) {
    const fourth = GROUPS[group].find((t) => !s.includes(t));
    const idx = s.findIndex((x) => !x);
    if (fourth && idx >= 0) s[idx] = fourth;
  }
  return s;
}

export function isGroupRankingComplete(ranks) {
  return GROUP_KEYS.every((g) => normalizeGroupSlots(ranks[g]).every(Boolean));
}

export function getAllKnockoutMatchNums() {
  return [
    ...MATCHES.r32.map((m) => m.num),
    ...MATCHES.r16.map((m) => m.num),
    ...MATCHES.quarters.map((m) => m.num),
    ...MATCHES.semis.map((m) => m.num),
    MATCHES.third.num,
    MATCHES.final.num,
  ];
}

export function isKnockoutTipsComplete(knockout) {
  const w = knockout || {};
  return getAllKnockoutMatchNums().every((num) => w[num]);
}

export function isBracketTipsComplete(groupRanks, thirdGroups, knockout) {
  return (
    isGroupRankingComplete(groupRanks) &&
    (thirdGroups || []).length === 8 &&
    isKnockoutTipsComplete(knockout)
  );
}

/** First tips tab that still needs work; null if bracket is complete. */
export function getIncompleteTipsTab(groupRanks, thirdGroups, knockout) {
  if (!isGroupRankingComplete(groupRanks)) return "groups";
  if ((thirdGroups || []).length < 8) return "third";
  if (!isKnockoutTipsComplete(knockout)) return "knockout";
  return null;
}

export function hasStartedBracketTips(groupRanks, thirdGroups, knockout) {
  if (GROUP_KEYS.some((g) => normalizeGroupSlots(groupRanks[g]).some(Boolean))) return true;
  if ((thirdGroups || []).length > 0) return true;
  if (Object.keys(knockout || {}).length > 0) return true;
  return false;
}

export function completeGroupRanking(partial, group) {
  const teams = [...GROUPS[group]];
  const picked = partial[group] || [];
  if (picked.length < 3) return picked;
  const fourth = teams.find((t) => !picked.includes(t));
  return fourth ? [...picked, fourth] : picked;
}

export { MATCHES, R32_NUM_TO_IDX };
