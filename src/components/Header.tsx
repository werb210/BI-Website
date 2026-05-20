// BI_WEBSITE_BLOCK_v98_BRANDING_v1 + HOTFIX_ROUTER_v1 — Boreal Risk
// Management brand. Uses react-router-dom (App.tsx is RRDv6+).
import { Link } from "react-router-dom";
import logoUrl from "../assets/logo-boreal-mountains-white.svg";

const APPLY_URL = "https://client.boreal.financial";

export default function Header() {
  return (
    <header style={{ background: "#0a1120", borderBottom: "1px solid #1c2538", padding: "12px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 1200, margin: "0 auto" }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
          <img src={logoUrl} alt="" style={{ height: 32, width: "auto" }} />
          <span style={{ fontWeight: 600, fontSize: 18, color: "white" }}>Boreal Risk Management</span>
        </Link>
        <nav style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Link to="/quote" style={{ color: "rgba(255,255,255,0.85)", textDecoration: "none" }}>Quote</Link>
          <Link to="/referrer/login" style={{ color: "rgba(255,255,255,0.85)", textDecoration: "none" }}>Referrer Login</Link>
          <Link to="/lender/login" style={{ color: "rgba(255,255,255,0.85)", textDecoration: "none" }}>Lender Login</Link>
          <a href="https://www.boreal.financial" target="_blank" rel="noopener noreferrer"
             style={{ color: "rgba(255,255,255,0.85)", textDecoration: "none", fontWeight: 500 }}>
            Visit Boreal Financial
          </a>
          <a href={APPLY_URL} target="_blank" rel="noopener noreferrer"
             style={{ background: "#3b82f6", color: "white", padding: "8px 18px", borderRadius: 999, textDecoration: "none", fontWeight: 500 }}>
            Apply Now
          </a>
        </nav>
      </div>
    </header>
  );
}
