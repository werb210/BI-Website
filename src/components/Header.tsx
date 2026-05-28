// BI_WEBSITE_BLOCK_v98_BRANDING_v1 + HOTFIX_ROUTER_v1 — Boreal Risk
// Management brand. Uses react-router-dom (App.tsx is RRDv6+).
// BI_WEBSITE_BLOCK_v326_APPLY_NOW_INTERNAL_LINK_v1 — Get Started must
// route to the BI insurance application form at /applications/new.
// BI_WEBSITE_BLOCK_v347_LAUNCH_BLOCKERS_v1 — responsive mobile nav.
// Below 768px the inline nav collapses to a hamburger; the original
// desktop layout is preserved at ≥768px via a single CSS media query
// embedded in a <style> block (avoids needing Tailwind for this file).
import { useState } from "react";
import { Link } from "react-router-dom";
import logoUrl from "../assets/logo-boreal-mountains-white.svg";

export default function Header() {
  const [open, setOpen] = useState(false);

  const linkStyle: React.CSSProperties = {
    color: "rgba(255,255,255,0.85)",
    textDecoration: "none",
  };
  const ctaStyle: React.CSSProperties = {
    background: "#3b82f6",
    color: "white",
    padding: "8px 18px",
    borderRadius: 999,
    textDecoration: "none",
    fontWeight: 500,
    display: "inline-block",
  };

  return (
    <header
      style={{
        background: "#0a1120",
        borderBottom: "1px solid #1c2538",
        padding: "12px 24px",
        // Honor iPhone notch / Dynamic Island so the time + signal icons
        // stop overlapping the wordmark on iOS Safari.
        paddingTop: "calc(12px + env(safe-area-inset-top))",
        paddingLeft: "calc(24px + env(safe-area-inset-left))",
        paddingRight: "calc(24px + env(safe-area-inset-right))",
        position: "relative",
        zIndex: 50,
      }}
    >
      <style>{`
        .bi-header-row { display: flex; align-items: center; justify-content: space-between; max-width: 1200px; margin: 0 auto; }
        .bi-header-nav-desktop { display: flex; align-items: center; gap: 24px; }
        .bi-header-burger { display: none; background: transparent; border: 1px solid rgba(255,255,255,0.25); color: white; padding: 6px 10px; border-radius: 6px; cursor: pointer; font-size: 18px; line-height: 1; }
        .bi-header-nav-mobile { display: none; flex-direction: column; gap: 14px; padding: 16px 24px 20px; background: #0a1120; border-top: 1px solid #1c2538; }
        .bi-header-nav-mobile a { color: rgba(255,255,255,0.92); text-decoration: none; font-size: 16px; padding: 6px 0; }
        @media (max-width: 767px) {
          .bi-header-nav-desktop { display: none; }
          .bi-header-burger { display: inline-flex; align-items: center; justify-content: center; }
          .bi-header-nav-mobile.open { display: flex; }
        }
      `}</style>

      <div className="bi-header-row">
        <Link
          to="/"
          style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", minWidth: 0 }}
          onClick={() => setOpen(false)}
        >
          <img src={logoUrl} alt="" style={{ height: 40, width: "auto", flexShrink: 0 }} />
          <span style={{ fontWeight: 600, fontSize: 18, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            Boreal Risk Management
          </span>
        </Link>

        <nav className="bi-header-nav-desktop">
          <Link to="/quote" style={linkStyle}>Quote</Link>
          <Link to="/referrer/login" style={linkStyle}>Referrer Login</Link>
          <Link to="/lender/login" style={linkStyle}>Lender Login</Link>
          <a href="https://www.boreal.financial" target="_blank" rel="noopener noreferrer" style={{ ...linkStyle, fontWeight: 500 }}>
            Visit Boreal Financial
          </a>
          <Link to="/applications/new" style={ctaStyle}>Get Started</Link>
        </nav>

        <button
          type="button"
          className="bi-header-burger"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      <div className={`bi-header-nav-mobile ${open ? "open" : ""}`}>
        <Link to="/quote" onClick={() => setOpen(false)}>Quote</Link>
        <Link to="/referrer/login" onClick={() => setOpen(false)}>Referrer Login</Link>
        <Link to="/lender/login" onClick={() => setOpen(false)}>Lender Login</Link>
        <a href="https://www.boreal.financial" target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
          Visit Boreal Financial
        </a>
        <Link to="/applications/new" style={{ ...ctaStyle, textAlign: "center" }} onClick={() => setOpen(false)}>
          Get Started
        </Link>
      </div>
    </header>
  );
}
