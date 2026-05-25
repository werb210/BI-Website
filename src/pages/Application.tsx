// BI_WEBSITE_BLOCK_v327_PURBECK_WIZARD_v1
// Public application wizard, rewritten for the 2026-05-25 Purbeck-aligned
// schema. 6 sections, all field renames are server-side mappings; this UI
// uses friendly internal keys and lets bi-server's V2 mapper translate
// to the q-keyed carrier payload at submit-to-pgi time.
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, getApplicantToken } from "../lib/api";
import { CoreBadge } from "../components/CoreBadge";
import { Section } from "../components/Section";
import { UploadAndScrape } from "../components/UploadAndScrape";

type FieldType = "text" | "email" | "phone" | "date" | "currency" | "number" | "boolean" | "select" | "naics" | "textarea";
type Option = { value: string; label: string };
type FieldDef = {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: Option[];
  help?: string;
  max?: number;
  showWhen?: (state: Record<string, unknown>) => boolean;
};

const PROVINCES_NO_QC: Option[] = [
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

const LOAN_TYPES: Option[] = [
  { value: "Commercial Mortgage", label: "Commercial Mortgage" },
  { value: "Other Secured Loan", label: "Other Secured Loan" },
];

const LOAN_PURPOSES: Option[] = [
  { value: "working_capital", label: "Working capital" },
  { value: "equipment",       label: "Equipment purchase" },
  { value: "expansion",       label: "Business expansion / growth" },
  { value: "acquisition",     label: "Acquisition" },
  { value: "real_estate",     label: "Real estate" },
  { value: "refinance",       label: "Refinance" },
  { value: "other",           label: "Other" },
];

const ID_TYPES: Option[] = [
  { value: "Passport", label: "Passport" },
  { value: "National ID", label: "National ID" },
  { value: "Driving Licence", label: "Driving Licence" },
  { value: "Other", label: "Other" },
];

const RELATIONSHIPS: Option[] = [
  { value: "Guarantor", label: "Guarantor" },
  { value: "Co-borrower", label: "Co-borrower" },
  { value: "Spouse", label: "Spouse" },
  { value: "Business Partner", label: "Business Partner" },
  { value: "Other", label: "Other" },
];

const LOAN_AMOUNT_MAX = 1_000_000;
const PGI_LIMIT_MAX = 1_000_000;

const SECTIONS: Array<{ title: string; fields: FieldDef[] }> = [
  {
    title: "Policy Holder Information",
    fields: [
      { key: "guarantor_name",    label: "Personal Guarantor's Full Legal Name", type: "text", required: true },
      { key: "guarantor_dob",     label: "What is your date of birth?",          type: "date", required: true },
      { key: "guarantor_address", label: "What is your primary residential address?", type: "text", required: true },
      { key: "guarantor_email",   label: "What is your email address?",          type: "email", required: true },
      { key: "guarantor_phone",   label: "What is your phone number?",           type: "phone", required: true },
    ],
  },
  {
    title: "Business Information",
    fields: [
      { key: "country",            label: "Which country is the loan agreement based in?", type: "select", required: true, options: [{ value: "Canada", label: "Canada" }] },
      { key: "business_name",      label: "What is the legal name of the business?", type: "text", required: true },
      { key: "business_address",   label: "What is the business operating address?", type: "text", required: true },
      { key: "business_province",  label: "Which province is the business operating in?", type: "select", required: true, options: PROVINCES_NO_QC,
        help: "Quebec is not currently eligible for PGI coverage." },
      { key: "business_website",   label: "What is the business website? (optional)", type: "text" },
      { key: "entity_type",        label: "What type of entity is the business?", type: "select",
        options: ["Corporation","Partnership","Sole Proprietorship","LLC","Other"].map(v => ({ value: v, label: v })) },
      { key: "business_number",    label: "What is the business number (BN)? (optional)", type: "text",
        help: "Don't know yours? Look it up at the CRA: https://apps.cra-arc.gc.ca/ebci/bnsi/bnsearch/en/" },
      { key: "naics_code",         label: "What is the NAICS code for the business?", type: "naics", required: true },
      { key: "formation_date",     label: "What month-year did this business start generating revenue?", type: "date", required: true },
    ],
  },
  {
    title: "Loan & Guarantee Details",
    fields: [
      { key: "loan_amount", label: "Loan Amount from Bank (CAD, max $1,000,000)", type: "currency", required: true, max: LOAN_AMOUNT_MAX },
      { key: "q_ca_loan_type", label: "What type of loan is this?", type: "select", required: true, options: LOAN_TYPES,
        help: "Only Commercial Mortgage and Other Secured Loan are eligible for Canadian PGI coverage." },
      { key: "csbfp_backed",                label: "Is this a CSBFP backed loan?", type: "boolean" },
      { key: "loan_has_guaranteed_cap",     label: "Does this loan have a guaranteed cap amount?", type: "boolean",
        help: "A guaranteed cap limits your personal guarantee to a fixed dollar amount instead of the full loan balance." },
      { key: "pgi_limit",   label: "Please declare your desired PGI limit (CAD, max $1,000,000, must be ≤ loan amount)", type: "currency", required: true, max: PGI_LIMIT_MAX },
      { key: "lender_name",            label: "Who is the lender?", type: "text", required: true },
      { key: "loan_funding_date",      label: "What is the loan funding date?", type: "date", required: true },
      { key: "loan_purpose",           label: "What is the purpose of the loan?", type: "select", required: true, options: LOAN_PURPOSES,
        help: "Used for our internal records. Does not affect carrier eligibility." },
      { key: "personally_guaranteeing", label: "Are you personally guaranteeing this loan?", type: "boolean", required: true },
      { key: "policy_start_date",       label: "What date do you need this policy to start?", type: "date", required: true },
    ],
  },
  {
    title: "Financial Information (CORE Score)",
    fields: [
      { key: "annual_revenue",       label: "What was the business revenue last year? (CAD)",      type: "currency", required: true },
      { key: "ebitda",               label: "What was the business EBITDA last year? (CAD)",       type: "currency", required: true,
        help: "EBITDA must be ≥ $50,000 for CORE auto-approval." },
      { key: "total_debt",           label: "What is the total business debt? (CAD)",              type: "currency", required: true },
      { key: "monthly_debt_service", label: "What are the total monthly business loan payments? (CAD)", type: "currency", required: true },
      { key: "collateral_value",     label: "Business collateral pledged (CAD)",                   type: "currency", required: true },
      { key: "enterprise_value",     label: "What is the estimated enterprise value of the business? (CAD)", type: "currency", required: true },
    ],
  },
  {
    // BI_WEBSITE_BLOCK_v327_DECLARATIONS_v1 — replaces the old Risk section.
    // 8 of the 11 carrier declaration sections live here. The other 3
    // (section_1_a, section_3_c, section_6_a) are driven by Section 6 consents.
    title: "Declarations",
    fields: [
      { key: "declarations.section_1_2", label: "Have you ever defaulted on a loan, had a loan written off, or had a credit facility called by a lender?", type: "select", required: true, options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes" }] },
      { key: "declarations.section_1_2_reason", label: "Please explain.", type: "textarea", required: true, showWhen: (s) => (s as any)?.declarations?.section_1_2 === "yes" },

      { key: "declarations.section_2_a", label: "Have you ever filed for personal bankruptcy, consumer proposal, or made a personal arrangement with creditors?", type: "select", required: true, options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes" }] },
      { key: "declarations.section_2_a_reason", label: "Please explain.", type: "textarea", required: true, showWhen: (s) => (s as any)?.declarations?.section_2_a === "yes" },

      { key: "declarations.section_2_b", label: "Has any business you owned, controlled, or directed ever been placed into receivership, liquidation, bankruptcy, or made a proposal to creditors?", type: "select", required: true, options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes" }] },
      { key: "declarations.section_2_b_reason", label: "Please explain.", type: "textarea", required: true, showWhen: (s) => (s as any)?.declarations?.section_2_b === "yes" },

      { key: "declarations.section_2_c", label: "Are there any outstanding personal judgments, liens, or unpaid debts registered against you?", type: "select", required: true, options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes" }] },
      { key: "declarations.section_2_c_reason", label: "Please explain.", type: "textarea", required: true, showWhen: (s) => (s as any)?.declarations?.section_2_c === "yes" },

      { key: "declarations.section_2_d", label: "Are there any outstanding judgments, liens, or material unpaid trade debts against the business?", type: "select", required: true, options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes" }] },
      { key: "declarations.section_2_d_reason", label: "Please explain.", type: "textarea", required: true, showWhen: (s) => (s as any)?.declarations?.section_2_d === "yes" },

      { key: "declarations.section_3_a", label: "Have you ever been charged with, convicted of, or are currently the subject of any criminal investigation or proceeding (excluding minor traffic offences)?", type: "select", required: true, options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes" }] },
      { key: "declarations.section_3_a_reason", label: "Please explain.", type: "textarea", required: true, showWhen: (s) => (s as any)?.declarations?.section_3_a === "yes" },

      { key: "declarations.section_4_a", label: "Are you or the business currently the subject of any regulatory investigation, sanction, or enforcement action by any government or professional body?", type: "select", required: true, options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes" }] },
      { key: "declarations.section_4_a_reason", label: "Please explain.", type: "textarea", required: true, showWhen: (s) => (s as any)?.declarations?.section_4_a === "yes" },

      { key: "declarations.section_5_a", label: "Are you aware of any material adverse change, threatened claim, or financial event that is reasonably likely to affect the business in the next 12 months?", type: "select", required: true, options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes" }] },
      { key: "declarations.section_5_a_reason", label: "Please explain.", type: "textarea", required: true, showWhen: (s) => (s as any)?.declarations?.section_5_a === "yes" },
    ],
  },
  {
    // BI_WEBSITE_BLOCK_v327_CONSENTS_VERBATIM_v1 — Section 6 questions copied
    // verbatim from PGI Q39-Q45 (per Todd 2026-05-25). These drive
    // section_1_a (consent), section_3_c (Agree/Disagree), section_6_a (accuracy).
    title: "Document Uploads & Consents",
    fields: [
      { key: "consents.electronic_signature",  label: "Do you consent to electronic signatures?", type: "boolean", required: true },
      { key: "consents.info_accurate",         label: "Do you certify that all information provided is accurate?", type: "boolean", required: true },
      { key: "consents.business_solvent",      label: "Do you certify the business is solvent as of today?", type: "boolean", required: true },
      { key: "consents.no_undisclosed_events", label: "Do you certify there are no undisclosed adverse events?", type: "boolean", required: true },
      { key: "consents.data_use",              label: "Do you consent to our use of your data for underwriting?", type: "boolean", required: true },
      { key: "consents.credit_pull",           label: "Do you authorize us to pull your credit report?", type: "boolean", required: true },
      { key: "consents.coverage_understood",   label: "Do you understand what PGI covers and does not cover?", type: "boolean", required: true },
    ],
  },
];

type CoGuarantor = {
  first_name: string;
  last_name: string;
  email: string;
  date_of_birth: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  relationship: string;
};

function emptyCoGuarantor(): CoGuarantor {
  return {
    first_name: "", last_name: "", email: "", date_of_birth: "", phone: "",
    address: "", city: "", province: "", postal_code: "", relationship: "Guarantor",
  };
}

function setNested(obj: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  const keys = path.split(".");
  const out = { ...obj };
  let cur: Record<string, unknown> = out;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    cur[k] = { ...((cur[k] as Record<string, unknown>) || {}) };
    cur = cur[k] as Record<string, unknown>;
  }
  cur[keys[keys.length - 1]] = value;
  return out;
}

function getNested(obj: Record<string, unknown>, path: string): unknown {
  const keys = path.split(".");
  let cur: unknown = obj;
  for (const k of keys) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[k];
  }
  return cur;
}

export default function Application() {
  const { publicId } = useParams();
  const nav = useNavigate();
  const [state, setState] = useState<Record<string, unknown>>({ declarations: {}, consents: {}, co_guarantors: [] as CoGuarantor[] });
  const [error, setError] = useState<string | null>(null);
  const [serverFieldErrors, setServerFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!publicId) return;
    (async () => {
      const token = getApplicantToken();
      const r = await api.get(`/api/v1/applications/${publicId}`, { token });
      if (r?.ok && r.application) setState({
        ...r.application,
        declarations: r.application.declarations || {},
        consents: r.application.consents || {},
        co_guarantors: r.application.co_guarantors || [],
      });
    })();
  }, [publicId]);

  function update(key: string, value: unknown) {
    setState((s) => setNested(s, key, value));
    if (serverFieldErrors[key]) {
      setServerFieldErrors((e) => { const { [key]: _, ...rest } = e; return rest; });
    }
  }

  const coGuarantors = (state.co_guarantors as CoGuarantor[]) || [];
  function addCoGuarantor() {
    setState((s) => ({ ...s, co_guarantors: [...((s.co_guarantors as CoGuarantor[]) || []), emptyCoGuarantor()] }));
  }
  function removeCoGuarantor(idx: number) {
    setState((s) => ({ ...s, co_guarantors: ((s.co_guarantors as CoGuarantor[]) || []).filter((_, i) => i !== idx) }));
  }
  function updateCoGuarantor(idx: number, key: keyof CoGuarantor, value: string) {
    setState((s) => {
      const list = [...((s.co_guarantors as CoGuarantor[]) || [])];
      list[idx] = { ...list[idx], [key]: value };
      return { ...s, co_guarantors: list };
    });
  }

  async function handleSave() {
    setError(null);
    const token = getApplicantToken();
    const r = await api.patch(`/api/v1/applications/${publicId}`, state, { token });
    if (!r?.ok) setError("Save failed");
  }

  async function handleSubmit() {
    setError(null);
    setServerFieldErrors({});
    setSubmitting(true);
    try {
      // Client-side caps (UI defense; server is the authority).
      const loan = Number(state.loan_amount);
      const limit = Number(state.pgi_limit);
      if (loan > LOAN_AMOUNT_MAX) {
        setServerFieldErrors({ loan_amount: `Loan amount ${loan} exceeds the 1,000,000 maximum.` });
        return;
      }
      if (limit > PGI_LIMIT_MAX) {
        setServerFieldErrors({ pgi_limit: `PGI limit ${limit} exceeds the 1,000,000 maximum.` });
        return;
      }
      if (limit > loan) {
        setServerFieldErrors({ pgi_limit: "PGI limit cannot exceed loan amount." });
        return;
      }
      if (String(state.business_province).toUpperCase() === "QC") {
        setServerFieldErrors({ business_province: "PGI does not currently write business in Quebec." });
        return;
      }

      const token = getApplicantToken();
      const payload = {
        ...state,
        has_co_guarantors: ((state.co_guarantors as CoGuarantor[]) || []).length > 0,
      };
      await api.patch(`/api/v1/applications/${publicId}`, payload, { token });
      const r = await api.post(`/api/v1/applications/${publicId}/submit`, {}, { token });
      if (r?.ok) {
        nav(`/applications/${publicId}/documents`);
      } else if (r?.errors) {
        setServerFieldErrors(r.errors);
      } else if (r?.fields) {
        const errors: Record<string, string> = {};
        for (const f of r.fields) errors[f] = "Required";
        setServerFieldErrors(errors);
      } else {
        setError(r?.error || "Submit failed");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Personal Guarantee Application</h1>
        <CoreBadge />
      </div>

      <UploadAndScrape onExtract={(extracted) => setState((s) => ({ ...s, ...extracted }))} />

      {SECTIONS.map((section) => (
        <Section key={section.title} title={section.title}>
          {section.fields.map((f) => {
            if (f.showWhen && !f.showWhen(state)) return null;
            const value = (getNested(state, f.key) ?? "") as string;
            const errMsg = serverFieldErrors[f.key];
            return (
              <FieldRenderer
                key={f.key}
                field={f}
                value={value}
                error={errMsg}
                onChange={(v) => update(f.key, v)}
              />
            );
          })}

          {section.title === "Policy Holder Information" && (
            <CoGuarantorPanel
              items={coGuarantors}
              onAdd={addCoGuarantor}
              onRemove={removeCoGuarantor}
              onUpdate={updateCoGuarantor}
            />
          )}
        </Section>
      ))}

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="flex gap-3 mt-6">
        <button onClick={handleSave} className="px-6 py-2 border rounded">Save</button>
        <button onClick={handleSubmit} disabled={submitting} className="px-6 py-2 bg-blue-600 text-white rounded disabled:opacity-50">
          {submitting ? "Submitting…" : "Submit"}
        </button>
      </div>
    </div>
  );
}

function FieldRenderer({ field, value, error, onChange }: { field: FieldDef; value: string; error?: string; onChange: (v: unknown) => void }) {
  const baseClass = `mt-1 block w-full rounded border ${error ? "border-red-500" : "border-gray-300"} p-2`;
  const renderInput = () => {
    if (field.type === "boolean") {
      return (
        <label className="inline-flex items-center gap-2 mt-1">
          <input type="checkbox" checked={String(value) === "true"} onChange={(e) => onChange(e.target.checked)} />
          <span>Yes</span>
        </label>
      );
    }
    if (field.type === "select" && field.options) {
      return (
        <select className={baseClass} value={String(value)} onChange={(e) => onChange(e.target.value)}>
          <option value="">Select…</option>
          {field.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
    }
    if (field.type === "textarea") {
      return <textarea className={baseClass} rows={3} value={String(value)} onChange={(e) => onChange(e.target.value)} />;
    }
    if (field.type === "currency" || field.type === "number") {
      return (
        <input
          type="number"
          className={baseClass}
          value={String(value)}
          max={field.max}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        />
      );
    }
    if (field.type === "date") {
      return <input type="date" className={baseClass} value={String(value)} onChange={(e) => onChange(e.target.value)} />;
    }
    return <input type={field.type === "email" ? "email" : field.type === "phone" ? "tel" : "text"} className={baseClass} value={String(value)} onChange={(e) => onChange(e.target.value)} />;
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium">
        {field.label}{field.required && <span className="text-red-500"> *</span>}
      </label>
      {field.help && <p className="text-xs text-gray-500 mt-1">{field.help}</p>}
      {renderInput()}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function CoGuarantorPanel({
  items, onAdd, onRemove, onUpdate,
}: {
  items: CoGuarantor[];
  onAdd: () => void;
  onRemove: (idx: number) => void;
  onUpdate: (idx: number, key: keyof CoGuarantor, value: string) => void;
}) {
  return (
    <div className="mt-6 p-4 border rounded bg-gray-50">
      <h3 className="font-semibold">Co-guarantors</h3>
      <p className="text-xs text-gray-600 mt-1">
        Add any other individuals who are co-guarantors on this loan (Canada only). Our team will contact you to complete the co-guarantor intake separately.
      </p>
      {items.length === 0 && <div className="text-sm text-gray-500 mt-3">No co-guarantors added yet.</div>}
      {items.map((cg, idx) => (
        <div key={idx} className="mt-4 p-3 border rounded bg-white">
          <div className="flex justify-between items-center mb-2">
            <strong>Co-guarantor #{idx + 1}</strong>
            <button onClick={() => onRemove(idx)} className="text-red-500 text-sm">Remove</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input className="border p-2 rounded" placeholder="First name *" value={cg.first_name} onChange={(e) => onUpdate(idx, "first_name", e.target.value)} />
            <input className="border p-2 rounded" placeholder="Last name *"  value={cg.last_name}  onChange={(e) => onUpdate(idx, "last_name", e.target.value)} />
            <input className="border p-2 rounded" type="email" placeholder="Email *" value={cg.email} onChange={(e) => onUpdate(idx, "email", e.target.value)} />
            <input className="border p-2 rounded" type="date"  placeholder="Date of birth *" value={cg.date_of_birth} onChange={(e) => onUpdate(idx, "date_of_birth", e.target.value)} />
            <input className="border p-2 rounded" type="tel"   placeholder="Phone *" value={cg.phone}    onChange={(e) => onUpdate(idx, "phone", e.target.value)} />
            <input className="border p-2 rounded" placeholder="Address *"   value={cg.address}    onChange={(e) => onUpdate(idx, "address", e.target.value)} />
            <input className="border p-2 rounded" placeholder="City *"      value={cg.city}       onChange={(e) => onUpdate(idx, "city", e.target.value)} />
            <select className="border p-2 rounded" value={cg.province} onChange={(e) => onUpdate(idx, "province", e.target.value)}>
              <option value="">Province *</option>
              {PROVINCES_NO_QC.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
            <input className="border p-2 rounded" placeholder="Postal code *" value={cg.postal_code} onChange={(e) => onUpdate(idx, "postal_code", e.target.value)} />
            <select className="border p-2 rounded" value={cg.relationship} onChange={(e) => onUpdate(idx, "relationship", e.target.value)}>
              {RELATIONSHIPS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
        </div>
      ))}
      <button onClick={onAdd} className="mt-3 text-blue-600 underline text-sm">+ Add another co-guarantor</button>
    </div>
  );
}
