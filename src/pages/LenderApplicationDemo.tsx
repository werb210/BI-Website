// BI_WEBSITE_BLOCK_v126_DEMO_SANDBOX_AND_CARRIER_FEEDBACK_v1
// BI_WEBSITE_BLOCK_v125_LENDER_FIXES_AND_PUBLIC_POLISH_v1
// Demo lender application page for sales presentations.
// - All fields pre-filled with realistic demo data (resets on every page load).
// - All 7 document slots show as "pre-loaded" (no real file IO required).
// - "Live demo" badge in the corner so demo apps are visually distinct.
// - Submit posts a real application row to the logged-in lender's pipeline
//   (skips the doc upload step since the docs are simulated).
// - Refresh resets the form to the demo defaults; the submitted app row stays
//   in the pipeline.
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  API_BASE,
  buildLenderSubmitBody,
  demoLenderForm,
  DOC_SLOTS,
  Field,
  getLenderToken,
  LenderFormState,
  SECTION,
  SECTION_TITLE,
  TextIn,
  YesNoSelect,
} from "../components/lenderFormShared";

// Fake "uploaded" file names so the slot panel looks done without real IO.
const DEMO_FILENAMES: Record<string, string> = {
  annual_y1: "FY2025_audited_statements.pdf",
  annual_y2: "FY2024_audited_statements.pdf",
  annual_y3: "FY2023_audited_statements.pdf",
  profit_loss: "interim_p_and_l_2026.pdf",
  balance_sheet: "interim_balance_sheet_2026.pdf",
  ar_aging: "ar_aging_2026Q1.xlsx",
  ap_aging: "ap_aging_2026Q1.xlsx",
};

