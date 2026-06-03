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

  for (const m of MATCHES.r32) {
    const [teamA, teamB] = resolveR32MatchTeams(m, groupRankings, advancingThirdGroups);
    out.push({ round: "r32", matchNum: m.num, teamA, teamB, label: `M${m.num}` });
  }

  const chain = [
    { round: "r16", defs: MATCHES.r16, prior: MATCHES.r32 },
    { round: "quarters", defs: MATCHES.quarters, prior: MATCHES.r16 },
    { round: "semis", defs: MATCHES.semis, prior: MATCHES.quarters },
  ];

  for (const { round, defs, prior } of chain) {
    const priorNums = prior.map((m) => m.num);
    for (const m of defs) {
      const [iA, iB] = m.from;
      out.push({
        round,
        matchNum: m.num,
        teamA: w[priorNums[iA]] || null,
        teamB: w[priorNums[iB]] || null,
        label: `M${m.num}`,
      });
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

  out.push({
    round: "third",
    matchNum: MATCHES.third.num,
    teamA: loser(sf0, s0),
    teamB: loser(sf1, s1),
    label: `M${MATCHES.third.num}`,
  });
  out.push({
    round: "final",
    matchNum: MATCHES.final.num,
    teamA: w[s0] || null,
    teamB: w[s1] || null,
    label: `M${MATCHES.final.num}`,
  });

  return out;
}

export function getKnockoutRoundsMeta() {
  return [
    { key: "r32", label: "Round of 32" },
    { key: "r16", label: "Round of 16" },
    { key: "quarters", label: "Quarter-finals" },
    { key: "semis", label: "Semi-finals" },
    { key: "third", label: "Third-place play-off" },
    { key: "final", label: "Final" },
  ];
}

export function getPredictedFinalists(winnersByNum) {
  return [winnersByNum[MATCHES.semis[0].num], winnersByNum[MATCHES.semis[1].num]].filter(Boolean);
}

export function getThirdPlaceTeamsFromGroups(groupRankings) {
  return GROUP_KEYS.map((g) => ({ group: g, team: groupRankings[g]?.[2] })).filter((x) => x.team);
}

export function isGroupRankingComplete(ranks) {
  return GROUP_KEYS.every((g) => ranks[g]?.filter(Boolean).length === 4);
}

export function completeGroupRanking(partial, group) {
  const teams = [...GROUPS[group]];
  const picked = partial[group] || [];
  if (picked.length < 3) return picked;
  const fourth = teams.find((t) => !picked.includes(t));
  return fourth ? [...picked, fourth] : picked;
}

export { MATCHES, R32_NUM_TO_IDX };
