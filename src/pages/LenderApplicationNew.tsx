// BI_WEBSITE_BLOCK_v125_LENDER_FIXES_AND_PUBLIC_POLISH_v1
// Lender New Application. Helpers (Field/TextIn/YesNoSelect) live at module
// scope in ../components/lenderFormShared so React keeps the same DOM nodes
// across renders — fixes the bug where only the first character was accepted.
// 3-column layout, full PGI-parity field set.
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  API_BASE,
  blankLenderForm,
  buildLenderSubmitBody,
  DOC_SLOTS,
  Field,
  getLenderToken,
  LenderFormState,
  REQUIRED_KEYS,
  SECTION,
  SECTION_TITLE,
  TextIn,
  YesNoSelect,
} from "../components/lenderFormShared";

export default function LenderApplicationNew() {
  const navigate = useNavigate();
  const token = useMemo(() => getLenderToken(), []);

  const [f, setF] = useState<LenderFormState>(blankLenderForm);
  const [files, setFiles] = useState<Record<string, File | undefined>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  // BI_WEBSITE_BLOCK_v133_LENDER_FORM_AUTOSAVE_v1 — draft auto-save state.
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  function set<K extends keyof LenderFormState>(k: K, v: LenderFormState[K]) {
    setF((p) => ({ ...p, [k]: v }));
  }
  // BI_WEBSITE_BLOCK_v133_LENDER_FORM_AUTOSAVE_v1 — restore draft on mount.
  const DRAFT_KEY = "bi.lender_draft";
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") setF((prev) => ({ ...prev, ...parsed }));
    } catch { /* noop */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // BI_WEBSITE_BLOCK_v133_LENDER_FORM_AUTOSAVE_v1 — debounced autosave (1500ms after last change).
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(f));
        setSavedAt(new Date());
      } catch { /* noop */ }
    }, 1500);
    return () => clearTimeout(id);
  }, [f]);
  function pickFile(slot: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setFiles((p) => ({ ...p, [slot]: file }));
  }

  const missingFields = REQUIRED_KEYS.filter((k) => !String(f[k]).trim());
  const missingDocs = DOC_SLOTS.filter((d) => d.required && !files[d.key]);
  const canSubmit = missingFields.length === 0 && missingDocs.length === 0 && !busy && !!token;

  async function onSubmit() {
    if (!canSubmit) return;
    setBusy(true); setError(null); setProgress(null);
    try {
      setProgress("Creating application…");
      const r = await fetch(`${API_BASE}/api/v1/lender/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(buildLenderSubmitBody(f)),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(data?.message || data?.error || `Submit failed (${r.status})`);
        return;
      }
      const code: string | undefined = data?.application_code;
      if (!code) {
        setError("Submit succeeded but no application_code returned.");
        return;
      }

      setProgress("Uploading documents…");
      const fd = new FormData();
      for (const slot of DOC_SLOTS) {
        const file = files[slot.key];
        if (!file) continue;
        fd.append("files", file);
        fd.append("doc_types", slot.key);
      }
      const docsR = await fetch(`${API_BASE}/api/v1/lender/applications/${code}/documents`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: fd,
      });
      if (!docsR.ok) {
        const docsData = await docsR.json().catch(() => ({}));
        setError(docsData?.error || `Document upload failed (${docsR.status}). Application created but docs not attached.`);
        return;
      }
      try { localStorage.removeItem(DRAFT_KEY); } catch { /* noop */ } /* BI_WEBSITE_BLOCK_v133_LENDER_FORM_AUTOSAVE_v1 */ navigate("/lender/portal");
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
          <div style={{ fontSize: 12, letterSpacing: 1, opacity: 0.7 }}>LENDER</div>
          <h1 style={{ fontSize: 28, margin: 0 }}>New Application</h1>
        </div>
        {savedAt && <span style={{ marginRight: 12, fontSize: "0.75rem", opacity: 0.7 }}>✓ Saved {savedAt.toLocaleTimeString()}</span>}
        <button type="button" onClick={() => navigate("/lender/portal")}
          style={{ background: "transparent", border: "1px solid #2c3a52", color: "#cbd5e1", padding: "8px 16px", borderRadius: 8 }}>Cancel</button>
      </div>
      <p style={{ opacity: 0.7, marginBottom: 24 }}>
        Enter the deal details and upload required documents.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }} className="lender-form-grid">
        <style>{`
          @media (min-width: 1024px) {
            .lender-form-grid { grid-template-columns: 1fr 1fr 1fr !important; }
          }
        `}</style>

        {/* COL 1: APPLICANT + BUSINESS */}
        <div>
          <div style={SECTION}>
            <h2 style={SECTION_TITLE}>Applicant</h2>
            <Field label="Company name *"><TextIn value={f.company_name} onChange={(v) => set("company_name", v)} /></Field>
            <Field label="Guarantor name *"><TextIn value={f.guarantor_name} onChange={(v) => set("guarantor_name", v)} /></Field>
            <Field label="Guarantor phone *"><TextIn value={f.guarantor_phone} onChange={(v) => set("guarantor_phone", v)} placeholder="+15551234567" /></Field>
            <Field label="Guarantor email *"><TextIn value={f.guarantor_email} onChange={(v) => set("guarantor_email", v)} type="email" /></Field>
            <Field label="Guarantor date of birth *"><TextIn value={f.guarantor_dob} onChange={(v) => set("guarantor_dob", v)} type="date" /></Field>
            <Field label="Guarantor address *"><TextIn value={f.guarantor_address} onChange={(v) => set("guarantor_address", v)} placeholder="Street, City, Province, Postal" /></Field>
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
            <Field label="Business number *"><TextIn value={f.business_number} onChange={(v) => set("business_number", v)} placeholder="CRA business number" /></Field>
            <Field label="Business address *"><TextIn value={f.business_address} onChange={(v) => set("business_address", v)} /></Field>
            <Field label="Website (optional)"><TextIn value={f.business_website} onChange={(v) => set("business_website", v)} placeholder="https://" /></Field>
            <Field label="NAICS code *"><TextIn value={f.naics} onChange={(v) => set("naics", v)} placeholder="6-digit code" /></Field>
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

        {/* COL 2: LOAN + FINANCIALS */}
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

        {/* COL 3: RISK + DOCUMENTS */}
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
              All required before submit. PDF, XLSX, DOCX or CSV.
            </p>
            {DOC_SLOTS.map((d) => (
              <div key={d.key} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6, lineHeight: 1.3 }}>
                  {d.label}{d.required && <span style={{ color: "#fca5a5" }}> *</span>}
                </div>
                <input
                  type="file"
                  accept=".pdf,.csv,.xlsx,.xls,.doc,.docx,.md"
                  onChange={(e) => pickFile(d.key, e)}
                  style={{ display: "block", color: "#cbd5e1", fontSize: 12 }}
                />
                {files[d.key] && (
                  <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>{files[d.key]?.name}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {!token && <div style={{ background: "#3a1010", color: "#fecaca", padding: 12, borderRadius: 8, marginTop: 16 }}>Not signed in as a lender. <a href="/lender/login" style={{ color: "#60a5fa" }}>Sign in</a> first.</div>}
      {error && <div style={{ background: "#3a1010", color: "#fecaca", padding: 12, borderRadius: 8, marginTop: 16 }}>{error}</div>}
      {progress && <div style={{ background: "#0f1729", border: "1px solid #1c2538", color: "#cbd5e1", padding: 12, borderRadius: 8, marginTop: 16 }}>{progress}</div>}

      <div style={{ marginTop: 16, fontSize: 13, opacity: 0.7 }}>
        {missingFields.length > 0 && <div>Fields remaining: {missingFields.length}</div>}
        {missingDocs.length > 0 && <div>Documents remaining: {missingDocs.length}</div>}
      </div>

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
