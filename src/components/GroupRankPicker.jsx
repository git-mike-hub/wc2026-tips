import { GROUPS, GROUP_KEYS } from "../data/groups.js";
import { applyAutoFourthSlot, normalizeGroupSlots } from "../lib/bracket.js";
import { FLAGS, tc } from "../constants.js";

export function GroupRankPicker({ ranks, onChange, locked, results, showScore }) {
  const toggle = (group, team) => {
    if (locked) return;
    let slots = normalizeGroupSlots(ranks[group]);
    const idx = slots.indexOf(team);
    if (idx >= 0) {
      slots[idx] = null;
    } else {
      const empty = slots.findIndex((s) => !s);
      if (empty < 0) return;
      slots[empty] = team;
      slots = applyAutoFourthSlot(slots, group);
    }
    onChange({ ...ranks, [group]: slots });
  };

  const clearSlot = (group, slotIdx) => {
    if (locked) return;
    const slots = normalizeGroupSlots(ranks[group]);
    if (!slots[slotIdx]) return;
    slots[slotIdx] = null;
    onChange({ ...ranks, [group]: slots });
  };

  return (
    <div className="tips-inner">
      {GROUP_KEYS.map((g) => {
        const slots = normalizeGroupSlots(ranks[g]);
        const actual = results?.[g];

        return (
          <div key={g} className="group-board">
            <h3 className="group-board-title">Group {g}</h3>
            <div className="group-board-cols">
              <div className="group-board-teams-col">
                {GROUPS[g].map((team) => {
                  const placed = slots.includes(team);
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
                  const team = slots[i];
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
