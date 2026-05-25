import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ACCEPT_PARTNER_DOCS, API_BASE, blankLenderForm, buildLenderSubmitBody, declarationsComplete, DOC_SLOTS,
  ELIGIBLE_LOAN_TYPES, emptyCoGuarantor, Field, getLenderToken, LenderFormState, LOAN_AMOUNT_MAX,
  PARTNER_ALLOWED_MIME, PARTNER_MAX_BYTES, PGI_LIMIT_MAX, PROVINCES_NO_QC, RELATIONSHIPS,
  REQUIRED_KEYS, SECTION, SECTION_TITLE, TextIn, YesNoSelect, type CoGuarantor, type DeclarationsState,
} from "../components/lenderFormShared";

export default function LenderApplicationNew() {
  const navigate = useNavigate();
  const token = useMemo(() => getLenderToken(), []);
  const [f, setF] = useState<LenderFormState>(blankLenderForm);
  const [files, setFiles] = useState<Record<string, File | undefined>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  function set<K extends keyof LenderFormState>(k: K, v: LenderFormState[K]) { setF((p) => ({ ...p, [k]: v })); }
  useEffect(() => { try { const raw = localStorage.getItem("bi.lender_draft"); if (raw) setF((p) => ({ ...p, ...JSON.parse(raw) })); } catch {} }, []);
  useEffect(() => { const id = setTimeout(() => { try { localStorage.setItem("bi.lender_draft", JSON.stringify(f)); setSavedAt(new Date()); } catch {} }, 1200); return () => clearTimeout(id); }, [f]);

  function pickFile(slot: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    if (!PARTNER_ALLOWED_MIME.has(file.type)) { alert(`File type '${file.type}' is not allowed. Accepted: PDF, DOCX, XLS, XLSX, CSV, Markdown. No images.`); return; }
    if (file.size > PARTNER_MAX_BYTES) { alert(`File exceeds the 5 MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB).`); return; }
    setFiles((p) => ({ ...p, [slot]: file }));
  }

  const missingFields = REQUIRED_KEYS.filter((k) => { const v = f[k]; return typeof v === "string" ? !v.trim() : v == null; });
  const missingDocs = DOC_SLOTS.filter((d) => d.required && !files[d.key]);
  const declOk = declarationsComplete(f.declarations);
  const loanAmt = Number(f.loan_amount.replace(/[,$\s]/g, "") || 0);
  const pgiAmt = Number(f.pgi_limit.replace(/[,$\s]/g, "") || 0);
  const capErrors: string[] = [];
  if (loanAmt > LOAN_AMOUNT_MAX) capErrors.push("Loan amount exceeds the 1,000,000 maximum.");
  if (pgiAmt > PGI_LIMIT_MAX) capErrors.push("PGI limit exceeds the 1,000,000 maximum.");
  if (loanAmt && pgiAmt && pgiAmt > loanAmt) capErrors.push("PGI limit cannot exceed loan amount.");
  if (f.business_province.toUpperCase() === "QC") capErrors.push("PGI does not currently write business in Quebec.");
  const canSubmit = missingFields.length === 0 && missingDocs.length === 0 && declOk && capErrors.length === 0 && !busy && !!token;

  async function onSubmit() { if (!canSubmit) return; setBusy(true); try { await fetch(`${API_BASE}/api/v1/lender/applications`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(buildLenderSubmitBody(f)) }); } finally { setBusy(false); } }

  return <div style={{ padding: 16 }}>
    <h1>New Application</h1>
    {savedAt && <div>Saved {savedAt.toLocaleTimeString()}</div>}
    <div style={SECTION}><div style={SECTION_TITLE}>Loan</div>
      <Field label="Loan amount ($) *"><TextIn value={f.loan_amount} onChange={(v) => set("loan_amount", v)} /></Field>
      <Field label="Requested PGI limit ($) *"><TextIn value={f.pgi_limit} onChange={(v) => set("pgi_limit", v)} /></Field>
      <Field label="What type of loan is this? (carrier eligibility)"><select style={{ width: "100%" }} value={f.q_ca_loan_type} onChange={(e) => set("q_ca_loan_type", e.target.value as LenderFormState["q_ca_loan_type"])}><option value="">Select…</option>{ELIGIBLE_LOAN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select></Field>
      <Field label="Business province"><select style={{ width: "100%" }} value={f.business_province} onChange={(e) => set("business_province", e.target.value)}><option value="">Select…</option>{PROVINCES_NO_QC.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}</select></Field>
    </div>

    <div style={SECTION}><div style={SECTION_TITLE}>Declarations (Purbeck-required)</div>
      <Field label="I consent to PGI / Purbeck verifying my information and conducting underwriting checks, including credit and background inquiries."><YesNoSelect value={f.declarations.section_1_a} onChange={(v) => set("declarations", { ...f.declarations, section_1_a: v })} /></Field>
      <Field label="Have you ever defaulted on a loan, had a loan written off, or had a credit facility called by a lender?"><YesNoSelect value={f.declarations.section_1_2} onChange={(v) => set("declarations", { ...f.declarations, section_1_2: v })} /></Field>
      {f.declarations.section_1_2 === "yes" && <Field label="Please explain."><TextIn value={f.declarations.section_1_2_reason} onChange={(v) => set("declarations", { ...f.declarations, section_1_2_reason: v })} /></Field>}
      <Field label="Have you ever filed for personal bankruptcy, consumer proposal, or made a personal arrangement with creditors?"><YesNoSelect value={f.declarations.section_2_a} onChange={(v) => set("declarations", { ...f.declarations, section_2_a: v })} /></Field>
      <Field label="Has any business you owned, controlled, or directed ever been placed into receivership, liquidation, bankruptcy, or made a proposal to creditors?"><YesNoSelect value={f.declarations.section_2_b} onChange={(v) => set("declarations", { ...f.declarations, section_2_b: v })} /></Field>
      <Field label="Are there any outstanding personal judgments, liens, or unpaid debts registered against you?"><YesNoSelect value={f.declarations.section_2_c} onChange={(v) => set("declarations", { ...f.declarations, section_2_c: v })} /></Field>
      <Field label="Are there any outstanding judgments, liens, or material unpaid trade debts against the business?"><YesNoSelect value={f.declarations.section_2_d} onChange={(v) => set("declarations", { ...f.declarations, section_2_d: v })} /></Field>
      <Field label="Have you ever been charged with, convicted of, or are currently the subject of any criminal investigation or proceeding (excluding minor traffic offences)?"><YesNoSelect value={f.declarations.section_3_a} onChange={(v) => set("declarations", { ...f.declarations, section_3_a: v })} /></Field>
      <Field label="Do you agree to the policy terms, conditions, and exclusions as set out in the PGI policy wording?"><select style={{ width: "100%" }} value={f.declarations.section_3_c} onChange={(e) => set("declarations", { ...f.declarations, section_3_c: e.target.value as DeclarationsState["section_3_c"] })}><option value="">Select…</option><option value="Agree">Agree</option><option value="Disagree">Disagree</option></select></Field>
      <Field label="Are you or the business currently the subject of any regulatory investigation, sanction, or enforcement action by any government or professional body?"><YesNoSelect value={f.declarations.section_4_a} onChange={(v) => set("declarations", { ...f.declarations, section_4_a: v })} /></Field>
      <Field label="Are you aware of any material adverse change, threatened claim, or financial event that is reasonably likely to affect the business in the next 12 months?"><YesNoSelect value={f.declarations.section_5_a} onChange={(v) => set("declarations", { ...f.declarations, section_5_a: v })} /></Field>
      <Field label="I certify that all information provided in this application is true, complete, and accurate to the best of my knowledge."><YesNoSelect value={f.declarations.section_6_a} onChange={(v) => set("declarations", { ...f.declarations, section_6_a: v })} /></Field>
    </div>

    <div style={SECTION}><div style={SECTION_TITLE}>Co-guarantors (Canada only)</div>
      {f.co_guarantors.map((cg, idx) => <div key={idx}>{(["first_name", "last_name", "email", "date_of_birth", "phone", "address", "city", "postal_code"] as (keyof CoGuarantor)[]).map((k) => <input key={k} value={cg[k]} onChange={(e) => set("co_guarantors", f.co_guarantors.map((c, i) => i === idx ? { ...c, [k]: e.target.value } : c))} />)}<select value={cg.province} onChange={(e) => set("co_guarantors", f.co_guarantors.map((c, i) => i === idx ? { ...c, province: e.target.value } : c))}><option value="">Province *</option>{PROVINCES_NO_QC.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}</select><select value={cg.relationship} onChange={(e) => set("co_guarantors", f.co_guarantors.map((c, i) => i === idx ? { ...c, relationship: e.target.value } : c))}>{RELATIONSHIPS.map((r) => <option key={r} value={r}>{r}</option>)}</select></div>)}
      <button type="button" onClick={() => set("co_guarantors", [...f.co_guarantors, emptyCoGuarantor()])}>+ Add another co-guarantor</button>
    </div>

    <div style={SECTION}><div style={SECTION_TITLE}>Required documents</div>
      {DOC_SLOTS.map((d) => <input key={d.key} type="file" accept={ACCEPT_PARTNER_DOCS} onChange={(e) => pickFile(d.key, e)} />)}
    </div>

    {capErrors.length > 0 && <div>{capErrors.map((e) => <div key={e}>{e}</div>)}</div>}
    {!declOk && <div>All 11 declarations must be answered. Any "yes" answer requires an explanation.</div>}
    {error && <div>{error}</div>}
    <button type="button" disabled={!canSubmit} onClick={onSubmit}>{busy ? "Submitting…" : "Submit application"}</button>
    <button type="button" onClick={() => navigate("/lender/portal")}>Cancel</button>
  </div>;
}
