// BI_WEBSITE_PGI_CONSENT_v1 (2026-11-24) - a guarantor confirms, before anything goes to PGI, that they have read
// how Boreal Risk Management is paid and agree to the sharing (referral agreement s.9 and s.10). Reached from the
// email BI-Server sends when a lender submits a file for them.
import { useEffect, useState, type CSSProperties } from "react";
import { useParams } from "react-router-dom";
import { API_BASE } from "@/config";

type Req = { guarantor_name: string | null; business: string | null; already_confirmed: boolean; fee_disclosure: string; consent_text: string };

const card: CSSProperties = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 28, boxShadow: "0 4px 16px rgba(15,23,42,0.06)" };
const primary = (disabled: boolean): CSSProperties => ({ width: "100%", padding: "14px 20px", fontSize: 17, fontWeight: 700, background: "#BF9B49", color: "#0B1F3A", border: 0, borderRadius: 999, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1, marginTop: 8 });
const box: CSSProperties = { width: 18, height: 18, flex: "0 0 18px", marginTop: 3, accentColor: "#0B1F3A", appearance: "auto" };

export default function PgiConsent() {
  const { token = "" } = useParams();
  const [req, setReq] = useState<Req | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing" | "done">("loading");
  const [fee, setFee] = useState(false);
  const [share, setShare] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/consent/${encodeURIComponent(token)}`)
      .then(async (r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((j: Req) => { setReq(j); setState(j.already_confirmed ? "done" : "ready"); })
      .catch(() => setState("missing"));
  }, [token]);

  async function confirm() {
    setBusy(true); setError(null);
    try {
      const r = await fetch(`${API_BASE}/api/v1/consent/${encodeURIComponent(token)}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fee_disclosure_ack: fee, consent_share_pgi: share }),
      });
      if (!r.ok) throw new Error(String(r.status));
      setState("done");
    } catch {
      setError("That didn't go through. Please try again, or call us at (844) 797-6700.");
    } finally { setBusy(false); }
  }

  const first = (req?.guarantor_name ?? "").trim().split(/\s+/)[0];
  return (
    <main style={{ maxWidth: 640, margin: "48px auto", padding: "0 16px" }}>
      <div style={card} data-testid="pgi-consent">
        {state === "loading" && <p>Loading…</p>}
        {state === "missing" && <p>This link isn't valid any more. Please call us at (844) 797-6700.</p>}
        {state === "done" && (
          <>
            <h1 style={{ fontSize: 24, margin: "0 0 12px", color: "#0B1F3A" }}>Thank you</h1>
            <p style={{ color: "#334155", lineHeight: 1.6 }}>Your confirmation is recorded. The application goes to PGI, who will contact you about the offer, program details and conditions.</p>
          </>
        )}
        {state === "ready" && req && (
          <>
            <h1 style={{ fontSize: 24, margin: "0 0 12px", color: "#0B1F3A" }}>Before we send your application</h1>
            <p style={{ color: "#334155", lineHeight: 1.6 }}>
              {first ? `Hi ${first}. ` : ""}Your lender started a Personal Guarantee Insurance application{req.business ? ` for ${req.business}` : ""}. It is optional and is never a condition of your loan. Nothing is shared with PGI until you confirm below.
            </p>
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: 14, margin: "16px 0" }}>
              <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14, color: "#0f172a", marginBottom: 12, cursor: "pointer" }}>
                <input type="checkbox" checked={fee} onChange={(e) => setFee(e.target.checked)} style={box} data-testid="consent-fee" />
                <span><strong>How we are paid.</strong> {req.fee_disclosure} I have read this.</span>
              </label>
              <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14, color: "#0f172a", cursor: "pointer" }}>
                <input type="checkbox" checked={share} onChange={(e) => setShare(e.target.checked)} style={box} data-testid="consent-share" />
                <span>{req.consent_text}</span>
              </label>
            </div>
            {error && <p style={{ color: "#b91c1c" }}>{error}</p>}
            <button type="button" disabled={!fee || !share || busy} onClick={() => void confirm()} style={primary(!fee || !share || busy)} data-testid="consent-confirm">
              {busy ? "Sending…" : "Confirm and send my application"}
            </button>
            <p style={{ fontSize: 13, color: "#64748b", marginTop: 14 }}>Don't want to go ahead? Just close this page and nothing will be sent.</p>
          </>
        )}
      </div>
      <p style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5, marginTop: 16 }}>
        Boreal Risk Management is a referral partner of PGI and is not a licensed insurance broker. The offer, program details and conditions come from PGI. Not available to Quebec residents.
      </p>
    </main>
  );
}
