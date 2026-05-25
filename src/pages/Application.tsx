// BI_WEBSITE_BLOCK_v330_PUBLIC_APP_FIXES_v1
// Public Personal Guarantee Application — 2-column grid layout, light-blue
// field styling, structured address, OTP-phone prefill, BN lookup popup,
// "Use today" loan-funding affordance, and the correct api method names
// (api.getApp/patchApp/submit, NOT api.get/patch/post).
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { CoreBadge } from "../components/CoreBadge";
import { UploadAndScrape } from "../components/UploadAndScrape";

// ---------- Constants ----------

const PROVINCES_NO_QC = [
  { value: "AB", label: "Alberta" },
  { value: "BC", label: "British Columbia" },
  { value: "MB", label: "Manitoba" },
  { value: "NB", label: "New Brunswick" },
  { value: "NL", label: "Newfoundland and Labrador" },
  { value: "NS", label: "Nova Scotia" },
  { value: "NT", label: "Northwest Territories" },
  { value: "NU", label: "Nunavut" },
  { value: "ON", label: "Ontario" },
  { value: "PE", label: "Prince Edward Island" },
  { value: "SK", label: "Saskatchewan" },
  { value: "YT", label: "Yukon" },
];

const ELIGIBLE_LOAN_TYPES = [
  { value: "Commercial Mortgage", label: "Commercial Mortgage" },
  { value: "Other Secured Loan", label: "Other Secured Loan" },
];

const LOAN_PURPOSES = [
  { value: "working_capital", label: "Working Capital" },
  { value: "acquisition",     label: "Acquisition" },
  { value: "expansion",       label: "Expansion" },
  { value: "equipment",       label: "Equipment Purchase" },
  { value: "real_estate",     label: "Real Estate" },
  { value: "refinance",       label: "Refinance" },
  { value: "other",           label: "Other" },
];

const RELATIONSHIPS = ["Guarantor", "Co-borrower", "Spouse", "Business Partner", "Other"];

const LOAN_AMOUNT_MAX = 1_000_000;
const PGI_LIMIT_MAX = 1_000_000;

const INPUT_CLS = "w-full bg-sky-500/15 border border-sky-300/40 text-white placeholder:text-sky-100/50 rounded px-3 py-2 focus:outline-none focus:border-sky-300 focus:bg-sky-500/25 transition";
const LABEL_CLS = "block text-xs font-medium text-sky-100 mb-1";
const HELP_CLS = "text-xs text-sky-200/70 mt-1";
const ERROR_CLS = "text-xs text-rose-300 mt-1";

const POSTAL_RE = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;

type AddressState = { line1: string; city: string; province: string; postal_code: string };
type CoGuarantor = {
  first_name: string; last_name: string; email: string; date_of_birth: string;
  phone: string; address: string; city: string; province: string;
  postal_code: string; relationship: string;
};

const blankAddress: AddressState = { line1: "", city: "", province: "", postal_code: "" };
const emptyCoGuarantor = (): CoGuarantor => ({
  first_name: "", last_name: "", email: "", date_of_birth: "", phone: "",
  address: "", city: "", province: "", postal_code: "", relationship: "Guarantor",
});

