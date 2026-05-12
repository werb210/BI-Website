// BI_WEBSITE_BLOCK_v124_LENDER_APP_PARITY_v1
// Lender New Application — full parity with the public application's underwriting signal.
// 3-column layout:
//   Col 1: APPLICANT (incl. DOB, address) + BUSINESS (incl. entity_type, business_number, address, website)
//   Col 2: LOAN (incl. policy_start_date, funding date, csbfp, cap, PG status) + FINANCIALS
//   Col 3: RISK (10 fields, parity with public app) + DOCUMENTS (7 slots)
// No signature, no T&C, no consents UI — server back-stamps lender_attestation.
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = ((import.meta as any).env?.VITE_API_URL
  || (import.meta as any).env?.VITE_BI_API_URL
  || "https://bi-server-cse0apamgkheb9d5.canadacentral-01.azurewebsites.net").replace(/\/$/, "");

type YN = "" | "yes" | "no";

type F = {
  // Applicant / Guarantor
  company_name: string;
  guarantor_name: string;
  guarantor_phone: string;
  guarantor_email: string;
  guarantor_dob: string;
  guarantor_address: string;
  // Business
  entity_type: "" | "Corporation" | "Partnership" | "Sole Proprietorship" | "LLC" | "Other";
  business_number: string;
  business_address: string;
  business_website: string;
  naics: string;
  business_start_date: string;
  country: "CA" | "US";
  // Loan
  loan_amount: string;
  pgi_limit: string;
  use_of_proceeds: "expansion" | "refinance" | "equipment" | "acquisition" | "working_capital" | "real_estate";
  loan_funding_date: string;
  policy_start_date: string;
  monthly_debt_service: string;
  collateral_value: string;
  enterprise_value: string;
  csbfp_backed: YN;
  loan_has_guaranteed_cap: YN;
  personally_guaranteeing: YN;
  has_other_guarantors: YN;
  // Financials
  annual_revenue: string;
  ebitda: string;
  total_debt: string;
  // Risk
  bankruptcy_history: YN;
  insolvency_history: YN;
  judgment_history: YN;
  payables_threatening: YN;
  upcoming_adverse_events: YN;
  personal_investigations: YN;
  business_investigations: YN;
  property_insurance_in_force: YN;
  personal_judgments: YN;
  business_judgments: YN;
};

const blank: F = {
  company_name: "", guarantor_name: "", guarantor_phone: "", guarantor_email: "",
  guarantor_dob: "", guarantor_address: "",
  entity_type: "", business_number: "", business_address: "", business_website: "",
  naics: "", business_start_date: "", country: "CA",
  loan_amount: "", pgi_limit: "", use_of_proceeds: "expansion",
  loan_funding_date: "", policy_start_date: "",
  monthly_debt_service: "", collateral_value: "", enterprise_value: "",
  csbfp_backed: "", loan_has_guaranteed_cap: "",
  personally_guaranteeing: "", has_other_guarantors: "",
  annual_revenue: "", ebitda: "", total_debt: "",
  bankruptcy_history: "", insolvency_history: "", judgment_history: "",
  payables_threatening: "", upcoming_adverse_events: "",
  personal_investigations: "", business_investigations: "",
  property_insurance_in_force: "", personal_judgments: "", business_judgments: "",
};

const num = (s: string): number | null => {
  if (!s) return null;
  const v = Number(String(s).replace(/[,$\s]/g, ""));
  return Number.isFinite(v) ? v : null;
};
const yn = (v: YN): boolean | null => v === "yes" ? true : v === "no" ? false : null;

