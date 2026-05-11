// BI_WEBSITE_BLOCK_v113_LENDER_APP_FORM_v1
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type F = {
  company_name: string; guarantor_name: string; guarantor_phone: string; guarantor_email: string;
  naics: string; business_start_date: string; country: "CA" | "US";
  loan_amount: string; pgi_limit: string;
  use_of_proceeds: "expansion"|"refinance"|"equipment"|"acquisition"|"working_capital"|"real_estate";
  estimated_close_date: string;
  revenue_last_year: string; ebitda_last_year: string; total_debt: string;
  monthly_payments: string; owner_salary: string; cash_on_hand: string;
  revenue_projection_next_year: string; lender_notes: string;
};
const blank: F = {
  company_name:"",guarantor_name:"",guarantor_phone:"",guarantor_email:"",
  naics:"",business_start_date:"",country:"CA",
  loan_amount:"",pgi_limit:"",use_of_proceeds:"expansion",estimated_close_date:"",
  revenue_last_year:"",ebitda_last_year:"",total_debt:"",monthly_payments:"",
  owner_salary:"",cash_on_hand:"",revenue_projection_next_year:"",lender_notes:"",
};
const num = (s: string) => { if (!s) return null; const v = Number(String(s).replace(/[,$\s]/g,"")); return Number.isFinite(v) ? v : null; };
const REQUIRED: (keyof F)[] = ["company_name","guarantor_name","guarantor_phone","naics","business_start_date","loan_amount","pgi_limit","revenue_last_year","ebitda_last_year","estimated_close_date"];

const ISTYLE: React.CSSProperties = { background:"#0a1120", border:"1px solid #2c3a52", color:"#e5e7eb", padding:"10px 12px", borderRadius:8, width:"100%", fontSize:14 };

