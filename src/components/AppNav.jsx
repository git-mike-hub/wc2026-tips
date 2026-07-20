import { useState } from "react";

const NAV_LOGO = "/eshkol-logo-with-name.png";

export function AppNav({
  view,
  user,
  ranksVisible = true,
  onHome,
  onRules,
  onLeaderboard,
  onTips,
  onAdmin,
  onSignIn,
  onLogout,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const go = (fn) => {
    fn();
    setMenuOpen(false);
  };

  const tab = (key, label, onClick, opts = {}) => (
    <button
      type="button"
      className={`nav-tab${view === key ? " active" : ""}`}
      onClick={() => go(onClick)}
      disabled={opts.disabled}
    >
      {label}
    </button>
  );

  return (
    <nav className="nav">
      <div className="nav-inner">
        <div className="nav-start">
          <button
            type="button"
            className="nav-burger"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="nav-burger-bar" />
            <span className="nav-burger-bar" />
            <span className="nav-burger-bar" />
          </button>

          <div className={`nav-tabs${menuOpen ? " open" : ""}`}>
            {tab("home", "Home", onHome)}
            {tab("rules", "Rules", onRules)}
            {ranksVisible && tab("leaderboard", "Ranks", onLeaderboard)}
            {user && tab("tips", "My Bracket", onTips)}
            {user?.is_admin && tab("admin", "Admin", onAdmin)}
          </div>
        </div>

        <button type="button" className="nav-logo-center" onClick={() => go(onHome)} aria-label="Home">
          <img src={NAV_LOGO} alt="Eshkol" className="nav-logo-img" />
        </button>

        <div className="nav-end">
          {user ? (
            <>
              <span className="nav-user-name">👋 {user.name}</span>
              <button type="button" className="btn-logout" onClick={() => go(onLogout)}>
                Logout
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn-logout"
              style={{ color: "var(--green2)", borderColor: "var(--green-dim)" }}
              onClick={() => go(onSignIn)}
            >
              Sign In
            </button>
          )}
        </div>
      </div>
      {menuOpen && <button type="button" className="nav-backdrop" aria-label="Close menu" onClick={() => setMenuOpen(false)} />}
    </nav>
  );
}