export default function Application() {
  const { publicId } = useParams<{ publicId: string }>();
  const nav = useNavigate();

  const [state, setState] = useState<Record<string, any>>({
    guarantor_address: blankAddress,
    business_address: blankAddress,
    declarations: {},
    consents: {},
    co_guarantors: [] as CoGuarantor[],
    business_province: "",
    loan_amount: "",
    pgi_limit: "",
    q_ca_loan_type: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [serverFieldErrors, setServerFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Load existing application + OTP phone on mount (v330 bugfix).
  useEffect(() => {
    if (!publicId) return;
    (async () => {
      try {
        const appResp: any = await api.getApp(publicId);
        const app = appResp?.application || appResp || {};

        const normAddr = (v: any): AddressState => {
          if (v && typeof v === "object" && !Array.isArray(v)) {
            return { line1: v.line1 || "", city: v.city || "", province: v.province || "", postal_code: v.postal_code || "" };
          }
          if (typeof v === "string" && v.trim()) return { ...blankAddress, line1: v };
          return { ...blankAddress };
        };

        setState((prev) => ({
          ...prev,
          ...app,
          guarantor_address: normAddr(app.guarantor_address),
          business_address: normAddr(app.business_address),
          declarations: app.declarations || {},
          consents: app.consents || {},
          co_guarantors: Array.isArray(app.co_guarantors) ? app.co_guarantors : [],
        }));

        // Pre-fill phone from OTP-verified session (issue #5).
        if (!app.guarantor_phone) {
          try {
            const pending: any = await api.getMyPendingApplication();
            const phone = pending?.phone || pending?.applicant?.phone || pending?.applicant_phone;
            if (typeof phone === "string" && phone.trim()) {
              setState((prev) => ({ ...prev, guarantor_phone: phone }));
            }
          } catch { /* non-blocking */ }
        }
      } catch (e) {
        console.warn("[v330] failed to load application:", (e as Error).message);
      }
    })();
  }, [publicId]);

  // ---- Helpers ----

  function update(key: string, value: any) {
    setState((s) => ({ ...s, [key]: value }));
    if (serverFieldErrors[key]) setServerFieldErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  }
  function updateAddress(rootKey: "guarantor_address" | "business_address", subKey: keyof AddressState, value: string) {
    setState((s) => ({ ...s, [rootKey]: { ...(s[rootKey] || blankAddress), [subKey]: value } }));
  }
  function updateDecl(key: string, value: any) {
    setState((s) => ({ ...s, declarations: { ...(s.declarations || {}), [key]: value } }));
  }
  function updateConsent(key: string, value: boolean) {
    setState((s) => ({ ...s, consents: { ...(s.consents || {}), [key]: value } }));
  }
  function addCoGuarantor() {
    setState((s) => ({ ...s, co_guarantors: [...(s.co_guarantors || []), emptyCoGuarantor()] }));
  }
  function removeCoGuarantor(idx: number) {
    setState((s) => ({ ...s, co_guarantors: (s.co_guarantors || []).filter((_: CoGuarantor, i: number) => i !== idx) }));
  }
  function updateCoGuarantor(idx: number, k: keyof CoGuarantor, v: string) {
    setState((s) => {
      const list = [...(s.co_guarantors || [])];
      list[idx] = { ...list[idx], [k]: v };
      return { ...s, co_guarantors: list };
    });
  }

  // ---- Save / Submit (v330 bugfix: correct api methods) ----

  async function handleSave() {
    if (!publicId) return;
    setError(null);
    try { await api.patchApp(publicId, state); } catch { setError("Save failed"); }
  }

  async function handleSubmit() {
    if (!publicId) return;
    setError(null);
    setServerFieldErrors({});
    setSubmitting(true);
    try {
      const loan = Number(state.loan_amount) || 0;
      const limit = Number(state.pgi_limit) || 0;
      const local: Record<string, string> = {};
      if (loan > LOAN_AMOUNT_MAX) local.loan_amount = `Loan amount ${loan} exceeds the 1,000,000 maximum.`;
      if (limit > PGI_LIMIT_MAX) local.pgi_limit = `PGI limit ${limit} exceeds the 1,000,000 maximum.`;
      if (loan && limit && limit > loan) local.pgi_limit = "PGI limit cannot exceed loan amount.";
      if (String(state.business_province || "").toUpperCase() === "QC") local.business_province = "PGI does not currently write business in Quebec.";
      const gaPc = (state.guarantor_address?.postal_code || "").trim();
      if (gaPc && !POSTAL_RE.test(gaPc)) local["guarantor_address.postal_code"] = "Postal code format A1A 1A1 expected.";
      const baPc = (state.business_address?.postal_code || "").trim();
      if (baPc && !POSTAL_RE.test(baPc)) local["business_address.postal_code"] = "Postal code format A1A 1A1 expected.";
      if (Object.keys(local).length > 0) { setServerFieldErrors(local); return; }

      const payload = { ...state, has_co_guarantors: (state.co_guarantors || []).length > 0 };
      await api.patchApp(publicId, payload);
      const r: any = await api.submit(publicId);
      if (r?.ok) nav(`/applications/${publicId}/documents`);
      else if (r?.errors) setServerFieldErrors(r.errors);
      else if (r?.fields) { const errs: Record<string, string> = {}; for (const f of r.fields) errs[f] = "Required"; setServerFieldErrors(errs); }
      else setError(r?.error || "Submit failed");
    } catch (e: any) {
      const data = e?.data;
      if (data?.errors) setServerFieldErrors(data.errors);
      else setError(e?.message || "Submit failed");
    } finally {
      setSubmitting(false);
    }
  }

  const fieldErr = (k: string) => serverFieldErrors[k];

  function TextInput({ k, label, type = "text", help, placeholder }: { k: string; label: string; type?: string; help?: string; placeholder?: string }) {
    const err = fieldErr(k);
    return (
      <div>
        <label className={LABEL_CLS}>{label}</label>
        <input type={type} className={INPUT_CLS} placeholder={placeholder} value={String(state[k] ?? "")} onChange={(e) => update(k, e.target.value)} />
        {help && <p className={HELP_CLS}>{help}</p>}
        {err && <p className={ERROR_CLS}>{err}</p>}
      </div>
    );
  }
  function NumberInput({ k, label, max }: { k: string; label: string; max?: number }) {
    const err = fieldErr(k);
    return (
      <div>
        <label className={LABEL_CLS}>{label}</label>
        <input type="number" className={INPUT_CLS} max={max} value={state[k] === "" || state[k] == null ? "" : Number(state[k])} onChange={(e) => update(k, e.target.value === "" ? "" : Number(e.target.value))} />
        {err && <p className={ERROR_CLS}>{err}</p>}
      </div>
    );
  }
  function SelectInput({ k, label, options, help }: { k: string; label: string; options: { value: string; label: string }[]; help?: string }) {
    const err = fieldErr(k);
    return (
      <div>
        <label className={LABEL_CLS}>{label}</label>
        <select className={INPUT_CLS} value={String(state[k] ?? "")} onChange={(e) => update(k, e.target.value)}>
          <option value="">Select…</option>
          {options.map((o) => <option key={o.value} value={o.value} className="text-slate-900">{o.label}</option>)}
        </select>
        {help && <p className={HELP_CLS}>{help}</p>}
        {err && <p className={ERROR_CLS}>{err}</p>}
      </div>
    );
  }
  function DateInput({ k, label, withTodayButton }: { k: string; label: string; withTodayButton?: boolean }) {
    const err = fieldErr(k);
    return (
      <div>
        <label className={LABEL_CLS}>{label}</label>
        <div className="flex gap-2">
          <input type="date" className={INPUT_CLS} value={String(state[k] ?? "")} onChange={(e) => update(k, e.target.value)} />
          {withTodayButton && (
            <button type="button" className="whitespace-nowrap px-3 py-2 text-xs bg-sky-400/20 border border-sky-300/40 text-sky-100 rounded hover:bg-sky-400/30" onClick={() => update(k, new Date().toISOString().slice(0, 10))} title="Fill with today's date (as soon as possible).">
              Use today
            </button>
          )}
        </div>
        {err && <p className={ERROR_CLS}>{err}</p>}
      </div>
    );
  }
  function AddressInputGroup({ rootKey, label }: { rootKey: "guarantor_address" | "business_address"; label: string }) {
    const addr: AddressState = state[rootKey] || blankAddress;
    const pcErr = fieldErr(`${rootKey}.postal_code`);
    return (
      <div className="md:col-span-2 p-3 rounded border border-sky-300/30 bg-sky-500/5">
        <div className="text-sm font-semibold text-sky-100 mb-2">{label}</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="md:col-span-2">
            <label className={LABEL_CLS}>Street address</label>
            <input className={INPUT_CLS} value={addr.line1} onChange={(e) => updateAddress(rootKey, "line1", e.target.value)} placeholder="123 King Street West" />
          </div>
          <div>
            <label className={LABEL_CLS}>City</label>
            <input className={INPUT_CLS} value={addr.city} onChange={(e) => updateAddress(rootKey, "city", e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLS}>Province</label>
            <select className={INPUT_CLS} value={addr.province} onChange={(e) => updateAddress(rootKey, "province", e.target.value)}>
              <option value="">Select…</option>
              {PROVINCES_NO_QC.map((p) => <option key={p.value} value={p.value} className="text-slate-900">{p.label}</option>)}
            </select>
          </div>
          <div>
            <label className={LABEL_CLS}>Postal code</label>
            <input className={INPUT_CLS} value={addr.postal_code} placeholder="A1A 1A1" onChange={(e) => updateAddress(rootKey, "postal_code", e.target.value)} />
            {pcErr && <p className={ERROR_CLS}>{pcErr}</p>}
          </div>
        </div>
      </div>
    );
  }
  function YesNoSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
      <select className={INPUT_CLS} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select…</option>
        <option value="no" className="text-slate-900">No</option>
        <option value="yes" className="text-slate-900">Yes</option>
      </select>
    );
  }

  function openBnLookup() {
    const name = encodeURIComponent(String(state.business_name || "").trim());
    const url = `https://www.ised-isde.canada.ca/cc/lgcy/fdrlCrpSrch.html?V_TOKEN=1&crpNm=${name}&V_SEARCH.command=navigate`;
    window.open(url, "bn_lookup", "width=900,height=700,noopener,noreferrer");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Personal Guarantee Application</h1>
        <CoreBadge />
      </div>

      <div className="mb-6">
        <UploadAndScrape onExtract={(extracted: any) => setState((s) => ({ ...s, ...extracted }))} />
      </div>

      {/* Policy Holder */}
      <h2 className="text-lg font-semibold text-sky-100 mt-6 mb-2 border-b border-sky-300/30 pb-1">Policy Holder Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <TextInput k="guarantor_name" label="Personal Guarantor's Full Legal Name *" />
        <DateInput k="guarantor_dob" label="What is your date of birth? *" />
        <AddressInputGroup rootKey="guarantor_address" label="Primary residential address *" />
        <TextInput k="guarantor_email" label="What is your email address? *" type="email" />
        <TextInput k="guarantor_phone" label="What is your phone number? * (pre-filled from your OTP verification)" type="tel" />
      </div>

      {/* Co-guarantors */}
      <div className="mb-6 p-4 rounded border border-sky-300/30 bg-sky-500/5">
        <h3 className="text-sm font-semibold text-sky-100">Co-guarantors</h3>
        <p className="text-xs text-sky-200/70 mt-1 mb-3">Add any other individuals who are co-guarantors on this loan (Canada only). Our team will contact you to complete the co-guarantor intake separately.</p>
        {(state.co_guarantors || []).length === 0 && <div className="text-sm text-sky-200/70">No co-guarantors added yet.</div>}
        {(state.co_guarantors as CoGuarantor[] || []).map((cg, idx) => (
          <div key={idx} className="mt-3 p-3 rounded bg-sky-500/10 border border-sky-300/20">
            <div className="flex justify-between items-center mb-2">
              <strong className="text-sm">Co-guarantor #{idx + 1}</strong>
              <button onClick={() => removeCoGuarantor(idx)} className="text-rose-300 text-xs hover:text-rose-200">Remove</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input className={INPUT_CLS} placeholder="First name *"   value={cg.first_name}    onChange={(e) => updateCoGuarantor(idx, "first_name", e.target.value)} />
              <input className={INPUT_CLS} placeholder="Last name *"    value={cg.last_name}     onChange={(e) => updateCoGuarantor(idx, "last_name", e.target.value)} />
              <input className={INPUT_CLS} placeholder="Email *" type="email" value={cg.email}   onChange={(e) => updateCoGuarantor(idx, "email", e.target.value)} />
              <input className={INPUT_CLS} placeholder="DOB *"   type="date"  value={cg.date_of_birth} onChange={(e) => updateCoGuarantor(idx, "date_of_birth", e.target.value)} />
              <input className={INPUT_CLS} placeholder="Phone *" type="tel"   value={cg.phone}    onChange={(e) => updateCoGuarantor(idx, "phone", e.target.value)} />
              <input className={INPUT_CLS} placeholder="Address *"      value={cg.address}        onChange={(e) => updateCoGuarantor(idx, "address", e.target.value)} />
              <input className={INPUT_CLS} placeholder="City *"         value={cg.city}           onChange={(e) => updateCoGuarantor(idx, "city", e.target.value)} />
              <select className={INPUT_CLS} value={cg.province} onChange={(e) => updateCoGuarantor(idx, "province", e.target.value)}>
                <option value="">Province *</option>
                {PROVINCES_NO_QC.map((p) => <option key={p.value} value={p.value} className="text-slate-900">{p.label}</option>)}
              </select>
              <input className={INPUT_CLS} placeholder="Postal code *"  value={cg.postal_code}    onChange={(e) => updateCoGuarantor(idx, "postal_code", e.target.value)} />
              <select className={INPUT_CLS} value={cg.relationship} onChange={(e) => updateCoGuarantor(idx, "relationship", e.target.value)}>
                {RELATIONSHIPS.map((r) => <option key={r} value={r} className="text-slate-900">{r}</option>)}
              </select>
            </div>
          </div>
        ))}
        <button onClick={addCoGuarantor} className="mt-3 text-sky-200 underline text-sm hover:text-sky-100">+ Add another co-guarantor</button>
      </div>

      {/* Business */}
      <h2 className="text-lg font-semibold text-sky-100 mt-6 mb-2 border-b border-sky-300/30 pb-1">Business Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <SelectInput k="country" label="Which country is the loan agreement based in?" options={[{ value: "Canada", label: "Canada" }]} />
        <TextInput k="business_name" label="What is the legal name of the business? *" />
        <AddressInputGroup rootKey="business_address" label="Business operating address *" />
        <SelectInput k="business_province" label="Business operating province *" options={PROVINCES_NO_QC} help="Quebec is not currently eligible for PGI coverage." />
        <TextInput k="business_website" label="Business website (optional)" />
        <SelectInput k="entity_type" label="What type of entity is the business?" options={["Corporation","Partnership","Sole Proprietorship","LLC","Other"].map(v => ({ value: v, label: v }))} />
        <div>
          <label className={LABEL_CLS}>Business Number (BN) (optional)</label>
          <div className="flex gap-2">
            <input className={INPUT_CLS} value={String(state.business_number ?? "")} onChange={(e) => update("business_number", e.target.value)} placeholder="123456789RT0001" />
            <button type="button" className="whitespace-nowrap px-3 py-2 text-xs bg-sky-400/20 border border-sky-300/40 text-sky-100 rounded hover:bg-sky-400/30" onClick={openBnLookup} title="Open Canada Business Registries search with your business name pre-filled">
              Look up by name
            </button>
          </div>
          <p className={HELP_CLS}>Don't know your BN? The button opens the federal Canada Business Registries search in a popup. You can also find your BN on the CRA: <a className="underline" target="_blank" rel="noreferrer" href="https://apps.cra-arc.gc.ca/ebci/bnsi/bnsearch/en/">CRA BN search</a>.</p>
        </div>
        <TextInput k="naics_code" label="What is the NAICS code for the business? *" placeholder="541511" />
        <DateInput k="formation_date" label="What month-year did this business start generating revenue? *" />
      </div>

      {/* Loan */}
      <h2 className="text-lg font-semibold text-sky-100 mt-6 mb-2 border-b border-sky-300/30 pb-1">Loan & Guarantee Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <NumberInput k="loan_amount" label="Loan Amount from Bank (CAD, max $1,000,000) *" max={LOAN_AMOUNT_MAX} />
        <SelectInput k="q_ca_loan_type" label="What type of loan is this? *" options={ELIGIBLE_LOAN_TYPES} help="Only Commercial Mortgage and Other Secured Loan are eligible for Canadian PGI coverage." />
        <NumberInput k="pgi_limit" label="Please declare your desired PGI limit (CAD, max $1,000,000, must be ≤ loan amount) *" max={PGI_LIMIT_MAX} />
        <TextInput k="lender_name" label="Who is the lender? *" />
        <DateInput k="loan_funding_date" label="What is the loan funding date? *" withTodayButton />
        <SelectInput k="loan_purpose" label="What is the purpose of the loan? *" options={LOAN_PURPOSES} help="Used for our internal records. Does not affect carrier eligibility." />
        <SelectInput k="csbfp_backed" label="Is this a CSBFP backed loan?" options={[{ value: "false", label: "No" }, { value: "true", label: "Yes" }]} />
        <SelectInput k="loan_has_guaranteed_cap" label="Does this loan have a guaranteed cap amount?" options={[{ value: "false", label: "No" }, { value: "true", label: "Yes" }]} />
        <SelectInput k="personally_guaranteeing" label="Are you personally guaranteeing this loan? *" options={[{ value: "false", label: "No" }, { value: "true", label: "Yes" }]} />
        <DateInput k="policy_start_date" label="What date do you need this policy to start? *" withTodayButton />
      </div>

      {/* Financials */}
      <h2 className="text-lg font-semibold text-sky-100 mt-6 mb-2 border-b border-sky-300/30 pb-1">Financial Information (from CORE Score)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <NumberInput k="annual_revenue"       label="Business revenue last year (CAD) *" />
        <NumberInput k="ebitda"               label="EBITDA last year (CAD) *" />
        <NumberInput k="total_debt"           label="Total business debt (CAD) *" />
        <NumberInput k="monthly_debt_service" label="Total monthly business loan payments (CAD) *" />
        <NumberInput k="collateral_value"     label="Business collateral pledged (CAD) *" />
        <NumberInput k="enterprise_value"     label="Estimated enterprise value of the business (CAD) *" />
      </div>

      {/* Declarations */}
      <h2 className="text-lg font-semibold text-sky-100 mt-6 mb-2 border-b border-sky-300/30 pb-1">Declarations</h2>
      <p className="text-xs text-sky-200/70 mb-3">All 11 declarations must be answered. Any "yes" answer requires a brief explanation.</p>
      <div className="grid grid-cols-1 gap-3 mb-6">
        {[
          { k: "section_1_2", label: "Have you ever defaulted on a loan, had a loan written off, or had a credit facility called by a lender?", adverse: "yes" },
          { k: "section_2_a", label: "Have you ever filed for personal bankruptcy, consumer proposal, or made a personal arrangement with creditors?", adverse: "yes" },
          { k: "section_2_b", label: "Has any business you owned, controlled, or directed ever been placed into receivership, liquidation, bankruptcy, or made a proposal to creditors?", adverse: "yes" },
          { k: "section_2_c", label: "Are there any outstanding personal judgments, liens, or unpaid debts registered against you?", adverse: "yes" },
          { k: "section_2_d", label: "Are there any outstanding judgments, liens, or material unpaid trade debts against the business?", adverse: "yes" },
          { k: "section_3_a", label: "Have you ever been charged with, convicted of, or are currently the subject of any criminal investigation or proceeding (excluding minor traffic offences)?", adverse: "yes" },
          { k: "section_4_a", label: "Are you or the business currently the subject of any regulatory investigation, sanction, or enforcement action by any government or professional body?", adverse: "yes" },
          { k: "section_5_a", label: "Are you aware of any material adverse change, threatened claim, or financial event that is reasonably likely to affect the business in the next 12 months?", adverse: "yes" },
        ].map(({ k, label, adverse }) => {
          const val = String(state.declarations?.[k] ?? "");
          return (
            <div key={k} className="grid grid-cols-1 md:grid-cols-[1fr_180px] gap-2 items-start">
              <label className="text-sm text-sky-100">{label}</label>
              <YesNoSelect value={val} onChange={(v) => updateDecl(k, v)} />
              {val === adverse && (
                <div className="md:col-span-2">
                  <textarea className={INPUT_CLS} rows={2} placeholder="Please explain…" value={String(state.declarations?.[`${k}_reason`] ?? "")} onChange={(e) => updateDecl(`${k}_reason`, e.target.value)} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Consents */}
      <h2 className="text-lg font-semibold text-sky-100 mt-6 mb-2 border-b border-sky-300/30 pb-1">Consents <span className="text-xs font-normal text-sky-200/60">(document uploads happen on the next step)</span></h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
        {[
          { k: "electronic_signature",  label: "Do you consent to electronic signatures?" },
          { k: "info_accurate",         label: "Do you certify that all information provided is accurate?" },
          { k: "business_solvent",      label: "Do you certify the business is solvent as of today?" },
          { k: "no_undisclosed_events", label: "Do you certify there are no undisclosed adverse events?" },
          { k: "data_use",              label: "Do you consent to our use of your data for underwriting?" },
          { k: "credit_pull",           label: "Do you authorize us to pull your credit report?" },
          { k: "coverage_understood",   label: "Do you understand what PGI covers and does not cover?" },
        ].map(({ k, label }) => (
          <label key={k} className="flex items-start gap-2 p-2 rounded bg-sky-500/5 border border-sky-300/20 cursor-pointer">
            <input type="checkbox" className="mt-1" checked={!!state.consents?.[k]} onChange={(e) => updateConsent(k, e.target.checked)} />
            <span className="text-sm text-sky-100">{label}</span>
          </label>
        ))}
      </div>

      {error && <div className="text-rose-300 mb-3">{error}</div>}

      <div className="flex gap-3 mt-6">
        <button onClick={handleSave} className="px-6 py-2 border border-sky-300/50 rounded text-sky-100 hover:bg-sky-500/20">Save</button>
        <button onClick={handleSubmit} disabled={submitting} className="px-6 py-2 bg-sky-500 text-white rounded disabled:opacity-50 hover:bg-sky-400">{submitting ? "Submitting…" : "Submit"}</button>
      </div>
    </div>
  );
}
