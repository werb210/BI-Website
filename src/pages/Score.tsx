import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";

const EBITDA_MIN = 50_000;
const LOAN_MAX = 1_000_000;

export default function Score() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const country = params.get("country") || "CA";
  if (country !== "CA") { nav("/applications/new"); }

  const [v, setV] = useState({
    naics_code: "", formation_date: "", loan_amount: "", pgi_limit: "",
    annual_revenue: "", ebitda: "", total_debt: "", monthly_debt_service: "",
    collateral_value: "", enterprise_value: "",
  });
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function set<K extends keyof typeof v>(k: K, val: string) {
    setV({ ...v, [k]: val });
  }

  async function submit() {
    setErr(null);
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

  const filled = Object.values(v).filter(Boolean).length;

  return (
    <div className="bi-card">
      <header className="bi-progress">
        <div className="bi-progress-bar"><div style={{ width: `${(filled / 10) * 100}%` }} /></div>
        <span>Fill in Answers: {filled}/10</span>
      </header>

      <Field label="What is the NAICS code for the business?" hint="6-digit industry code">
        <input value={v.naics_code} onChange={(e) => set("naics_code", e.target.value)} placeholder="e.g., 541511" />
      </Field>

      <Field label="What month-year did this business start generating revenue?">
        <input type="month" value={v.formation_date.slice(0, 7)} onChange={(e) => set("formation_date", e.target.value + "-01")} />
        <small>Enter month and year, e.g. January 2015</small>
      </Field>

      <h3 className="bi-section-divider">LOAN & GUARANTEE DETAILS</h3>

      <Field label="Loan Amount from Bank">
        <input type="number" value={v.loan_amount} onChange={(e) => set("loan_amount", e.target.value)} placeholder="$0" />
      </Field>

      <Field label="Please declare your desired PGI limit.">
        <input type="number" value={v.pgi_limit} onChange={(e) => set("pgi_limit", e.target.value)} placeholder="$0" />
      </Field>

      <h3 className="bi-section-divider">FINANCIAL INFORMATION</h3>

      <Field label="What was the business revenue last year?">
        <input type="number" value={v.annual_revenue} onChange={(e) => set("annual_revenue", e.target.value)} />
      </Field>

      <Field label="What was the business EBITDA last year?">
        <input type="number" value={v.ebitda} onChange={(e) => set("ebitda", e.target.value)} />
        {Number(v.ebitda) > 0 && Number(v.ebitda) < EBITDA_MIN && (
          <div className="field-error">Minimum is ${EBITDA_MIN.toLocaleString()}</div>
        )}
      </Field>

      <Field label="What is the total business debt?">
        <input type="number" value={v.total_debt} onChange={(e) => set("total_debt", e.target.value)} />
      </Field>

      <Field label="What are the total monthly business loan payments?">
        <input type="number" value={v.monthly_debt_service} onChange={(e) => set("monthly_debt_service", e.target.value)} />
      </Field>

      <Field label="Business collateral pledged">
        <input type="number" value={v.collateral_value} onChange={(e) => set("collateral_value", e.target.value)} />
      </Field>

      <Field label="What is the estimated enterprise value of the business?">
        <input type="number" value={v.enterprise_value} onChange={(e) => set("enterprise_value", e.target.value)} />
      </Field>

      {err && <div className="form-error">{err}</div>}

      <button className="primary big" disabled={busy || filled < 10} onClick={submit}>
        {busy ? "Calculating CORE Score…" : "Get my CORE Score"}
      </button>
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
