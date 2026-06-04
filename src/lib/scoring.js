import { MATCHES } from "../data/matches.js";
import { GROUP_KEYS } from "../data/groups.js";
import { getPredictedFinalists } from "./bracket.js";

/** Rounds scored by “team reaches this stage” (not by match winner). */
export const KNOCKOUT_SCORING_ROUNDS = [
  { key: "r16", label: "Round of 16", feeder: "r32" },
  { key: "quarters", label: "Quarter-finals", feeder: "r16" },
  { key: "semis", label: "Semi-finals", feeder: "quarters" },
  { key: "final", label: "Final", feeder: "semis" },
];

/** Which “reach” round applies when viewing fixtures in a bracket column. */
export const FIXTURE_ROUND_TO_REACHING = {
  r32: "r16",
  r16: "quarters",
  quarters: "semis",
  semis: "final",
};

const FEEDER_MATCHES = {
  r16: MATCHES.r32,
  quarters: MATCHES.r16,
  semis: MATCHES.quarters,
  final: MATCHES.semis,
};

/** Teams a bracket path sends into `targetRound` (winners of the prior round). */
export function getTeamsReachingRound(winnersByNum, targetRound) {
  const feeder = FEEDER_MATCHES[targetRound];
  if (!feeder) return { teams: new Set(), complete: false };
  const teams = new Set();
  let complete = true;
  for (const m of feeder) {
    const w = winnersByNum?.[m.num];
    if (!w) {
      complete = false;
      continue;
    }
    teams.add(w);
  }
  return { teams, complete };
}

/** @param {Record<string, string[]>} groupRankings */
export function scoreGroupTips(tipsByGroup, actualByGroup) {
  let pts = 0;
  for (const g of GROUP_KEYS) {
    const actual = actualByGroup[g];
    const tip = tipsByGroup[g];
    if (!actual?.length || !tip?.length) continue;
    for (let i = 0; i < 4; i++) {
      if (tip[i] && actual[i] && tip[i] === actual[i]) pts += 1;
    }
  }
  return pts;
}

export function scoreThirdPlaceTips(tippedGroups, actualGroups) {
  const actual = new Set(actualGroups || []);
  let pts = 0;
  for (const g of tippedGroups || []) {
    if (actual.has(g)) pts += 1;
  }
  return pts;
}

/** 1 pt per team correctly predicted to reach each knockout round (path-independent). */
export function scoreKnockoutTips(tipsByNum, actualByNum) {
  return scoreKnockoutBreakdown(tipsByNum, actualByNum).total;
}

export function countKnockoutResultsEntered(actualByNum) {
  return Object.keys(actualByNum || {}).length;
}

export function scoreKnockoutBreakdown(tipsByNum, actualByNum) {
  let total = 0;
  const byRound = {};
  for (const { key, label } of KNOCKOUT_SCORING_ROUNDS) {
    const tip = getTeamsReachingRound(tipsByNum, key);
    const act = getTeamsReachingRound(actualByNum, key);
    const feeder = FEEDER_MATCHES[key];
    const enteredCount = feeder.filter((m) => actualByNum?.[m.num]).length;

    if (enteredCount === 0) {
      byRound[key] = { label, points: 0, possible: 0, scored: false, partial: false, enteredCount: 0, feederTotal: feeder.length };
      continue;
    }
    let points = 0;
    for (const t of tip.teams) {
      if (act.teams.has(t)) points += 1;
    }
    byRound[key] = {
      label,
      points,
      possible: act.teams.size,
      scored: true,
      partial: !act.complete,
      enteredCount,
      feederTotal: feeder.length,
    };
    total += points;
  }
  return { total, byRound };
}

export function scoreFinalistBonus(tipsByNum, actualByNum) {
  const tipFinalists = new Set(getPredictedFinalists(tipsByNum));
  let pts = 0;
  for (const m of MATCHES.semis) {
    const actual = actualByNum?.[m.num];
    if (actual && tipFinalists.has(actual)) pts += 5;
  }
  return pts;
}

