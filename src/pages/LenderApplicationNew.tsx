// BI_WEBSITE_BLOCK_v123_LENDER_FORM_AND_PORTAL_v1
// Lender New Application — 3-column layout (APPLICANT+BUSINESS / LOAN+FINANCIALS / DOCUMENTS).
// All fields required by PGI Partner API are captured up front.
//   form_data required (per docs.pgicover.com/api/applications.html):
//     country, naics_code, formation_date, loan_amount, pgi_limit,
//     annual_revenue, ebitda, total_debt, monthly_debt_service,
//     collateral_value, enterprise_value,
//     bankruptcy_history, insolvency_history, judgment_history
//   top-level required: guarantor_name, guarantor_email, business_name (we map company_name -> business_name on submit)
//
// LENDER NOTES section removed.
// Inline documents picker (7 slots) in column 3. Submit fires: create app -> upload all docs -> portal.
// No signature, no T&C, no consents — server back-stamps lender_attestation.
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = ((import.meta as any).env?.VITE_API_URL
  || (import.meta as any).env?.VITE_BI_API_URL
  || "https://bi-server-cse0apamgkheb9d5.canadacentral-01.azurewebsites.net").replace(/\/$/, "");

type F = {
  // Applicant
  company_name: string; guarantor_name: string; guarantor_phone: string; guarantor_email: string;
  // Business
  naics: string; business_start_date: string; country: "CA" | "US";
  // Loan
  loan_amount: string; pgi_limit: string;
  use_of_proceeds: "expansion" | "refinance" | "equipment" | "acquisition" | "working_capital" | "real_estate";
  estimated_close_date: string;
  monthly_debt_service: string;
  collateral_value: string;
  enterprise_value: string;
  // Financials
  annual_revenue: string;
  ebitda: string;
  total_debt: string;
  bankruptcy_history: "" | "yes" | "no";
  insolvency_history: "" | "yes" | "no";
  judgment_history: "" | "yes" | "no";
};

const blank: F = {
  company_name: "", guarantor_name: "", guarantor_phone: "", guarantor_email: "",
  naics: "", business_start_date: "", country: "CA",
  loan_amount: "", pgi_limit: "", use_of_proceeds: "expansion", estimated_close_date: "",
  monthly_debt_service: "", collateral_value: "", enterprise_value: "",
  annual_revenue: "", ebitda: "", total_debt: "",
  bankruptcy_history: "", insolvency_history: "", judgment_history: "",
};

const num = (s: string): number | null => {
  if (!s) return null;
  const v = Number(String(s).replace(/[,$\s]/g, ""));
  return Number.isFinite(v) ? v : null;
};

const REQUIRED: (keyof F)[] = [
  "company_name", "guarantor_name", "guarantor_phone", "guarantor_email",
  "naics", "business_start_date",
  "loan_amount", "pgi_limit", "estimated_close_date",
  "monthly_debt_service", "collateral_value", "enterprise_value",
  "annual_revenue", "ebitda", "total_debt",
  "bankruptcy_history", "insolvency_history", "judgment_history",
];

type DocSlot = { key: string; label: string; required: boolean };
const DOC_SLOTS: DocSlot[] = [
  { key: "annual_y1",     label: "Year-end Financials (most recent year, accountant-prepared)", required: true },
  { key: "annual_y2",     label: "Year-end Financials (2 years ago, accountant-prepared)",      required: true },
  { key: "annual_y3",     label: "Year-end Financials (3 years ago, accountant-prepared)",      required: true },
  { key: "profit_loss",   label: "Interim Profit & Loss (last 12 months)",                       required: true },
  { key: "balance_sheet", label: "Interim Balance Sheet (most recent)",                          required: true },
  { key: "ar_aging",      label: "Accounts Receivable Aging",                                    required: true },
  { key: "ap_aging",      label: "Accounts Payable Aging",                                       required: true },
];

const ISTYLE: React.CSSProperties = { background: "#0a1120", border: "1px solid #2c3a52", color: "#e5e7eb", padding: "10px 12px", borderRadius: 8, width: "100%", fontSize: 14 };
const SECTION: React.CSSProperties = { background: "#0f1729", border: "1px solid #1c2538", borderRadius: 12, padding: 16, marginBottom: 16 };
const SECTION_TITLE: React.CSSProperties = { fontSize: 12, letterSpacing: 1, opacity: 0.7, margin: "0 0 12px", textTransform: "uppercase" };
const FLD_LABEL: React.CSSProperties = { fontSize: 12, opacity: 0.7, marginBottom: 6 };

