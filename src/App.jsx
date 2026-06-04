import { useState, useEffect } from "react";
import { supabase, hashPIN, FLAGS } from "./constants.js";
import { styles } from "./styles.js";
import { buildLeaderboardRows } from "./lib/api.js";
import { TipsView } from "./views/TipsView.jsx";
import { AdminView } from "./views/AdminView.jsx";
import { AppNav } from "./components/AppNav.jsx";
import { loadParticipantTips } from "./lib/api.js";
import {
  getIncompleteTipsTab,
  getPredictedChampion,
  hasStartedBracketTips,
  isBracketTipsComplete,
} from "./lib/bracket.js";

const LOGO_WITH_NAME = "/eshkol-logo-with-name.png";
const APP_TITLE = "World Cup 2026 Competition";

function HeroBrand() {
  return (
    <>
      <img src={LOGO_WITH_NAME} alt="Eshkol" className="brand-logo brand-logo-hero" />
      <h2 className="hero-subtitle">{APP_TITLE}</h2>
    </>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("home");
  const [loading, setLoading] = useState(true);
  const [tipsLocked, setTipsLocked] = useState(false);
  const [tipsInitialTab, setTipsInitialTab] = useState("groups");
  const [homeTipsKey, setHomeTipsKey] = useState(0);

  const openTips = (tab = "groups") => {
    setTipsInitialTab(tab);
    setView("tips");
  };

  const goHomeAfterBracketSave = () => {
    setHomeTipsKey((k) => k + 1);
    setView("home");
  };

  const scrollToSignIn = () => {
    setView("home");
    window.setTimeout(() => {
      document.getElementById("sign-in")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
  };

  const goToRules = () => {
    setView("home");
    window.setTimeout(() => {
      document.getElementById("rules")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  useEffect(() => {
    const saved = localStorage.getItem("wc2026_user");
    if (saved) setUser(JSON.parse(saved));
    supabase.from("settings").select("value").eq("key", "tips_locked").maybeSingle().then(({ data }) => {
      setTipsLocked(data?.value === "true");
      setLoading(false);
    });
  }, []);

  const login = (u) => {
    setUser(u);
    localStorage.setItem("wc2026_user", JSON.stringify(u));
    openTips("groups");
  };
  const logout = () => {
    setUser(null);
    localStorage.removeItem("wc2026_user");
    setView("home");
  };

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="loading-wrap"><div className="spinner" /></div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <AppNav
        view={view}
        user={user}
        onHome={() => setView("home")}
        onRules={goToRules}
        onLeaderboard={() => setView("leaderboard")}
        onTips={() => openTips("groups")}
        onAdmin={() => setView("admin")}
        onSignIn={scrollToSignIn}
        onLogout={logout}
      />
      <div className="app">
        {view === "home" && (
          <HomeView
            user={user}
            onLogin={login}
            tipsLocked={tipsLocked}
            setView={setView}
            onContinueTips={openTips}
            onOpenBracket={() => openTips("groups")}
            tipsRefreshKey={homeTipsKey}
          />
        )}
        {view === "leaderboard" && <LeaderboardView user={user} tipsLocked={tipsLocked} />}
        {view === "tips" && user && (
          <TipsView
            key={`${user.id}-${tipsInitialTab}`}
            user={user}
            tipsLocked={tipsLocked}
            initialTab={tipsInitialTab}
            onBracketComplete={goHomeAfterBracketSave}
          />
        )}
        {view === "admin" && user?.is_admin && <AdminView tipsLocked={tipsLocked} setTipsLocked={setTipsLocked} />}
      </div>
    </>
  );
}

function HomeRulesBrief() {
  return (
    <div className="home-rules" id="rules">
      <div className="home-rules-title">How scoring works</div>
      <ul className="home-rules-list">
        <li>
          <strong>Group stage</strong> — Rank teams 1st–4th in groups A–L. <strong>1 pt</strong> per correct position.
        </li>
        <li>
          <strong>Best 8 third-placed</strong> — Pick which third-placed teams advance. <strong>1 pt</strong> each correct team.
        </li>
        <li>
          <strong>Knockout</strong> — Build your bracket by picking match winners. <strong>1 pt</strong> for every team you
          correctly predicted to reach a round (Round of 16, quarters, semis, final), even if your path was different.
        </li>
        <li>
          <strong>Bonuses</strong> — <strong>+5 pts</strong> per correct finalist · <strong>+10 pts</strong> for the champion.
        </li>
        <li>Tips lock when the admin closes submissions.</li>
      </ul>
    </div>
  );
}

function HomeView({ user, onLogin, tipsLocked, setView, onContinueTips, onOpenBracket, tipsRefreshKey }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const [bracketIncomplete, setBracketIncomplete] = useState(false);
  const [championPick, setChampionPick] = useState(null);
  const [continueTipsTab, setContinueTipsTab] = useState("groups");

  useEffect(() => {
    if (!user) {
      setBracketIncomplete(false);
      setChampionPick(null);
      return;
    }
    loadParticipantTips(supabase, user.id).then((tips) => {
      const complete = isBracketTipsComplete(tips.groupRanks, tips.thirdGroups, tips.knockout);
      setChampionPick(complete ? getPredictedChampion(tips.knockout) : null);
      if (tipsLocked) {
        setBracketIncomplete(false);
        return;
      }
      const started = hasStartedBracketTips(tips.groupRanks, tips.thirdGroups, tips.knockout);
      setBracketIncomplete(started && !complete);
      setContinueTipsTab(
        getIncompleteTipsTab(tips.groupRanks, tips.thirdGroups, tips.knockout) || "groups"
      );
    });
  }, [user?.id, tipsLocked, tipsRefreshKey]);

  const handleRegister = async () => {
    if (!name.trim()) return setError("Please enter your name.");
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) return setError("PIN must be exactly 4 digits.");
    if (pin !== pin2) return setError("PINs don't match.");
    setBusy(true);
    setError("");
    const { data: existing } = await supabase.from("participants").select("id").ilike("name", name.trim()).maybeSingle();
    if (existing) { setError("That name is already taken."); setBusy(false); return; }
    const pin_hash = await hashPIN(pin);
    const { error: err } = await supabase.from("participants").insert({ name: name.trim(), pin_hash, is_admin: false });
    if (err) { setError("Registration failed."); setBusy(false); return; }
    setSuccess("Account created! You can now log in.");
    setMode("login");
    setPin("");
    setPin2("");
    setBusy(false);
  };

  const handleLogin = async () => {
    if (!name.trim() || !pin) return setError("Enter your name and PIN.");
    setBusy(true);
    setError("");
    const { data } = await supabase.from("participants").select("*").ilike("name", name.trim()).maybeSingle();
    if (!data) { setError("Name not found."); setBusy(false); return; }
    if ((await hashPIN(pin)) !== data.pin_hash) { setError("Wrong PIN."); setBusy(false); return; }
    onLogin(data);
  };

  if (user) {
    return (
      <div>
        <div className="hero">
          <HeroBrand />
          <div className="hero-deadline">{tipsLocked ? <>🔒 Tips <strong>locked</strong></> : <>🟢 Tips <strong>open</strong></>}</div>
          {championPick ? (
            <div className="hero-champion-pick">
              <p className="hero-champion-line">
                Your World Champion pick is:{" "}
                <span className="hero-champion-team">
                  <span className="hero-champion-flag" aria-hidden="true">{FLAGS[championPick] || "🏳"}</span>
                  {championPick}
                </span>
              </p>
              <p className="hero-champion-luck">Good Luck 🤞</p>
            </div>
          ) : bracketIncomplete ? (
            <div className="hero-bracket-warning">
              ⚠️ You still need to finish filling out your bracket.{" "}
              <button
                type="button"
                className="hero-bracket-warning-link"
                onClick={() => onContinueTips(continueTipsTab)}
              >
                Continue your picks →
              </button>
            </div>
          ) : null}
        </div>
        <div className="card">
          <div className="card-title">👋 Welcome, {user.name}!</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="button" className="btn btn-primary" style={{ maxWidth: 160 }} onClick={onOpenBracket}>
              My Bracket
            </button>
            <button type="button" className="btn btn-secondary" style={{ maxWidth: 160 }} onClick={() => setView("leaderboard")}>Ranks</button>
          </div>
        </div>
        <HomeRulesBrief />
      </div>
    );
  }

  return (
    <div>
      <div className="hero">
        <HeroBrand />
        <div className="hero-deadline">{tipsLocked ? <>🔒 Tips <strong>locked</strong></> : <>🟢 Submit your full bracket before kickoff!</>}</div>
      </div>
      <div className="home-auth-stack">
        <div className="card">
          <div className="card-title">🚀 Get started</div>
          <p className="section-intro" style={{ padding: 0 }}>
            Register with your name and a 4-digit PIN, then fill in your full bracket before tips lock.
            Check the rankings anytime to see how you stack up.
          </p>
        </div>
        <div className="card" id="sign-in">
          <div className="card-title">🔐 {mode === "login" ? "Sign In" : "Register"}</div>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          <div className="form-group">
            <label className="form-label">Your Name</label>
            <input className="form-input" placeholder="e.g. Alex" value={name} onChange={(e) => { setName(e.target.value); setError(""); }} />
          </div>
          <div className="form-group">
            <label className="form-label">4-Digit PIN</label>
            <input className="form-input" type="password" inputMode="numeric" maxLength={4} value={pin} onChange={(e) => { setPin(e.target.value.replace(/\D/g, "")); setError(""); }} />
          </div>
          {mode === "register" && (
            <div className="form-group">
              <label className="form-label">Confirm PIN</label>
              <input className="form-input" type="password" inputMode="numeric" maxLength={4} value={pin2} onChange={(e) => { setPin2(e.target.value.replace(/\D/g, "")); setError(""); }} />
            </div>
          )}
          <button type="button" className="btn btn-primary" onClick={mode === "login" ? handleLogin : handleRegister} disabled={busy}>
            {busy ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
          </button>
          <div className="text-center mt-16">
            <button type="button" style={{ background: "none", border: "none", color: "var(--green2)", cursor: "pointer", fontWeight: 700 }} onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); setSuccess(""); }}>
              {mode === "login" ? "Register here" : "Sign in instead"}
            </button>
          </div>
        </div>
      </div>
      <HomeRulesBrief />
    </div>
  );
}

function LeaderboardView({ user, tipsLocked }) {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLeaderboard = async () => {
    setLoading(true);
    const rows = await buildLeaderboardRows(supabase, { includeChampionPick: tipsLocked });
    setParticipants(rows);
    setLoading(false);
  };

  useEffect(() => {
    loadLeaderboard();
    const onVisible = () => {
      if (document.visibilityState === "visible") loadLeaderboard();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [tipsLocked]);

  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>;

  return (
    <div>
      <div style={{ margin: "24px 0 16px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: "var(--green)" }}>🏆 Rankings</h2>
        <button type="button" className="btn-sm btn-green" onClick={loadLeaderboard}>↻ Refresh</button>
      </div>
      {participants.some((p) => p.change !== null && p.change !== 0) && (
        <p className="section-intro" style={{ margin: "0 0 12px" }}>
          <span className="rank-change rank-up">▲</span> moved up ·{" "}
          <span className="rank-change rank-down">▼</span> moved down since last Admin scoring save
        </p>
      )}
      {participants.length > 0 && !participants[0].hasBaseline && (
        <p className="section-intro" style={{ margin: "0 0 12px" }}>
          No rank baseline yet — usually means Supabase is blocking saves. In Admin, tap &quot;Set baseline&quot;;
          if you see an error, run <code>supabase/settings-policies.sql</code> in the SQL editor, then try again.
        </p>
      )}
      {participants.length > 0 && participants[0].hasBaseline && !participants.some((p) => p.change !== null && p.change !== 0) && (
        <p className="section-intro" style={{ margin: "0 0 12px" }}>
          No position changes vs the last baseline (standings match the snapshot from before the latest scoring save).
        </p>
      )}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th style={{ paddingLeft: 16 }}>#</th>
              <th>Player</th>
              {tipsLocked && <th>WC Tip</th>}
              <th>Change</th>
              <th style={{ textAlign: "right", paddingRight: 16 }}>Points</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((p, i) => (
              <tr key={p.id}>
                <td style={{ paddingLeft: 16 }}><span className={`rank-badge rank-${p.rank <= 3 ? p.rank : "other"}`}>{p.rank}</span></td>
                <td><strong>{p.name}</strong>{user?.id === p.id && <span className="you-badge">YOU</span>}</td>
                {tipsLocked && (
                  <td>
                    <span
                      className="champion-pick-flag"
                      title={p.championPick || "No WC tip"}
                      aria-label={p.championPick ? `WC tip: ${p.championPick}` : "No WC tip"}
                    >
                      {p.championPick ? FLAGS[p.championPick] || "🏳" : "—"}
                    </span>
                  </td>
                )}
                <td>
                  {p.change === null ? (
                    <span className="rank-change rank-same">—</span>
                  ) : p.change > 0 ? (
                    <span className="rank-change rank-up" title="Moved up">▲ {p.change}</span>
                  ) : p.change < 0 ? (
                    <span className="rank-change rank-down" title="Moved down">▼ {Math.abs(p.change)}</span>
                  ) : (
                    <span className="rank-change rank-same" title="No change">—</span>
                  )}
                </td>
                <td style={{ textAlign: "right", paddingRight: 16 }}><span className="pts">{p.total}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