export default function LenderApplicationNew() {
  const navigate = useNavigate();
  const [f, setF] = useState<F>(blank);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = useMemo(() => { try { return localStorage.getItem("bi.lender_token") || ""; } catch { return ""; } }, []);
  const missing = REQUIRED.filter(k => !String(f[k]).trim());
  const canSubmit = missing.length === 0 && !submitting && !!token;
  function set<K extends keyof F>(k: K, v: F[K]) { setF(p => ({ ...p, [k]: v })); }

  async function onSubmit() {
    if (!canSubmit) return;
    setSubmitting(true); setError(null);
    try {
      const body = {
        source: "lender",
        company_name: f.company_name.trim(),
        guarantor: { name: f.guarantor_name.trim(), phone: f.guarantor_phone.trim(), email: f.guarantor_email.trim() || null },
        business: { naics: f.naics.trim(), start_date: f.business_start_date, country: f.country },
        loan: { amount: num(f.loan_amount), pgi_limit: num(f.pgi_limit), use_of_proceeds: f.use_of_proceeds, estimated_close_date: f.estimated_close_date },
        financials: {
          revenue_last_year: num(f.revenue_last_year), ebitda_last_year: num(f.ebitda_last_year),
          total_debt: num(f.total_debt), monthly_payments: num(f.monthly_payments),
          owner_salary: num(f.owner_salary), cash_on_hand: num(f.cash_on_hand),
          revenue_projection_next_year: num(f.revenue_projection_next_year),
        },
        lender_notes: f.lender_notes.trim() || null,
      };
      const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || "https://bi-server-cse0apamgkheb9d5.canadacentral-01.azurewebsites.net";
      const r = await fetch(`${apiBase}/api/v1/lender/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) { console.error("[lender-submit] failed:", { status: r.status, data }); setError(data?.message || `Submit failed (${r.status})`); return; }
      navigate("/lender/portal");
    } catch (e: any) {
      console.error("[lender-submit] network:", e);
      setError(e?.message || "Network error");
    } finally { setSubmitting(false); }
  }

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ background:"#0f1729", border:"1px solid #1c2538", borderRadius:12, padding:20, marginBottom:16 }}>
      <h2 style={{ fontSize:12, letterSpacing:1, opacity:0.7, margin:"0 0 16px", textTransform:"uppercase" }}>{title}</h2>
      {children}
    </div>
  );
  const Grid = ({ children }: { children: React.ReactNode }) => (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(2, minmax(0, 1fr))", gap:16 }}>{children}</div>
  );
  const Fld = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <label style={{ display:"block" }}><div style={{ fontSize:12, opacity:0.7, marginBottom:6 }}>{label}</div>{children}</label>
  );
  const In = (p: { value: string; onChange: (v: string) => void; type?: string; placeholder?: string; inputMode?: any }) => (
    <input type={p.type||"text"} value={p.value} placeholder={p.placeholder} inputMode={p.inputMode}
      onChange={(e) => p.onChange(e.target.value)} style={ISTYLE} />
  );

  return (
    <div style={{ maxWidth:1100, margin:"0 auto", padding:"24px 24px 96px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div>
          <div style={{ fontSize:12, letterSpacing:1, opacity:0.7 }}>LENDER</div>
          <h1 style={{ fontSize:28, margin:0 }}>New Application</h1>
        </div>
        <button type="button" onClick={() => navigate("/lender/portal")}
          style={{ background:"transparent", border:"1px solid #2c3a52", color:"#cbd5e1", padding:"8px 16px", borderRadius:8 }}>Cancel</button>
      </div>
      <p style={{ opacity:0.7, marginBottom:24 }}>Enter the deal details. No CORE score or consents — lender-submitted applications go straight to underwriting.</p>

      <Section title="Applicant">
        <Grid>
          <Fld label="Company name *"><In value={f.company_name} onChange={(v) => set("company_name", v)} /></Fld>
          <Fld label="Guarantor name *"><In value={f.guarantor_name} onChange={(v) => set("guarantor_name", v)} /></Fld>
          <Fld label="Guarantor phone *"><In value={f.guarantor_phone} onChange={(v) => set("guarantor_phone", v)} placeholder="+15551234567" /></Fld>
          <Fld label="Guarantor email"><In value={f.guarantor_email} onChange={(v) => set("guarantor_email", v)} type="email" /></Fld>
        </Grid>
      </Section>

      <Section title="Business">
        <Grid>
          <Fld label="NAICS code *"><In value={f.naics} onChange={(v) => set("naics", v)} placeholder="6-digit code" /></Fld>
          <Fld label="Business start date *"><In value={f.business_start_date} onChange={(v) => set("business_start_date", v)} type="date" /></Fld>
          <Fld label="Country">
            <select value={f.country} onChange={(e) => set("country", e.target.value as any)} style={ISTYLE}>
              <option value="CA">Canada</option><option value="US">United States</option>
            </select>
          </Fld>
        </Grid>
      </Section>

      <Section title="Loan">
        <Grid>
          <Fld label="Loan amount ($) *"><In value={f.loan_amount} onChange={(v) => set("loan_amount", v)} inputMode="decimal" /></Fld>
          <Fld label="Requested PGI limit ($) *"><In value={f.pgi_limit} onChange={(v) => set("pgi_limit", v)} inputMode="decimal" /></Fld>
          <Fld label="Use of proceeds">
            <select value={f.use_of_proceeds} onChange={(e) => set("use_of_proceeds", e.target.value as any)} style={ISTYLE}>
              <option value="expansion">Expansion</option>
              <option value="refinance">Refinance</option>
              <option value="equipment">Equipment</option>
              <option value="acquisition">Acquisition</option>
              <option value="working_capital">Working capital</option>
              <option value="real_estate">Real estate</option>
            </select>
          </Fld>
          <Fld label="Estimated close date *"><In value={f.estimated_close_date} onChange={(v) => set("estimated_close_date", v)} type="date" /></Fld>
        </Grid>
      </Section>

      <Section title="Financials">
        <Grid>
          <Fld label="Revenue last year ($) *"><In value={f.revenue_last_year} onChange={(v) => set("revenue_last_year", v)} inputMode="decimal" /></Fld>
          <Fld label="EBITDA last year ($) *"><In value={f.ebitda_last_year} onChange={(v) => set("ebitda_last_year", v)} inputMode="decimal" /></Fld>
          <Fld label="Total business debt ($)"><In value={f.total_debt} onChange={(v) => set("total_debt", v)} inputMode="decimal" /></Fld>
          <Fld label="Monthly loan payments ($)"><In value={f.monthly_payments} onChange={(v) => set("monthly_payments", v)} inputMode="decimal" /></Fld>
          <Fld label="Owner salary ($)"><In value={f.owner_salary} onChange={(v) => set("owner_salary", v)} inputMode="decimal" /></Fld>
          <Fld label="Cash on hand ($)"><In value={f.cash_on_hand} onChange={(v) => set("cash_on_hand", v)} inputMode="decimal" /></Fld>
          <Fld label="Revenue projection next year ($)"><In value={f.revenue_projection_next_year} onChange={(v) => set("revenue_projection_next_year", v)} inputMode="decimal" /></Fld>
        </Grid>
      </Section>

      <Section title="Lender notes">
        <textarea value={f.lender_notes} onChange={(e) => set("lender_notes", e.target.value)} rows={4}
          style={{ ...ISTYLE, resize:"vertical" }} placeholder="Anything underwriting should know" />
      </Section>

      {!token && <div style={{ background:"#3a1010", color:"#fecaca", padding:12, borderRadius:8, marginTop:16 }}>Not signed in as a lender. <a href="/lender/login">Sign in</a> first.</div>}
      {error && <div style={{ background:"#3a1010", color:"#fecaca", padding:12, borderRadius:8, marginTop:16 }}>{error}</div>}
      {missing.length > 0 && <div style={{ opacity:0.7, marginTop:16, fontSize:14 }}>Required fields remaining: {missing.length}</div>}

      <div style={{ marginTop:24, display:"flex", gap:12, justifyContent:"flex-end" }}>
        <button type="button" onClick={() => navigate("/lender/portal")}
          style={{ background:"transparent", border:"1px solid #2c3a52", color:"#cbd5e1", padding:"12px 24px", borderRadius:8 }}>Cancel</button>
        <button type="button" disabled={!canSubmit} onClick={onSubmit}
          style={{ background: canSubmit ? "#3b82f6" : "#1f2937", color: canSubmit ? "white" : "#6b7280",
                   border:"none", padding:"12px 32px", borderRadius:8,
                   cursor: canSubmit ? "pointer" : "not-allowed", fontWeight:600 }}>
          {submitting ? "Submitting..." : "Submit application"}
        </button>
      </div>
    </div>
  );
}