export function scoreChampionBonus(tipsByNum, actualByNum) {
  const tip = tipsByNum[MATCHES.final.num];
  const actual = actualByNum[MATCHES.final.num];
  return tip && actual && tip === actual ? 10 : 0;
}

export function calculateTotalPoints(groupTips, thirdTips, knockoutTips, results) {
  const groupPts = scoreGroupTips(groupTips, results.groups);
  const thirdPts = scoreThirdPlaceTips(thirdTips, results.thirdGroups);
  const koBreakdown = scoreKnockoutBreakdown(knockoutTips, results.knockout);
  const finalistPts = scoreFinalistBonus(knockoutTips, results.knockout);
  const champPts = scoreChampionBonus(knockoutTips, results.knockout);
  return {
    total: groupPts + thirdPts + koBreakdown.total + finalistPts + champPts,
    groupPts,
    thirdPts,
    koPts: koBreakdown.total,
    koByRound: koBreakdown.byRound,
    finalistPts,
    champPts,
  };
}

export function isGroupResultsComplete(actualByGroup, group) {
  const actual = actualByGroup?.[group];
  return !!(actual?.length === 4 && actual.every(Boolean));
}

export function hasAnyGroupResults(actualByGroup) {
  return GROUP_KEYS.some((g) => isGroupResultsComplete(actualByGroup, g));
}

export function scoreSingleGroup(tipSlots, actualSlots) {
  if (!actualSlots?.length || !actualSlots.every(Boolean)) return null;
  let pts = 0;
  for (let i = 0; i < 4; i++) {
    if (tipSlots?.[i] && actualSlots[i] && tipSlots[i] === actualSlots[i]) pts += 1;
  }
  return pts;
}

export function scoreGroupByGroup(tipsByGroup, actualByGroup) {
  const byGroup = {};
  for (const g of GROUP_KEYS) {
    byGroup[g] = isGroupResultsComplete(actualByGroup, g)
      ? scoreSingleGroup(tipsByGroup[g], actualByGroup[g])
      : null;
  }
  return byGroup;
}

export function hasThirdPlaceResults(actualGroups) {
  return (actualGroups || []).length === 8;
}

export function hasAnyKnockoutResults(actualByNum) {
  return countKnockoutResultsEntered(actualByNum) > 0;
}

/** @deprecated alias */
export function hasKnockoutResultsForScoring(actualByNum) {
  return hasAnyKnockoutResults(actualByNum);
}

/** Per-match reach pts when user picked this team to win the match and result is entered. */
export function teamMatchReachPoints(team, matchNum, tipsByNum, actualByNum, showScore) {
  if (!showScore || !team || matchNum == null) return null;
  if (tipsByNum?.[matchNum] !== team) return null;
  const actualWinner = actualByNum?.[matchNum];
  if (!actualWinner) return null;
  return actualWinner === team ? 1 : 0;
}

export function teamChampionPoints(team, matchNum, tipsByNum, actualByNum, showScore) {
  if (!showScore || matchNum !== MATCHES.final.num) return null;
  if (tipsByNum?.[matchNum] !== team) return null;
  const actual = actualByNum?.[matchNum];
  if (!actual) return null;
  return actual === team ? 10 : 0;
}

/** UI helper: class suffix for a team row when results exist. */
export function teamReachScoreClass(team, matchNum, tipsByNum, actualByNum, showScore) {
  const champ = teamChampionPoints(team, matchNum, tipsByNum, actualByNum, showScore);
  if (champ !== null) return champ === 10 ? " reach-correct" : " reach-wrong";
  const pts = teamMatchReachPoints(team, matchNum, tipsByNum, actualByNum, showScore);
  if (pts === null) return "";
  return pts === 1 ? " reach-correct" : " reach-wrong";
}
