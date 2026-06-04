import { useState, useEffect } from "react";
import { FLAGS, supabase, hashPIN } from "../constants.js";
import { isGroupRankingComplete, getThirdPlaceTeamsFromGroups } from "../lib/bracket.js";
import {
  loadResults,
  saveGroupResults,
  saveThirdResults,
  saveKnockoutResult,
  computeParticipantRankMap,
  persistRankBaseline,
  loadRankBaseline,
  countRankMovements,
  loadParticipantsBracketReady,
  wipeBracketCompetitionData,
  RANK_BASELINE_SQL_HINT,
} from "../lib/api.js";
import { GroupRankPicker } from "../components/GroupRankPicker.jsx";
import { KnockoutPicker } from "../components/KnockoutPicker.jsx";

export function AdminView({ tipsLocked, setTipsLocked }) {
  const [tab, setTab] = useState("groups");
  const [groupRanks, setGroupRanks] = useState({});
  const [thirdGroups, setThirdGroups] = useState([]);
  const [knockoutDraft, setKnockoutDraft] = useState({});
  const [knockoutSaved, setKnockoutSaved] = useState({});
  const [participants, setParticipants] = useState([]);
  const [bracketReady, setBracketReady] = useState({});
  const [newPin, setNewPin] = useState({});
  const [msg, setMsg] = useState({});
  const [loading, setLoading] = useState(true);
  const [lockBusy, setLockBusy] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [resetMsg, setResetMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [pendingRemove, setPendingRemove] = useState(null);

  const loadAll = async () => {
    setLoading(true);
    const [{ data: parts }, res, ready] = await Promise.all([
      supabase.from("participants").select("*").order("name"),
      loadResults(supabase),
      loadParticipantsBracketReady(supabase),
    ]);
    setParticipants(parts || []);
    setBracketReady(ready);
    setGroupRanks(res.groups || {});
    setThirdGroups(res.thirdGroups || []);
    const ko = res.knockout || {};
    setKnockoutDraft({ ...ko });
    setKnockoutSaved({ ...ko });
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const toggleLock = async () => {
    setLockBusy(true);
    const newVal = !tipsLocked;
    await supabase.from("settings").upsert({ key: "tips_locked", value: String(newVal) }, { onConflict: "key" });
    setTipsLocked(newVal);
    setLockBusy(false);
  };

  const rankBaselineFailedMsg = () =>
    `❌ Could not save rank baseline. ${RANK_BASELINE_SQL_HINT}`;

  const applyScoringWithRankBaseline = async (applySave) => {
    const ranksBefore = await computeParticipantRankMap(supabase);
    await applySave();
    const ranksAfter = await computeParticipantRankMap(supabase);
    const moved = countRankMovements(ranksBefore, ranksAfter);
    try {
      await persistRankBaseline(supabase, ranksBefore);
    } catch {
      const err = new Error("rank_baseline_failed");
      err.moved = moved;
      throw err;
    }
    return moved;
  };

  const setRankingBaseline = async () => {
    try {
      const current = await computeParticipantRankMap(supabase);
      await persistRankBaseline(supabase, current);
      const check = await loadRankBaseline(supabase);
      if (Object.keys(check).length === 0) {
        setMsg((m) => ({ ...m, ranks: rankBaselineFailedMsg() }));
        return;
      }
      setMsg((m) => ({
        ...m,
        ranks: "✅ Rank baseline set. Change results, save scoring, then open Ranks.",
      }));
      setTimeout(() => setMsg((m) => ({ ...m, ranks: "" })), 5000);
    } catch {
      setMsg((m) => ({ ...m, ranks: rankBaselineFailedMsg() }));
    }
  };

  const saveGroups = async () => {
    setSaving(true);
    try {
      const moved = await applyScoringWithRankBaseline(() => saveGroupResults(supabase, groupRanks));
      setMsg((m) => ({
        ...m,
        groups: moved > 0 ? `✅ Saved & scored · ${moved} players moved in rankings` : "✅ Saved & scored",
      }));
      setTimeout(() => setMsg((m) => ({ ...m, groups: "" })), 3000);
    } catch (e) {
      if (e?.message === "rank_baseline_failed") {
        setMsg((m) => ({
          ...m,
          groups: `✅ Results saved · ${e.moved} moved but ${rankBaselineFailedMsg()}`,
        }));
      } else {
        setMsg((m) => ({ ...m, groups: "❌ Could not save group results" }));
      }
    }
    setSaving(false);
  };

  const saveThird = async () => {
    setSaving(true);
    try {
      const moved = await applyScoringWithRankBaseline(() => saveThirdResults(supabase, thirdGroups));
      setMsg((m) => ({
        ...m,
        third: moved > 0 ? `✅ Saved & scored · ${moved} players moved in rankings` : "✅ Saved & scored",
      }));
      setTimeout(() => setMsg((m) => ({ ...m, third: "" })), 3000);
    } catch (e) {
      if (e?.message === "rank_baseline_failed") {
        setMsg((m) => ({
          ...m,
          third: `✅ Results saved · ${e.moved} moved but ${rankBaselineFailedMsg()}`,
        }));
      } else {
        setMsg((m) => ({ ...m, third: "❌ Could not save third-place results" }));
      }
    }
    setSaving(false);
  };

  const pickKoLocal = (matchNum, team) => {
    setKnockoutDraft((k) => ({ ...k, [matchNum]: team }));
    setMsg((m) => ({ ...m, knockout: "" }));
  };

  const koDirtyCount = Object.keys(knockoutDraft).filter(
    (num) => knockoutDraft[num] && knockoutDraft[num] !== knockoutSaved[num]
  ).length;

  const saveKoBatch = async () => {
    const toSave = Object.keys(knockoutDraft)
      .map(Number)
      .filter((num) => knockoutDraft[num] && knockoutDraft[num] !== knockoutSaved[num]);
    if (!toSave.length) return;
    setSaving(true);
    setMsg((m) => ({ ...m, knockout: "" }));
    try {
      const moved = await applyScoringWithRankBaseline(async () => {
        for (const matchNum of toSave) {
          await saveKnockoutResult(supabase, matchNum, knockoutDraft[matchNum]);
        }
        setKnockoutSaved({ ...knockoutDraft });
      });
      setMsg((m) => ({
        ...m,
        knockout:
          moved > 0
            ? `✅ Saved ${toSave.length} match result${toSave.length === 1 ? "" : "s"} · ${moved} players moved in rankings`
            : `✅ Saved ${toSave.length} match result${toSave.length === 1 ? "" : "s"} · rankings updated`,
      }));
      setTimeout(() => setMsg((m) => ({ ...m, knockout: "" })), 5000);
    } catch (e) {
      if (e?.message === "rank_baseline_failed") {
        setMsg((m) => ({
          ...m,
          knockout: `✅ Knockout saved · ${e.moved} moved but ${rankBaselineFailedMsg()}`,
        }));
      } else {
        setMsg((m) => ({ ...m, knockout: "❌ Could not save knockout results" }));
      }
    }
    setSaving(false);
  };

  const resetCompetition = async () => {
    if (!confirm("Delete ALL brackets and results? Everyone starts fresh.")) return;
    setResetBusy(true);
    setResetMsg("");
    try {
      await wipeBracketCompetitionData(supabase);
      await loadAll();
      setResetMsg("✅ All tips and results wiped.");
    } catch (e) {
      setResetMsg(
        `❌ Could not wipe. Run supabase/wipe-competition.sql in the Supabase SQL editor, then try again.${e?.message ? ` (${e.message})` : ""}`
      );
    }
    setResetBusy(false);
    setTimeout(() => setResetMsg(""), 8000);
  };

  const confirmRemoveParticipant = async () => {
    const p = pendingRemove;
    if (!p) return;
    setPendingRemove(null);
    setRemovingId(p.id);
    setMsg((m) => ({ ...m, [p.id]: "" }));
    const { error } = await supabase.from("participants").delete().eq("id", p.id);
    if (error) {
      alert(
        "Could not remove participant. If this is a permissions error, run supabase/participant-delete-policy.sql in the Supabase SQL editor, then try again."
      );
    } else {
      setParticipants((list) => list.filter((x) => x.id !== p.id));
      setBracketReady((m) => {
        const next = { ...m };
        delete next[p.id];
        return next;
      });
      try {
        const prevRanks = await loadRankBaseline(supabase);
        if (prevRanks[p.id]) {
          delete prevRanks[p.id];
          await persistRankBaseline(supabase, prevRanks);
        }
      } catch {
        /* ignore */
      }
    }
    setRemovingId(null);
  };

  const resetPin = async (participantId) => {
    const pin = newPin[participantId];
    if (!pin || pin.length !== 4) return alert("Enter a valid 4-digit PIN");
    const pin_hash = await hashPIN(pin);
    await supabase.from("participants").update({ pin_hash }).eq("id", participantId);
    setMsg((m) => ({ ...m, [participantId]: "✅ PIN reset" }));
    setNewPin((p) => ({ ...p, [participantId]: "" }));
    setTimeout(() => setMsg((m) => ({ ...m, [participantId]: "" })), 3000);
  };

  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>;

  const groupsDone = isGroupRankingComplete(groupRanks);
  const thirdOptions = getThirdPlaceTeamsFromGroups(groupRanks);

  return (
    <div>
      <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: "var(--green)", margin: "24px 0 16px" }}>⚙️ Admin</h2>

      <div className="lock-toggle">
        <div>
          <div style={{ fontWeight: 700 }}>{tipsLocked ? "🔒 Tips locked" : "🟢 Tips open"}</div>
          <div className="lock-status-desc">{tipsLocked ? "No new submissions." : "Participants can edit brackets."}</div>
        </div>
        <button type="button" className={`btn-sm ${tipsLocked ? "btn-green" : "btn-red"}`} onClick={toggleLock} disabled={lockBusy}>
          {lockBusy ? "…" : tipsLocked ? "Unlock" : "Lock Tips"}
        </button>
      </div>

      <div className="card">
        <div className="card-title">📊 Ranking arrows</div>
        <p className="section-intro" style={{ marginBottom: 10 }}>
          Rankings compare to the baseline from <strong>before</strong> each scoring save. To test arrows: tap
          &quot;Set baseline&quot;, change results, save scoring, then open Ranks.
        </p>
        {msg.ranks && <div className="alert alert-success" style={{ marginBottom: 10 }}>{msg.ranks}</div>}
        <button type="button" className="btn-sm btn-green" onClick={setRankingBaseline}>
          Set baseline from current standings
        </button>
      </div>

      <div className="card">
        <div className="card-title">🔄 Fresh start</div>
        {resetMsg && <div className={`alert ${resetMsg.startsWith("✅") ? "alert-success" : "alert-warn"}`}>{resetMsg}</div>}
        <button type="button" className="btn-sm btn-red" onClick={resetCompetition} disabled={resetBusy}>
          {resetBusy ? "Wiping…" : "Wipe all tips & results"}
        </button>
      </div>

      <div className="admin-tabs">
        <button type="button" className={`admin-tab${tab === "groups" ? " active" : ""}`} onClick={() => setTab("groups")}>Group Results</button>
        <button type="button" className={`admin-tab${tab === "third" ? " active" : ""}`} onClick={() => setTab("third")}>Best 8 Third</button>
        <button type="button" className={`admin-tab${tab === "knockout" ? " active" : ""}`} onClick={() => setTab("knockout")}>Knockout</button>
        <button type="button" className={`admin-tab${tab === "participants" ? " active" : ""}`} onClick={() => setTab("participants")}>Participants</button>
      </div>

      {tab === "groups" && (
        <>
          <p className="section-intro">Enter actual finishing positions for all 12 groups.</p>
          <GroupRankPicker ranks={groupRanks} onChange={setGroupRanks} locked={false} />
          <button type="button" className="btn btn-primary" style={{ maxWidth: 200 }} onClick={saveGroups} disabled={saving || !groupsDone}>
            {saving ? "Saving…" : "Save & Score Groups"}
          </button>
          {msg.groups && <span className="result-saved" style={{ marginLeft: 12 }}>{msg.groups}</span>}
        </>
      )}

      {tab === "third" && (
        <div className="tips-inner">
          <div className="card">
            <div className="card-title">Actual best 8 third-placed teams</div>
            {!groupsDone ? (
              <p className="section-intro">Save group results first — third-placed teams come from each group&apos;s 3rd spot.</p>
            ) : (
              <>
                <p className="section-intro">Select the 8 third-placed teams that actually advance.</p>
                <div className="team-grid">
                  {thirdOptions.map(({ group, team }) => (
                    <div
                      key={group}
                      className={`team-chip${thirdGroups.includes(group) ? " selected" : ""}`}
                      onClick={() =>
                        setThirdGroups((prev) =>
                          prev.includes(group) ? prev.filter((x) => x !== group) : prev.length >= 8 ? prev : [...prev, group]
                        )
                      }
                    >
                      {FLAGS[team] || "🏳"} {team}{" "}
                      <span style={{ color: "var(--text3)", fontSize: 11 }}>(3rd {group})</span>
                    </div>
                  ))}
                </div>
                <p className="count-badge">{thirdGroups.length}/8 selected</p>
                <button
                  type="button"
                  className="btn btn-primary mt-16"
                  style={{ maxWidth: 200 }}
                  onClick={saveThird}
                  disabled={saving || thirdGroups.length !== 8}
                >
                  Save & Score
                </button>
                {msg.third && <span className="result-saved" style={{ marginLeft: 12 }}>{msg.third}</span>}
              </>
            )}
          </div>
        </div>
      )}

      {tab === "knockout" && (
        <div style={{ paddingBottom: koDirtyCount > 0 ? 80 : 0 }}>
          <p className="section-intro">
            Select as many match winners as you like, then tap <strong>Save knockout results</strong> when ready.
            Changed picks overwrite previous results and recalculate points and rankings.
          </p>
          {msg.knockout && (
            <div className={`alert ${msg.knockout.startsWith("✅") ? "alert-success" : "alert-error"}`} style={{ margin: "0 0 12px" }}>
              {msg.knockout}
            </div>
          )}
          <p className="count-badge" style={{ marginBottom: 12 }}>
            {Object.keys(knockoutSaved).length} saved
            {koDirtyCount > 0 ? ` · ${koDirtyCount} unsaved change${koDirtyCount === 1 ? "" : "s"}` : ""}
          </p>
          <KnockoutPicker
            groupRanks={groupRanks}
            thirdGroups={thirdGroups}
            winners={knockoutDraft}
            savedWinners={knockoutSaved}
            onPick={pickKoLocal}
            locked={false}
            adminResultsMode
          />
          {koDirtyCount > 0 && (
            <div className="save-bar">
              <div className="save-bar-inner">
                <span className="text-muted">{koDirtyCount} unsaved match{koDirtyCount === 1 ? "" : "es"}</span>
                <button
                  type="button"
                  className="btn-save"
                  onClick={saveKoBatch}
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save knockout results"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "participants" && (
        <>
          <p className="section-intro">{participants.length} participants.</p>
          {participants.map((p) => (
            <div key={p.id} className="participant-row">
              <div className="participant-name-wrap">
                <strong>{p.name}</strong>
                {bracketReady[p.id] && (
                  <span className="participant-ready" title="Bracket complete">
                    Ready
                  </span>
                )}
                {p.is_admin && <span style={{ fontSize: 11, color: "var(--green2)", marginLeft: 6 }}>★ admin</span>}
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  className="form-input"
                  style={{ width: 100, padding: "6px 10px" }}
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="PIN"
                  value={newPin[p.id] || ""}
                  onChange={(e) => setNewPin((n) => ({ ...n, [p.id]: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                />
                <button type="button" className="btn-sm btn-green" onClick={() => resetPin(p.id)}>Reset PIN</button>
                {!p.is_admin && (
                  <button
                    type="button"
                    className="btn-sm btn-red"
                    disabled={removingId === p.id}
                    onClick={() => setPendingRemove({ id: p.id, name: p.name })}
                  >
                    {removingId === p.id ? "Removing…" : "Remove"}
                  </button>
                )}
                {msg[p.id] && <span className="result-saved">{msg[p.id]}</span>}
              </div>
            </div>
          ))}
        </>
      )}

      {pendingRemove && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="remove-participant-title"
          onClick={() => setPendingRemove(null)}
        >
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 id="remove-participant-title" className="modal-title">Remove participant?</h3>
            <p className="modal-text">
              Do you really want to remove this user?
            </p>
            <p className="modal-text">
              <span className="modal-name">{pendingRemove.name}</span> will be deleted along with all of their bracket tips.
            </p>
            <p className="modal-warn">This cannot be undone.</p>
            <div className="modal-actions">
              <button type="button" className="btn-sm btn-secondary" style={{ background: "rgba(0,0,0,0.25)", color: "var(--text)" }} onClick={() => setPendingRemove(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-sm btn-red"
                disabled={removingId === pendingRemove.id}
                onClick={confirmRemoveParticipant}
              >
                {removingId === pendingRemove.id ? "Removing…" : "Yes, remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
