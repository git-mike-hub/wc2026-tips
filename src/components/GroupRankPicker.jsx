import { GROUPS, GROUP_KEYS } from "../data/groups.js";
import { completeGroupRanking } from "../lib/bracket.js";
import { FLAGS, tc } from "../constants.js";

export function GroupRankPicker({ ranks, onChange, locked, results, showScore }) {
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

  const clearSlot = (group, slotIdx) => {
    if (locked) return;
    const order = ranks[group] || [];
    const display = displayOrder(order, g);
    const team = display[slotIdx];
    if (!team) return;
    onChange({ ...ranks, [group]: order.filter((t) => t !== team) });
  };

  const displayOrder = (order, g) => {
    if (order.length === 3) return completeGroupRanking({ [g]: order }, g);
    return order;
  };

  return (
    <div className="tips-inner">
      {GROUP_KEYS.map((g) => {
        const order = ranks[g] || [];
        const full = displayOrder(order, g);
        const actual = results?.[g];

        return (
          <div key={g} className="group-board">
            <h3 className="group-board-title">Group {g}</h3>
            <div className="group-board-cols">
              <div className="group-board-teams-col">
                {GROUPS[g].map((team) => {
                  const placed = full.includes(team);
                  return (
                    <button
                      key={team}
                      type="button"
                      className={`group-team-pill${placed ? " placed" : ""}`}
                      disabled={locked}
                      onClick={() => toggle(g, team)}
                    >
                      <span className="group-flag">{FLAGS[team] || "🏳"}</span>
                      <span className="group-code">{tc(team)}</span>
                    </button>
                  );
                })}
              </div>
              <div className="group-board-slots-col">
              {[0, 1, 2, 3].map((i) => {
                const team = full[i];
                const slotClass =
                  showScore && actual?.[i] && team === actual[i]
                    ? " correct"
                    : showScore && actual?.[i] && team
                      ? " wrong"
                      : "";
                return (
                  <div
                    key={`slot-${i}`}
                    className={`group-rank-slot${slotClass}`}
                    onClick={() => !locked && team && clearSlot(g, i)}
                    role="button"
                    tabIndex={locked ? -1 : 0}
                  >
                    <span className="group-rank-num">{i + 1}</span>
                    {team ? (
                      <span className="group-rank-fill">
                        <span className="group-flag">{FLAGS[team] || "🏳"}</span>
                        <span className="group-code">{tc(team)}</span>
                      </span>
                    ) : null}
                  </div>
                );
              })}
              </div>
            </div>
            {!locked && (
              <p className="group-hint">Tap teams in order (1st → 4th). Tap a filled slot to remove that pick.</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