// All required keys (everything except business_website).
const REQUIRED: (keyof F)[] = [
  "company_name", "guarantor_name", "guarantor_phone", "guarantor_email",
  "guarantor_dob", "guarantor_address",
  "entity_type", "business_number", "business_address",
  "naics", "business_start_date",
  "loan_amount", "pgi_limit", "loan_funding_date", "policy_start_date",
  "monthly_debt_service", "collateral_value", "enterprise_value",
  "csbfp_backed", "loan_has_guaranteed_cap",
  "personally_guaranteeing", "has_other_guarantors",
  "annual_revenue", "ebitda", "total_debt",
  "bankruptcy_history", "insolvency_history", "judgment_history",
  "payables_threatening", "upcoming_adverse_events",
  "personal_investigations", "business_investigations",
  "property_insurance_in_force", "personal_judgments", "business_judgments",
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
          dob: f.guarantor_dob,
          address: f.guarantor_address.trim(),
        },
        business: {
          entity_type: f.entity_type,
          business_number: f.business_number.trim(),
          address: f.business_address.trim(),
          website: f.business_website.trim() || null,
          naics: f.naics.trim(),
          start_date: f.business_start_date,
          formation_date: f.business_start_date,
          country: f.country,
        },
        loan: {
          amount: num(f.loan_amount),
          pgi_limit: num(f.pgi_limit),
          use_of_proceeds: f.use_of_proceeds,
          loan_funding_date: f.loan_funding_date,
          estimated_close_date: f.loan_funding_date,
          policy_start_date: f.policy_start_date,
          csbfp_backed: yn(f.csbfp_backed),
          loan_has_guaranteed_cap: yn(f.loan_has_guaranteed_cap),
          personally_guaranteeing: yn(f.personally_guaranteeing),
          has_other_guarantors: yn(f.has_other_guarantors),
        },
        financials: {
          // Server-known keys (backward compatible)
          revenue_last_year: num(f.annual_revenue),
          ebitda_last_year: num(f.ebitda),
          total_debt: num(f.total_debt),
          monthly_payments: num(f.monthly_debt_service),
          // PGI-canonical keys (for downstream carrier forwarding)
          annual_revenue: num(f.annual_revenue),
          ebitda: num(f.ebitda),
          monthly_debt_service: num(f.monthly_debt_service),
          collateral_value: num(f.collateral_value),
          enterprise_value: num(f.enterprise_value),
        },
        risk: {
          bankruptcy_history: yn(f.bankruptcy_history),
          insolvency_history: yn(f.insolvency_history),
          judgment_history: yn(f.judgment_history),
          payables_threatening: yn(f.payables_threatening),
          upcoming_adverse_events: yn(f.upcoming_adverse_events),
          personal_investigations: yn(f.personal_investigations),
          business_investigations: yn(f.business_investigations),
          property_insurance_in_force: yn(f.property_insurance_in_force),
          personal_judgments: yn(f.personal_judgments),
          business_judgments: yn(f.business_judgments),
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
  const YesNo = (p: { value: YN; onChange: (v: YN) => void }) => (
    <select value={p.value} onChange={(e) => p.onChange(e.target.value as YN)} style={ISTYLE}>
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
        Enter the deal details and upload required documents. No CORE score, no signature, no T&amp;C —
        lender-submitted applications go straight to underwriting.
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
            <Field label="Guarantor date of birth *"><In value={f.guarantor_dob} onChange={(v) => set("guarantor_dob", v)} type="date" /></Field>
            <Field label="Guarantor address *"><In value={f.guarantor_address} onChange={(v) => set("guarantor_address", v)} placeholder="Street, City, Province, Postal" /></Field>
          </div>

          <div style={SECTION}>
            <h2 style={SECTION_TITLE}>Business</h2>
            <Field label="Entity type *">
              <select value={f.entity_type} onChange={(e) => set("entity_type", e.target.value as any)} style={ISTYLE}>
                <option value="">—</option>
                <option value="Corporation">Corporation</option>
                <option value="Partnership">Partnership</option>
                <option value="Sole Proprietorship">Sole Proprietorship</option>
                <option value="LLC">LLC</option>
                <option value="Other">Other</option>
              </select>
            </Field>
            <Field label="Business number *"><In value={f.business_number} onChange={(v) => set("business_number", v)} placeholder="CRA business number" /></Field>
            <Field label="Business address *"><In value={f.business_address} onChange={(v) => set("business_address", v)} /></Field>
            <Field label="Website (optional)"><In value={f.business_website} onChange={(v) => set("business_website", v)} placeholder="https://" /></Field>
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
            <Field label="Use of proceeds *">
              <select value={f.use_of_proceeds} onChange={(e) => set("use_of_proceeds", e.target.value as any)} style={ISTYLE}>
                <option value="expansion">Expansion</option>
                <option value="refinance">Refinance</option>
                <option value="equipment">Equipment</option>
                <option value="acquisition">Acquisition</option>
                <option value="working_capital">Working capital</option>
                <option value="real_estate">Real estate</option>
              </select>
            </Field>
            <Field label="Loan funding date *"><In value={f.loan_funding_date} onChange={(v) => set("loan_funding_date", v)} type="date" /></Field>
            <Field label="Policy start date *"><In value={f.policy_start_date} onChange={(v) => set("policy_start_date", v)} type="date" /></Field>
            <Field label="Monthly debt service ($) *"><In value={f.monthly_debt_service} onChange={(v) => set("monthly_debt_service", v)} inputMode="decimal" /></Field>
            <Field label="Collateral value ($) *"><In value={f.collateral_value} onChange={(v) => set("collateral_value", v)} inputMode="decimal" /></Field>
            <Field label="Enterprise value ($) *"><In value={f.enterprise_value} onChange={(v) => set("enterprise_value", v)} inputMode="decimal" /></Field>
            <Field label="CSBFP-backed? *"><YesNo value={f.csbfp_backed} onChange={(v) => set("csbfp_backed", v)} /></Field>
            <Field label="Loan has a guaranteed cap? *"><YesNo value={f.loan_has_guaranteed_cap} onChange={(v) => set("loan_has_guaranteed_cap", v)} /></Field>
            <Field label="Personally guaranteeing this loan? *"><YesNo value={f.personally_guaranteeing} onChange={(v) => set("personally_guaranteeing", v)} /></Field>
            <Field label="Other guarantors on this loan? *"><YesNo value={f.has_other_guarantors} onChange={(v) => set("has_other_guarantors", v)} /></Field>
          </div>

          <div style={SECTION}>
            <h2 style={SECTION_TITLE}>Financials</h2>
            <Field label="Annual revenue ($) *"><In value={f.annual_revenue} onChange={(v) => set("annual_revenue", v)} inputMode="decimal" /></Field>
            <Field label="EBITDA ($) *"><In value={f.ebitda} onChange={(v) => set("ebitda", v)} inputMode="decimal" /></Field>
            <Field label="Total business debt ($) *"><In value={f.total_debt} onChange={(v) => set("total_debt", v)} inputMode="decimal" /></Field>
          </div>
        </div>

        {/* COLUMN 3: RISK + DOCUMENTS */}
        <div>
          <div style={SECTION}>
            <h2 style={SECTION_TITLE}>Risk</h2>
            <Field label="Bankruptcy history? *"><YesNo value={f.bankruptcy_history} onChange={(v) => set("bankruptcy_history", v)} /></Field>
            <Field label="Insolvency history? *"><YesNo value={f.insolvency_history} onChange={(v) => set("insolvency_history", v)} /></Field>
            <Field label="Judgment history? *"><YesNo value={f.judgment_history} onChange={(v) => set("judgment_history", v)} /></Field>
            <Field label="Any payables threatening collection? *"><YesNo value={f.payables_threatening} onChange={(v) => set("payables_threatening", v)} /></Field>
            <Field label="Any upcoming adverse events? *"><YesNo value={f.upcoming_adverse_events} onChange={(v) => set("upcoming_adverse_events", v)} /></Field>
            <Field label="Personal investigations? *"><YesNo value={f.personal_investigations} onChange={(v) => set("personal_investigations", v)} /></Field>
            <Field label="Business investigations? *"><YesNo value={f.business_investigations} onChange={(v) => set("business_investigations", v)} /></Field>
            <Field label="Property insurance in force? *"><YesNo value={f.property_insurance_in_force} onChange={(v) => set("property_insurance_in_force", v)} /></Field>
            <Field label="Personal judgments outstanding? *"><YesNo value={f.personal_judgments} onChange={(v) => set("personal_judgments", v)} /></Field>
            <Field label="Business judgments outstanding? *"><YesNo value={f.business_judgments} onChange={(v) => set("business_judgments", v)} /></Field>
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