function getLenderToken(): string {
  try { return localStorage.getItem("bi.lender_token") || ""; } catch { return ""; }
}

export default function LenderApplicationNew() {
  const navigate = useNavigate();
  const token = useMemo(() => getLenderToken(), []);

  const [f, setF] = useState<F>(blank);
  const [files, setFiles] = useState<Record<string, File | undefined>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);

  function set<K extends keyof F>(k: K, v: F[K]) { setF((p) => ({ ...p, [k]: v })); }
  function pickFile(slot: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setFiles((p) => ({ ...p, [slot]: file }));
  }

  const missingFields = REQUIRED.filter((k) => !String(f[k]).trim());
  const missingDocs = DOC_SLOTS.filter((d) => d.required && !files[d.key]);
  const canSubmit = missingFields.length === 0 && missingDocs.length === 0 && !busy && !!token;

  async function onSubmit() {
    if (!canSubmit) return;
    setBusy(true); setError(null); setProgress(null);
    try {
      setProgress("Creating application…");
      const body = {
        source: "lender",
        company_name: f.company_name.trim(),
        business_name: f.company_name.trim(),
        lender_name: null,
        guarantor: {
          name: f.guarantor_name.trim(),
          phone: f.guarantor_phone.trim(),
          email: f.guarantor_email.trim() || null,
        },
        business: {
          naics: f.naics.trim(),
          start_date: f.business_start_date,
          country: f.country,
        },
        loan: {
          amount: num(f.loan_amount),
          pgi_limit: num(f.pgi_limit),
          use_of_proceeds: f.use_of_proceeds,
          estimated_close_date: f.estimated_close_date,
        },
        financials: {
          // Server-known keys (backward compatible)
          revenue_last_year: num(f.annual_revenue),
          ebitda_last_year: num(f.ebitda),
          total_debt: num(f.total_debt),
          monthly_payments: num(f.monthly_debt_service),
          // PGI-canonical keys (used for downstream carrier forwarding)
          annual_revenue: num(f.annual_revenue),
          ebitda: num(f.ebitda),
          monthly_debt_service: num(f.monthly_debt_service),
          collateral_value: num(f.collateral_value),
          enterprise_value: num(f.enterprise_value),
        },
        risk: {
          bankruptcy_history: f.bankruptcy_history === "yes",
          insolvency_history: f.insolvency_history === "yes",
          judgment_history: f.judgment_history === "yes",
        },
      };
      const r = await fetch(`${API_BASE}/api/v1/lender/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(body),
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
      const docsData = await docsR.json().catch(() => ({}));
      if (!docsR.ok) {
        setError(docsData?.error || `Document upload failed (${docsR.status}). Application created but docs not attached.`);
        return;
      }

      navigate("/lender/portal");
    } catch (e: any) {
      setError(e?.message || "Network error");
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <label style={{ display: "block", marginBottom: 12 }}>
      <div style={FLD_LABEL}>{label}</div>
      {children}
    </label>
  );

  const In = (p: { value: string; onChange: (v: string) => void; type?: string; placeholder?: string; inputMode?: any }) => (
    <input
      type={p.type || "text"}
      value={p.value}
      placeholder={p.placeholder}
      inputMode={p.inputMode}
      onChange={(e) => p.onChange(e.target.value)}
      style={ISTYLE}
    />
  );

  const YesNo = (p: { value: F["bankruptcy_history"]; onChange: (v: F["bankruptcy_history"]) => void }) => (
    <select value={p.value} onChange={(e) => p.onChange(e.target.value as any)} style={ISTYLE}>
      <option value="">—</option>
      <option value="no">No</option>
      <option value="yes">Yes</option>
    </select>
  );

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 24px 96px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: 1, opacity: 0.7 }}>LENDER</div>
          <h1 style={{ fontSize: 28, margin: 0 }}>New Application</h1>
        </div>
        <button type="button" onClick={() => navigate("/lender/portal")}
          style={{ background: "transparent", border: "1px solid #2c3a52", color: "#cbd5e1", padding: "8px 16px", borderRadius: 8 }}>Cancel</button>
      </div>
      <p style={{ opacity: 0.7, marginBottom: 24 }}>
        Enter the deal details and upload required documents. No CORE score, no signature,
        no T&amp;C — lender-submitted applications go straight to underwriting.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }} className="lender-form-grid">
        <style>{`
          @media (min-width: 1024px) {
            .lender-form-grid { grid-template-columns: 1fr 1fr 1fr !important; }
          }
        `}</style>

        {/* COLUMN 1: APPLICANT + BUSINESS */}
        <div>
          <div style={SECTION}>
            <h2 style={SECTION_TITLE}>Applicant</h2>
            <Field label="Company name *"><In value={f.company_name} onChange={(v) => set("company_name", v)} /></Field>
            <Field label="Guarantor name *"><In value={f.guarantor_name} onChange={(v) => set("guarantor_name", v)} /></Field>
            <Field label="Guarantor phone *"><In value={f.guarantor_phone} onChange={(v) => set("guarantor_phone", v)} placeholder="+15551234567" /></Field>
            <Field label="Guarantor email *"><In value={f.guarantor_email} onChange={(v) => set("guarantor_email", v)} type="email" /></Field>
          </div>

          <div style={SECTION}>
            <h2 style={SECTION_TITLE}>Business</h2>
            <Field label="NAICS code *"><In value={f.naics} onChange={(v) => set("naics", v)} placeholder="6-digit code" /></Field>
            <Field label="Business start date *"><In value={f.business_start_date} onChange={(v) => set("business_start_date", v)} type="date" /></Field>
            <Field label="Country">
              <select value={f.country} onChange={(e) => set("country", e.target.value as any)} style={ISTYLE}>
                <option value="CA">Canada</option>
                <option value="US">United States</option>
              </select>
            </Field>
          </div>
        </div>

        {/* COLUMN 2: LOAN + FINANCIALS */}
        <div>
          <div style={SECTION}>
            <h2 style={SECTION_TITLE}>Loan</h2>
            <Field label="Loan amount ($) *"><In value={f.loan_amount} onChange={(v) => set("loan_amount", v)} inputMode="decimal" /></Field>
            <Field label="Requested PGI limit ($) *"><In value={f.pgi_limit} onChange={(v) => set("pgi_limit", v)} inputMode="decimal" /></Field>
            <Field label="Monthly debt service ($) *"><In value={f.monthly_debt_service} onChange={(v) => set("monthly_debt_service", v)} inputMode="decimal" /></Field>
            <Field label="Collateral value ($) *"><In value={f.collateral_value} onChange={(v) => set("collateral_value", v)} inputMode="decimal" /></Field>
            <Field label="Enterprise value ($) *"><In value={f.enterprise_value} onChange={(v) => set("enterprise_value", v)} inputMode="decimal" /></Field>
            <Field label="Use of proceeds">
              <select value={f.use_of_proceeds} onChange={(e) => set("use_of_proceeds", e.target.value as any)} style={ISTYLE}>
                <option value="expansion">Expansion</option>
                <option value="refinance">Refinance</option>
                <option value="equipment">Equipment</option>
                <option value="acquisition">Acquisition</option>
                <option value="working_capital">Working capital</option>
                <option value="real_estate">Real estate</option>
              </select>
            </Field>
            <Field label="Estimated close date *"><In value={f.estimated_close_date} onChange={(v) => set("estimated_close_date", v)} type="date" /></Field>
          </div>

          <div style={SECTION}>
            <h2 style={SECTION_TITLE}>Financials</h2>
            <Field label="Annual revenue ($) *"><In value={f.annual_revenue} onChange={(v) => set("annual_revenue", v)} inputMode="decimal" /></Field>
            <Field label="EBITDA ($) *"><In value={f.ebitda} onChange={(v) => set("ebitda", v)} inputMode="decimal" /></Field>
            <Field label="Total business debt ($) *"><In value={f.total_debt} onChange={(v) => set("total_debt", v)} inputMode="decimal" /></Field>
            <Field label="Bankruptcy history? *"><YesNo value={f.bankruptcy_history} onChange={(v) => set("bankruptcy_history", v)} /></Field>
            <Field label="Insolvency history? *"><YesNo value={f.insolvency_history} onChange={(v) => set("insolvency_history", v)} /></Field>
            <Field label="Judgment history? *"><YesNo value={f.judgment_history} onChange={(v) => set("judgment_history", v)} /></Field>
          </div>
        </div>

        {/* COLUMN 3: REQUIRED DOCUMENTS */}
        <div>
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
                  <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>
                    {files[d.key]?.name}
                  </div>
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
