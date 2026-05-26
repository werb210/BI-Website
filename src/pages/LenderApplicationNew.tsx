// BI_WEBSITE_BLOCK_v335_LENDER_RESTRUCTURE_v1
// New section order:
//   1. Guarantor + Company  (no Gov ID here anymore)
//   2. Co-guarantors  (moved up from later in the page)
//   3. Business  (Gov ID type + number now beside Business website)
//   4. Loan & Guarantee
//   5. Declarations (radio buttons, 2-col grid)
//   6. Required documents (5 base + 2 startup-conditional)
// Financials section REMOVED entirely.
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LenderApplicationFormBody } from "../components/LenderApplicationFormBody";
import {
  API_BASE,
  blankLenderForm,
  buildLenderSubmitBody,
  declarationsComplete,
  docSlotsFor,
  getLenderToken,
  LOAN_AMOUNT_MAX,
  LOAN_AMOUNT_MIN,
  LenderFormState,
  PARTNER_ALLOWED_MIME,
  PARTNER_MAX_BYTES,
  PGI_LIMIT_MAX,
  REQUIRED_KEYS,
} from "../components/lenderFormShared";

export default function LenderApplicationNew() {
  const nav = useNavigate();
  const token = useMemo(() => getLenderToken(), []);
  const [f, setF] = useState<LenderFormState>(blankLenderForm);
  const [files, setFiles] = useState<Record<string, File | undefined>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof LenderFormState>(k: K, v: LenderFormState[K]) { setF((p) => ({ ...p, [k]: v })); }

  // BI_WEBSITE_BLOCK_v345_AUTOSAVE_v1
  // localStorage draft persistence. No server-side draft endpoint exists
  // for lender apps yet, so we shadow the form state to localStorage
  // every 1.5s. Cleared on successful submit.
  const DRAFT_KEY_v345 = "bi.lender_app_draft";
  const isDraftHydratedRef = useRef(false);
  // Hydrate from localStorage on mount (before first paint where possible).
  useEffect(() => {
    if (isDraftHydratedRef.current) return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY_v345);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          setF((prev) => ({ ...prev, ...parsed }));
        }
      }
    } catch { /* private mode / parse error — ignore */ }
    isDraftHydratedRef.current = true;
  }, []);
  // Save on every change, debounced 1500ms.
  const [draftSavedAt, setDraftSavedAt] = useState<number | null>(null);
  useEffect(() => {
    if (!isDraftHydratedRef.current) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY_v345, JSON.stringify(f));
        setDraftSavedAt(Date.now());
      } catch { /* quota / private mode — silent */ }
    }, 1500);
    return () => clearTimeout(t);
  }, [f]);

  // Dynamic doc slots — startup docs auto-append when business < 3 yrs old.
  const docSlots = useMemo(() => docSlotsFor(f.business_start_date), [f.business_start_date]);

  function pickFile(slot: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!PARTNER_ALLOWED_MIME.has(file.type)) { alert(`File type '${file.type}' is not allowed. Accepted: PDF, DOCX, XLS, XLSX, CSV, Markdown. No images.`); return; }
    if (file.size > PARTNER_MAX_BYTES) { alert(`File exceeds the 5 MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB).`); return; }
    setFiles((p) => ({ ...p, [slot]: file }));
  }

  const missingFields = REQUIRED_KEYS.filter((k) => { const v = f[k]; return typeof v === "string" ? !v.trim() : v == null; });
  const missingDocs = docSlots.filter((d) => d.required && !files[d.key]);
  const declOk = declarationsComplete(f.declarations);
  const loanAmt = Number(String(f.loan_amount).replace(/[,$\s]/g, "") || 0);
  const pgiAmt = Number(String(f.pgi_limit).replace(/[,$\s]/g, "") || 0);
  const capErrors: string[] = [];
  if (loanAmt > 0 && loanAmt < LOAN_AMOUNT_MIN) capErrors.push("Loan amount is below the 50,000 minimum.");
  if (loanAmt > LOAN_AMOUNT_MAX) capErrors.push("Loan amount exceeds the 1,000,000 maximum.");
  if (pgiAmt > PGI_LIMIT_MAX) capErrors.push("PGI limit exceeds the 1,000,000 maximum.");
  if (loanAmt && pgiAmt && pgiAmt > loanAmt) capErrors.push("PGI limit cannot exceed loan amount.");
  if (f.business_province.toUpperCase() === "QC") capErrors.push("PGI does not currently write business in Quebec.");
  const canSubmit = missingFields.length === 0 && missingDocs.length === 0 && declOk && capErrors.length === 0 && !busy && !!token;

  async function onSubmit() {
    if (!canSubmit) return;
    setBusy(true); setError(null);
    try {
      const r = await fetch(`${API_BASE}/api/v1/lender/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(buildLenderSubmitBody(f)),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) { setError(data?.error || data?.message || `HTTP ${r.status}`); return; }
      const code = data.application_code || data.code || data.id;
      const fd = new FormData();
      for (const slot of docSlots) {
        const file = files[slot.key];
        if (file) { fd.append("files", file); fd.append("doc_types", slot.key); }
      }
      await fetch(`${API_BASE}/api/v1/lender/applications/${code}/documents`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: fd,
      }).catch(() => {});
      // BI_WEBSITE_BLOCK_v345_AUTOSAVE_v1
      try { localStorage.removeItem("bi.lender_app_draft"); } catch {}
      nav(`/lender/applications/${code}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl text-white">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h1 className="text-xl font-semibold">Lender — New Application</h1>
          <p className="text-xs text-sky-200/70">Expert mode. All Purbeck-required fields below. {draftSavedAt && <span>Draft saved {new Date(draftSavedAt).toLocaleTimeString()}.</span>}</p>
        </div>
        <button onClick={() => { localStorage.removeItem(DRAFT_KEY_v345); setF(blankLenderForm); setFiles({}); }} className="text-xs text-sky-200 underline">Clear draft</button>
      </div>

      {/* BI_WEBSITE_BLOCK_v341_LENDER_DEMO_UNIFY_v1
          Form body extracted to a shared component so LenderApplicationDemo
          renders the identical layout. Any future schema/layout change
          happens in LenderApplicationFormBody.tsx, not here. */}
      <LenderApplicationFormBody f={f} set={set} files={files} onPickFile={pickFile} />

      {capErrors.length > 0 && (
        <div className="bg-rose-900/40 border border-rose-300/40 text-rose-100 p-2 rounded mb-2 text-sm">
          {capErrors.map((e) => <div key={e}>• {e}</div>)}
        </div>
      )}
      {!declOk && f.declarations.section_1_a && (
        <div className="bg-amber-900/40 border border-amber-300/40 text-amber-100 p-2 rounded mb-2 text-sm">
          All 11 declarations must be answered. Any adverse answer requires a reason.
        </div>
      )}
      {error && <div className="text-rose-300 mb-2">{error}</div>}

      {/* BI_WEBSITE_BLOCK_v338 — Buttons sit under the LEFT column (under Country)
          on desktop. Use a 3-column grid that matches the rest of the form so
          the buttons land in the first column. */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
        <div className="flex gap-3 items-center">
          <button type="button" onClick={() => nav("/lender/applications")} className="px-4 py-2 border border-sky-300/50 rounded text-sky-100 hover:bg-sky-500/20">Cancel</button>
          <button type="button" onClick={onSubmit} disabled={!canSubmit} className="px-6 py-2 bg-sky-500 text-white rounded disabled:opacity-40 hover:bg-sky-400">{busy ? "Submitting…" : "Submit application"}</button>
          {draftSavedAt && <span className="text-xs text-sky-200/70">Draft saved {new Date(draftSavedAt).toLocaleTimeString()}</span>}
        </div>
      </div>
    </div>
  );
}