export default function LenderApplicationDemo() {
  const navigate = useNavigate();
  // BI_WEBSITE_BLOCK_v180_DEMO_TOKEN_AND_AUTO_UPLOAD_v1 — the previous
  // useMemo(() => getLenderToken(), []) captured whatever was in
  // localStorage at mount time, which is the REAL lender JWT. The
  // demo-session useEffect below then overwrites localStorage with the
  // demo JWT, but the captured `token` variable still holds the real
  // one. onSubmit was therefore POSTing with the real token, so the
  // demo application got inserted under the real lender's id and
  // is_demo=FALSE — disappearing from the demo pipeline filter and
  // appearing in the real pipeline as soon as the user exited demo.
  // Fix: split into two pieces of state. realTokenOnMount is captured
  // once so we can fall back to it if the demo handshake fails;
  // demoToken is the JWT minted by /lender/demo/session and is what
  // every subsequent API call uses.
  const realTokenOnMount = useMemo(() => getLenderToken(), []);
  const [demoToken, setDemoToken] = useState<string>("");
  const [demoReady, setDemoReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!realTokenOnMount) return;
      try {
        const real = localStorage.getItem("bi.lender_token") || "";
        if (real) localStorage.setItem("bi.real_token_backup", real);
        const r = await fetch(`${API_BASE}/api/v1/lender/demo/session`, {
          method: "POST",
          headers: { Authorization: `Bearer ${realTokenOnMount}` },
        });
        const data = await r.json().catch(() => ({}));
        const dt = data?.token || data?.access_token;
        if (alive && dt) {
          localStorage.setItem("bi.lender_token", dt);
          localStorage.setItem("bi.is_demo_session", "1");
          setDemoToken(dt);
          setDemoReady(true);
        }
      } catch {}
    })();
    return () => { alive = false; };
  }, [realTokenOnMount]);

  // State seeded from demo defaults — refresh = reset to demo state.
  const [f, setF] = useState<LenderFormState>(demoLenderForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);

  function set<K extends keyof LenderFormState>(k: K, v: LenderFormState[K]) {
    setF((p) => ({ ...p, [k]: v }));
  }

  // BI_WEBSITE_BLOCK_v180_DEMO_TOKEN_AND_AUTO_UPLOAD_v1 — gate on demoReady
  // so the user can't submit before /lender/demo/session has minted the
  // demo JWT. Without this gate, a fast clicker would POST with the real
  // token and create a real-pipeline row in front of the bug-fix.
  const canSubmit = !busy && demoReady && !!demoToken;

  async function onSubmit() {
    if (!canSubmit) return;
    setBusy(true); setError(null); setProgress(null);
    try {
      setProgress("Creating application…");
      const r = await fetch(`${API_BASE}/api/v1/lender/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${demoToken}` },
        body: JSON.stringify(buildLenderSubmitBody(f)),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(data?.message || data?.error || `Submit failed (${r.status})`);
        return;
      }
      // Demo skips the document upload step — the slots only LOOK uploaded.
      // The app row exists in the pipeline; staff can ignore or delete it
      // after the demo if they want a clean slate.
      navigate("/lender/portal");
    } catch (e: any) {
      setError(e?.message || "Network error");
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 24px 96px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: 1, opacity: 0.7 }}>
            LENDER · <span style={{ color: "#fbbf24" }}>LIVE DEMO</span>
          </div>
          <h1 style={{ fontSize: 28, margin: 0 }}>New Application</h1>
        </div>
        <button type="button" onClick={() => navigate("/lender/portal")}
          style={{ background: "transparent", border: "1px solid #2c3a52", color: "#cbd5e1", padding: "8px 16px", borderRadius: 8 }}>Cancel</button>
      </div>
      <p style={{ opacity: 0.7, marginBottom: 24 }}>
        Demo data shown. Edit any field freely; refresh to reset. Submitting creates a real row in your pipeline.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }} className="lender-form-grid">
        <style>{`
          @media (min-width: 1024px) {
            .lender-form-grid { grid-template-columns: 1fr 1fr 1fr !important; }
          }
        `}</style>

        {/* COL 1 */}
        <div>
          <div style={SECTION}>
            <h2 style={SECTION_TITLE}>Applicant</h2>
            <Field label="Company name *"><TextIn value={f.company_name} onChange={(v) => set("company_name", v)} /></Field>
            <Field label="Guarantor name *"><TextIn value={f.guarantor_name} onChange={(v) => set("guarantor_name", v)} /></Field>
            <Field label="Guarantor phone *"><TextIn value={f.guarantor_phone} onChange={(v) => set("guarantor_phone", v)} /></Field>
            <Field label="Guarantor email *"><TextIn value={f.guarantor_email} onChange={(v) => set("guarantor_email", v)} type="email" /></Field>
            <Field label="Guarantor date of birth *"><TextIn value={f.guarantor_dob} onChange={(v) => set("guarantor_dob", v)} type="date" /></Field>
            <Field label="Guarantor address *"><TextIn value={f.guarantor_address} onChange={(v) => set("guarantor_address", v)} /></Field>
          </div>
          <div style={SECTION}>
            <h2 style={SECTION_TITLE}>Business</h2>
            <Field label="Entity type *">
              <select value={f.entity_type} onChange={(e) => set("entity_type", e.target.value as any)}
                style={{ background: "#0a1120", border: "1px solid #2c3a52", color: "#e5e7eb", padding: "10px 12px", borderRadius: 8, width: "100%", fontSize: 14 }}>
                <option value="">—</option>
                <option value="Corporation">Corporation</option>
                <option value="Partnership">Partnership</option>
                <option value="Sole Proprietorship">Sole Proprietorship</option>
                <option value="LLC">LLC</option>
                <option value="Other">Other</option>
              </select>
            </Field>
            <Field label="Business number *"><TextIn value={f.business_number} onChange={(v) => set("business_number", v)} /></Field>
            <Field label="Business address *"><TextIn value={f.business_address} onChange={(v) => set("business_address", v)} /></Field>
            <Field label="Website (optional)"><TextIn value={f.business_website} onChange={(v) => set("business_website", v)} /></Field>
            <Field label="NAICS code *"><TextIn value={f.naics} onChange={(v) => set("naics", v)} /></Field>
            <Field label="Business start date *"><TextIn value={f.business_start_date} onChange={(v) => set("business_start_date", v)} type="date" /></Field>
            <Field label="Country">
              <select value={f.country} onChange={(e) => set("country", e.target.value as any)}
                style={{ background: "#0a1120", border: "1px solid #2c3a52", color: "#e5e7eb", padding: "10px 12px", borderRadius: 8, width: "100%", fontSize: 14 }}>
                <option value="CA">Canada</option>
                <option value="US">United States</option>
              </select>
            </Field>
          </div>
        </div>

        {/* COL 2 */}
        <div>
          <div style={SECTION}>
            <h2 style={SECTION_TITLE}>Loan</h2>
            <Field label="Loan amount ($) *"><TextIn value={f.loan_amount} onChange={(v) => set("loan_amount", v)} inputMode="decimal" /></Field>
            <Field label="Requested PGI limit ($) *"><TextIn value={f.pgi_limit} onChange={(v) => set("pgi_limit", v)} inputMode="decimal" /></Field>
            <Field label="Use of proceeds *">
              <select value={f.use_of_proceeds} onChange={(e) => set("use_of_proceeds", e.target.value as any)}
                style={{ background: "#0a1120", border: "1px solid #2c3a52", color: "#e5e7eb", padding: "10px 12px", borderRadius: 8, width: "100%", fontSize: 14 }}>
                <option value="expansion">Expansion</option>
                <option value="refinance">Refinance</option>
                <option value="equipment">Equipment</option>
                <option value="acquisition">Acquisition</option>
                <option value="working_capital">Working capital</option>
                <option value="real_estate">Real estate</option>
              </select>
            </Field>
            <Field label="Loan funding date *"><TextIn value={f.loan_funding_date} onChange={(v) => set("loan_funding_date", v)} type="date" /></Field>
            <Field label="Policy start date *"><TextIn value={f.policy_start_date} onChange={(v) => set("policy_start_date", v)} type="date" /></Field>
            <Field label="Monthly debt service ($) *"><TextIn value={f.monthly_debt_service} onChange={(v) => set("monthly_debt_service", v)} inputMode="decimal" /></Field>
            <Field label="Collateral value ($) *"><TextIn value={f.collateral_value} onChange={(v) => set("collateral_value", v)} inputMode="decimal" /></Field>
            <Field label="Enterprise value ($) *"><TextIn value={f.enterprise_value} onChange={(v) => set("enterprise_value", v)} inputMode="decimal" /></Field>
            <Field label="CSBFP-backed? *"><YesNoSelect value={f.csbfp_backed} onChange={(v) => set("csbfp_backed", v)} /></Field>
            <Field label="Loan has a guaranteed cap? *"><YesNoSelect value={f.loan_has_guaranteed_cap} onChange={(v) => set("loan_has_guaranteed_cap", v)} /></Field>
            <Field label="Personally guaranteeing this loan? *"><YesNoSelect value={f.personally_guaranteeing} onChange={(v) => set("personally_guaranteeing", v)} /></Field>
            <Field label="Other guarantors on this loan? *"><YesNoSelect value={f.has_other_guarantors} onChange={(v) => set("has_other_guarantors", v)} /></Field>
          </div>
          <div style={SECTION}>
            <h2 style={SECTION_TITLE}>Financials</h2>
            <Field label="Annual revenue ($) *"><TextIn value={f.annual_revenue} onChange={(v) => set("annual_revenue", v)} inputMode="decimal" /></Field>
            <Field label="EBITDA ($) *"><TextIn value={f.ebitda} onChange={(v) => set("ebitda", v)} inputMode="decimal" /></Field>
            <Field label="Total business debt ($) *"><TextIn value={f.total_debt} onChange={(v) => set("total_debt", v)} inputMode="decimal" /></Field>
          </div>
        </div>

        {/* COL 3 */}
        <div>
          <div style={SECTION}>
            <h2 style={SECTION_TITLE}>Risk</h2>
            <Field label="Bankruptcy history? *"><YesNoSelect value={f.bankruptcy_history} onChange={(v) => set("bankruptcy_history", v)} /></Field>
            <Field label="Insolvency history? *"><YesNoSelect value={f.insolvency_history} onChange={(v) => set("insolvency_history", v)} /></Field>
            <Field label="Judgment history? *"><YesNoSelect value={f.judgment_history} onChange={(v) => set("judgment_history", v)} /></Field>
            <Field label="Any payables threatening collection? *"><YesNoSelect value={f.payables_threatening} onChange={(v) => set("payables_threatening", v)} /></Field>
            <Field label="Any upcoming adverse events? *"><YesNoSelect value={f.upcoming_adverse_events} onChange={(v) => set("upcoming_adverse_events", v)} /></Field>
            <Field label="Personal investigations? *"><YesNoSelect value={f.personal_investigations} onChange={(v) => set("personal_investigations", v)} /></Field>
            <Field label="Business investigations? *"><YesNoSelect value={f.business_investigations} onChange={(v) => set("business_investigations", v)} /></Field>
            <Field label="Property insurance in force? *"><YesNoSelect value={f.property_insurance_in_force} onChange={(v) => set("property_insurance_in_force", v)} /></Field>
            <Field label="Personal judgments outstanding? *"><YesNoSelect value={f.personal_judgments} onChange={(v) => set("personal_judgments", v)} /></Field>
            <Field label="Business judgments outstanding? *"><YesNoSelect value={f.business_judgments} onChange={(v) => set("business_judgments", v)} /></Field>
          </div>
          <div style={SECTION}>
            <h2 style={SECTION_TITLE}>Required documents</h2>
            <p style={{ fontSize: 12, opacity: 0.6, margin: "0 0 12px" }}>
              All documents pre-loaded for demo. In a real application you would upload each file.
            </p>
            {DOC_SLOTS.map((d) => (
              <div key={d.key} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6, lineHeight: 1.3 }}>
                  {d.label}{d.required && <span style={{ color: "#fca5a5" }}> *</span>}
                </div>
                <div style={{
                  background: "#0a1120", border: "1px solid #1f9d55", borderRadius: 6,
                  padding: "8px 12px", display: "flex", alignItems: "center", gap: 8, fontSize: 12,
                }}>
                  <span style={{ color: "#34d399", fontWeight: 700 }}>✓</span>
                  <span style={{ color: "#cbd5e1" }}>{DEMO_FILENAMES[d.key] ?? "document.pdf"}</span>
                  <span style={{ marginLeft: "auto", color: "#94a3b8", fontSize: 11 }}>ready</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {!realTokenOnMount && <div style={{ background: "#3a1010", color: "#fecaca", padding: 12, borderRadius: 8, marginTop: 16 }}>Not signed in as a lender. <a href="/lender/login" style={{ color: "#60a5fa" }}>Sign in</a> first.</div>}
      {error && <div style={{ background: "#3a1010", color: "#fecaca", padding: 12, borderRadius: 8, marginTop: 16 }}>{error}</div>}
      {progress && <div style={{ background: "#0f1729", border: "1px solid #1c2538", color: "#cbd5e1", padding: 12, borderRadius: 8, marginTop: 16 }}>{progress}</div>}

      <div style={{ marginTop: 24, display: "flex", gap: 12, justifyContent: "flex-end" }}>
        <button type="button" onClick={() => navigate("/lender/portal")}
          style={{ background: "transparent", border: "1px solid #2c3a52", color: "#cbd5e1", padding: "12px 24px", borderRadius: 8 }}>Cancel</button>
        <button type="button" disabled={!canSubmit} onClick={onSubmit}
          style={{
            background: canSubmit ? "#3b82f6" : "#1f2937",
            color: canSubmit ? "white" : "#6b7280",
            border: "none", padding: "12px 32px", borderRadius: 8,
            cursor: canSubmit ? "pointer" : "not-allowed", fontWeight: 600,
          }}>
          {busy ? "Submitting…" : "Submit application"}
        </button>
      </div>
    </div>
  );
}
