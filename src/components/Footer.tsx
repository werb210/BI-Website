// BI_WEBSITE_BLOCK_v98_BRANDING_v1 + HOTFIX_ROUTER_v1
import { Link } from "react-router-dom";
import markelUrl from "../assets/logo-markel.svg";

const SUPPORT_EMAIL = "info@boreal.financial";

export default function Footer() {
  return (
    <footer style={{ background: "#0a1120", borderTop: "1px solid #1c2538", color: "rgba(255,255,255,0.8)", padding: "32px 24px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 32, marginBottom: 24 }}>
          <div>
            <div style={{ fontWeight: 600, color: "white", marginBottom: 12 }}>Boreal Risk Management</div>
            <p style={{ fontSize: 14, lineHeight: 1.5, color: "rgba(255,255,255,0.65)" }}>
              Personal guarantee insurance for Canadian businesses.
            </p>
          </div>
          <div>
            <div style={{ fontWeight: 600, color: "white", marginBottom: 12 }}>Explore</div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 14, lineHeight: 1.9 }}>
              <li><Link to="/quote" style={{ color: "rgba(255,255,255,0.75)", textDecoration: "none" }}>Get a Quote</Link></li>
              <li><a href="https://client.boreal.financial" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.75)", textDecoration: "none" }}>Apply Now</a></li>
              <li><Link to="/faq" style={{ color: "rgba(255,255,255,0.75)", textDecoration: "none" }}>FAQ</Link></li>
              <li><a href="https://www.boreal.financial" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.75)", textDecoration: "none" }}>Visit Boreal Financial</a></li>
            </ul>
          </div>
          <div>
            <div style={{ fontWeight: 600, color: "white", marginBottom: 12 }}>Sign In</div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 14, lineHeight: 1.9 }}>
              <li><Link to="/lender/login" style={{ color: "rgba(255,255,255,0.75)", textDecoration: "none" }}>Lender Login</Link></li>
              <li><Link to="/referrer/login" style={{ color: "rgba(255,255,255,0.75)", textDecoration: "none" }}>Referral Login</Link></li>
            </ul>
          </div>
          <div>
            <div style={{ fontWeight: 600, color: "white", marginBottom: 12 }}>Contact</div>
            <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: "rgba(255,255,255,0.75)", textDecoration: "none", fontSize: 14 }}>
              {SUPPORT_EMAIL}
            </a>
            <div style={{ marginTop: 4, fontSize: 14, color: "rgba(255,255,255,0.55)" }}>
              Mon–Fri 8am–6pm MT
            </div>
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 6, letterSpacing: 1 }}>UNDERWRITTEN BY</div>
              <img src={markelUrl} alt="Markel Canada" style={{ height: 28, width: "auto" }} />
            </div>
          </div>
        </div>

        <p style={{ fontSize: 12, lineHeight: 1.6, color: "rgba(255,255,255,0.5)", marginTop: 24, marginBottom: 16 }}>
          Boreal Risk Management is a referral platform operated by Boreal Financial. We are not a licensed
          insurance broker, agent, or adviser. We introduce Canadian businesses to licensed brokers who
          arrange Personal Guarantee Insurance underwritten by Markel Canada Limited (A-rated by AM Best,
          S&amp;P, and Fitch). Coverage is subject to underwriting approval, policy terms, and exclusions
          issued by the licensed broker and insurer. Premium estimates shown here are illustrative and
          non-binding; final terms are set when a licensed broker binds a policy. Questions about this
          referral service: {SUPPORT_EMAIL}.
        </p>

        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #1c2538", paddingTop: 16, fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
          <div style={{ display: "flex", gap: 16 }}>
            <Link to="/privacy" style={{ color: "inherit", textDecoration: "none" }}>Privacy Policy</Link>
            <Link to="/terms" style={{ color: "inherit", textDecoration: "none" }}>Terms of Service</Link>
          </div>
          <div>© {new Date().getFullYear()} Boreal Risk Management</div>
        </div>
      </div>
    </footer>
  );
}
