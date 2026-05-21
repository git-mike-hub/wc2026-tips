import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ydiunjgokejzcvpohjrc.supabase.co";
const SUPABASE_KEY = "sb_publishable_FG_g9WZEq1ipejUrWYHIRw_PzmGdR1k";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const FLAGS = {
  "Mexico":"🇲🇽","South Africa":"🇿🇦","South Korea":"🇰🇷","Czech Republic":"🇨🇿",
  "Canada":"🇨🇦","Bosnia & Herz.":"🇧🇦","Qatar":"🇶🇦","Switzerland":"🇨🇭",
  "Brazil":"🇧🇷","Morocco":"🇲🇦","Haiti":"🇭🇹","Scotland":"🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "USA":"🇺🇸","Paraguay":"🇵🇾","Australia":"🇦🇺","Turkey":"🇹🇷",
  "Germany":"🇩🇪","Curacao":"🇨🇼","Ivory Coast":"🇨🇮","Ecuador":"🇪🇨",
  "Netherlands":"🇳🇱","Japan":"🇯🇵","Sweden":"🇸🇪","Tunisia":"🇹🇳",
  "Belgium":"🇧🇪","Egypt":"🇪🇬","Iran":"🇮🇷","New Zealand":"🇳🇿",
  "Spain":"🇪🇸","Cape Verde":"🇨🇻","Saudi Arabia":"🇸🇦","Uruguay":"🇺🇾",
  "France":"🇫🇷","Senegal":"🇸🇳","Iraq":"🇮🇶","Norway":"🇳🇴",
  "Argentina":"🇦🇷","Algeria":"🇩🇿","Austria":"🇦🇹","Jordan":"🇯🇴",
  "Portugal":"🇵🇹","DR Congo":"🇨🇩","Uzbekistan":"🇺🇿","Colombia":"🇨🇴",
  "England":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","Croatia":"🇭🇷","Ghana":"🇬🇭","Panama":"🇵🇦"
};

const tf = (name) => `${FLAGS[name]||"🏳"} ${name}`;
const ALL_TEAMS = Object.keys(FLAGS).sort();

const ROUNDS = [
  { key:"round_of_32", label:"Round of 32",    count:32, points:1.5 },
  { key:"round_of_16", label:"Round of 16",    count:16, points:2.5 },
  { key:"quarter",     label:"Quarter-finals", count:8,  points:4   },
  { key:"semi",        label:"Semi-finals",    count:4,  points:6   },
  { key:"final",       label:"Finalists",      count:2,  points:9   },
];

