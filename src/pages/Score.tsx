import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
// BI_WEBSITE_BLOCK_v86_SCORE_NAICS_AND_UPLOAD_v1
import { NAICS_TOP } from "../data/naicsTop";

function fmtCurrency(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, "");
  if (!digits) return "";
  return "$" + Number(digits).toLocaleString();
}
function unfmtCurrency(s: string): string { return s.replace(/[^0-9]/g, ""); }

const EBITDA_MIN = 50_000;
const LOAN_MAX = 1_000_000;

export default function Score() {
  const nav = useNavigate();
  // BI_WEBSITE_BLOCK_v84_ROUTES_RESKIN_AND_SCORE_TC_v1 — added `terms` so the
  // progress denominator and submit gate match the carrier's 11/11 bar.
  const [v, setV] = useState({
    naics_code: "", formation_date: "", loan_amount: "", pgi_limit: "",
    annual_revenue: "", ebitda: "", total_debt: "", monthly_debt_service: "",
    collateral_value: "", enterprise_value: "",
  });
  const [terms, setTerms] = useState(false);
  // BI_WEBSITE_BLOCK_v86_SCORE_NAICS_AND_UPLOAD_v1
  const [naicsOpen, setNaicsOpen] = useState(false);
  const [naicsQuery, setNaicsQuery] = useState("");
  const naicsResults = naicsQuery.trim().length === 0
    ? NAICS_TOP.slice(0, 12)
    : NAICS_TOP.filter((e) =>
        e.code.includes(naicsQuery) ||
        e.title.toLowerCase().includes(naicsQuery.toLowerCase())
      ).slice(0, 12);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // BI_WEBSITE_BLOCK_v97_OTP_GATE_AND_FLOW_v1 — country state replaces the prior URL search param.
  const [country, setCountry] = useState<"CA" | "US">("CA");

  function set<K extends keyof typeof v>(k: K, val: string) {
    setV({ ...v, [k]: val });
  }

  async function submit() {
    setErr(null);
    // BI_WEBSITE_BLOCK_v84_ROUTES_RESKIN_AND_SCORE_TC_v1 — T&C is mandatory
    if (!terms) { setErr("Please accept the Terms & Conditions to continue."); return; }
    if (Number(v.ebitda) < EBITDA_MIN) { setErr(`Minimum EBITDA is $${EBITDA_MIN.toLocaleString()}`); return; }
    if (Number(v.loan_amount) > LOAN_MAX) { setErr(`Loan amount cannot exceed $${LOAN_MAX.toLocaleString()}`); return; }
    if (Number(v.pgi_limit) > Number(v.loan_amount)) { setErr("PGI limit cannot exceed loan amount."); return; }
    if (Number(v.pgi_limit) > Number(v.loan_amount) * 0.80) { setErr("PGI limit cannot exceed 80% of loan."); return; }

    setBusy(true);
    try {
      const r = await api.score({ country, ...v });
      nav(`/applications/${r.public_id}/score-result`);
    } catch (ex: any) {
      setErr(ex.message ?? "Could not run score");
    } finally {
      setBusy(false);
    }
  }

  // BI_WEBSITE_BLOCK_v84_ROUTES_RESKIN_AND_SCORE_TC_v1 — count T&C as the 11th input
  const filled = Object.values(v).filter(Boolean).length + (terms ? 1 : 0);

  return (
    <div className="bi-card">
      <header className="bi-progress">
        <div className="bi-progress-bar"><div style={{ width: `${(filled / 11) * 100}%` }} /></div>
        <span>Fill in Answers: {filled}/11</span>
      </header>

      {/* BI_WEBSITE_BLOCK_v96_LAUNCH_UX_v2 — 2-column grid on md+ screens. NAICS, date, section
          headings, terms, and actions all span both columns; financial fields pair up. */}
      <div className="grid gap-3 md:grid-cols-2 [&_h3]:md:col-span-2 [&>label]:md:col-span-1">
      {/* BI_WEBSITE_BLOCK_v97_OTP_GATE_AND_FLOW_v1 — country picker — v100: col-span-1 to pair with date. */}
      <div className="md:col-span-1">
        <label className="bi-field">
          <span className="bi-field-label">Country of business</span>
          <select value={country} onChange={(e) => setCountry(e.target.value as "CA" | "US")}>
            <option value="CA">🇨🇦 Canada</option>
            <option value="US" disabled>🇺🇸 United States — coming soon</option>
          </select>
          <small className="bi-field-hint">Only Canadian businesses are supported at launch.</small>
        </label>
      </div>
      {/* BI_WEBSITE_BLOCK_v100_SCORE_LAYOUT_AND_BRAND_v2 — date paired with country. */}
      <div className="md:col-span-1">
        <Field label="What month-year did this business start generating revenue?">
          <input type="month" value={v.formation_date.slice(0, 7)} onChange={(e) => set("formation_date", e.target.value + "-01")} />
          <small>Enter month and year, e.g. January 2015</small>
        </Field>
      </div>
      <div className="md:col-span-2">
      <Field label="What is the NAICS code for the business?" hint="6-digit industry code">
        {/* BI_WEBSITE_BLOCK_v86_SCORE_NAICS_AND_UPLOAD_v1 — Look it up popover */}
        <div className="bi-naics-row">
          <input value={v.naics_code} onChange={(e) => set("naics_code", e.target.value.replace(/[^0-9]/g, "").slice(0, 6))} placeholder="e.g., 541511" />
          <button type="button" className="bi-lookup-btn" onClick={() => setNaicsOpen(true)}>🔍 Look it up</button>
        </div>
        {naicsOpen && (
          <div className="bi-naics-popover" role="dialog" aria-label="NAICS lookup">
            <div className="bi-naics-popover-head">
              <input
                autoFocus
                placeholder="Search by code or industry…"
                value={naicsQuery}
                onChange={(e) => setNaicsQuery(e.target.value)}
              />
              <button type="button" className="ghost" onClick={() => setNaicsOpen(false)}>Close</button>
            </div>
            <ul className="bi-naics-results">
              {naicsResults.map((e) => (
                <li key={e.code}>
                  <button type="button" onClick={() => { set("naics_code", e.code); setNaicsOpen(false); setNaicsQuery(""); }}>
                    <span className="bi-naics-code">{e.code}</span>
                    <span className="bi-naics-title">{e.title}</span>
                  </button>
                </li>
              ))}
              {naicsResults.length === 0 && <li className="bi-naics-empty">No matches in our top list. Type the 6-digit code directly.</li>}
            </ul>
          </div>
        )}
      </Field>
      </div>

      <h3 className="bi-section-divider">LOAN & GUARANTEE DETAILS</h3>

      <Field label="Loan Amount from Bank">
        <input type="text" inputMode="decimal" value={fmtCurrency(v.loan_amount)} onChange={(e) => set("loan_amount", unfmtCurrency(e.target.value))} placeholder="$0" />
      </Field>

      <Field label="Please declare your desired PGI limit.">
        <input type="text" inputMode="decimal" value={fmtCurrency(v.pgi_limit)} onChange={(e) => set("pgi_limit", unfmtCurrency(e.target.value))} placeholder="$0" />
      </Field>

      <h3 className="bi-section-divider">FINANCIAL INFORMATION</h3>

      <Field label="What was the business revenue last year?">
        <input type="text" inputMode="decimal" value={fmtCurrency(v.annual_revenue)} onChange={(e) => set("annual_revenue", unfmtCurrency(e.target.value))} placeholder="$0" />
      </Field>

      <Field label="What was the business EBITDA last year?">
        <input type="text" inputMode="decimal" value={fmtCurrency(v.ebitda)} onChange={(e) => set("ebitda", unfmtCurrency(e.target.value))} placeholder="$0" />
        {Number(v.ebitda) > 0 && Number(v.ebitda) < EBITDA_MIN && (
          <div className="field-error">Minimum is ${EBITDA_MIN.toLocaleString()}</div>
        )}
      </Field>

      <Field label="What is the total business debt?">
        <input type="text" inputMode="decimal" value={fmtCurrency(v.total_debt)} onChange={(e) => set("total_debt", unfmtCurrency(e.target.value))} placeholder="$0" />
      </Field>

      <Field label="What are the total monthly business loan payments?">
        <input type="text" inputMode="decimal" value={fmtCurrency(v.monthly_debt_service)} onChange={(e) => set("monthly_debt_service", unfmtCurrency(e.target.value))} placeholder="$0" />
      </Field>

      <Field label="Business collateral pledged">
        <input type="text" inputMode="decimal" value={fmtCurrency(v.collateral_value)} onChange={(e) => set("collateral_value", unfmtCurrency(e.target.value))} placeholder="$0" />
      </Field>

      <Field label="What is the estimated enterprise value of the business?">
        <input type="text" inputMode="decimal" value={fmtCurrency(v.enterprise_value)} onChange={(e) => set("enterprise_value", unfmtCurrency(e.target.value))} placeholder="$0" />
      </Field>

      </div>
      {/* BI_WEBSITE_BLOCK_v84_ROUTES_RESKIN_AND_SCORE_TC_v1 — T&C checkbox */}

      <label className="bi-field bi-terms">
        <input
          type="checkbox"
          checked={terms}
          onChange={(e) => setTerms(e.target.checked)}
        />
        <span>
          I have read and understand the conditions and obligations set forth in our{" "}
          <a href="/terms" target="_blank" rel="noreferrer">Terms &amp; Conditions</a>.
        </span>
      </label>

      {err && <div className="form-error">{err}</div>}

      <div className="bi-actions">
        <button type="button" className="ghost" onClick={() => nav("/applications/new")}>Cancel</button>
        <button className="primary big" disabled={busy || filled < 11} onClick={submit}>
          {busy ? "Calculating CORE Score…" : "Get my CORE Score"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="bi-field">
      <span className="bi-field-label">{label}</span>
      {children}
      {hint && <small className="bi-field-hint">{hint}</small>}
    </label>
  );
}
