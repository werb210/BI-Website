import { useState } from "react";

export default function LenderPortal() {
  const [apiKey, setApiKey] = useState(localStorage.getItem("bi.lender_key") || "");
  const [v, setV] = useState<any>({ country: "CA", consents: {} });
  const [result, setResult] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function set(k: string, val: any) { setV((p: any) => ({ ...p, [k]: val })); }
  async function submit() { setBusy(true); setErr(null); setResult(null); try { const r = await fetch(`${(import.meta.env.VITE_BI_API_URL || "").replace(/\/$/, "")}/api/v1/lender/applications`, { method: "POST", headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify(v) }); const data = await r.json(); if (!r.ok) throw Object.assign(new Error(data.error), { data }); setResult(data); localStorage.setItem("bi.lender_key", apiKey);} catch (ex: any) { setErr(ex.data?.reason ?? ex.message ?? "Submission failed"); } finally { setBusy(false);} }
  return <div className="bi-card lender"><h1>Lender Portal — New Application</h1><label className="bi-field"><span>API Key</span><input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Bearer key issued by Boreal staff" /></label>{err && <div className="form-error">{err}</div>}{result && <div className="form-success">Submitted. App# {result.public_id}, score {result.score}.</div>}<button className="primary big" disabled={busy || !apiKey} onClick={submit}>{busy ? "Submitting…" : "Score & Submit"}</button></div>;
}