async function hashPIN(pin) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pin));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join("");
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  :root{
    --bg:#0a0e0a;--bg2:#111711;--bg3:#182018;--card:#1a221a;
    --border:#2a3a2a;--green:#4caf50;--green2:#66bb6a;--green-dim:#2d5a30;
    --gold:#ffd700;--silver:#c0c0c0;--bronze:#cd7f32;
    --text:#e8f0e8;--text2:#9ab09a;--text3:#5a7a5a;
    --red:#ef5350;--blue:#42a5f5;--radius:12px;--radius-sm:8px;
  }
  body{background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;min-height:100vh;font-size:15px;line-height:1.5;}
  h1,h2,h3{font-family:'Bebas Neue',sans-serif;letter-spacing:0.05em;}
  .app{max-width:900px;margin:0 auto;padding:0 16px 80px;}
  .nav{background:var(--bg2);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:100;padding:0 16px;}
  .nav-inner{max-width:900px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;height:56px;gap:8px;}
  .nav-logo{font-family:'Bebas Neue',sans-serif;font-size:22px;color:var(--green);letter-spacing:0.08em;white-space:nowrap;}
  .nav-logo span{color:var(--text2);font-size:13px;font-family:'DM Sans',sans-serif;letter-spacing:0;margin-left:8px;}
  .nav-tabs{display:flex;gap:4px;flex-wrap:wrap;}
  .nav-tab{padding:6px 14px;border-radius:6px;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;background:transparent;color:var(--text2);transition:all 0.15s;}
  .nav-tab:hover{background:var(--bg3);color:var(--text);}
  .nav-tab.active{background:var(--green-dim);color:var(--green2);}
  .nav-user{display:flex;align-items:center;gap:10px;}
  .nav-user-name{font-size:13px;color:var(--text2);font-weight:500;white-space:nowrap;}
  .btn-logout{padding:5px 12px;border-radius:6px;border:1px solid var(--border);background:transparent;color:var(--text2);font-size:12px;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s;}
  .btn-logout:hover{border-color:var(--red);color:var(--red);}
  .hero{background:linear-gradient(135deg,var(--bg2) 0%,var(--bg3) 100%);border:1px solid var(--border);border-radius:var(--radius);padding:48px 32px;text-align:center;margin:24px 0;position:relative;overflow:hidden;}
  .hero::before{content:'⚽';position:absolute;top:-20px;right:-20px;font-size:120px;opacity:0.05;}
  .hero h1{font-size:56px;color:var(--green);line-height:1;margin-bottom:6px;}
  .hero h2{font-size:28px;color:var(--text2);font-weight:300;margin-bottom:24px;font-family:'DM Sans',sans-serif;}
  .hero-deadline{display:inline-flex;align-items:center;gap:8px;background:var(--bg);border:1px solid var(--border);padding:8px 20px;border-radius:20px;font-size:13px;color:var(--text2);}
  .hero-deadline strong{color:var(--gold);}
  .card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:24px;margin-bottom:16px;}
  .card-title{font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:0.05em;color:var(--green2);margin-bottom:16px;}
  .auth-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:24px;}
  @media(max-width:600px){.auth-grid{grid-template-columns:1fr;}.hero h1{font-size:40px;}.hero h2{font-size:20px;}.nav-logo span{display:none;}}
  .form-group{margin-bottom:14px;}
  .form-label{font-size:12px;font-weight:600;color:var(--text2);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;display:block;}
  .form-input{width:100%;padding:10px 14px;background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-family:'DM Sans',sans-serif;font-size:15px;transition:border-color 0.15s;outline:none;}
  .form-input:focus{border-color:var(--green);}
  .form-input::placeholder{color:var(--text3);}
  .btn{width:100%;padding:12px;border-radius:var(--radius-sm);border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:15px;font-weight:700;transition:all 0.15s;}
  .btn-primary{background:var(--green);color:#000;}
  .btn-primary:hover{background:var(--green2);transform:translateY(-1px);}
  .btn-primary:disabled{background:var(--text3);cursor:not-allowed;transform:none;}
  .btn-secondary{background:var(--bg2);color:var(--text);border:1px solid var(--border);}
  .btn-secondary:hover{border-color:var(--green);color:var(--green);}
  .btn-sm{padding:6px 14px;font-size:13px;font-weight:600;border-radius:6px;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s;}
  .btn-green{background:var(--green-dim);color:var(--green2);}
  .btn-green:hover{background:var(--green);color:#000;}
  .btn-red{background:rgba(239,83,80,0.15);color:var(--red);}
  .btn-red:hover{background:var(--red);color:#fff;}
  .alert{padding:10px 14px;border-radius:var(--radius-sm);font-size:13px;margin-bottom:14px;}
  .alert-error{background:rgba(239,83,80,0.1);border:1px solid rgba(239,83,80,0.3);color:var(--red);}
  .alert-success{background:rgba(76,175,80,0.1);border:1px solid rgba(76,175,80,0.3);color:var(--green2);}
  .alert-info{background:rgba(66,165,245,0.1);border:1px solid rgba(66,165,245,0.3);color:var(--blue);}
  .alert-warn{background:rgba(255,215,0,0.1);border:1px solid rgba(255,215,0,0.3);color:var(--gold);}
  .leaderboard-table{width:100%;border-collapse:collapse;}
  .leaderboard-table th{text-align:left;padding:8px 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--text3);border-bottom:1px solid var(--border);}
  .leaderboard-table td{padding:12px;border-bottom:1px solid rgba(42,58,42,0.5);vertical-align:middle;}
  .leaderboard-table tr:last-child td{border-bottom:none;}
  .leaderboard-table tr:hover td{background:var(--bg2);}
  .rank-badge{width:28px;height:28px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;}
  .rank-1{background:var(--gold);color:#000;}
  .rank-2{background:var(--silver);color:#000;}
  .rank-3{background:var(--bronze);color:#fff;}
  .rank-other{background:var(--bg3);color:var(--text2);}
  .pts{font-family:'Bebas Neue',sans-serif;font-size:22px;color:var(--green);}
  .you-badge{font-size:10px;background:var(--green-dim);color:var(--green2);padding:2px 7px;border-radius:10px;font-weight:700;margin-left:6px;}
  .rank-change{display:inline-flex;align-items:center;gap:3px;font-size:12px;font-weight:700;margin-left:8px;}
  .rank-up{color:var(--green2);}
  .rank-down{color:var(--red);}
  .rank-same{color:var(--text3);}
  .group-header{font-family:'Bebas Neue',sans-serif;font-size:18px;color:var(--text2);letter-spacing:0.1em;padding:20px 0 10px;display:flex;align-items:center;gap:12px;}
  .group-header::after{content:'';flex:1;height:1px;background:var(--border);}
  .match-row{display:grid;grid-template-columns:1fr auto 1fr auto;align-items:center;gap:8px;padding:12px 16px;border-radius:var(--radius-sm);background:var(--bg2);border:1px solid var(--border);margin-bottom:8px;transition:border-color 0.15s;}
  .match-row:hover{border-color:var(--green-dim);}
  .match-row.has-result{border-left:3px solid var(--green);}
  .match-row.wrong-result{border-left:3px solid var(--red);}
  .team-name{font-weight:600;font-size:14px;}
  .team-home{text-align:right;}
  .match-score{display:flex;align-items:center;gap:6px;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:6px 10px;}
  .score-input{width:36px;text-align:center;background:transparent;border:none;outline:none;color:var(--text);font-family:'Bebas Neue',sans-serif;font-size:22px;line-height:1;}
  .score-input::-webkit-inner-spin-button{-webkit-appearance:none;}
  .score-input.active-tip{color:var(--green2);}
  .score-sep{color:var(--text3);font-weight:700;font-size:18px;}
  .score-display{font-family:'Bebas Neue',sans-serif;font-size:22px;color:var(--green2);min-width:28px;text-align:center;}
  .match-date{font-size:11px;color:var(--text3);text-align:right;}
  .match-pts{font-size:12px;font-weight:700;}
  .match-pts.earned{color:var(--green2);}
  .match-pts.zero{color:var(--text3);}
  .odds-row{display:flex;gap:6px;margin-top:6px;justify-content:center;}
  .odds-chip{display:flex;flex-direction:column;align-items:center;gap:1px;padding:4px 8px;border-radius:6px;background:rgba(76,175,80,0.15);border:1px solid rgba(76,175,80,0.2);}
  .odds-chip-label{font-size:10px;color:#a5d6a7;font-weight:800;letter-spacing:0.05em;}
  .odds-chip-val{font-size:12px;color:#c8e6c9;font-weight:700;}
  .save-bar{position:fixed;bottom:0;left:0;right:0;z-index:200;background:var(--bg2);border-top:1px solid var(--border);padding:12px 16px;}
  .save-bar-inner{max-width:900px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:12px;}
  .save-bar-text{font-size:13px;color:var(--text2);}
  .save-bar-text strong{color:var(--green2);}
  .btn-save{padding:10px 28px;background:var(--green);color:#000;border:none;border-radius:var(--radius-sm);font-family:'DM Sans',sans-serif;font-size:15px;font-weight:700;cursor:pointer;transition:all 0.15s;white-space:nowrap;}
  .btn-save:hover{background:var(--green2);}
  .btn-save:disabled{background:var(--text3);cursor:not-allowed;}
  .qualifier-section{margin-bottom:24px;}
  .qualifier-title{font-family:'Bebas Neue',sans-serif;font-size:16px;color:var(--text2);letter-spacing:0.08em;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;}
  .qualifier-pts{font-size:12px;background:var(--green-dim);color:var(--green2);padding:2px 8px;border-radius:10px;font-family:'DM Sans',sans-serif;font-weight:700;}
  .team-grid{display:flex;flex-wrap:wrap;gap:8px;}
  .team-chip{padding:6px 14px;border-radius:20px;font-size:13px;font-weight:600;border:1px solid var(--border);background:var(--bg2);color:var(--text2);cursor:pointer;transition:all 0.15s;user-select:none;}
  .team-chip:hover{border-color:var(--green-dim);color:var(--text);}
  .team-chip.selected{background:var(--green-dim);border-color:var(--green);color:var(--green2);}
  .team-chip.locked{cursor:default;pointer-events:none;}
  .count-badge{font-size:11px;color:var(--text3);margin-top:6px;}
  .champion-select{width:100%;padding:12px 16px;background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-family:'DM Sans',sans-serif;font-size:15px;font-weight:600;outline:none;cursor:pointer;}
  .champion-select:focus{border-color:var(--green);}
  .champion-display{padding:12px 16px;background:var(--bg2);border:1px solid var(--green-dim);border-radius:var(--radius-sm);font-size:18px;font-weight:700;color:var(--green2);}
  .admin-tabs{display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap;}
  .admin-tab{padding:8px 20px;border-radius:var(--radius-sm);border:1px solid var(--border);background:transparent;color:var(--text2);cursor:pointer;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;transition:all 0.15s;}
  .admin-tab.active{background:var(--green-dim);border-color:var(--green);color:var(--green2);}
  .admin-tab:hover:not(.active){border-color:var(--green-dim);color:var(--text);}
  /* Admin sticky save bar */
  .admin-save-bar{position:sticky;top:56px;z-index:90;background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius-sm);padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;gap:12px;}
  .admin-save-bar-left{font-size:13px;color:var(--text2);}
  .admin-save-bar-left strong{color:var(--green2);}
  .result-row{display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius-sm);margin-bottom:8px;flex-wrap:wrap;}
  .result-row.has-saved{border-left:3px solid var(--green);}
  .result-teams{flex:1;font-size:13px;font-weight:600;min-width:160px;}
  .result-input{width:48px;text-align:center;padding:6px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);font-family:'Bebas Neue',sans-serif;font-size:20px;outline:none;}
  .result-input:focus{border-color:var(--green);}
  .result-input.dirty{border-color:var(--gold);color:var(--gold);}
  .result-sep{color:var(--text3);font-weight:700;}
  .result-saved{font-size:12px;color:var(--green2);font-weight:600;}
  .participant-row{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius-sm);margin-bottom:8px;flex-wrap:wrap;gap:8px;}
  .participant-info{font-size:14px;font-weight:600;}
  .participant-meta{font-size:12px;color:var(--text3);}
  .tips-tabs{display:flex;gap:4px;margin-bottom:20px;overflow-x:auto;}
  .tips-tab{padding:8px 16px;border-radius:var(--radius-sm);border:1px solid var(--border);background:transparent;color:var(--text2);cursor:pointer;white-space:nowrap;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;transition:all 0.15s;}
  .tips-tab.active{background:var(--green-dim);border-color:var(--green);color:var(--green2);}
  .lock-toggle{display:flex;align-items:center;gap:12px;padding:16px;background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius-sm);margin-bottom:16px;}
  .lock-status{flex:1;}
  .lock-status-label{font-size:14px;font-weight:700;}
  .lock-status-desc{font-size:12px;color:var(--text3);margin-top:2px;}
  .spinner{width:32px;height:32px;border:3px solid var(--border);border-top-color:var(--green);border-radius:50%;animation:spin 0.7s linear infinite;margin:40px auto;}
  @keyframes spin{to{transform:rotate(360deg);}}
  .loading-wrap{text-align:center;padding:40px;}
  .section-intro{font-size:13px;color:var(--text2);margin-bottom:16px;line-height:1.6;}
  .text-center{text-align:center;}
  .text-muted{color:var(--text2);font-size:13px;}
  .mt-16{margin-top:16px;}
`;

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("home");
  const [loading, setLoading] = useState(true);
  const [tipsLocked, setTipsLocked] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("wc2026_user");
    if (saved) setUser(JSON.parse(saved));
    loadLockStatus();
  }, []);

  const loadLockStatus = async () => {
    const { data } = await supabase.from("settings").select("value").eq("key","tips_locked").maybeSingle();
    setTipsLocked(data?.value === "true");
    setLoading(false);
  };

  const login = (u) => { setUser(u); localStorage.setItem("wc2026_user", JSON.stringify(u)); setView("tips"); };
  const logout = () => { setUser(null); localStorage.removeItem("wc2026_user"); setView("home"); };

  if (loading) return (<><style>{styles}</style><div className="loading-wrap"><div className="spinner"/></div></>);

  return (
    <>
      <style>{styles}</style>
      <nav className="nav">
        <div className="nav-inner">
          <div className="nav-logo">WC2026 <span>Tipping Competition</span></div>
          <div className="nav-tabs">
            <button className={`nav-tab${view==="home"?" active":""}`} onClick={()=>setView("home")}>Home</button>
            <button className={`nav-tab${view==="leaderboard"?" active":""}`} onClick={()=>setView("leaderboard")}>Ranks</button>
            {user && <button className={`nav-tab${view==="tips"?" active":""}`} onClick={()=>setView("tips")}>My Tips</button>}
            {user?.is_admin && <button className={`nav-tab${view==="admin"?" active":""}`} onClick={()=>setView("admin")}>Admin</button>}
          </div>
          <div className="nav-user">
            {user
              ? <><span className="nav-user-name">👋 {user.name}</span><button className="btn-logout" onClick={logout}>Logout</button></>
              : <button className="btn-logout" style={{color:"var(--green2)",borderColor:"var(--green-dim)"}} onClick={()=>setView("home")}>Sign In</button>
            }
          </div>
        </div>
      </nav>
      <div className="app">
        {view==="home"        && <HomeView user={user} onLogin={login} tipsLocked={tipsLocked} setView={setView}/>}
        {view==="leaderboard" && <LeaderboardView user={user}/>}
        {view==="tips"        && user && <TipsView user={user} tipsLocked={tipsLocked}/>}
        {view==="admin"       && user?.is_admin && <AdminView tipsLocked={tipsLocked} setTipsLocked={setTipsLocked}/>}
      </div>
    </>
  );
}

// ── HOME ──────────────────────────────────────────────────────
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
    if (pin.length!==4||!/^\d{4}$/.test(pin)) return setError("PIN must be exactly 4 digits.");
    if (pin!==pin2) return setError("PINs don't match.");
    setBusy(true); setError("");
    const { data: existing } = await supabase.from("participants").select("id").ilike("name",name.trim()).maybeSingle();
    if (existing) { setError("That name is already taken. Please choose another."); setBusy(false); return; }
    const pin_hash = await hashPIN(pin);
    const { error: err } = await supabase.from("participants").insert({name:name.trim(),pin_hash,is_admin:false});
    if (err) { setError("Registration failed. Try again."); setBusy(false); return; }
    setSuccess("Account created! You can now log in.");
    setMode("login"); setPin(""); setPin2(""); setBusy(false);
  };

  const handleLogin = async () => {
    if (!name.trim()||!pin) return setError("Enter your name and PIN.");
    setBusy(true); setError("");
    const { data } = await supabase.from("participants").select("*").ilike("name",name.trim()).maybeSingle();
    if (!data) { setError("Name not found. Check spelling or register first."); setBusy(false); return; }
    const pin_hash = await hashPIN(pin);
    if (pin_hash!==data.pin_hash) { setError("Wrong PIN. Try again."); setBusy(false); return; }
    onLogin(data);
  };

  if (user) return (
    <div>
      <div className="hero">
        <h1>WC 2026</h1><h2>World Cup Tipping Competition</h2>
        <div className="hero-deadline">{tipsLocked ? <>🔒 Tips are <strong>locked</strong></> : <>🟢 Tips are <strong>open</strong></>}</div>
      </div>
      <div className="card">
        <div className="card-title">👋 Welcome back, {user.name}!</div>
        <div style={{display:"flex",gap:10}}>
          <button className="btn btn-primary" style={{maxWidth:160}} onClick={()=>setView("leaderboard")}>Ranks</button>
          <button className="btn btn-secondary" style={{maxWidth:160}} onClick={()=>setView("tips")}>My Tips</button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="hero">
        <h1>WC 2026</h1><h2>World Cup Tipping Competition</h2>
        <div className="hero-deadline">{tipsLocked ? <>🔒 Tips are <strong>locked</strong></> : <>🟢 Tips are <strong>open</strong> — submit before they close!</>}</div>
      </div>
      <div className="auth-grid">
        <div className="card">
          <div className="card-title">🔐 {mode==="login"?"Sign In":"Register"}</div>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          <div className="form-group">
            <label className="form-label">Your Name</label>
            <input className="form-input" placeholder="e.g. Alex" value={name} onChange={e=>{setName(e.target.value);setError("");}}/>
          </div>
          <div className="form-group">
            <label className="form-label">4-Digit PIN</label>
            <input className="form-input" type="password" inputMode="numeric" maxLength={4} placeholder="••••" value={pin} onChange={e=>{setPin(e.target.value.replace(/\D/g,""));setError("");}}/>
          </div>
          {mode==="register" && (
            <div className="form-group">
              <label className="form-label">Confirm PIN</label>
              <input className="form-input" type="password" inputMode="numeric" maxLength={4} placeholder="••••" value={pin2} onChange={e=>{setPin2(e.target.value.replace(/\D/g,""));setError("");}}/>
            </div>
          )}
          <button className="btn btn-primary" onClick={mode==="login"?handleLogin:handleRegister} disabled={busy}>
            {busy?"Please wait...":mode==="login"?"Sign In":"Create Account"}
          </button>
          <div className="text-center mt-16">
            <span className="text-muted">{mode==="login"?"No account? ":"Already registered? "}</span>
            <button style={{background:"none",border:"none",color:"var(--green2)",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}
              onClick={()=>{setMode(mode==="login"?"register":"login");setError("");setSuccess("");setPin("");setPin2("");}}>
              {mode==="login"?"Register here":"Sign in instead"}
            </button>
          </div>
        </div>
        <div className="card">
          <div className="card-title">📋 How It Works</div>
          <div className="section-intro">
            <strong style={{color:"var(--green2)"}}>Group Stage (72 matches)</strong><br/>
            Pick the exact score. Correct result = odds points. Exact score = +5 bonus.<br/><br/>
            <strong style={{color:"var(--green2)"}}>Knockout Rounds</strong><br/>
            R32 = 1.5 pts · R16 = 2.5 pts · QF = 4 pts · SF = 6 pts · Final = 9 pts<br/><br/>
            <strong style={{color:"var(--green2)"}}>World Champion</strong><br/>
            Predict the winner = <strong style={{color:"var(--gold)"}}>13 bonus points</strong>.<br/><br/>
            <em style={{color:"var(--text3)"}}>Tips lock when the admin closes submissions.</em>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── LEADERBOARD ───────────────────────────────────────────────
function LeaderboardView({ user }) {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{ loadLeaderboard(); },[]);

  const loadLeaderboard = async () => {
    setLoading(true);
    const { data: parts } = await supabase.from("participants").select("id,name,is_admin");
    if (!parts) { setLoading(false); return; }
    const scores = await Promise.all(parts.map(async p => {
      const [{ data: mt },{ data: qt },{ data: ct }] = await Promise.all([
        supabase.from("match_tips").select("points_earned").eq("participant_id",p.id),
        supabase.from("qualifier_tips").select("points_earned").eq("participant_id",p.id),
        supabase.from("champion_tips").select("points_earned").eq("participant_id",p.id),
      ]);
      const total =
        (mt||[]).reduce((s,r)=>s+parseFloat(r.points_earned||0),0)+
        (qt||[]).reduce((s,r)=>s+parseFloat(r.points_earned||0),0)+
        parseFloat((ct&&ct[0]?.points_earned)||0);
      return { ...p, total };
    }));
    scores.sort((a,b)=>b.total-a.total);
    const { data: prevData } = await supabase.from("settings").select("value").eq("key","prev_ranks").maybeSingle();
    let prevRanks = {};
    try { prevRanks = JSON.parse(prevData?.value||"{}"); } catch(e) {}
    const hasSnapshot = Object.keys(prevRanks).length > 0;
    const withRanks = scores.map((p,i) => {
      const prevRank = prevRanks[p.id];
      // null = truly new participant with no snapshot at all
      // 0 = no change, positive = moved up, negative = moved down
      const change = !hasSnapshot ? null : prevRank ? prevRank-(i+1) : 0;
      return { ...p, currentRank:i+1, change };
    });
    setParticipants(withRanks);
    setLoading(false);
  };

  if (loading) return <div className="loading-wrap"><div className="spinner"/></div>;

  return (
    <div>
      <div style={{margin:"24px 0 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:32,color:"var(--green)"}}>🏆 Rankings</h2>
        <button className="btn-sm btn-green" onClick={loadLeaderboard}>↻ Refresh</button>
      </div>
      {participants.length===0
        ? <div className="card text-center"><p className="text-muted">No participants yet.</p></div>
        : <div className="card" style={{padding:0,overflow:"hidden"}}>
            <table className="leaderboard-table">
              <thead><tr>
                <th style={{paddingLeft:16}}>#</th>
                <th>Player</th>
                <th>Change</th>
                <th style={{textAlign:"right",paddingRight:16}}>Points</th>
              </tr></thead>
              <tbody>
                {participants.map((p,i)=>(
                  <tr key={p.id}>
                    <td style={{paddingLeft:16}}><span className={`rank-badge rank-${i<3?i+1:"other"}`}>{i+1}</span></td>
                    <td><strong>{p.name}</strong>{user?.id===p.id&&<span className="you-badge">YOU</span>}</td>
                    <td>
                      {p.change===null ? <span style={{fontSize:12,color:"var(--text3)"}}>new</span>
                        : p.change>0 ? <span className="rank-change rank-up">▲ {p.change}</span>
                        : p.change<0 ? <span className="rank-change rank-down">▼ {Math.abs(p.change)}</span>
                        : <span className="rank-change rank-same">—</span>}
                    </td>
                    <td style={{textAlign:"right",paddingRight:16}}><span className="pts">{p.total.toFixed(2)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      }
    </div>
  );
}

// ── TIPS VIEW ─────────────────────────────────────────────────
function TipsView({ user, tipsLocked }) {
  const [tab, setTab] = useState("groups");
  const [matches, setMatches] = useState([]);
  const [myTips, setMyTips] = useState({});
  const [qualTips, setQualTips] = useState({});
  const [champTip, setChampTip] = useState("");
  const [dirtyMatches, setDirtyMatches] = useState({});
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(()=>{ loadAll(); },[user]);

  const loadAll = async () => {
    setLoading(true);
    const [{ data: ms },{ data: mt },{ data: qt },{ data: ct }] = await Promise.all([
      supabase.from("matches").select("*").order("match_number"),
      supabase.from("match_tips").select("*").eq("participant_id",user.id),
      supabase.from("qualifier_tips").select("*").eq("participant_id",user.id),
      supabase.from("champion_tips").select("*").eq("participant_id",user.id).maybeSingle(),
    ]);
    setMatches(ms||[]);
    const tipMap = {};
    (mt||[]).forEach(t=>{ tipMap[t.match_id]={home:t.tip_home??0,away:t.tip_away??0,active:true,pts:t.points_earned}; });
    setMyTips(tipMap);
    const qMap = {};
    (qt||[]).forEach(t=>{ if(!qMap[t.round])qMap[t.round]=[]; qMap[t.round].push(t.team_name); });
    setQualTips(qMap);
    setChampTip(ct?.team_name||"");
    setLoading(false);
  };

  const updateTip = (matchId, side, val) => {
    if (tipsLocked) return;
    // Allow only single digit 0-9
    const cleaned = val.replace(/[^0-9]/g,"").slice(-1);
    const raw = cleaned===""?"":parseInt(cleaned);
    setMyTips(prev=>{
      const cur = prev[matchId]||{home:"",away:"",active:false};
      const updated = {...cur,[side]:raw,active:true};
      return {...prev,[matchId]:updated};
    });
    setDirtyMatches(prev=>({...prev,[matchId]:true}));
    setDirty(true);
  };

  const toggleQualTeam = (round, team, maxCount) => {
    if (tipsLocked) return;
    setQualTips(prev=>{
      const cur = prev[round]||[];
      if (cur.includes(team)) return {...prev,[round]:cur.filter(t=>t!==team)};
      if (cur.length>=maxCount) return prev;
      return {...prev,[round]:[...cur,team]};
    });
    setDirty(true);
  };

  const saveAll = async () => {
    setSaving(true); setSaveMsg("");
    try {
      await Promise.all(Object.entries(dirtyMatches).map(async ([matchId]) => {
        const t = myTips[matchId];
        if (!t?.active) return;
        const h=t.home===""?0:parseInt(t.home)||0, a=t.away===""?0:parseInt(t.away)||0;
        const { data: existing } = await supabase.from("match_tips").select("id").eq("participant_id",user.id).eq("match_id",matchId).maybeSingle();
        if (existing) await supabase.from("match_tips").update({tip_home:h,tip_away:a}).eq("id",existing.id);
        else await supabase.from("match_tips").insert({participant_id:user.id,match_id:parseInt(matchId),tip_home:h,tip_away:a});
      }));
      for (const round of ROUNDS.map(r=>r.key)) {
        await supabase.from("qualifier_tips").delete().eq("participant_id",user.id).eq("round",round);
        const teams = qualTips[round]||[];
        if (teams.length>0) await supabase.from("qualifier_tips").insert(teams.map(t=>({participant_id:user.id,round,team_name:t})));
      }
      if (champTip) {
        const { data: existing } = await supabase.from("champion_tips").select("id").eq("participant_id",user.id).maybeSingle();
        if (existing) await supabase.from("champion_tips").update({team_name:champTip}).eq("id",existing.id);
        else await supabase.from("champion_tips").insert({participant_id:user.id,team_name:champTip});
      }
      setDirty(false); setDirtyMatches({});
      setSaveMsg("✅ Tips saved successfully!");
    } catch(e) { setSaveMsg("❌ Error saving. Please try again."); }
    setSaving(false);
    setTimeout(()=>setSaveMsg(""),4000);
  };

  if (loading) return <div className="loading-wrap"><div className="spinner"/></div>;
  const groups = [...new Set(matches.map(m=>m.group_name))].sort();
  const tipsCount = Object.values(myTips).filter(t=>t?.active).length;

  return (
    <div style={{paddingBottom:tipsLocked?0:80}}>
      <div style={{margin:"24px 0 16px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
        <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:32,color:"var(--green)"}}>⚽ My Tips</h2>
        {tipsLocked
          ? <span className="alert alert-warn" style={{margin:0}}>🔒 Tips are locked — view only</span>
          : <span className="text-muted">{tipsCount}/72 matches tipped</span>}
      </div>
      {saveMsg && <div className={`alert ${saveMsg.startsWith("✅")?"alert-success":"alert-error"}`}>{saveMsg}</div>}
      <div className="tips-tabs">
        <button className={`tips-tab${tab==="groups"?" active":""}`} onClick={()=>setTab("groups")}>Group Stage</button>
        <button className={`tips-tab${tab==="qualifiers"?" active":""}`} onClick={()=>setTab("qualifiers")}>Knockout Picks</button>
        <button className={`tips-tab${tab==="champion"?" active":""}`} onClick={()=>setTab("champion")}>World Champion</button>
      </div>

      {tab==="groups" && groups.map(g=>(
        <div key={g}>
          <div className="group-header">GROUP {g}</div>
          {matches.filter(m=>m.group_name===g).map(m=>{
            const tip = myTips[m.id]||{};
            const hasResult = m.result_home!==null&&m.result_away!==null;
            const hasTip = tip.active;
            const getRes=(h,a)=>h>a?"1":h<a?"2":"X";
            let rowClass="match-row";
            if (hasResult&&hasTip) rowClass+=getRes(tip.home,tip.away)===getRes(m.result_home,m.result_away)?" has-result":" wrong-result";
            const d=new Date(m.match_date);
            const dateStr=d.toLocaleDateString("en-GB",{day:"numeric",month:"short"})+" "+d.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit",timeZone:"UTC"});
            return (
              <div key={m.id} className={rowClass}>
                <div className="team-name team-home">{tf(m.home_team)}</div>
                <div>
                  <div className="match-score">
                    {tipsLocked
                      ? <><span className="score-display">{hasTip?tip.home:"?"}</span><span className="score-sep">-</span><span className="score-display">{hasTip?tip.away:"?"}</span></>
                      : <><input className={`score-input${tip.active?" active-tip":""}`} type="number" min="0" max="9" value={tip.active?(tip.home??""):""}  onChange={e=>updateTip(m.id,"home",e.target.value)} placeholder="-"/>
                          <span className="score-sep">-</span>
                          <input className={`score-input${tip.active?" active-tip":""}`} type="number" min="0" max="9" value={tip.active?(tip.away??""):""}  onChange={e=>updateTip(m.id,"away",e.target.value)} placeholder="-"/></>
                    }
                  </div>
                  {hasResult&&<div style={{textAlign:"center",fontSize:11,color:"var(--text3)",marginTop:4}}>Result: {m.result_home}-{m.result_away}</div>}
                  <div className="odds-row">
                    <span className="odds-chip"><span className="odds-chip-label">1</span><span className="odds-chip-val">{m.odds_home}</span></span>
                    <span className="odds-chip"><span className="odds-chip-label">X</span><span className="odds-chip-val">{m.odds_draw}</span></span>
                    <span className="odds-chip"><span className="odds-chip-label">2</span><span className="odds-chip-val">{m.odds_away}</span></span>
                  </div>
                </div>
                <div className="team-name">{tf(m.away_team)}</div>
                <div style={{textAlign:"right",minWidth:60}}>
                  <div className="match-date">{dateStr}</div>
                  {hasResult&&hasTip&&<div className={`match-pts${parseFloat(tip.pts||0)>0?" earned":" zero"}`}>{parseFloat(tip.pts||0).toFixed(2)} pts</div>}
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {tab==="qualifiers" && (
        <div>
          <p className="section-intro">Select which teams you think will advance to each knockout round.</p>
          {ROUNDS.map(r=>{
            const selected=qualTips[r.key]||[];
            return (
              <div key={r.key} className="qualifier-section card">
                <div className="qualifier-title">{r.label}<span className="qualifier-pts">{r.points} pts each · pick {r.count}</span></div>
                <div className="team-grid">
                  {ALL_TEAMS.map(team=>(
                    <div key={team} className={`team-chip${selected.includes(team)?" selected":""}${tipsLocked?" locked":""}`} onClick={()=>toggleQualTeam(r.key,team,r.count)}>{tf(team)}</div>
                  ))}
                </div>
                <div className="count-badge">{selected.length}/{r.count} selected</div>
              </div>
            );
          })}
        </div>
      )}

      {tab==="champion" && (
        <div className="card">
          <div className="card-title">🏆 World Champion Tip</div>
          <p className="section-intro">Who will win the 2026 World Cup? Correct = <strong style={{color:"var(--gold)"}}>13 bonus points</strong>.</p>
          {tipsLocked
            ? <div className="champion-display">🏆 {champTip||<span style={{color:"var(--text3)"}}>No tip submitted</span>}</div>
            : <select className="champion-select" value={champTip} onChange={e=>{setChampTip(e.target.value);setDirty(true);}}>
                <option value="">— Select a team —</option>
                {ALL_TEAMS.map(t=><option key={t} value={t}>{tf(t)}</option>)}
              </select>
          }
        </div>
      )}

      {!tipsLocked && dirty && (
        <div className="save-bar">
          <div className="save-bar-inner">
            <div className="save-bar-text">You have <strong>unsaved changes</strong></div>
            <button className="btn-save" onClick={saveAll} disabled={saving}>{saving?"Saving...":"Save All Tips"}</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ADMIN ─────────────────────────────────────────────────────
function AdminView({ tipsLocked, setTipsLocked }) {
  const [tab, setTab] = useState("results");
  const [matches, setMatches] = useState([]);
  // results: { matchId: { home, away } } — tracks what's typed in the inputs
  const [results, setResults] = useState({});
  // dirtyResults: set of matchIds that have been edited since last save
  const [dirtyResults, setDirtyResults] = useState(new Set());
  const [participants, setParticipants] = useState([]);
  const [newPin, setNewPin] = useState({});
  const [qualResults, setQualResults] = useState({});
  const [champResult, setChampResult] = useState("");
  const [saving, setSaving] = useState({});
  const [msg, setMsg] = useState({});
  const [loading, setLoading] = useState(true);
  const [lockBusy, setLockBusy] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkMsg, setBulkMsg] = useState("");

  useEffect(()=>{ loadAll(); },[]);

  const loadAll = async () => {
    setLoading(true);
    const [{ data: ms },{ data: parts },{ data: qr },{ data: cr }] = await Promise.all([
      supabase.from("matches").select("*").order("match_number"),
      supabase.from("participants").select("*").order("name"),
      supabase.from("qualifier_results").select("*"),
      supabase.from("champion_result").select("*").maybeSingle(),
    ]);
    setMatches(ms||[]);
    const rMap = {};
    (ms||[]).forEach(m=>{ if(m.result_home!==null) rMap[m.id]={home:m.result_home,away:m.result_away}; });
    setResults(rMap);
    setParticipants(parts||[]);
    const qMap = {};
    (qr||[]).forEach(r=>{ if(!qMap[r.round])qMap[r.round]=[]; qMap[r.round].push(r.team_name); });
    setQualResults(qMap);
    setChampResult(cr?.team_name||"");
    setLoading(false);
  };

  const toggleLock = async () => {
    setLockBusy(true);
    const newVal = !tipsLocked;
    await supabase.from("settings").upsert({key:"tips_locked",value:String(newVal)},{onConflict:"key"});
    setTipsLocked(newVal);
    setLockBusy(false);
  };

  const getRes=(h,a)=>h>a?"1":h<a?"2":"X";

  const saveRankSnapshot = async () => {
    const { data: parts } = await supabase.from("participants").select("id");
    if (!parts) return;
    const scores = await Promise.all(parts.map(async p => {
      const [{ data: mt },{ data: qt },{ data: ct }] = await Promise.all([
        supabase.from("match_tips").select("points_earned").eq("participant_id",p.id),
        supabase.from("qualifier_tips").select("points_earned").eq("participant_id",p.id),
        supabase.from("champion_tips").select("points_earned").eq("participant_id",p.id),
      ]);
      const total =
        (mt||[]).reduce((s,r)=>s+parseFloat(r.points_earned||0),0)+
        (qt||[]).reduce((s,r)=>s+parseFloat(r.points_earned||0),0)+
        parseFloat((ct&&ct[0]?.points_earned)||0);
      return {id:p.id,total};
    }));
    scores.sort((a,b)=>b.total-a.total);
    const rankMap = {};
    scores.forEach((p,i)=>{ rankMap[p.id]=i+1; });
    await supabase.from("settings").upsert({key:"prev_ranks",value:JSON.stringify(rankMap)},{onConflict:"key"});
  };

  // Single match result scorer (used by bulk save)
  const scoreMatch = async (match, rh, ra) => {
    await supabase.from("matches").update({result_home:rh,result_away:ra,result_entered_at:new Date().toISOString()}).eq("id",match.id);
    const { data: tips } = await supabase.from("match_tips").select("*").eq("match_id",match.id);
    const actualRes=getRes(rh,ra);
    for (const t of (tips||[])) {
      const tipRes=getRes(t.tip_home,t.tip_away);
      let pts = tipRes===actualRes?(tipRes==="1"?match.odds_home:tipRes==="2"?match.odds_away:match.odds_draw):0;
      if (t.tip_home===rh&&t.tip_away===ra) pts+=5;
      await supabase.from("match_tips").update({points_earned:pts}).eq("id",t.id);
    }
  };

  // Bulk save all dirty results at once
  const saveAllResults = async () => {
    if (dirtyResults.size===0) return;
    setBulkSaving(true); setBulkMsg("");
    try {
      const matchMap = {};
      matches.forEach(m=>{ matchMap[m.id]=m; });
      const savedCount = dirtyResults.size;
      await Promise.all([...dirtyResults].map(async (matchId) => {
        const r = results[matchId];
        if (r?.home===""||r?.away===""||r?.home===undefined||r?.away===undefined) return;
        const rh=parseInt(r.home), ra=parseInt(r.away);
        if (isNaN(rh)||isNaN(ra)) return;
        await scoreMatch(matchMap[matchId], rh, ra);
      }));
      // Snapshot AFTER scoring so leaderboard reflects new points
      await saveRankSnapshot();
      setDirtyResults(new Set());
      setBulkMsg(`✅ ${savedCount} result${savedCount>1?"s":""} saved & scored!`);
      // Refresh matches to show updated state
      const { data: ms } = await supabase.from("matches").select("*").order("match_number");
      setMatches(ms||[]);
    } catch(e) {
      setBulkMsg("❌ Error saving. Please try again.");
    }
    setBulkSaving(false);
    setTimeout(()=>setBulkMsg(""),5000);
  };

  const updateResult = (matchId, side, val) => {
    setResults(r=>({...r,[matchId]:{...r[matchId],[side]:val}}));
    setDirtyResults(prev=>new Set([...prev,matchId]));
  };

  const saveQualResults = async (round) => {
    const teams=qualResults[round]||[];
    setSaving(s=>({...s,[round]:true}));
    await supabase.from("qualifier_results").delete().eq("round",round);
    if (teams.length>0) await supabase.from("qualifier_results").insert(teams.map(t=>({round,team_name:t})));
    const pts=ROUNDS.find(r=>r.key===round)?.points||0;
    const { data: tips } = await supabase.from("qualifier_tips").select("*").eq("round",round);
    for (const t of (tips||[])) await supabase.from("qualifier_tips").update({points_earned:teams.includes(t.team_name)?pts:0}).eq("id",t.id);
    await saveRankSnapshot();
    setMsg(m=>({...m,[round]:"✅ Saved"}));
    setTimeout(()=>setMsg(m=>({...m,[round]:""})),3000);
    setSaving(s=>({...s,[round]:false}));
  };

  const saveChampResult = async () => {
    if (!champResult) return;
    setSaving(s=>({...s,champ:true}));
    await supabase.from("champion_result").delete().neq("id","00000000-0000-0000-0000-000000000000");
    await supabase.from("champion_result").insert({team_name:champResult});
    const { data: tips } = await supabase.from("champion_tips").select("*");
    for (const t of (tips||[])) await supabase.from("champion_tips").update({points_earned:t.team_name===champResult?13:0}).eq("id",t.id);
    await saveRankSnapshot();
    setMsg(m=>({...m,champ:"✅ Saved"}));
    setTimeout(()=>setMsg(m=>({...m,champ:""})),3000);
    setSaving(s=>({...s,champ:false}));
  };

  const resetPin = async (participantId) => {
    const pin=newPin[participantId];
    if (!pin||pin.length!==4||!/^\d{4}$/.test(pin)) { alert("Enter a valid 4-digit PIN"); return; }
    const pin_hash=await hashPIN(pin);
    await supabase.from("participants").update({pin_hash}).eq("id",participantId);
    setMsg(m=>({...m,[participantId]:"✅ PIN reset"}));
    setNewPin(p=>({...p,[participantId]:""}));
    setTimeout(()=>setMsg(m=>({...m,[participantId]:""})),3000);
  };

  const toggleQualResult=(round,team,maxCount)=>{
    setQualResults(prev=>{
      const cur=prev[round]||[];
      if (cur.includes(team)) return {...prev,[round]:cur.filter(t=>t!==team)};
      if (cur.length>=maxCount) return prev;
      return {...prev,[round]:[...cur,team]};
    });
  };

  if (loading) return <div className="loading-wrap"><div className="spinner"/></div>;
  const groups=[...new Set(matches.map(m=>m.group_name))].sort();

  return (
    <div>
      <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:32,color:"var(--green)",margin:"24px 0 16px"}}>⚙️ Admin Panel</h2>

      <div className="lock-toggle">
        <div className="lock-status">
          <div className="lock-status-label">{tipsLocked?"🔒 Tips are currently LOCKED":"🟢 Tips are currently OPEN"}</div>
          <div className="lock-status-desc">{tipsLocked?"Participants cannot submit or change tips.":"Participants can submit and edit their tips."}</div>
        </div>
        <button className={`btn-sm ${tipsLocked?"btn-green":"btn-red"}`} onClick={toggleLock} disabled={lockBusy}>
          {lockBusy?"...":tipsLocked?"Unlock Tips":"Lock Tips"}
        </button>
      </div>

      <div className="admin-tabs">
        <button className={`admin-tab${tab==="results"?" active":""}`} onClick={()=>setTab("results")}>Match Results</button>
        <button className={`admin-tab${tab==="qualifiers"?" active":""}`} onClick={()=>setTab("qualifiers")}>Qualifier Results</button>
        <button className={`admin-tab${tab==="champion"?" active":""}`} onClick={()=>setTab("champion")}>Champion</button>
        <button className={`admin-tab${tab==="participants"?" active":""}`} onClick={()=>setTab("participants")}>Participants</button>
      </div>

      {tab==="results" && (
        <div>
          {/* Sticky save bar */}
          <div className="admin-save-bar">
            <div className="admin-save-bar-left">
              {dirtyResults.size>0
                ? <><strong>{dirtyResults.size} match{dirtyResults.size>1?"es":""}</strong> ready to save</>
                : <span style={{color:"var(--text3)"}}>Enter scores below — they turn gold when edited</span>
              }
              {bulkMsg && <span style={{marginLeft:12,color:bulkMsg.startsWith("✅")?"var(--green2)":"var(--red)",fontWeight:700}}>{bulkMsg}</span>}
            </div>
            <button className="btn-save" onClick={saveAllResults} disabled={bulkSaving||dirtyResults.size===0}>
              {bulkSaving?"Saving...":"Save All Results"}
            </button>
          </div>

          {groups.map(g=>(
            <div key={g}>
              <div className="group-header">GROUP {g}</div>
              {matches.filter(m=>m.group_name===g).map(m=>{
                const isDirty = dirtyResults.has(m.id);
                const hasSaved = m.result_home!==null;
                return (
                  <div key={m.id} className={`result-row${hasSaved&&!isDirty?" has-saved":""}`}>
                    <div className="result-teams">{tf(m.home_team)} vs {tf(m.away_team)}</div>
                    <input className={`result-input${isDirty?" dirty":""}`} type="number" min="0" max="20" placeholder="0"
                      value={results[m.id]?.home??""} onChange={e=>updateResult(m.id,"home",e.target.value)}/>
                    <span className="result-sep">-</span>
                    <input className={`result-input${isDirty?" dirty":""}`} type="number" min="0" max="20" placeholder="0"
                      value={results[m.id]?.away??""} onChange={e=>updateResult(m.id,"away",e.target.value)}/>
                    {hasSaved&&!isDirty&&<span className="result-saved">✅ {m.result_home}-{m.result_away}</span>}
                    {isDirty&&<span style={{fontSize:12,color:"var(--gold)",fontWeight:600}}>● unsaved</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {tab==="qualifiers" && (
        <div>
          <p className="section-intro">Select which teams actually advanced. Points awarded automatically.</p>
          {ROUNDS.map(r=>(
            <div key={r.key} className="card qualifier-section">
              <div className="qualifier-title">{r.label}<span className="qualifier-pts">{r.points} pts · {r.count} teams</span></div>
              <div className="team-grid">
                {ALL_TEAMS.map(team=>(
                  <div key={team} className={`team-chip${(qualResults[r.key]||[]).includes(team)?" selected":""}`}
                    onClick={()=>toggleQualResult(r.key,team,r.count)}>{tf(team)}</div>
                ))}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:12,marginTop:12}}>
                <span className="count-badge">{(qualResults[r.key]||[]).length}/{r.count} selected</span>
                <button className="btn-sm btn-green" onClick={()=>saveQualResults(r.key)} disabled={saving[r.key]}>
                  {saving[r.key]?"Saving...":"Save & Score"}
                </button>
                {msg[r.key]&&<span className="result-saved">{msg[r.key]}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab==="champion" && (
        <div className="card">
          <div className="card-title">🏆 World Champion Result</div>
          <p className="section-intro">Select the actual winner to award 13 points to correct tips.</p>
          <select className="champion-select" value={champResult} onChange={e=>setChampResult(e.target.value)} style={{marginBottom:16}}>
            <option value="">— Select champion —</option>
            {ALL_TEAMS.map(t=><option key={t} value={t}>{tf(t)}</option>)}
          </select>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <button className="btn btn-primary" style={{maxWidth:160}} onClick={saveChampResult} disabled={saving.champ||!champResult}>
              {saving.champ?"Saving...":"Save & Score"}
            </button>
            {msg.champ&&<span className="result-saved">{msg.champ}</span>}
          </div>
        </div>
      )}

      {tab==="participants" && (
        <div>
          <p className="section-intro">{participants.length} registered participants. Reset a PIN if someone is locked out.</p>
          {participants.map(p=>(
            <div key={p.id} className="participant-row">
              <div>
                <div className="participant-info">{p.name}{p.is_admin&&<span style={{fontSize:11,color:"var(--green2)",marginLeft:6}}>★ admin</span>}</div>
                <div className="participant-meta">Joined {new Date(p.created_at).toLocaleDateString("en-GB")}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <input className="form-input" type="number" inputMode="numeric" maxLength={4} placeholder="New PIN"
                  style={{width:100,padding:"6px 10px",fontSize:14}}
                  value={newPin[p.id]||""} onChange={e=>setNewPin(n=>({...n,[p.id]:e.target.value.replace(/\D/g,"").slice(0,4)}))}/>
                <button className="btn-sm btn-green" onClick={()=>resetPin(p.id)}>Reset PIN</button>
                {msg[p.id]&&<span className="result-saved">{msg[p.id]}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
