import { GROUPS, GROUP_KEYS } from "../data/groups.js";
import { completeGroupRanking } from "../lib/bracket.js";

const tf = (name, flags) => `${flags[name] || "🏳"} ${name}`;
const ORD = ["1st", "2nd", "3rd", "4th"];

export function GroupRankPicker({ flags, ranks, onChange, locked, results, showScore }) {
  const toggle = (group, team) => {
    if (locked) return;
    const cur = ranks[group] || [];
    let next;
    if (cur.includes(team)) next = cur.filter((t) => t !== team);
    else if (cur.length >= 3) return;
    else next = [...cur, team];
    const full = next.length === 3 ? completeGroupRanking({ [group]: next }, group) : next;
    onChange({ ...ranks, [group]: full });
  };

  return GROUP_KEYS.map((g) => {
    const order = ranks[g] || [];
    const full = order.length === 3 ? completeGroupRanking({ [g]: order }, g) : order;
    const actual = results?.[g];
    return (
      <div key={g} className="card group-card">
        <div className="group-header">GROUP {g}</div>
        <div className="rank-slots">
          {ORD.map((label, i) => (
            <div key={label} className="rank-slot">
              <span className="rank-slot-label">{label}</span>
              <span className={`rank-slot-team${showScore && actual?.[i] && full[i] === actual[i] ? " correct" : showScore && actual?.[i] && full[i] ? " wrong" : ""}`}>
                {full[i] ? tf(full[i], flags) : "—"}
              </span>
            </div>
          ))}
        </div>
        {!locked && (
          <div className="team-grid">
            {GROUPS[g].map((team) => {
              const idx = full.indexOf(team);
              const selected = idx >= 0;
              return (
                <div
                  key={team}
                  className={`team-chip${selected ? " selected" : ""}`}
                  onClick={() => toggle(g, team)}
                >
                  {selected && <span className="rank-chip-badge">{idx + 1}</span>}
                  {tf(team, flags)}
                </div>
              );
            })}
          </div>
        )}
        {!locked && <p className="count-badge">Tap teams in order: 1st → 2nd → 3rd (4th fills automatically)</p>}
      </div>
    );
  });
}
