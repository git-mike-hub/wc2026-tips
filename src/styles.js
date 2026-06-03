export const styles = `
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
  .btn-logout{padding:5px 12px;border-radius:6px;border:1px solid var(--border);background:transparent;color:var(--text2);font-size:12px;cursor:pointer;font-family:'DM Sans',sans-serif;}
  .btn-logout:hover{border-color:var(--red);color:var(--red);}
  .hero{background:linear-gradient(135deg,var(--bg2) 0%,var(--bg3) 100%);border:1px solid var(--border);border-radius:var(--radius);padding:48px 32px;text-align:center;margin:24px 0;position:relative;overflow:hidden;}
  .hero::before{content:'⚽';position:absolute;top:-20px;right:-20px;font-size:120px;opacity:0.05;}
  .hero h1{font-size:56px;color:var(--green);line-height:1;margin-bottom:6px;}
  .hero h2{font-size:28px;color:var(--text2);font-weight:300;margin-bottom:24px;font-family:'DM Sans',sans-serif;}
  .hero-deadline{display:inline-flex;align-items:center;gap:8px;background:var(--bg);border:1px solid var(--border);padding:8px 20px;border-radius:20px;font-size:13px;color:var(--text2);}
  .hero-deadline strong{color:var(--gold);}
  .card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:24px;margin-bottom:16px;}
  .group-card{padding:16px 20px;}
  .card-title{font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:0.05em;color:var(--green2);margin-bottom:16px;}
  .auth-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:24px;}
  @media(max-width:600px){.auth-grid{grid-template-columns:1fr;}.hero h1{font-size:40px;}.hero h2{font-size:20px;}.nav-logo span{display:none;}}
  .form-group{margin-bottom:14px;}
  .form-label{font-size:12px;font-weight:600;color:var(--text2);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;display:block;}
  .form-input{width:100%;padding:10px 14px;background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-family:'DM Sans',sans-serif;font-size:15px;outline:none;}
  .form-input:focus{border-color:var(--green);}
  .btn{width:100%;padding:12px;border-radius:var(--radius-sm);border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:15px;font-weight:700;}
  .btn-primary{background:var(--green);color:#000;}
  .btn-primary:disabled{background:var(--text3);cursor:not-allowed;}
  .btn-secondary{background:var(--bg2);color:var(--text);border:1px solid var(--border);}
  .btn-sm{padding:6px 14px;font-size:13px;font-weight:600;border-radius:6px;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;}
  .btn-green{background:var(--green-dim);color:var(--green2);}
  .btn-red{background:rgba(239,83,80,0.15);color:var(--red);}
  .alert{padding:10px 14px;border-radius:var(--radius-sm);font-size:13px;margin-bottom:14px;}
  .alert-error{background:rgba(239,83,80,0.1);border:1px solid rgba(239,83,80,0.3);color:var(--red);}
  .alert-success{background:rgba(76,175,80,0.1);border:1px solid rgba(76,175,80,0.3);color:var(--green2);}
  .alert-warn{background:rgba(255,215,0,0.1);border:1px solid rgba(255,215,0,0.3);color:var(--gold);}
  .leaderboard-table{width:100%;border-collapse:collapse;}
  .leaderboard-table th{text-align:left;padding:8px 12px;font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text3);border-bottom:1px solid var(--border);}
  .leaderboard-table td{padding:12px;border-bottom:1px solid rgba(42,58,42,0.5);}
  .rank-badge{width:28px;height:28px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;}
  .rank-1{background:var(--gold);color:#000;}
  .rank-2{background:var(--silver);color:#000;}
  .rank-3{background:var(--bronze);color:#fff;}
  .rank-other{background:var(--bg3);color:var(--text2);}
  .pts{font-family:'Bebas Neue',sans-serif;font-size:22px;color:var(--green);}
  .you-badge{font-size:10px;background:var(--green-dim);color:var(--green2);padding:2px 7px;border-radius:10px;font-weight:700;margin-left:6px;}
  .rank-change{font-size:12px;font-weight:700;margin-left:8px;}
  .rank-up{color:var(--green2);}
  .rank-down{color:var(--red);}
  .rank-same{color:var(--text3);}
  .group-header{font-family:'Bebas Neue',sans-serif;font-size:18px;color:var(--text2);letter-spacing:0.1em;padding:12px 0 8px;display:flex;align-items:center;gap:12px;}
  .group-header::after{content:'';flex:1;height:1px;background:var(--border);}
  .rank-slots{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:12px;}
  @media(max-width:600px){.rank-slots{grid-template-columns:repeat(2,1fr);}}
  .rank-slot{background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:8px;text-align:center;min-height:56px;}
  .rank-slot-label{font-size:10px;color:var(--text3);text-transform:uppercase;display:block;margin-bottom:4px;}
  .rank-slot-team{font-size:12px;font-weight:600;line-height:1.3;}
  .rank-slot-team.correct{color:var(--green2);}
  .rank-slot-team.wrong{color:var(--red);}
  .team-grid{display:flex;flex-wrap:wrap;gap:8px;}
  .team-chip{padding:6px 14px;border-radius:20px;font-size:13px;font-weight:600;border:1px solid var(--border);background:var(--bg2);color:var(--text2);cursor:pointer;user-select:none;position:relative;}
  .team-chip:hover{border-color:var(--green-dim);color:var(--text);}
  .team-chip.selected{background:var(--green-dim);border-color:var(--green);color:var(--green2);}
  .rank-chip-badge{position:absolute;top:-6px;right:-4px;background:var(--green);color:#000;font-size:10px;font-weight:800;width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;}
  .count-badge{font-size:11px;color:var(--text3);margin-top:8px;}
  .tips-tabs{display:flex;gap:4px;margin-bottom:20px;overflow-x:auto;}
  .tips-tab{padding:8px 16px;border-radius:var(--radius-sm);border:1px solid var(--border);background:transparent;color:var(--text2);cursor:pointer;white-space:nowrap;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;}
  .tips-tab.active{background:var(--green-dim);border-color:var(--green);color:var(--green2);}
  .ko-match{padding:12px;background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius-sm);margin-bottom:8px;border-left:3px solid transparent;}
  .ko-match.correct{border-left-color:var(--green);}
  .ko-match.wrong{border-left-color:var(--red);}
  .ko-match-pending{opacity:0.7;}
  .ko-match-label{font-family:'Bebas Neue',sans-serif;font-size:14px;color:var(--text3);display:block;margin-bottom:8px;}
  .ko-teams{display:flex;flex-wrap:wrap;gap:8px;}
  .ko-team-btn{padding:10px 16px;border-radius:8px;border:2px solid var(--border);background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;flex:1;min-width:140px;text-align:left;}
  .ko-team-btn:hover{border-color:var(--green-dim);}
  .ko-team-btn.selected{background:var(--green);border-color:var(--green2);color:#000;}
  .ko-team-btn:disabled{cursor:default;opacity:0.85;}
  .ko-result-meta{display:block;font-size:11px;color:var(--text3);margin-top:8px;}
  .save-bar{position:fixed;bottom:0;left:0;right:0;z-index:200;background:var(--bg2);border-top:1px solid var(--border);padding:12px 16px;}
  .save-bar-inner{max-width:900px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:12px;}
  .btn-save{padding:10px 28px;background:var(--green);color:#000;border:none;border-radius:var(--radius-sm);font-family:'DM Sans',sans-serif;font-size:15px;font-weight:700;cursor:pointer;}
  .btn-save:disabled{background:var(--text3);cursor:not-allowed;}
  .admin-tabs{display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap;}
  .admin-tab{padding:8px 20px;border-radius:var(--radius-sm);border:1px solid var(--border);background:transparent;color:var(--text2);cursor:pointer;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;}
  .admin-tab.active{background:var(--green-dim);border-color:var(--green);color:var(--green2);}
  .lock-toggle{display:flex;align-items:center;gap:12px;padding:16px;background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius-sm);margin-bottom:16px;}
  .lock-status-desc{font-size:12px;color:var(--text3);margin-top:2px;}
  .participant-row{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius-sm);margin-bottom:8px;flex-wrap:wrap;gap:8px;}
  .result-saved{font-size:12px;color:var(--green2);font-weight:600;}
  .spinner{width:32px;height:32px;border:3px solid var(--border);border-top-color:var(--green);border-radius:50%;animation:spin 0.7s linear infinite;margin:40px auto;}
  @keyframes spin{to{transform:rotate(360deg);}}
  .loading-wrap{text-align:center;padding:40px;}
  .section-intro{font-size:13px;color:var(--text2);margin-bottom:16px;line-height:1.6;}
  .text-center{text-align:center;}
  .text-muted{color:var(--text2);font-size:13px;}
  .mt-16{margin-top:16px;}
  .step-nav{display:flex;gap:8px;margin:16px 0;flex-wrap:wrap;}
`;
