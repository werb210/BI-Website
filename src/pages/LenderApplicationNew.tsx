// BI_WEBSITE_BLOCK_v335_LENDER_RESTRUCTURE_v1
// New section order:
//   1. Guarantor + Company  (no Gov ID here anymore)
//   2. Co-guarantors  (moved up from later in the page)
//   3. Business  (Gov ID type + number now beside Business website)
//   4. Loan & Guarantee
//   5. Declarations (radio buttons, 2-col grid)
//   6. Required documents (5 base + 2 startup-conditional)
// Financials section REMOVED entirely.
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ACCEPT_PARTNER_DOCS, AgreeRadio, API_BASE, blankLenderForm, buildLenderSubmitBody,
  declarationsComplete, docSlotsFor, ELIGIBLE_LOAN_TYPES, emptyCoGuarantor,
  Field, getLenderToken, INPUT, LBL, LOAN_AMOUNT_MAX, LOAN_AMOUNT_MIN, LenderFormState,
  PARTNER_ALLOWED_MIME, PARTNER_MAX_BYTES, PGI_LIMIT_MAX, PROVINCES_NO_QC,
  RELATIONSHIPS, REQUIRED_KEYS, SECTION_H, TextIn, YesNoRadio,
  type DeclarationsState,
} from "../components/lenderFormShared";

