import { getLiveFixtures, getKnockoutRoundsMeta } from "../lib/bracket.js";

const tf = (name, flags) => `${flags[name] || "🏳"} ${name}`;

export function KnockoutPicker({ flags, groupRanks, thirdGroups, winners, onPick, locked, actualWinners, showScore }) {
  const fixtures = getLiveFixtures(groupRanks, thirdGroups, winners);
  const rounds = getKnockoutRoundsMeta();

  return rounds.map(({ key, label }) => {
    const roundFixtures = fixtures.filter((f) => f.round === key);
    if (!roundFixtures.length) return null;
    return (
      <div key={key} className="card">
        <div className="card-title">{label}</div>
        {roundFixtures.map((f) => {
          if (!f.teamA && !f.teamB) {
            return (
              <div key={f.matchNum} className="ko-match ko-match-pending">
                <span className="ko-match-label">{f.label}</span>
                <span className="text-muted">Complete earlier picks first</span>
              </div>
            );
          }
          const pick = winners[f.matchNum];
          const actual = actualWinners?.[f.matchNum];
          const scored = showScore && actual;
          return (
            <div key={f.matchNum} className={`ko-match${scored && pick === actual ? " correct" : scored && pick ? " wrong" : ""}`}>
              <span className="ko-match-label">{f.label}</span>
              <div className="ko-teams">
                {[f.teamA, f.teamB].filter(Boolean).map((team) => (
                  <button
                    key={team}
                    type="button"
                    className={`ko-team-btn${pick === team ? " selected" : ""}`}
                    disabled={locked}
                    onClick={() => !locked && onPick(f.matchNum, team)}
                  >
                    {tf(team, flags)}
                  </button>
                ))}
              </div>
              {scored && (
                <span className="ko-result-meta">
                  Actual: {actual ? tf(actual, flags) : "—"}
                  {pick === actual ? " · +1 pt" : pick ? " · 0 pt" : ""}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  });
}
