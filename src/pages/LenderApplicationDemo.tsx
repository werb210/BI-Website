import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LenderApplicationFormBody } from "../components/LenderApplicationFormBody";
import {
  API_BASE,
  buildLenderSubmitBody,
  demoLenderForm,
  docSlotsFor,
  getLenderToken,
  LenderFormState,
} from "../components/lenderFormShared";

const DEMO_FILENAMES: Record<string, string> = {
  loan_agreement: "demo_lender_agreement.pdf",
  profit_loss: "demo_p_and_l_12mo.pdf",
  balance_sheet: "demo_balance_sheet.pdf",
  ar_aging: "demo_ar_aging.xlsx",
  ap_aging: "demo_ap_aging.xlsx",
  founder_cv: "demo_founder_cv.pdf",
  financial_forecast: "demo_financial_forecast.xlsx",
};

export default function LenderApplicationDemo() {
  const navigate = useNavigate();
  const realTokenOnMount = useMemo(() => getLenderToken(), []);
  const [demoToken, setDemoToken] = useState<string>("");
  const [demoReady, setDemoReady] = useState(false);
  const [f, setF] = useState<LenderFormState>(demoLenderForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const docSlotsForCurrent = useMemo(() => docSlotsFor(f.business_start_date), [f.business_start_date]);
  const files = useMemo(() => {
    const out: Record<string, { name: string; size: number }> = {};
    for (const slot of docSlotsForCurrent) {
      out[slot.key] = { name: DEMO_FILENAMES[slot.key] || `${slot.key}.pdf`, size: 0 };
    }
    return out;
  }, [docSlotsForCurrent]);

  function set<K extends keyof LenderFormState>(k: K, v: LenderFormState[K]) {
    setF((p) => ({ ...p, [k]: v }));
  }

  useEffect(() => {
    if (!realTokenOnMount) {
      navigate("/lender/login", { replace: true });
      return;
    }
    try {
      localStorage.setItem("bi.real_token_backup", realTokenOnMount);
      localStorage.setItem("bi.is_demo_session", "1");
      localStorage.setItem("bi.demo_session_started_at", new Date().toISOString());
    } catch {}

    let alive = true;
    (async () => {
      try {
        const r = await fetch(`${API_BASE}/api/v1/lender/demo/session`, {
          method: "POST",
          headers: { Authorization: `Bearer ${realTokenOnMount}` },
        });
        if (!r.ok) throw new Error(`demo session HTTP ${r.status}`);
        const d = await r.json();
        if (!alive) return;
        const t: string = d.token || "";
        if (!t) throw new Error("demo session returned no token");
        try { localStorage.setItem("bi.lender_token", t); } catch {}
        setDemoToken(t);
        setDemoReady(true);
      } catch (err) {
        if (alive) setError(`Demo session failed: ${(err as Error).message}`);
      }
    })();
    return () => { alive = false; };
  }, [realTokenOnMount, navigate]);

  async function onSubmit() {
    if (busy || !demoReady) return;
    setBusy(true);
    setError(null);
    try {
      const r = await fetch(`${API_BASE}/api/v1/lender/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${demoToken}` },
        body: JSON.stringify(buildLenderSubmitBody(f)),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(data?.error || data?.message || `HTTP ${r.status}`);
        return;
      }
      const code = data.application_code || data.code || data.id;
      navigate(`/lender/applications/${code}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function resetDemo() { setF(demoLenderForm); }
  function cancel() { navigate("/lender/portal"); }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl text-white">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-sky-300/60">Lender · Live demo</div>
          <h1 className="text-xl font-semibold">New Application</h1>
          <p className="text-xs text-sky-200/70 mt-1">Demo data shown. Edit any field freely; reset returns to demo defaults. Submitting creates a real row in your pipeline (carrier call skipped).</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={resetDemo} className="text-xs text-sky-200 underline">Reset to demo data</button>
        </div>
      </div>

      {!demoReady && !error && <div className="text-sm text-sky-200/70 mb-3">Preparing demo session…</div>}

      <LenderApplicationFormBody f={f} set={set} files={files} onPickFile={() => {}} isDemoMode />

      {error && <div className="text-rose-300 mb-2 mt-2">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
        <div className="flex gap-3">
          <button type="button" onClick={cancel} className="px-4 py-2 border border-sky-300/50 rounded text-sky-100 hover:bg-sky-500/20">Cancel</button>
          <button type="button" onClick={onSubmit} disabled={!demoReady || busy} className="px-6 py-2 bg-sky-500 text-white rounded disabled:opacity-40 hover:bg-sky-400">{busy ? "Submitting…" : "Submit demo application"}</button>
        </div>
      </div>
    </div>
  );
}
