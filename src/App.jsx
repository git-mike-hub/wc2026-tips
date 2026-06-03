import { useState, useEffect } from "react";
import { supabase, hashPIN } from "./constants.js";
import { styles } from "./styles.js";
import { loadResults, getParticipantPoints } from "./lib/api.js";
import { TipsView } from "./views/TipsView.jsx";
import { AdminView } from "./views/AdminView.jsx";

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("home");
  const [loading, setLoading] = useState(true);
  const [tipsLocked, setTipsLocked] = useState(false);

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
    setView("tips");
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
      <nav className="nav">
        <div className="nav-inner">
          <div className="nav-logo">WC2026 <span>Bracket Pool</span></div>
          <div className="nav-tabs">
            <button type="button" className={`nav-tab${view === "home" ? " active" : ""}`} onClick={() => setView("home")}>Home</button>
            <button type="button" className={`nav-tab${view === "leaderboard" ? " active" : ""}`} onClick={() => setView("leaderboard")}>Ranks</button>
            {user && <button type="button" className={`nav-tab${view === "tips" ? " active" : ""}`} onClick={() => setView("tips")}>My Bracket</button>}
            {user?.is_admin && <button type="button" className={`nav-tab${view === "admin" ? " active" : ""}`} onClick={() => setView("admin")}>Admin</button>}
          </div>
          <div className="nav-user">
            {user ? (
              <>
                <span className="nav-user-name">👋 {user.name}</span>
                <button type="button" className="btn-logout" onClick={logout}>Logout</button>
              </>
            ) : (
              <button type="button" className="btn-logout" style={{ color: "var(--green2)", borderColor: "var(--green-dim)" }} onClick={() => setView("home")}>Sign In</button>
            )}
          </div>
        </div>
      </nav>
      <div className="app">
        {view === "home" && <HomeView user={user} onLogin={login} tipsLocked={tipsLocked} setView={setView} />}
        {view === "leaderboard" && <LeaderboardView user={user} />}
        {view === "tips" && user && <TipsView user={user} tipsLocked={tipsLocked} />}
        {view === "admin" && user?.is_admin && <AdminView tipsLocked={tipsLocked} setTipsLocked={setTipsLocked} />}
      </div>
    </>
  );
}

function HomeView({ user, onLogin, tipsLocked, setView }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

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
          <h1>WC 2026</h1>
          <h2>Bracket Prediction Pool</h2>
          <div className="hero-deadline">{tipsLocked ? <>🔒 Tips <strong>locked</strong></> : <>🟢 Tips <strong>open</strong></>}</div>
        </div>
        <div className="card">
          <div className="card-title">👋 Welcome, {user.name}!</div>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" className="btn btn-primary" style={{ maxWidth: 160 }} onClick={() => setView("tips")}>My Bracket</button>
            <button type="button" className="btn btn-secondary" style={{ maxWidth: 160 }} onClick={() => setView("leaderboard")}>Ranks</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="hero">
        <h1>WC 2026</h1>
        <h2>Bracket Prediction Pool</h2>
        <div className="hero-deadline">{tipsLocked ? <>🔒 Tips <strong>locked</strong></> : <>🟢 Submit your full bracket before kickoff!</>}</div>
      </div>
      <div className="auth-grid">
        <div className="card">
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
        <div className="card">
          <div className="card-title">📋 How It Works</div>
          <div className="section-intro">
            <strong style={{ color: "var(--green2)" }}>1. Group stage</strong><br />
            Rank all 4 teams in groups A–L (1st–4th). <strong>1 pt</strong> per correct spot.<br /><br />
            <strong style={{ color: "var(--green2)" }}>2. Best 8 third-placed</strong><br />
            Pick which 8 of 12 third-placed teams advance. <strong>1 pt</strong> each.<br /><br />
            <strong style={{ color: "var(--green2)" }}>3. Knockout bracket</strong><br />
            Your R32 draw follows official FIFA 2026 rules; pick every winner. <strong>1 pt</strong> per match.<br />
            Finalists: <strong>+5 pts</strong> each · Champion: <strong>+10 pts</strong>.<br /><br />
            <em style={{ color: "var(--text3)" }}>Tips lock when the admin closes submissions.</em>
          </div>
        </div>
      </div>
    </div>
  );
}

function LeaderboardView({ user }) {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLeaderboard = async () => {
    setLoading(true);
    const { data: parts } = await supabase.from("participants").select("id,name,is_admin");
    if (!parts) { setLoading(false); return; }
    const results = await loadResults(supabase);
    const scores = await Promise.all(
      parts.map(async (p) => {
        const { total } = await getParticipantPoints(supabase, p.id, results);
        return { ...p, total };
      })
    );
    scores.sort((a, b) => b.total - a.total);
    const { data: prevData } = await supabase.from("settings").select("value").eq("key", "prev_ranks").maybeSingle();
    let prevRanks = {};
    try { prevRanks = JSON.parse(prevData?.value || "{}"); } catch { /* ignore */ }
    const hasSnapshot = Object.keys(prevRanks).length > 0;
    setParticipants(
      scores.map((p, i) => ({
        ...p,
        change: !hasSnapshot ? null : prevRanks[p.id] ? prevRanks[p.id] - (i + 1) : 0,
      }))
    );
    setLoading(false);
  };

  useEffect(() => { loadLeaderboard(); }, []);

  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>;

  return (
    <div>
      <div style={{ margin: "24px 0 16px", display: "flex", justifyContent: "space-between" }}>
        <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: "var(--green)" }}>🏆 Rankings</h2>
        <button type="button" className="btn-sm btn-green" onClick={loadLeaderboard}>↻ Refresh</button>
      </div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th style={{ paddingLeft: 16 }}>#</th>
              <th>Player</th>
              <th>Change</th>
              <th style={{ textAlign: "right", paddingRight: 16 }}>Points</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((p, i) => (
              <tr key={p.id}>
                <td style={{ paddingLeft: 16 }}><span className={`rank-badge rank-${i < 3 ? i + 1 : "other"}`}>{i + 1}</span></td>
                <td><strong>{p.name}</strong>{user?.id === p.id && <span className="you-badge">YOU</span>}</td>
                <td>
                  {p.change === null ? <span className="rank-same">new</span>
                    : p.change > 0 ? <span className="rank-change rank-up">▲ {p.change}</span>
                    : p.change < 0 ? <span className="rank-change rank-down">▼ {Math.abs(p.change)}</span>
                    : <span className="rank-change rank-same">—</span>}
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
