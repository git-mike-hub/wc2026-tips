import { useState, useEffect } from "react";
import { FLAGS, supabase } from "../constants.js";
import {
  isGroupRankingComplete,
  getThirdPlaceTeamsFromGroups,
  isBracketTipsComplete,
} from "../lib/bracket.js";
import { loadParticipantTips, saveParticipantTips, loadResults } from "../lib/api.js";
import { GroupRankPicker } from "../components/GroupRankPicker.jsx";
import { KnockoutPicker } from "../components/KnockoutPicker.jsx";

export function TipsView({ user, tipsLocked }) {
  const [tab, setTab] = useState("groups");
  const [groupRanks, setGroupRanks] = useState({});
  const [thirdGroups, setThirdGroups] = useState([]);
  const [knockout, setKnockout] = useState({});
  const [results, setResults] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [tips, res] = await Promise.all([
        loadParticipantTips(supabase, user.id),
        loadResults(supabase),
      ]);
      setGroupRanks(tips.groupRanks);
      setThirdGroups(tips.thirdGroups);
      setKnockout(tips.knockout);
      setResults(res);
      setLoading(false);
    })();
  }, [user.id]);

  const groupsDone = isGroupRankingComplete(groupRanks);
  const thirdOptions = getThirdPlaceTeamsFromGroups(groupRanks);
  const thirdDone = thirdGroups.length === 8;
  const koCount = Object.keys(knockout).length;

  const toggleThird = (group) => {
    if (tipsLocked) return;
    setThirdGroups((prev) => {
      if (prev.includes(group)) return prev.filter((g) => g !== group);
      if (prev.length >= 8) return prev;
      return [...prev, group];
    });
    setDirty(true);
  };

  const saveAll = async () => {
    setSaving(true);
    setSaveMsg("");
    const wasThirdTab = tab === "third";
    try {
      await saveParticipantTips(supabase, user.id, { groupRanks, thirdGroups, knockout });
      setDirty(false);
      const complete = isBracketTipsComplete(groupRanks, thirdGroups, knockout);
      setSaveMsg(complete ? "✅ Bracket saved!" : "✅ Progress saved — come back anytime to finish.");
      if (wasThirdTab && thirdDone) {
        setTab("knockout");
      }
    } catch {
      setSaveMsg("❌ Error saving. Try again.");
    }
    setSaving(false);
    setTimeout(() => setSaveMsg(""), 4000);
  };

  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>;

  return (
    <div className={tab === "knockout" ? "app-wide" : ""} style={{ paddingBottom: tipsLocked ? 0 : 80 }}>
      <div className="tips-inner" style={{ margin: "24px 0 16px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: "var(--gold)" }}>⚽ My Bracket</h2>
        {tipsLocked
          ? <span className="alert alert-warn" style={{ margin: 0 }}>🔒 Tips locked — view only</span>
          : <span className="text-muted">{groupsDone ? "Groups ✓" : "Groups…"} · {thirdDone ? "3rd ✓" : `${thirdGroups.length}/8 3rd`} · {koCount} KO picks</span>}
      </div>
      {saveMsg && <div className={`alert ${saveMsg.startsWith("✅") ? "alert-success" : "alert-error"}`}>{saveMsg}</div>}

      <div className="tips-tabs" style={tab === "knockout" ? { padding: "0 16px" } : undefined}>
        <button type="button" className={`tips-tab${tab === "groups" ? " active" : ""}`} onClick={() => setTab("groups")}>Group Stage</button>
        <button type="button" className={`tips-tab${tab === "third" ? " active" : ""}`} onClick={() => setTab("third")} disabled={!groupsDone}>Best 8 Third</button>
        <button type="button" className={`tips-tab${tab === "knockout" ? " active" : ""}`} onClick={() => setTab("knockout")} disabled={!thirdDone}>Knockout</button>
      </div>

      {tab === "groups" && (
        <>
          <p className="section-intro">Rank all 4 teams in each group (tap 1st → 4th; 4th fills automatically). <strong>1 pt</strong> per correct position.</p>
          <GroupRankPicker
            ranks={groupRanks}
            onChange={(r) => { setGroupRanks(r); setDirty(true); }}
            locked={tipsLocked}
            results={results?.groups}
            showScore={!!Object.keys(results?.groups || {}).length}
          />
          {!tipsLocked && groupsDone && (
            <div className="step-nav">
              <button type="button" className="btn btn-primary" style={{ maxWidth: 220 }} onClick={() => setTab("third")}>Continue to Best 8 Third →</button>
            </div>
          )}
        </>
      )}

      {tab === "third" && (
        <div className="tips-inner">
        <div className="card">
          <div className="card-title">Best 8 third-placed teams</div>
          <p className="section-intro">Pick which 8 of the 12 third-placed teams advance. <strong>1 pt</strong> each correct pick.</p>
          <div className="team-grid">
            {thirdOptions.map(({ group, team }) => (
              <div
                key={group}
                className={`team-chip${thirdGroups.includes(group) ? " selected" : ""}${tipsLocked ? " locked" : ""}`}
                style={tipsLocked ? { pointerEvents: "none" } : {}}
                onClick={() => toggleThird(group)}
              >
                {FLAGS[team] || "🏳"} {team} <span style={{ color: "var(--text3)", fontSize: 11 }}>(3rd {group})</span>
              </div>
            ))}
          </div>
          <p className="count-badge">{thirdGroups.length}/8 selected</p>
          {!tipsLocked && thirdDone && (
            <button type="button" className="btn btn-primary mt-16" style={{ maxWidth: 220 }} onClick={() => setTab("knockout")}>Continue to Knockout →</button>
          )}
        </div>
        </div>
      )}

      {tab === "knockout" && (
        <>
          <KnockoutPicker
            groupRanks={groupRanks}
            thirdGroups={thirdGroups}
            winners={knockout}
            onPick={(num, team) => {
              setKnockout((k) => ({ ...k, [num]: team }));
              setDirty(true);
            }}
            locked={tipsLocked}
            actualWinners={results?.knockout}
            showScore={!!Object.keys(results?.knockout || {}).length}
          />
        </>
      )}

      {!tipsLocked && dirty && (
        <div className="save-bar">
          <div className="save-bar-inner">
            <span className="text-muted">Unsaved changes</span>
            <button type="button" className="btn-save" onClick={saveAll} disabled={saving}>{saving ? "Saving…" : "Save Bracket"}</button>
          </div>
        </div>
      )}
    </div>
  );
}
