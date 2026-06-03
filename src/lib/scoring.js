import { MATCHES } from "../data/matches.js";
import { GROUP_KEYS } from "../data/groups.js";
import { getPredictedFinalists } from "./bracket.js";

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

export function scoreKnockoutTips(tipsByNum, actualByNum) {
  let pts = 0;
  for (const [num, winner] of Object.entries(actualByNum || {})) {
    if (tipsByNum[num] && tipsByNum[num] === winner) pts += 1;
  }
  return pts;
}

export function scoreFinalistBonus(tipsByNum, actualByNum) {
  const tipFinalists = new Set(getPredictedFinalists(tipsByNum));
  const actualFinalists = new Set(getPredictedFinalists(actualByNum));
  let pts = 0;
  for (const t of tipFinalists) {
    if (actualFinalists.has(t)) pts += 5;
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
  const koPts = scoreKnockoutTips(knockoutTips, results.knockout);
  const finalistPts = scoreFinalistBonus(knockoutTips, results.knockout);
  const champPts = scoreChampionBonus(knockoutTips, results.knockout);
  return {
    total: groupPts + thirdPts + koPts + finalistPts + champPts,
    groupPts,
    thirdPts,
    koPts,
    finalistPts,
    champPts,
  };
}
