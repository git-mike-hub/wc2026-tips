export const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  :root{
    --bg:#0d47a1;--bg2:#1565c0;--bg3:#1976d2;--card:#0a1628;--card2:#0f1f38;
    --border:rgba(255,255,255,0.12);--green:#f5c518;--green2:#ffe566;--green-dim:rgba(255,255,255,0.14);
    --navy:#0a1e3d;--navy2:#0c2548;
    --gold:#f5c518;--silver:#c0c0c0;--bronze:#cd7f32;
    --text:#ffffff;--text2:rgba(255,255,255,0.78);--text3:rgba(255,255,255,0.5);
    --red:#ff6b6b;--blue:#64b5f6;
    --bracket-bg:#eceff4;--bracket-card:#ffffff;--bracket-text:#0a1e3d;--bracket-muted:#5a6a7a;
    --radius:14px;--radius-sm:10px;
  }
  body{
    background:linear-gradient(160deg,#1e88e5 0%,#1565c0 45%,#0d47a1 100%);
    background-attachment:fixed;
    color:var(--text);font-family:'DM Sans',sans-serif;min-height:100vh;font-size:15px;line-height:1.5;
  }
  h1,h2,h3{font-family:'Bebas Neue',sans-serif;letter-spacing:0.05em;}
  .app{max-width:900px;margin:0 auto;padding:0 16px 80px;}
  .app-wide{max-width:none;padding:0 0 80px;}
  .nav{background:rgba(10,22,40,0.92);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:100;padding:0 16px;backdrop-filter:blur(8px);}
  .nav-inner{max-width:900px;margin:0 auto;position:relative;display:flex;align-items:center;justify-content:space-between;height:56px;gap:8px;}
  .nav-start{display:flex;align-items:center;gap:8px;z-index:2;min-width:0;flex:1;}
  .nav-end{display:flex;align-items:center;justify-content:flex-end;gap:10px;z-index:2;flex:1;}
  .nav-logo-center{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:1;background:none;border:none;padding:0;cursor:pointer;line-height:0;}
  .nav-logo-img{display:block;height:38px;width:auto;max-width:min(220px,52vw);object-fit:contain;}
  .nav-burger{display:none;flex-direction:column;justify-content:center;gap:5px;width:40px;height:40px;padding:8px;border:1px solid var(--border);border-radius:8px;background:rgba(0,0,0,0.25);cursor:pointer;flex-shrink:0;}
  .nav-burger-bar{display:block;width:100%;height:2px;background:var(--text);border-radius:1px;}
  .nav-backdrop{position:fixed;left:0;right:0;bottom:0;top:56px;background:rgba(0,0,0,0.5);border:none;z-index:140;cursor:pointer;}
  .brand-mark{display:inline-flex;align-items:center;gap:6px;line-height:0;}
  .brand-trophy-side{display:block;object-fit:contain;width:auto;flex-shrink:0;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.25));}
  .brand-trophy-side-nav{height:57px;margin-right:2px;}
  .brand-trophy-side-hero{height:108px;margin-right:4px;}
  .brand-logo{display:block;object-fit:contain;width:auto;background:transparent;}
  .brand-logo-nav{height:75px;width:auto;max-width:min(330px,58vw);}
  .nav-tabs{display:flex;gap:4px;flex-wrap:wrap;align-items:center;}
  .nav-tab{padding:6px 14px;border-radius:6px;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;background:transparent;color:var(--text2);transition:all 0.15s;}
  .nav-tab:hover{background:var(--green-dim);color:var(--text);}
  .nav-tab.active{background:rgba(245,197,24,0.2);color:var(--gold);}
  .nav-user-name{font-size:13px;color:var(--text2);font-weight:500;white-space:nowrap;}
  .btn-logout{padding:5px 12px;border-radius:6px;border:1px solid var(--border);background:transparent;color:var(--text2);font-size:12px;cursor:pointer;font-family:'DM Sans',sans-serif;}
  .btn-logout:hover{border-color:var(--red);color:var(--red);}
  .hero{background:rgba(10,22,40,0.75);border:1px solid var(--border);border-radius:var(--radius);padding:48px 32px;text-align:center;margin:24px 16px;position:relative;overflow:hidden;}
  .brand-logo-hero{height:96px;width:auto;max-width:min(390px,92vw);margin:0 auto 14px;}
  .hero-subtitle{font-size:26px;color:var(--text);font-weight:600;margin-bottom:24px;font-family:'DM Sans',sans-serif;letter-spacing:0.02em;}
  @media(max-width:600px){.brand-logo-hero{height:38px;max-width:min(195px,88vw);}.hero-subtitle{font-size:20px;}}
  .hero-deadline{display:inline-flex;align-items:center;gap:8px;background:rgba(0,0,0,0.25);border:1px solid var(--border);padding:8px 20px;border-radius:20px;font-size:13px;color:var(--text2);}
  .hero-deadline strong{color:var(--gold);}
  .hero-bracket-warning{margin:14px auto 0;max-width:520px;padding:12px 16px;background:rgba(255,193,7,0.12);border:1px solid rgba(255,193,7,0.35);border-radius:10px;font-size:13px;color:var(--text2);line-height:1.55;}
  .hero-bracket-warning-link{background:none;border:none;color:var(--gold);font-weight:700;cursor:pointer;text-decoration:underline;padding:0;font-family:'DM Sans',sans-serif;font-size:13px;}
  .hero-champion-pick{margin:14px auto 0;max-width:520px;padding:12px 16px;background:rgba(245,197,24,0.12);border:1px solid rgba(245,197,24,0.35);border-radius:10px;font-size:14px;color:var(--text2);line-height:1.55;text-align:center;}
  .hero-champion-line{margin:0;}
  .hero-champion-luck{margin:10px 0 0;font-weight:600;color:var(--gold);font-size:15px;}
  .hero-champion-team{display:inline-flex;align-items:center;gap:8px;font-weight:700;color:var(--gold);margin-left:4px;}
  .hero-champion-flag{font-size:1.35em;line-height:1;}
  @media(min-width:769px){
    .nav-burger{display:none!important;}
    .nav-tabs{display:flex!important;position:static;flex-direction:row;box-shadow:none;border:none;padding:0;background:transparent;}
    .nav-start{flex:1;}
  }
  @media(max-width:768px){
    .nav-burger{display:flex;}
    .nav-start{flex:0 0 auto;}
    .nav-end{flex:0 0 auto;}
    .nav-logo-img{height:32px;max-width:min(180px,46vw);}
    .nav-tabs{display:none;position:fixed;top:56px;left:0;right:0;flex-direction:column;align-items:stretch;gap:4px;background:rgba(10,22,40,0.98);border-bottom:1px solid var(--border);padding:10px 12px 14px;z-index:150;box-shadow:0 10px 28px rgba(0,0,0,0.35);}
    .nav-tabs.open{display:flex;}
    .nav-tab{width:100%;text-align:left;padding:12px 14px;font-size:15px;}
    .nav-user-name{display:none;}
  }
  .home-rules{margin:0 16px 20px;padding:18px 20px;background:rgba(10,22,40,0.75);border:1px solid var(--border);border-radius:var(--radius);scroll-margin-top:72px;}
  .home-rules-title{font-family:'Bebas Neue',sans-serif;font-size:18px;color:var(--gold);letter-spacing:0.06em;margin-bottom:12px;}
  .home-rules-list{margin:0;padding:0 0 0 18px;color:var(--text2);font-size:14px;line-height:1.65;}
  .home-rules-list li{margin-bottom:8px;}
  .home-rules-list li:last-child{margin-bottom:0;}
  .home-rules-list strong{color:var(--text);font-weight:600;}
  .card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:24px;margin-bottom:16px;box-shadow:0 8px 32px rgba(0,0,0,0.2);}
  .card-title{font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:0.05em;color:var(--gold);margin-bottom:16px;}
  .auth-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:24px;}
  .home-auth-stack{display:flex;flex-direction:column;gap:16px;margin:20px 16px 8px;}
  @media(max-width:600px){.auth-grid{grid-template-columns:1fr;}}
  .form-group{margin-bottom:14px;}
  .form-label{font-size:12px;font-weight:600;color:var(--text2);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;display:block;}
  .form-input{width:100%;padding:10px 14px;background:rgba(0,0,0,0.25);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-family:'DM Sans',sans-serif;font-size:15px;outline:none;}
  .form-input:focus{border-color:var(--gold);}
  .btn{width:100%;padding:12px;border-radius:var(--radius-sm);border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:15px;font-weight:700;}
  .btn-primary{background:var(--gold);color:#0a1628;}
  .btn-primary:disabled{background:var(--text3);cursor:not-allowed;color:rgba(0,0,0,0.4);}
  .btn-secondary{background:rgba(0,0,0,0.2);color:var(--text);border:1px solid var(--border);}
  .btn-sm{padding:6px 14px;font-size:13px;font-weight:600;border-radius:6px;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;}
  .btn-green{background:rgba(245,197,24,0.2);color:var(--gold);}
  .btn-red{background:rgba(255,107,107,0.15);color:var(--red);}
  .alert{padding:10px 14px;border-radius:var(--radius-sm);font-size:13px;margin-bottom:14px;}
  .alert-error{background:rgba(255,107,107,0.15);border:1px solid rgba(255,107,107,0.35);color:var(--red);}
  .alert-success{background:rgba(245,197,24,0.12);border:1px solid rgba(245,197,24,0.35);color:var(--gold);}
  .alert-warn{background:rgba(255,215,0,0.1);border:1px solid rgba(255,215,0,0.3);color:var(--gold);}
  .leaderboard-table{width:100%;border-collapse:collapse;}
  .leaderboard-table th{text-align:left;padding:8px 12px;font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text3);border-bottom:1px solid var(--border);}
  .leaderboard-table td{padding:12px;border-bottom:1px solid rgba(255,255,255,0.08);}
  .rank-badge{width:28px;height:28px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;}
  .rank-1{background:var(--gold);color:#000;}
  .rank-2{background:var(--silver);color:#000;}
  .rank-3{background:var(--bronze);color:#fff;}
  .rank-other{background:rgba(255,255,255,0.1);color:var(--text2);}
  .pts{font-family:'Bebas Neue',sans-serif;font-size:22px;color:var(--gold);}
  .you-badge{font-size:10px;background:rgba(245,197,24,0.2);color:var(--gold);padding:2px 7px;border-radius:10px;font-weight:700;margin-left:6px;}
  .rank-change{font-size:13px;font-weight:700;display:inline-flex;align-items:center;gap:2px;}
  .rank-up{color:#81c784;}
  .rank-down{color:#ef5350;}
  .rank-same{color:var(--text3);}
  .group-header{font-family:'Bebas Neue',sans-serif;font-size:18px;color:var(--text2);letter-spacing:0.1em;padding:12px 0 8px;display:flex;align-items:center;gap:12px;}
  .group-header::after{content:'';flex:1;height:1px;background:var(--border);}
  .group-board{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:16px 18px;margin-bottom:14px;box-shadow:0 6px 24px rgba(0,0,0,0.18);}
  .group-board-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:14px;}
  .group-board-title{font-family:'Bebas Neue',sans-serif;font-size:26px;color:#fff;letter-spacing:0.06em;margin:0;line-height:1;display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
  .group-pts-badge{font-family:'DM Sans',sans-serif;font-size:12px;font-weight:700;padding:3px 10px;border-radius:6px;background:rgba(129,199,132,0.25);border:1px solid rgba(129,199,132,0.6);color:#a5d6a7;letter-spacing:0;}
  .group-reset-btn{padding:4px 10px;border-radius:6px;border:1px solid rgba(255,255,255,0.25);background:rgba(0,0,0,0.2);color:var(--text2);font-family:'DM Sans',sans-serif;font-size:11px;font-weight:600;cursor:pointer;flex-shrink:0;}
  .group-reset-btn:hover{border-color:rgba(255,107,107,0.5);color:var(--red);background:rgba(255,107,107,0.12);}
  .group-board-cols{display:grid;grid-template-columns:1fr 1fr;gap:10px 14px;align-items:stretch;}
  .group-board-teams-col,.group-board-slots-col{display:flex;flex-direction:column;gap:10px;}
  .group-team-pill{display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(30,80,150,0.45);border:1px solid rgba(255,255,255,0.1);border-radius:var(--radius-sm);cursor:pointer;user-select:none;transition:background 0.15s,border-color 0.15s,opacity 0.15s;}
  .group-team-pill:hover:not(.placed){background:rgba(40,100,180,0.55);border-color:rgba(255,255,255,0.2);}
  .group-team-pill.placed{opacity:0.45;cursor:pointer;}
  .group-team-pill.placed:hover{opacity:0.65;}
  .group-flag{font-size:22px;line-height:1;}
  .group-code{font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:0.08em;color:#fff;}
  .group-rank-slot{display:flex;align-items:center;gap:10px;background:#fff;border-radius:var(--radius-sm);min-height:48px;padding:6px 12px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.12);}
  .group-rank-num{font-family:'Bebas Neue',sans-serif;font-size:28px;color:#0a1628;line-height:1;min-width:22px;}
  .group-rank-fill{display:flex;align-items:center;gap:8px;flex:1;min-width:0;}
  .group-rank-fill .group-flag{font-size:18px;}
  .group-rank-fill .group-code{font-size:16px;color:#0a1628;}
  .group-rank-slot.correct .group-rank-fill .group-code{color:#1b5e20;}
  .group-rank-slot.wrong .group-rank-fill .group-code{color:#c62828;}
  .group-hint{font-size:12px;color:var(--text3);margin-top:10px;}
  .team-grid{display:flex;flex-wrap:wrap;gap:8px;}
  .team-chip{padding:8px 16px;border-radius:20px;font-size:13px;font-weight:600;border:1px solid var(--border);background:rgba(0,0,0,0.2);color:var(--text2);cursor:pointer;user-select:none;}
  .team-chip:hover{border-color:rgba(255,255,255,0.3);color:var(--text);}
  .team-chip.selected{background:rgba(245,197,24,0.25);border-color:var(--gold);color:var(--gold);}
  .team-chip.score-correct{border-color:rgba(129,199,132,0.75);}
  .team-chip.score-wrong{border-color:rgba(255,107,107,0.5);}
  .chip-pts{margin-left:6px;font-size:11px;font-weight:700;color:var(--text3);}
  .chip-pts.earned{color:#81c784;}
  .section-pts-badge{margin-left:10px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:700;color:#81c784;letter-spacing:0;}
  .tips-score-summary{margin:0 16px 16px;}
  .tips-score-breakdown{font-weight:400;color:var(--text2);font-size:13px;}
  .count-badge{font-size:11px;color:var(--text3);margin-top:8px;}
  .tips-tabs{display:flex;gap:4px;margin-bottom:20px;overflow-x:auto;padding:0 16px;}
  .tips-tab{padding:8px 16px;border-radius:var(--radius-sm);border:1px solid var(--border);background:rgba(10,22,40,0.5);color:var(--text2);cursor:pointer;white-space:nowrap;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;}
  .tips-tab.active{background:rgba(245,197,24,0.22);border-color:var(--gold);color:var(--gold);}
  .tips-tab:disabled{opacity:0.4;cursor:not-allowed;}
  .tips-inner{padding:0 16px;}
  .bracket-page{margin:0;padding:0 0 24px;background:var(--bracket-bg);border-radius:var(--radius) var(--radius) 0 0;min-height:60vh;}
  .bracket-page-intro{padding:16px 16px 8px;color:var(--bracket-muted);font-size:13px;line-height:1.55;}
  .bracket-page-intro strong{color:var(--navy);}
  .bracket-scroll-wrap{position:relative;}
  .bracket-scroll{display:flex;gap:0;overflow-x:auto;overflow-y:hidden;padding:16px 8px 24px;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:thin;}
  .bracket-scroll::-webkit-scrollbar{height:6px;}
  .bracket-scroll::-webkit-scrollbar-thumb{background:rgba(10,30,61,0.25);border-radius:3px;}
  .bracket-column{flex:0 0 auto;scroll-snap-align:start;padding:0 12px;min-width:min(300px,88vw);scroll-margin-top:72px;}
  .bracket-column-title{font-family:'Bebas Neue',sans-serif;font-size:18px;color:var(--navy);letter-spacing:0.06em;margin-bottom:14px;text-align:center;scroll-margin-top:72px;}
  .bracket-column-matches{display:flex;flex-direction:column;gap:20px;}
  .bracket-match-wrap{position:relative;}
  .bracket-feed-badge{display:inline-flex;flex-direction:column;align-items:center;background:var(--navy);color:#fff;padding:4px 10px;border-radius:6px;margin-bottom:6px;font-size:10px;line-height:1.2;}
  .bracket-feed-badge span:first-child{color:var(--gold);font-weight:700;text-transform:uppercase;letter-spacing:0.06em;font-size:9px;}
  .bracket-feed-badge span:last-child{font-family:'Bebas Neue',sans-serif;font-size:16px;letter-spacing:0.04em;}
  .bracket-match-card{background:var(--bracket-card);border-radius:12px;padding:12px 14px 14px;box-shadow:0 2px 12px rgba(10,30,61,0.1);border:1px solid rgba(10,30,61,0.08);}
  .bracket-team-row.reach-correct{border-color:#2e7d32;background:#e8f5e9;}
  .bracket-team-row.reach-correct.selected{background:#1b5e20;border-color:#1b5e20;}
  .bracket-team-row.reach-wrong{border-color:#c62828;background:#ffebee;}
  .bracket-team-row.reach-wrong.selected{background:#b71c1c;border-color:#b71c1c;}
  .bracket-round-score{font-size:11px;color:var(--bracket-muted);margin:-6px 0 10px;text-align:center;}
  .bracket-round-score strong{color:#2e7d32;}
  .bracket-match-head{display:flex;align-items:baseline;gap:10px;margin-bottom:10px;flex-wrap:wrap;}
  .bracket-match-id{font-family:'Bebas Neue',sans-serif;font-size:15px;background:var(--navy);color:#fff;padding:3px 8px;border-radius:5px;letter-spacing:0.04em;}
  .bracket-saved-badge{font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;background:rgba(46,125,50,0.15);color:#2e7d32;border:1px solid rgba(46,125,50,0.35);}
  .bracket-unsaved-badge{font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;background:rgba(255,193,7,0.15);color:#f9a825;border:1px solid rgba(255,193,7,0.4);}
  .bracket-match-meta{font-size:11px;color:var(--bracket-muted);font-weight:500;}
  .bracket-teams{display:flex;flex-direction:column;gap:8px;}
  .bracket-team-row{display:flex;align-items:center;gap:8px;width:100%;padding:8px 12px;border-radius:999px;border:1px solid #d0d8e4;background:#fff;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;text-align:left;transition:border-color 0.12s,background 0.12s;}
  .bracket-team-row:hover:not(:disabled){border-color:var(--navy);background:#f5f8fc;}
  .bracket-team-row.selected{background:var(--navy);border-color:var(--navy);color:#fff;}
  .bracket-team-row.selected .bracket-team-seed{color:rgba(255,255,255,0.7);}
  .bracket-team-row:disabled{cursor:default;}
  .bracket-team-row.placeholder .bracket-team-name{font-style:italic;color:var(--bracket-muted);font-weight:500;}
  .bracket-team-row.selected.placeholder .bracket-team-name{color:#fff;}
  .bracket-team-flag{font-size:18px;line-height:1;flex-shrink:0;}
  .bracket-team-name{flex:1;font-weight:700;color:var(--navy);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .bracket-team-row.selected .bracket-team-name{color:#fff;}
  .bracket-team-seed{font-size:11px;color:var(--bracket-muted);font-weight:600;flex-shrink:0;}
  .bracket-team-pts{font-size:10px;font-weight:700;padding:2px 7px;border-radius:4px;background:rgba(0,0,0,0.08);color:var(--bracket-muted);flex-shrink:0;}
  .bracket-team-row.selected .bracket-team-pts{background:rgba(255,255,255,0.2);color:rgba(255,255,255,0.9);}
  .bracket-team-pts.earned{background:rgba(46,125,50,0.2);color:#2e7d32;}
  .bracket-team-row.selected .bracket-team-pts.earned{background:rgba(255,255,255,0.25);color:#a5d6a7;}
  .bracket-pending-msg{font-size:12px;color:var(--bracket-muted);padding:8px 0;}
  .bracket-result-meta{font-size:11px;color:var(--bracket-muted);margin-top:8px;display:block;}
  .bracket-hint{padding:8px 16px 0;font-size:12px;color:var(--bracket-muted);text-align:center;}
  .save-bar{position:fixed;bottom:0;left:0;right:0;z-index:200;background:rgba(10,22,40,0.95);border-top:1px solid var(--border);padding:12px 16px;backdrop-filter:blur(8px);}
  .save-bar-inner{max-width:900px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:12px;}
  .btn-save{padding:10px 28px;background:var(--gold);color:#0a1628;border:none;border-radius:var(--radius-sm);font-family:'DM Sans',sans-serif;font-size:15px;font-weight:700;cursor:pointer;}
  .btn-save:disabled{background:var(--text3);cursor:not-allowed;}
  .admin-tabs{display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap;}
  .admin-tab{padding:8px 20px;border-radius:var(--radius-sm);border:1px solid var(--border);background:transparent;color:var(--text2);cursor:pointer;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;}
  .admin-tab.active{background:rgba(245,197,24,0.2);border-color:var(--gold);color:var(--gold);}
  .lock-toggle{display:flex;align-items:center;gap:12px;padding:16px;background:rgba(0,0,0,0.2);border:1px solid var(--border);border-radius:var(--radius-sm);margin-bottom:16px;}
  .lock-status-desc{font-size:12px;color:var(--text3);margin-top:2px;}
  .participant-row{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:rgba(0,0,0,0.2);border:1px solid var(--border);border-radius:var(--radius-sm);margin-bottom:8px;flex-wrap:wrap;gap:8px;}
  .participant-name-wrap{display:flex;align-items:center;flex-wrap:wrap;gap:6px;}
  .participant-ready{display:inline-flex;align-items:center;padding:2px 8px;border-radius:4px;background:rgba(76,175,80,0.22);border:1px solid rgba(129,199,132,0.75);color:#a5d6a7;font-size:10px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;line-height:1.4;}
  .result-saved{font-size:12px;color:var(--gold);font-weight:600;}
  .spinner{width:32px;height:32px;border:3px solid var(--border);border-top-color:var(--gold);border-radius:50%;animation:spin 0.7s linear infinite;margin:40px auto;}
  @keyframes spin{to{transform:rotate(360deg);}}
  .loading-wrap{text-align:center;padding:40px;}
  .section-intro{font-size:13px;color:var(--text2);margin-bottom:16px;line-height:1.6;padding:0 16px;}
  .text-center{text-align:center;}
  .text-muted{color:var(--text2);font-size:13px;}
  .mt-16{margin-top:16px;}
  .step-nav{display:flex;gap:8px;margin:16px 16px;flex-wrap:wrap;}
  .modal-overlay{position:fixed;inset:0;z-index:500;background:rgba(0,0,0,0.65);display:flex;align-items:center;justify-content:center;padding:20px;}
  .modal-box{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:24px;max-width:400px;width:100%;box-shadow:0 16px 48px rgba(0,0,0,0.4);}
  .modal-title{font-family:'Bebas Neue',sans-serif;font-size:24px;color:var(--gold);margin-bottom:12px;letter-spacing:0.04em;}
  .modal-text{font-size:15px;color:var(--text2);line-height:1.55;margin-bottom:8px;}
  .modal-name{font-weight:700;color:var(--text);}
  .modal-warn{font-size:13px;color:var(--red);margin-bottom:20px;}
  .modal-actions{display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;}
`;
