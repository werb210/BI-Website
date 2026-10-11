import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { applyConsent, readConsent, saveConsent } from "../lib/consent";

export default function ConsentBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const stored = readConsent();
    if (stored) { applyConsent(stored === "granted"); return; }
    setShow(true);
  }, []);

  if (!show) return null;

  const choose = (granted: boolean) => {
    saveConsent(granted);
    setShow(false);
  };

  return (
    <div role="region" aria-label="Cookie consent" style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 80, background: "#0b1f33", color: "#fff", borderTop: "1px solid rgba(255,255,255,0.12)", padding: "16px 20px calc(16px + env(safe-area-inset-bottom))", display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "center" }}>
      <p style={{ margin: 0, fontSize: 13, maxWidth: 640, lineHeight: 1.5 }}>
        We use cookies to analyze traffic and improve your experience. You can accept or decline analytics and advertising cookies.{" "}
        <Link to="/privacy" style={{ color: "inherit", textDecoration: "underline" }}>Privacy Policy</Link>
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => choose(false)} style={{ background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.4)", borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer" }}>Decline</button>
        <button onClick={() => choose(true)} style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Accept</button>
      </div>
    </div>
  );
}