export default function LenderApplicationNew() {
  const nav = useNavigate();
  const token = useMemo(() => getLenderToken(), []);
  const [f, setF] = useState<LenderFormState>(blankLenderForm);
  const [files, setFiles] = useState<Record<string, File | undefined>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  function set<K extends keyof LenderFormState>(k: K, v: LenderFormState[K]) { setF((p) => ({ ...p, [k]: v })); }
  const setDecl = (d: DeclarationsState) => set("declarations", d);

  const DRAFT_KEY = "bi.lender_draft.v335";
  useEffect(() => {
    try { const raw = localStorage.getItem(DRAFT_KEY); if (raw) setF((p) => ({ ...p, ...JSON.parse(raw) })); } catch {}
  }, []);
  useEffect(() => {
    const id = setTimeout(() => { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(f)); setSavedAt(new Date()); } catch {} }, 1500);
    return () => clearTimeout(id);
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
      localStorage.removeItem(DRAFT_KEY);
      nav(`/lender/applications/${code}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const isStartup = (() => {
    if (!f.business_start_date) return false;
    const dt = new Date(f.business_start_date);
    if (isNaN(dt.getTime())) return false;
    return (Date.now() - dt.getTime()) / (365.25 * 24 * 60 * 60 * 1000) < 3;
  })();

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl text-white">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h1 className="text-xl font-semibold">Lender — New Application</h1>
          <p className="text-xs text-sky-200/70">Expert mode. All Purbeck-required fields below. {savedAt && <span>Draft saved {savedAt.toLocaleTimeString()}.</span>}</p>
        </div>
        <button onClick={() => { localStorage.removeItem(DRAFT_KEY); setF(blankLenderForm); setFiles({}); }} className="text-xs text-sky-200 underline">Clear draft</button>
      </div>

      {/* 1. Guarantor + Company (Gov ID moved to Business section, v335) */}
      <h2 className={SECTION_H}>Guarantor + Company</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
        <Field label="Company name *"><TextIn value={f.company_name} onChange={(v) => set("company_name", v)} /></Field>
        <Field label="Guarantor full name *"><TextIn value={f.guarantor_name} onChange={(v) => set("guarantor_name", v)} /></Field>
        <Field label="Guarantor DOB *"><TextIn type="date" value={f.guarantor_dob} onChange={(v) => set("guarantor_dob", v)} /></Field>
        <Field label="Guarantor phone *"><TextIn type="tel" value={f.guarantor_phone} onChange={(v) => set("guarantor_phone", v)} /></Field>
        <Field label="Guarantor email *"><TextIn type="email" value={f.guarantor_email} onChange={(v) => set("guarantor_email", v)} /></Field>
        <Field label="Guarantor residential address *"><TextIn value={f.guarantor_address} onChange={(v) => set("guarantor_address", v)} /></Field>
      </div>

      {/* 2. Co-guarantors — MOVED UP per v335 */}
      <h2 className={SECTION_H}>Co-guarantors (Canada only)</h2>
      <p className="text-xs text-sky-200/70 mb-2">Add other individuals on the personal guarantee. Our team will reach out to complete the co-guarantor intake separately.</p>
      <div className="grid grid-cols-1 gap-2 mb-2">
        {f.co_guarantors.map((cg, idx) => (
          <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-2 p-2 border border-sky-300/20 rounded bg-sky-500/5">
            <input className={INPUT} placeholder="First name *"  value={cg.first_name}    onChange={(e) => set("co_guarantors", f.co_guarantors.map((c, i) => i === idx ? { ...c, first_name: e.target.value } : c))} />
            <input className={INPUT} placeholder="Last name *"   value={cg.last_name}     onChange={(e) => set("co_guarantors", f.co_guarantors.map((c, i) => i === idx ? { ...c, last_name: e.target.value } : c))} />
            <input className={INPUT} placeholder="Email *" type="email" value={cg.email}  onChange={(e) => set("co_guarantors", f.co_guarantors.map((c, i) => i === idx ? { ...c, email: e.target.value } : c))} />
            <input className={INPUT} placeholder="Phone *" type="tel"   value={cg.phone}  onChange={(e) => set("co_guarantors", f.co_guarantors.map((c, i) => i === idx ? { ...c, phone: e.target.value } : c))} />
            <div className="flex gap-2">
              <select className={INPUT} value={cg.relationship} onChange={(e) => set("co_guarantors", f.co_guarantors.map((c, i) => i === idx ? { ...c, relationship: e.target.value } : c))}>
                {RELATIONSHIPS.map((r) => <option key={r} value={r} className="text-slate-900">{r}</option>)}
              </select>
              <button onClick={() => set("co_guarantors", f.co_guarantors.filter((_, i) => i !== idx))} className="text-rose-300 text-xs">✕</button>
            </div>
          </div>
        ))}
        <button onClick={() => set("co_guarantors", [...f.co_guarantors, emptyCoGuarantor()])} className="self-start text-sky-200 underline text-sm">+ Add co-guarantor</button>
      </div>

      {/* 3. Business — now includes Gov ID type + number (moved from Guarantor section per v335) */}
      <h2 className={SECTION_H}>Business</h2>
      {isStartup && (
        <div className="p-2 mb-2 rounded bg-amber-500/10 border border-amber-300/40 text-xs text-amber-100">
          <strong>Startup detected:</strong> business is under 3 years old. Two extra documents (founder CV + 12–24 month financial forecast) will be required below.
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
        <Field label="Entity type *">
          <select className={INPUT} value={f.entity_type} onChange={(e) => set("entity_type", e.target.value as LenderFormState["entity_type"])}>
            <option value="">Select…</option>
            {["Corporation","Partnership","Sole Proprietorship","LLC","Other"].map((v) => <option key={v} value={v} className="text-slate-900">{v}</option>)}
          </select>
        </Field>
        <Field label="Business number (BN) *"><TextIn value={f.business_number} onChange={(v) => set("business_number", v)} /></Field>
        <Field label="NAICS code *"><TextIn value={f.naics} onChange={(v) => set("naics", v)} placeholder="541511" /></Field>
        <Field label="Business operating address *"><TextIn value={f.business_address} onChange={(v) => set("business_address", v)} /></Field>
        <Field label="Business province *">
          <select className={INPUT} value={f.business_province} onChange={(e) => set("business_province", e.target.value)}>
            <option value="">Select…</option>
            {PROVINCES_NO_QC.map((p) => <option key={p.value} value={p.value} className="text-slate-900">{p.label}</option>)}
          </select>
        </Field>
        <Field label="Business start date *"><TextIn type="date" value={f.business_start_date} onChange={(v) => set("business_start_date", v)} /></Field>
        <Field label="Business website"><TextIn value={f.business_website} onChange={(v) => set("business_website", v)} /></Field>
        <Field label="Government ID type *">
          <select className={INPUT} value={f.q_ca_id_type} onChange={(e) => set("q_ca_id_type", e.target.value as LenderFormState["q_ca_id_type"])}>
            <option value="">Select…</option>
            <option value="Passport" className="text-slate-900">Passport</option>
            <option value="National ID" className="text-slate-900">National ID</option>
            <option value="Driving Licence" className="text-slate-900">Driving Licence</option>
            <option value="Other" className="text-slate-900">Other</option>
          </select>
        </Field>
        <Field label="Government ID number *"><TextIn value={f.q_ca_id_number} onChange={(v) => set("q_ca_id_number", v)} /></Field>
        <Field label="Country">
          <select className={INPUT} value={f.country} onChange={(e) => set("country", e.target.value as LenderFormState["country"])}>
            <option value="CA" className="text-slate-900">Canada</option>
            <option value="US" className="text-slate-900">United States</option>
          </select>
        </Field>
      </div>

      {/* 4. Loan & Guarantee */}
      <h2 className={SECTION_H}>Loan & Guarantee</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
        <Field label="Loan amount (CAD) *"><TextIn type="number" value={f.loan_amount} onChange={(v) => set("loan_amount", v)} /></Field>
        <Field label="Requested PGI limit (CAD) *"><TextIn type="number" value={f.pgi_limit} onChange={(v) => set("pgi_limit", v)} /></Field>
        <Field label="Carrier loan type *">
          <select className={INPUT} value={f.q_ca_loan_type} onChange={(e) => set("q_ca_loan_type", e.target.value as LenderFormState["q_ca_loan_type"])}>
            <option value="">Select…</option>
            {ELIGIBLE_LOAN_TYPES.map((t) => <option key={t} value={t} className="text-slate-900">{t}</option>)}
          </select>
        </Field>
        <Field label="Loan funding date *"><TextIn type="date" value={f.loan_funding_date} onChange={(v) => set("loan_funding_date", v)} /></Field>
        <Field label="Policy start date *"><TextIn type="date" value={f.policy_start_date} onChange={(v) => set("policy_start_date", v)} /></Field>
        <Field label="Use of proceeds (internal)">
          <select className={INPUT} value={f.use_of_proceeds} onChange={(e) => set("use_of_proceeds", e.target.value as LenderFormState["use_of_proceeds"])}>
            <option value="working_capital" className="text-slate-900">Working Capital</option>
            <option value="acquisition" className="text-slate-900">Acquisition</option>
            <option value="expansion" className="text-slate-900">Expansion</option>
            <option value="equipment" className="text-slate-900">Equipment Purchase</option>
            <option value="real_estate" className="text-slate-900">Real Estate</option>
            <option value="refinance" className="text-slate-900">Refinance</option>
          </select>
        </Field>
        <Field label="CSBFP backed? *"><YesNoRadio name="csbfp_backed" value={f.csbfp_backed} onChange={(v) => set("csbfp_backed", v)} /></Field>
        <Field label="Guaranteed cap? *"><YesNoRadio name="loan_has_guaranteed_cap" value={f.loan_has_guaranteed_cap} onChange={(v) => set("loan_has_guaranteed_cap", v)} /></Field>
        <Field label="Personally guaranteeing? *"><YesNoRadio name="personally_guaranteeing" value={f.personally_guaranteeing} onChange={(v) => set("personally_guaranteeing", v)} /></Field>
      </div>

      {/* 5. Declarations — radio buttons, 2-col grid, v335 */}
      <h2 className={SECTION_H}>Declarations (all 11 Purbeck-required)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
        {[
          { k: "section_1_a", label: "Does the business carry insurance coverage for all physical assets covered by the personal guarantee?" },
          { k: "section_1_2", label: "Have you ever declared personal bankruptcy?" },
          { k: "section_2_a", label: "Have you ever been barred from serving as a Director, or are you under investigation that could result in being barred?" },
          { k: "section_2_b", label: "Have you ever been a Director of a company that has gone through bankruptcy, receivership, or restructuring proceedings?" },
          { k: "section_2_c", label: "Have you ever been a Director of a company under investigation by the Canada Revenue Agency or Canada Border Services Agency?" },
          { k: "section_2_d", label: "Do you currently have any actual or contingent liability you will not be able to pay within 30 days?" },
          { k: "section_3_a", label: "Does the business currently have any bad or doubtful debts owed to it that materially affect its ability to pay liabilities?" },
          { k: "section_4_a", label: "Has the business lost a significant investor, customer, or supplier in the last 6 months?" },
          { k: "section_5_a", label: "Are you aware of any information that could materially affect the business's obligations over the next 6 months?" },
          { k: "section_6_a", label: "As of today, is the company solvent (able to pay its debts as they become due)?" },
        ].map(({ k, label }) => {
          const val = (f.declarations as any)[k] as import("../components/lenderFormShared").YN;
          const adverse = "yes";
          const reasonKey = `${k}_reason` as keyof DeclarationsState;
          const showReason = (k === "section_1_2" || k === "section_2_a" || k === "section_2_b" || k === "section_2_c" || k === "section_2_d" || k === "section_3_a" || k === "section_4_a" || k === "section_5_a") && val === adverse;
          return (
            <div key={k} className="p-2 rounded bg-sky-500/5 border border-sky-300/20">
              <label className="text-xs text-sky-100 block mb-1">{label}</label>
              <YesNoRadio name={k} value={val} onChange={(v) => setDecl({ ...f.declarations, [k]: v } as any)} />
              {showReason && (
                <input className={`${INPUT} mt-2`} placeholder="Reason (required)" value={String((f.declarations as any)[reasonKey] || "")} onChange={(e) => setDecl({ ...f.declarations, [reasonKey]: e.target.value } as any)} />
              )}
            </div>
          );
        })}

        {/* section_3_c — truthfulness oath (Agree/Disagree), spans both columns */}
        <div className="md:col-span-2 p-2 rounded bg-sky-500/5 border border-sky-300/40 mt-2">
          <label className="text-xs text-sky-100 block mb-1">I confirm that all answers above are true to the best of my knowledge (and if anyone else completed this form on my behalf, that they were authorized).</label>
          <AgreeRadio name="section_3_c" value={f.declarations.section_3_c} onChange={(v) => setDecl({ ...f.declarations, section_3_c: v })} />
          {f.declarations.section_3_c === "Disagree" && (
            <input className={`${INPUT} mt-2`} placeholder="Please explain (required)" value={f.declarations.section_3_c_reason} onChange={(e) => setDecl({ ...f.declarations, section_3_c_reason: e.target.value })} />
          )}
        </div>
      </div>

      {/* 6. Required documents — 5 base + 2 startup-conditional */}
      <h2 className={SECTION_H}>Required documents</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {docSlots.map((slot) => {
          const picked = files[slot.key];
          return (
            <div key={slot.key} className="p-2 rounded border border-sky-300/30 bg-sky-500/5">
              <label className={LBL}>{slot.label}{slot.required && " *"}</label>
              <input type="file" accept={ACCEPT_PARTNER_DOCS} onChange={(e) => pickFile(slot.key, e)} className="text-xs text-sky-100" />
              {picked && <p className="text-[11px] text-emerald-300 mt-1">✓ {picked.name} ({(picked.size / 1024 / 1024).toFixed(1)} MB)</p>}
            </div>
          );
        })}
      </div>

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

      <div className="flex gap-3 mt-4">
        <button onClick={() => nav("/lender/applications")} className="px-4 py-2 border border-sky-300/50 rounded text-sky-100 hover:bg-sky-500/20">Cancel</button>
        <button onClick={onSubmit} disabled={!canSubmit} className="px-6 py-2 bg-sky-500 text-white rounded disabled:opacity-40 hover:bg-sky-400">{busy ? "Submitting…" : "Submit application"}</button>
      </div>
    </div>
  );
}
