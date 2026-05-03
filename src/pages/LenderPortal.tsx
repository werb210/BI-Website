// BI_WEBSITE_BLOCK_v3_FULL_FIELD_RENDER_v1
import { useEffect, useState } from "react";

const STAGES = ["new", "in_progress", "ready_for_submission", "submitted", "under_review", "information_required", "approved", "declined", "policy_issued"] as const;
const STAGE_LABELS: Record<string, string> = {
  new: "New",
  in_progress: "In Progress",
  ready_for_submission: "Ready for Submission",
  submitted: "Submitted",
  under_review: "Under Review",
  information_required: "Information Required",
  approved: "Approved",
  declined: "Declined",
  policy_issued: "Policy Issued",
};

const BASE = (import.meta.env.VITE_BI_API_URL || window.location.origin).replace(/\/$/, "") + "/api/v1";

async function lenderFetch(path: string, init: RequestInit, apiKey: string) {
  const r = await fetch(BASE + path, {
    ...init,
    headers: { "Content-Type": "application/json", "X-API-Key": apiKey, ...(init.headers ?? {}) },
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(data?.error ?? `HTTP ${r.status}`), { status: r.status, data });
  return data;
}

const APPLICATION_FIELDS = [
  "borrower_name","borrower_email","industry","annual_revenue","ebitda",
  "total_debt","monthly_debt_service","loan_amount","pgi_limit",
  "collateral_value","enterprise_value","years_in_business",
  "owner_credit_score","debt_to_income","country","naics_code","formation_date",
] as const;

export default function LenderPortal() {
  const [apiKey, setApiKey] = useState(localStorage.getItem("bi.lender_key") || "");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authed, setAuthed] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({ country: "CA", consent_attest: false, consent_pii: false, consent_terms: false });
  const [apps, setApps] = useState<any[]>([]);
  const [submitErr, setSubmitErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function login() {
    setAuthError(null);
    if (!apiKey.trim()) { setAuthError("API key is required."); return; }
    try {
      const list = await lenderFetch("/lender/applications", { method: "GET" }, apiKey.trim());
      localStorage.setItem("bi.lender_key", apiKey.trim());
      setApps(Array.isArray(list?.items) ? list.items : Array.isArray(list) ? list : []);
      setAuthed(true);
    } catch (e: any) {
      setAuthError(e?.message ?? "Authentication failed");
    }
  }

  function set(k: string, v: any) { setForm((p) => ({ ...p, [k]: v })); }

  async function submit() {
    setSubmitErr(null); setBusy(true);
    try {
      if (!form.consent_attest || !form.consent_pii || !form.consent_terms) {
        throw new Error("All three consents are required.");
      }
      const result = await lenderFetch("/lender/applications", {
        method: "POST",
        body: JSON.stringify(form),
      }, apiKey.trim());
      setApps((prev) => [{ ...form, id: result?.id ?? `tmp-${Date.now()}`, stage: result?.stage ?? "new" }, ...prev]);
      setForm({ country: "CA", consent_attest: false, consent_pii: false, consent_terms: false });
    } catch (e: any) {
      setSubmitErr(e?.message ?? "Submission failed");
    } finally { setBusy(false); }
  }

  useEffect(() => {
    if (!authed) return;
    const i = setInterval(async () => {
      try {
        const list = await lenderFetch("/lender/applications", { method: "GET" }, apiKey.trim());
        setApps(Array.isArray(list?.items) ? list.items : Array.isArray(list) ? list : []);
      } catch { /* ignore polling errors */ }
    }, 30_000);
    return () => clearInterval(i);
  }, [authed, apiKey]);

  if (!authed) return (
    <div className="bi-card lender">
      <h1>Lender Portal</h1>
      <p>Submit applications via your lender API key. Contact us if you don't have one.</p>
      <label className="bi-field"><span>API key</span>
        <input type="password" value={apiKey} onChange={(e)=>setApiKey(e.target.value)} />
      </label>
      {authError && <div className="form-error">{authError}</div>}
      <button className="primary" onClick={login}>Verify & Continue</button>
    </div>
  );

  return (
    <div className="bi-card lender">
      <div className="flex justify-between items-center"><h1>Lender Portal Dashboard</h1>
        <button className="secondary" onClick={() => { setAuthed(false); }}>Sign out</button></div>

      <h2 className="mt-4">Submit New Application</h2>
      <div className="grid md:grid-cols-2 gap-3 mt-2">
        {APPLICATION_FIELDS.map((f)=>(
          <label key={f} className="bi-field"><span>{f.replaceAll("_"," ")}</span>
            <input value={form[f] ?? ""} onChange={(e)=>set(f,e.target.value)} />
          </label>
        ))}
      </div>
      <div className="mt-3 space-y-2">
        {[["consent_attest","I attest the data submitted is accurate."],
          ["consent_pii","I have the borrower's consent to share PII."],
          ["consent_terms","I agree to the lender API terms of service."]].map(([k,label])=>(
          <label key={k} className="block"><input type="checkbox" checked={!!form[k]} onChange={(e)=>set(k as string, e.target.checked)} /> {label}</label>
        ))}
      </div>
      {submitErr && <div className="form-error mt-3">{submitErr}</div>}
      <button className="primary mt-4" onClick={submit} disabled={busy}>{busy ? "Submitting…" : "Submit Application"}</button>

      <h2 className="mt-6">9-Stage Pipeline</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {STAGES.map((st)=>(
          <div key={st} className="bi-section">
            <h3>{STAGE_LABELS[st]}</h3>
            <ul>{apps.filter((a)=>a.stage===st).map((a)=><li key={a.id}>{a.id} · {a.borrower_name ?? "—"}</li>)}</ul>
          </div>
        ))}
      </div>
    </div>
  );
}
