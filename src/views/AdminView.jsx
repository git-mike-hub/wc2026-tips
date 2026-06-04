import { useState, useEffect } from "react";
import { FLAGS, supabase, hashPIN } from "../constants.js";
import { isGroupRankingComplete, getThirdPlaceTeamsFromGroups } from "../lib/bracket.js";
import {
  loadResults,
  saveGroupResults,
  saveThirdResults,
  saveKnockoutResult,
  getParticipantPoints,
  loadParticipantsBracketReady,
} from "../lib/api.js";
import { GroupRankPicker } from "../components/GroupRankPicker.jsx";
import { KnockoutPicker } from "../components/KnockoutPicker.jsx";

export function AdminView({ tipsLocked, setTipsLocked }) {
  const [tab, setTab] = useState("groups");
  const [groupRanks, setGroupRanks] = useState({});
  const [thirdGroups, setThirdGroups] = useState([]);
  const [knockout, setKnockout] = useState({});
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
    setKnockout(res.knockout || {});
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

  const saveRankSnapshot = async () => {
    const { data: parts } = await supabase.from("participants").select("id");
    const res = await loadResults(supabase);
    const scores = await Promise.all(
      (parts || []).map(async (p) => ({ id: p.id, total: (await getParticipantPoints(supabase, p.id, res)).total }))
    );
    scores.sort((a, b) => b.total - a.total);
    const rankMap = {};
    scores.forEach((p, i) => { rankMap[p.id] = i + 1; });
    await supabase.from("settings").upsert({ key: "prev_ranks", value: JSON.stringify(rankMap) }, { onConflict: "key" });
  };

  const saveGroups = async () => {
    setSaving(true);
    await saveGroupResults(supabase, groupRanks);
    await saveRankSnapshot();
    setMsg((m) => ({ ...m, groups: "✅ Saved & scored" }));
    setTimeout(() => setMsg((m) => ({ ...m, groups: "" })), 3000);
    setSaving(false);
  };

  const saveThird = async () => {
    setSaving(true);
    await saveThirdResults(supabase, thirdGroups);
    await saveRankSnapshot();
    setMsg((m) => ({ ...m, third: "✅ Saved & scored" }));
    setTimeout(() => setMsg((m) => ({ ...m, third: "" })), 3000);
    setSaving(false);
  };

  const pickKo = async (matchNum, team) => {
    const next = { ...knockout, [matchNum]: team };
    setKnockout(next);
    setSaving(true);
    setMsg((m) => ({ ...m, knockout: "" }));
    try {
      await saveKnockoutResult(supabase, matchNum, team);
      await saveRankSnapshot();
      const n = Object.keys(next).length;
      setMsg((m) => ({
        ...m,
        knockout: `✅ M${matchNum} saved — ${n} match result${n === 1 ? "" : "s"} in · rankings updated`,
      }));
      setTimeout(() => setMsg((m) => ({ ...m, knockout: "" })), 5000);
    } catch {
      setMsg((m) => ({ ...m, knockout: "❌ Could not save match result" }));
      setKnockout(knockout);
    }
    setSaving(false);
  };

  const resetCompetition = async () => {
    if (!confirm("Delete ALL brackets and results? Everyone starts fresh.")) return;
    setResetBusy(true);
    setResetMsg("");
    const { error } = await supabase.rpc("wipe_bracket_competition_data");
    if (error) setResetMsg("Run supabase/migrate-bracket-format.sql first, then try again.");
    else {
      await loadAll();
      setResetMsg("✅ Wiped.");
    }
    setResetBusy(false);
    setTimeout(() => setResetMsg(""), 5000);
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
      const { data: prevData } = await supabase.from("settings").select("value").eq("key", "prev_ranks").maybeSingle();
      try {
        const prevRanks = JSON.parse(prevData?.value || "{}");
        if (prevRanks[p.id]) {
          delete prevRanks[p.id];
          await supabase.from("settings").upsert(
            { key: "prev_ranks", value: JSON.stringify(prevRanks) },
            { onConflict: "key" }
          );
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
        <>
          <p className="section-intro">
            Enter match winners as games finish — each pick saves immediately and updates everyone&apos;s points and
            rankings. You do not need to fill the whole bracket at once.
          </p>
          {msg.knockout && (
            <div className={`alert ${msg.knockout.startsWith("✅") ? "alert-success" : "alert-error"}`} style={{ margin: "0 0 12px" }}>
              {msg.knockout}
            </div>
          )}
          <p className="count-badge" style={{ marginBottom: 12 }}>
            {Object.keys(knockout).length} match result{Object.keys(knockout).length === 1 ? "" : "s"} saved
            {saving ? " · saving…" : ""}
          </p>
          <KnockoutPicker
            groupRanks={groupRanks}
            thirdGroups={thirdGroups}
            winners={knockout}
            onPick={pickKo}
            locked={false}
            adminResultsMode
          />
        </>
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
