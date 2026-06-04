import { useRef, useEffect, useMemo } from "react";
import {
  getLiveFixtures,
  BRACKET_ROUND_ORDER,
  roundIsComplete,
} from "../lib/bracket.js";
import {
  FIXTURE_ROUND_TO_REACHING,
  scoreKnockoutBreakdown,
  teamReachScoreClass,
  teamReachPoints,
} from "../lib/scoring.js";
import { FLAGS } from "../constants.js";

function formatSeed(desc) {
  if (!desc || desc === "3rd") return desc === "3rd" ? "(3rd)" : "";
  return `(${desc.charAt(0)}${desc.slice(1)})`;
}

function sideInfo(fixture, side) {
  const team = side === "A" ? fixture.teamA : fixture.teamB;
  const desc = side === "A" ? fixture.descA : fixture.descB;
  if (team) {
    return {
      team,
      label: team,
      seed: formatSeed(desc),
      placeholder: false,
      pickable: true,
    };
  }
  if (desc && desc !== "3rd") {
    return { team: null, label: `*${desc}*`, seed: formatSeed(desc), placeholder: true, pickable: false };
  }
  if (fixture.feedFrom) {
    const num = side === "A" ? fixture.feedFrom[0] : fixture.feedFrom[1];
    return {
      team: null,
      label: `*Winner M${num}*`,
      seed: "",
      placeholder: true,
      pickable: false,
    };
  }
  return { team: null, label: "TBD", seed: "", placeholder: true, pickable: false };
}

export function KnockoutPicker({
  groupRanks,
  thirdGroups,
  winners,
  onPick,
  locked,
  actualWinners,
  showScore,
}) {
  const fixtures = getLiveFixtures(groupRanks, thirdGroups, winners);
  const scrollRef = useRef(null);
  const colRefs = useRef({});
  const prevCompleteRef = useRef({});

  const koBreakdown = useMemo(() => {
    if (!showScore || !actualWinners) return null;
    return scoreKnockoutBreakdown(winners, actualWinners);
  }, [showScore, actualWinners, winners]);

  const scrollToRoundColumn = (roundKey) => {
    const container = scrollRef.current;
    const col = colRefs.current[roundKey];
    if (!col) return;

    if (container) {
      const pad = 12;
      const colRect = col.getBoundingClientRect();
      const contRect = container.getBoundingClientRect();
      const left = container.scrollLeft + (colRect.left - contRect.left) - pad;
      container.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
    }

    const navOffset = 72;
    const top = col.getBoundingClientRect().top + window.scrollY - navOffset;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  };

  useEffect(() => {
    const live = getLiveFixtures(groupRanks, thirdGroups, winners);
    const keys = BRACKET_ROUND_ORDER.map((r) => r.key);
    for (let i = 0; i < keys.length - 1; i++) {
      const r = keys[i];
      const was = prevCompleteRef.current[r];
      const now = roundIsComplete(r, live, winners);
      prevCompleteRef.current[r] = now;
      if (!was && now) {
        const next = keys[i + 1];
        requestAnimationFrame(() => {
          requestAnimationFrame(() => scrollToRoundColumn(next));
        });
        break;
      }
    }
  }, [winners, groupRanks, thirdGroups]);

  const columnReachRound = (fixtureRound) => FIXTURE_ROUND_TO_REACHING[fixtureRound];

  return (
    <div className="bracket-page">
      <p className="bracket-page-intro">
        Pick winners to build your bracket (visual only). Scoring: <strong>1 pt</strong> for each team you
        correctly predicted to reach a round (R16, QF, SF, Final) — even on a different path.
        Finalists: <strong>+5</strong> each · Champion: <strong>+10</strong>.
      </p>
      <div className="bracket-scroll-wrap">
        <div className="bracket-scroll" ref={scrollRef}>
          {BRACKET_ROUND_ORDER.map(({ key, label }, colIdx) => {
            const roundFixtures = fixtures.filter((f) => f.round === key);
            if (!roundFixtures.length) return null;
            const reaching = columnReachRound(key);
            const roundScore = reaching && koBreakdown?.byRound[reaching];

            return (
              <div
                key={key}
                className="bracket-column"
                ref={(el) => {
                  colRefs.current[key] = el;
                }}
              >
                <h3 className="bracket-column-title">{label}</h3>
                {roundScore?.scored && (
                  <p className="bracket-round-score">
                    Reach {roundScore.label}: <strong>{roundScore.points}</strong> / {roundScore.possible} pts
                  </p>
                )}
                <div className="bracket-column-matches">
                  {roundFixtures.map((f) => {
                    const pick = winners[f.matchNum];
                    const ready = f.teamA && f.teamB;
                    const sideA = sideInfo(f, "A");
                    const sideB = sideInfo(f, "B");

                    return (
                      <div key={f.matchNum} className="bracket-match-wrap">
                        {f.feedFrom && colIdx > 0 && (
                          <div className="bracket-feed-badge">
                            <span>Feeds</span>
                            <span>M{f.matchNum}</span>
                          </div>
                        )}
                        <div className="bracket-match-card">
                          <div className="bracket-match-head">
                            <span className="bracket-match-id">M{f.matchNum}</span>
                            {f.date && (
                              <span className="bracket-match-meta">
                                {f.date}
                                {f.city ? ` · ${f.city}` : ""}
                              </span>
                            )}
                          </div>
                          {!ready ? (
                            <p className="bracket-pending-msg">Complete earlier picks first</p>
                          ) : (
                            <div className="bracket-teams">
                              {[sideA, sideB].map((side) => {
                                if (!side.team && !side.pickable) {
                                  return (
                                    <div
                                      key={side.label}
                                      className="bracket-team-row placeholder"
                                      style={{ cursor: "default" }}
                                    >
                                      <span className="bracket-team-flag">🏳</span>
                                      <span className="bracket-team-name">{side.label}</span>
                                      {side.seed && <span className="bracket-team-seed">{side.seed}</span>}
                                    </div>
                                  );
                                }
                                const team = side.team;
                                const reachClass = teamReachScoreClass(
                                  team,
                                  f.round,
                                  winners,
                                  actualWinners,
                                  showScore
                                );
                                const reachPts = teamReachPoints(
                                  team,
                                  f.round,
                                  winners,
                                  actualWinners,
                                  showScore
                                );
                                return (
                                  <button
                                    key={team}
                                    type="button"
                                    className={`bracket-team-row${pick === team ? " selected" : ""}${reachClass}`}
                                    disabled={locked || !team}
                                    onClick={() => !locked && team && onPick(f.matchNum, team)}
                                  >
                                    <span className="bracket-team-flag">{FLAGS[team] || "🏳"}</span>
                                    <span className="bracket-team-name">{team}</span>
                                    {side.seed && <span className="bracket-team-seed">{side.seed}</span>}
                                    {reachPts !== null && (
                                      <span
                                        className={`bracket-team-pts${reachPts === 1 ? " earned" : ""}`}
                                        title={reachPts === 1 ? "Correct reach pick" : "Did not advance"}
                                      >
                                        {reachPts} pt
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <p className="bracket-hint">
        Swipe between rounds · green = team correctly predicted to reach that round
      </p>
    </div>
  );
}
