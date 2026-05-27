// BI_WEBSITE_BLOCK_v337_PUBLIC_APP_RESCUE_v1
// All helper components live at MODULE LEVEL to fix the 1-char-per-field
// bug (nested-component remounting on every state change).
// Step-1 CORE Score fields are NOT asked again in Step 2.
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { CoreBadge } from "../components/CoreBadge";

// ---------- Constants ----------

const PROVINCES_NO_QC = [
  { value: "AB", label: "Alberta" }, { value: "BC", label: "British Columbia" },
  { value: "MB", label: "Manitoba" }, { value: "NB", label: "New Brunswick" },
  { value: "NL", label: "Newfoundland and Labrador" }, { value: "NS", label: "Nova Scotia" },
  { value: "NT", label: "Northwest Territories" }, { value: "NU", label: "Nunavut" },
  { value: "ON", label: "Ontario" }, { value: "PE", label: "Prince Edward Island" },
  { value: "SK", label: "Saskatchewan" }, { value: "YT", label: "Yukon" },
];
const ELIGIBLE_LOAN_TYPES = ["Commercial Mortgage", "Other Secured Loan"];
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
const ID_TYPES = ["Passport", "National ID", "Driving Licence", "Other"];

const LOAN_AMOUNT_MIN = 50_000;
const LOAN_AMOUNT_MAX = 1_000_000;
const PGI_COVERAGE_RATIO = 0.80; // v337: pgi_limit cannot exceed 80% of loan_amount.

const INPUT_CLS = "w-full bg-sky-500/15 border border-sky-300/40 text-white placeholder:text-sky-100/50 rounded px-3 py-2 focus:outline-none focus:border-sky-300";
const LABEL_CLS = "block text-xs font-medium text-sky-100 mb-1";
const HELP_CLS = "text-xs text-sky-200/70 mt-1";
const ERROR_CLS = "text-xs text-rose-300 mt-1";
const SECTION_H_CLS = "text-lg font-semibold text-sky-100 mt-6 mb-2 border-b border-sky-300/30 pb-1";
const POSTAL_RE = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;

// ---------- Types ----------

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

// ---------- Module-level helpers (the 1-char bug fix) ----------

function TextField({ label, value, onChange, type = "text", placeholder, help, error }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; help?: string; error?: string;
}) {
  return (
    <div>
      <label className={LABEL_CLS}>{label}</label>
      <input type={type} className={INPUT_CLS} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      {help && <p className={HELP_CLS}>{help}</p>}
      {error && <p className={ERROR_CLS}>{error}</p>}
    </div>
  );
}

function SelectField({ label, value, onChange, options, help, error }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; help?: string; error?: string;
}) {
  return (
    <div>
      <label className={LABEL_CLS}>{label}</label>
      <select className={INPUT_CLS} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select…</option>
        {options.map((o) => <option key={o.value} value={o.value} className="text-slate-900">{o.label}</option>)}
      </select>
      {help && <p className={HELP_CLS}>{help}</p>}
      {error && <p className={ERROR_CLS}>{error}</p>}
    </div>
  );
}

function DateField({ label, value, onChange, withTodayButton, error }: {
  label: string; value: string; onChange: (v: string) => void;
  withTodayButton?: boolean; error?: string;
}) {
  return (
    <div>
      <label className={LABEL_CLS}>{label}</label>
      <div className="flex gap-2">
        <input type="date" className={INPUT_CLS} value={value} onChange={(e) => onChange(e.target.value)} />
        {withTodayButton && (
          <button type="button" className="whitespace-nowrap px-3 py-2 text-xs bg-sky-400/20 border border-sky-300/40 text-sky-100 rounded hover:bg-sky-400/30"
                  onClick={() => onChange(new Date().toISOString().slice(0, 10))} title="Fill with today's date">
            Use today
          </button>
        )}
      </div>
      {error && <p className={ERROR_CLS}>{error}</p>}
    </div>
  );
}

function AddressFieldGroup({ label, value, onChange, error }: {
  label: string; value: AddressState; onChange: (next: AddressState) => void; error?: string;
}) {
  const addr = value || blankAddress;
  return (
    <div className="md:col-span-2 p-3 rounded border border-sky-300/30 bg-sky-500/5">
      <div className="text-sm font-semibold text-sky-100 mb-2">{label}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div>
          <label className={LABEL_CLS}>Street address</label>
          <input className={INPUT_CLS} value={addr.line1} placeholder="123 King Street West" onChange={(e) => onChange({ ...addr, line1: e.target.value })} />
        </div>
        <div>
          <label className={LABEL_CLS}>City</label>
          <input className={INPUT_CLS} value={addr.city} onChange={(e) => onChange({ ...addr, city: e.target.value })} />
        </div>
        <div>
          <label className={LABEL_CLS}>Province</label>
          <select className={INPUT_CLS} value={addr.province} onChange={(e) => onChange({ ...addr, province: e.target.value })}>
            <option value="">Select…</option>
            {PROVINCES_NO_QC.map((p) => <option key={p.value} value={p.value} className="text-slate-900">{p.label}</option>)}
          </select>
        </div>
        <div>
          <label className={LABEL_CLS}>Postal code</label>
          <input className={INPUT_CLS} value={addr.postal_code} placeholder="A1A 1A1" onChange={(e) => onChange({ ...addr, postal_code: e.target.value })} />
        </div>
      </div>
      {error && <p className={ERROR_CLS}>{error}</p>}
    </div>
  );
}

function YesNoButtons({ name, value, onChange }: { name: string; value: boolean | null; onChange: (v: boolean) => void }) {
  return (
    <div className="flex gap-2" role="radiogroup" aria-label={name}>
      <button type="button"
              className={`flex-1 px-4 py-2 rounded border text-sm transition ${value === false ? "bg-sky-500 text-white border-sky-400" : "bg-sky-500/10 text-sky-100 border-sky-300/40 hover:bg-sky-500/20"}`}
              onClick={() => onChange(false)}>No</button>
      <button type="button"
              className={`flex-1 px-4 py-2 rounded border text-sm transition ${value === true ? "bg-sky-500 text-white border-sky-400" : "bg-sky-500/10 text-sky-100 border-sky-300/40 hover:bg-sky-500/20"}`}
              onClick={() => onChange(true)}>Yes</button>
    </div>
  );
}
// Declarations store as "yes"/"no" strings (not booleans) per carrier schema.
function YesNoStr({ name, value, onChange }: { name: string; value: string; onChange: (v: "yes" | "no") => void }) {
  return (
    <div className="flex gap-2" role="radiogroup" aria-label={name}>
      <button type="button"
              className={`flex-1 px-4 py-2 rounded border text-sm transition ${value === "no" ? "bg-sky-500 text-white border-sky-400" : "bg-sky-500/10 text-sky-100 border-sky-300/40 hover:bg-sky-500/20"}`}
              onClick={() => onChange("no")}>No</button>
      <button type="button"
              className={`flex-1 px-4 py-2 rounded border text-sm transition ${value === "yes" ? "bg-sky-500 text-white border-sky-400" : "bg-sky-500/10 text-sky-100 border-sky-300/40 hover:bg-sky-500/20"}`}
              onClick={() => onChange("yes")}>Yes</button>
    </div>
  );
}
function AgreeButtons({ name, value, onChange }: { name: string; value: string; onChange: (v: "Agree" | "Disagree") => void }) {
  return (
    <div className="flex gap-2" role="radiogroup" aria-label={name}>
      <button type="button"
              className={`flex-1 px-4 py-2 rounded border text-sm transition ${value === "Agree" ? "bg-sky-500 text-white border-sky-400" : "bg-sky-500/10 text-sky-100 border-sky-300/40 hover:bg-sky-500/20"}`}
              onClick={() => onChange("Agree")}>Agree</button>
      <button type="button"
              className={`flex-1 px-4 py-2 rounded border text-sm transition ${value === "Disagree" ? "bg-sky-500 text-white border-sky-400" : "bg-sky-500/10 text-sky-100 border-sky-300/40 hover:bg-sky-500/20"}`}
              onClick={() => onChange("Disagree")}>Disagree</button>
    </div>
  );
}

// Declarations array — order matches carrier schema. `adverse` marks which answer triggers a _reason field.
const DECLARATIONS: { k: string; label: string; adverse: "yes" | null }[] = [
  { k: "section_1_a", label: "Does the business carry insurance coverage for all physical assets covered by the personal guarantee?", adverse: null },
  { k: "section_1_2", label: "Have you ever declared personal bankruptcy?", adverse: "yes" },
  { k: "section_2_a", label: "Have you ever been barred from serving as a Director, or are you currently under investigation that could result in being barred?", adverse: "yes" },
  { k: "section_2_b", label: "Have you ever been a Director of a company that has gone through bankruptcy, receivership, or restructuring proceedings?", adverse: "yes" },
  { k: "section_2_c", label: "Have you ever been a Director of a company that has been under investigation by the Canada Revenue Agency or the Canada Border Services Agency?", adverse: "yes" },
  { k: "section_2_d", label: "Do you currently have any actual or contingent liability that you will not be able to pay within 30 days of when it becomes due?", adverse: "yes" },
  { k: "section_3_a", label: "Does the business currently have any bad or doubtful debts owed to it that are likely to materially affect its ability to pay liabilities as they become due?", adverse: "yes" },
  { k: "section_4_a", label: "Has the business lost a significant investor, customer, or supplier in the last 6 months?", adverse: "yes" },
  { k: "section_5_a", label: "Are you aware of any information that could materially affect the business's ability to meet its obligations over the next 6 months?", adverse: "yes" },
  { k: "section_6_a", label: "As of today, is the company solvent (able to pay its debts as they become due)?", adverse: null },
];

const CONSENTS = [
  { k: "electronic_signature",  label: "Do you consent to electronic signatures?" },
  { k: "no_undisclosed_events", label: "Do you certify there are no undisclosed adverse events?" },
  { k: "data_use",              label: "Do you consent to our use of your data for underwriting?" },
  { k: "credit_pull",           label: "Do you authorize us to pull your credit report?" },
  { k: "coverage_understood",   label: "Do you understand what PGI covers and does not cover?" },
];

// BI_WEBSITE_BLOCK_v347_LAUNCH_BLOCKERS_v1
// Server error code/field → human label. Used by humanizeSubmitError so the
// red banner says "Please confirm the solvency declaration" instead of
// "missing_consents".
const FIELD_LABELS: Record<string, string> = {
  info_accurate: "the truthfulness declaration (\"I confirm answers are true\")",
  business_solvent: "the solvency declaration (\"Is the company solvent?\")",
  electronic_signature: "the electronic signature consent",
  no_undisclosed_events: "the no-undisclosed-events consent",
  data_use: "the data-use consent",
  credit_pull: "the credit-report authorization",
  coverage_understood: "the PGI coverage acknowledgement",
  section_3_c: "the truthfulness declaration",
  section_6_a: "the solvency declaration",
};

function formatStartedDate(v: unknown): string {
  if (!v) return "—";
  const s = String(v);
  // Accept either "YYYY-MM-DD" or full ISO datetime.
  const d = new Date(s.length === 10 ? `${s}T00:00:00Z` : s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric", timeZone: "UTC" });
}

function humanizeSubmitError(payload: any): string {
  if (!payload) return "Submit failed";
  const code: string = String(payload.error ?? payload.message ?? "Submit failed");
  const arr: string[] = Array.isArray(payload.fields)
    ? payload.fields
    : Array.isArray(payload.missing)
    ? payload.missing
    : [];
  const labels = arr.map((k) => FIELD_LABELS[k] ?? k);
  if (code === "missing_consents") {
    return labels.length
      ? `Please confirm: ${labels.join("; ")}.`
      : "Please confirm the declarations and consents at the bottom of the form.";
  }
  if (code === "missing_fields") {
    return labels.length
      ? `Please complete: ${labels.join("; ")}.`
      : "Some required fields are missing.";
  }
  if (code === "validation") {
    return labels.length
      ? `Please complete: ${labels.join("; ")}.`
      : "Some required fields are missing.";
  }
  if (code === "quebec_blocked") return "PGI does not currently write business in Quebec.";
  if (code === "loan_amount_over_cap") return "Loan amount exceeds the $1,000,000 maximum.";
  if (code === "pgi_limit_over_cap") return "PGI limit exceeds the $1,000,000 maximum.";
  if (code === "pgi_limit_over_loan") return "PGI limit cannot exceed loan amount.";
  if (code === "loan_type_ineligible") return "The selected loan type is not eligible for Canadian PGI coverage.";
  return code;
}


// ---------- Component ----------

export default function Application() {
  const { publicId } = useParams<{ publicId: string }>();
  const nav = useNavigate();

  const [state, setState] = useState<Record<string, any>>({
    guarantor_address: blankAddress,
    business_address: blankAddress,
    declarations: {},
    consents: {},
    co_guarantors: [] as CoGuarantor[],
    country: "Canada", // v337: pre-filled (Canada-only carrier)
    q_ca_id_type: "",
    q_ca_id_number: "",
  });
  const [serverFieldErrors, setServerFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ---- Load on mount ----
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
        const naicsAlias = app.naics_code || app.naics || app.q25_naics_code || "";

        setState((prev) => ({
          ...prev,
          ...app,
          country: app.country || "Canada",
          naics_code: naicsAlias,
          guarantor_address: normAddr(app.guarantor_address),
          business_address: normAddr(app.business_address),
          declarations: app.declarations || {},
          consents: app.consents || {},
          co_guarantors: Array.isArray(app.co_guarantors) ? app.co_guarantors : [],
          q_ca_id_type: app.q_ca_id_type || "",
          q_ca_id_number: app.q_ca_id_number || "",
        }));

        // Phone pre-fill — v352 server change ensures pending.phone is present.
        if (!app.guarantor_phone) {
          try {
            const pending: any = await api.getMyPendingApplication();
            const phone = pending?.phone;
            if (typeof phone === "string" && phone.trim()) {
              setState((prev) => ({ ...prev, guarantor_phone: phone }));
            }
          } catch { /* non-blocking */ }
        }
      } catch (e) {
        console.warn("[v337] failed to load application:", (e as Error).message);
      }
    })();
  }, [publicId]);

  // ---- Setters ----
  function update(k: string, v: any) {
    setState((s) => ({ ...s, [k]: v }));
    if (serverFieldErrors[k]) setServerFieldErrors((e) => { const n = { ...e }; delete n[k]; return n; });
  }
  function updateDecl(k: string, v: any) {
    setState((s) => ({ ...s, declarations: { ...(s.declarations || {}), [k]: v } }));
  }
  function updateConsent(k: string, v: boolean) {
    setState((s) => ({ ...s, consents: { ...(s.consents || {}), [k]: v } }));
  }
  function updateCG(idx: number, k: keyof CoGuarantor, v: string) {
    setState((s) => {
      const list = [...(s.co_guarantors || [])];
      list[idx] = { ...list[idx], [k]: v };
      return { ...s, co_guarantors: list };
    });
  }

  // ---- Save / Submit ----
  async function handleSave() {
    if (!publicId) return;
    setError(null);
    try { await api.patchApp(publicId, state); } catch { setError("Save failed"); }
  }

  // BI_WEBSITE_BLOCK_v345_AUTOSAVE_v1
  // Debounced autosave. Same pattern as Score.tsx. Triggers ~1.5s after
  // the last edit so users don't lose data on tab close.
  // Skips the initial mount (state is still being hydrated from server).
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const isHydratedRef = useRef(false);
  useEffect(() => {
    // Wait for first hydration: state.guarantor_name (or anything from the row)
    // appears once `getApp` resolves. Until then, don't fire saves.
    if (!isHydratedRef.current) {
      if (state.guarantor_name || state.business_name || state.country) {
        isHydratedRef.current = true;
      }
      return;
    }
    if (!publicId) return;
    const t = setTimeout(() => {
      api.patchApp(publicId, state)
        .then(() => setSavedAt(Date.now()))
        .catch(() => { /* swallow — manual Save button still works */ });
    }, 1500);
    return () => clearTimeout(t);
  }, [publicId, state]);

  async function handleSubmit() {
    if (!publicId) return;
    setError(null);
    setServerFieldErrors({});
    setSubmitting(true);
    try {
      const loan = Number(state.loan_amount) || 0;
      const limit = Number(state.pgi_limit) || 0;
      const local: Record<string, string> = {};
      if (loan && loan < LOAN_AMOUNT_MIN) local.loan_amount = `Loan amount is below the $50,000 minimum.`;
      if (loan > LOAN_AMOUNT_MAX) local.loan_amount = `Loan amount exceeds the $1,000,000 maximum.`;
      if (limit && loan && limit > loan * PGI_COVERAGE_RATIO) {
        local.pgi_limit = `PGI limit cannot exceed 80% of loan amount (max $${Math.floor(loan * PGI_COVERAGE_RATIO).toLocaleString()}).`;
      }
      const ga = state.guarantor_address || blankAddress;
      const ba = state.business_address || blankAddress;
      if (ga.postal_code && !POSTAL_RE.test(ga.postal_code)) local["guarantor_address.postal_code"] = "Format A1A 1A1 expected.";
      if (ba.postal_code && !POSTAL_RE.test(ba.postal_code)) local["business_address.postal_code"] = "Format A1A 1A1 expected.";
      if (String(ba.province || "").toUpperCase() === "QC") local["business_address.province"] = "PGI does not currently write business in Quebec.";
      if (Object.keys(local).length > 0) { setServerFieldErrors(local); return; }

      const payload = { ...state, has_co_guarantors: (state.co_guarantors || []).length > 0 };
      await api.patchApp(publicId, payload);
      const r: any = await api.submit(publicId);
      if (r?.ok) nav(`/applications/${publicId}/documents`);
      else if (r?.errors) setServerFieldErrors(r.errors);
      else setError(humanizeSubmitError(r));
    } catch (e: any) {
      const data = e?.data;
      if (data?.errors) setServerFieldErrors(data.errors);
      else setError(humanizeSubmitError(data ?? { error: e?.message }));
    } finally {
      setSubmitting(false);
    }
  }

  function openBnLookup() {
    const name = encodeURIComponent(String(state.business_name || "").trim());
    window.open(`https://www.ised-isde.canada.ca/cc/lgcy/fdrlCrpSrch.html?V_TOKEN=1&crpNm=${name}&V_SEARCH.command=navigate`, "bn_lookup", "width=900,height=700,noopener,noreferrer");
  }

  const fieldErr = (k: string) => serverFieldErrors[k];
  const loanNum = Number(state.loan_amount) || 0;
  const pgiNum = Number(state.pgi_limit) || 0;
  const maxAllowedPgi = Math.floor(loanNum * PGI_COVERAGE_RATIO);

  // ---- Render ----
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl text-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Personal Guarantee Application</h1>
        <CoreBadge />
      </div>

      {/* Read-only CORE Score summary — fields not re-asked in Step 2 (v337). */}
      <div className="mb-6 p-3 rounded border border-sky-300/30 bg-sky-500/5">
        <div className="text-xs uppercase tracking-wider text-sky-300/70 mb-2">From your CORE Score</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div><div className="text-sky-200/70 text-xs">Loan</div><div>${loanNum.toLocaleString()}</div></div>
          <div><div className="text-sky-200/70 text-xs">PGI limit</div><div>${pgiNum.toLocaleString()} <span className="text-sky-200/60 text-xs">(max ${maxAllowedPgi.toLocaleString()} at 80%)</span></div></div>
          <div><div className="text-sky-200/70 text-xs">NAICS</div><div>{state.naics_code || "—"}</div></div>
          <div><div className="text-sky-200/70 text-xs">Started</div><div>{formatStartedDate(state.formation_date)}</div></div>
        </div>
      </div>

      {/* Personal Guarantor */}
      <h2 className={SECTION_H_CLS}>Personal Guarantor</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <TextField label="Personal Guarantor's Full Legal Name *" value={String(state.guarantor_name || "")} onChange={(v) => update("guarantor_name", v)} error={fieldErr("guarantor_name")} />
        <DateField label="What is your date of birth? *" value={String(state.guarantor_dob || "")} onChange={(v) => update("guarantor_dob", v)} error={fieldErr("guarantor_dob")} />
        <AddressFieldGroup label="Primary residential address *" value={state.guarantor_address || blankAddress} onChange={(v) => update("guarantor_address", v)} error={fieldErr("guarantor_address.postal_code")} />
        <TextField label="What is your email address? *" type="email" value={String(state.guarantor_email || "")} onChange={(v) => update("guarantor_email", v)} error={fieldErr("guarantor_email")} />
        <TextField label="What is your phone number? * (pre-filled from your OTP verification)" type="tel" value={String(state.guarantor_phone || "")} onChange={(v) => update("guarantor_phone", v)} error={fieldErr("guarantor_phone")} />
      </div>

      {/* Government ID */}
      <h2 className={SECTION_H_CLS}>Government ID</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <SelectField label="Government ID type *" value={String(state.q_ca_id_type || "")} onChange={(v) => update("q_ca_id_type", v)} options={ID_TYPES.map((t) => ({ value: t, label: t }))} help="As shown on your photo ID (used for KYC by PGI)." error={fieldErr("q_ca_id_type")} />
        <TextField label="Government ID number *" value={String(state.q_ca_id_number || "")} onChange={(v) => update("q_ca_id_number", v)} placeholder="Exactly as shown on the document" help="The identifier on the government ID (passport number, driver's licence number, etc.)." error={fieldErr("q_ca_id_number")} />
      </div>

      {/* Co-guarantors */}
      <div className="mb-6 p-4 rounded border border-sky-300/30 bg-sky-500/5">
        <h3 className="text-sm font-semibold text-sky-100">Co-guarantors (optional)</h3>
        <p className="text-xs text-sky-200/70 mt-1 mb-3">Add any other individuals who are co-guarantors on this loan (Canada only). Our team will contact you to complete the co-guarantor intake separately.</p>
        {(state.co_guarantors || []).length === 0 && <div className="text-sm text-sky-200/70">No co-guarantors added yet.</div>}
        {(state.co_guarantors as CoGuarantor[] || []).map((cg, idx) => (
          <div key={idx} className="mt-3 p-3 rounded bg-sky-500/10 border border-sky-300/20">
            <div className="flex justify-between items-center mb-2">
              <strong className="text-sm">Co-guarantor #{idx + 1}</strong>
              <button type="button" onClick={() => setState((s) => ({ ...s, co_guarantors: (s.co_guarantors || []).filter((_: any, i: number) => i !== idx) }))} className="text-rose-300 text-xs hover:text-rose-200">Remove</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input className={INPUT_CLS} placeholder="First name *"   value={cg.first_name}    onChange={(e) => updateCG(idx, "first_name", e.target.value)} />
              <input className={INPUT_CLS} placeholder="Last name *"    value={cg.last_name}     onChange={(e) => updateCG(idx, "last_name", e.target.value)} />
              <input className={INPUT_CLS} placeholder="Email *" type="email" value={cg.email}   onChange={(e) => updateCG(idx, "email", e.target.value)} />
              <input className={INPUT_CLS} placeholder="DOB *"   type="date"  value={cg.date_of_birth} onChange={(e) => updateCG(idx, "date_of_birth", e.target.value)} />
              <input className={INPUT_CLS} placeholder="Phone *" type="tel"   value={cg.phone}    onChange={(e) => updateCG(idx, "phone", e.target.value)} />
              <input className={INPUT_CLS} placeholder="Address *"      value={cg.address}        onChange={(e) => updateCG(idx, "address", e.target.value)} />
              <input className={INPUT_CLS} placeholder="City *"         value={cg.city}           onChange={(e) => updateCG(idx, "city", e.target.value)} />
              <select className={INPUT_CLS} value={cg.province} onChange={(e) => updateCG(idx, "province", e.target.value)}>
                <option value="">Province *</option>
                {PROVINCES_NO_QC.map((p) => <option key={p.value} value={p.value} className="text-slate-900">{p.label}</option>)}
              </select>
              <input className={INPUT_CLS} placeholder="Postal code *"  value={cg.postal_code}    onChange={(e) => updateCG(idx, "postal_code", e.target.value)} />
              <select className={INPUT_CLS} value={cg.relationship} onChange={(e) => updateCG(idx, "relationship", e.target.value)}>
                {RELATIONSHIPS.map((r) => <option key={r} value={r} className="text-slate-900">{r}</option>)}
              </select>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => setState((s) => ({ ...s, co_guarantors: [...(s.co_guarantors || []), emptyCoGuarantor()] }))} className="mt-3 text-sky-200 underline text-sm hover:text-sky-100">+ Add another co-guarantor</button>
      </div>

      {/* Business Information (no NAICS, no formation_date, no country — already in CORE Score) */}
      <h2 className={SECTION_H_CLS}>Business Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <TextField label="What is the legal name of the business? *" value={String(state.business_name || "")} onChange={(v) => update("business_name", v)} error={fieldErr("business_name")} />
        <SelectField label="What type of entity is the business?" value={String(state.entity_type || "")} onChange={(v) => update("entity_type", v)} options={["Corporation","Partnership","Sole Proprietorship","LLC","Other"].map((v) => ({ value: v, label: v }))} />
        <AddressFieldGroup label="Business operating address * (Quebec not eligible)" value={state.business_address || blankAddress} onChange={(v) => update("business_address", v)} error={fieldErr("business_address.postal_code") || fieldErr("business_address.province")} />
        <TextField label="Business website (optional)" value={String(state.business_website || "")} onChange={(v) => update("business_website", v)} />
        <div>
          <label className={LABEL_CLS}>Business Number (BN) (optional)</label>
          <div className="flex gap-2">
            <input className={INPUT_CLS} value={String(state.business_number || "")} onChange={(e) => update("business_number", e.target.value)} placeholder="123456789RT0001" />
            <button type="button" onClick={openBnLookup} className="whitespace-nowrap px-3 py-2 text-xs bg-sky-400/20 border border-sky-300/40 text-sky-100 rounded hover:bg-sky-400/30">Look up by name</button>
          </div>
          <p className={HELP_CLS}>Don't know your BN? The button opens the federal Canada Business Registries search.</p>
        </div>
      </div>

      {/* Loan Details — only fields NOT in Stage 1 CORE Score */}
      <h2 className={SECTION_H_CLS}>Loan Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <TextField label="Who is the lender? *" value={String(state.lender_name || "")} onChange={(v) => update("lender_name", v)} error={fieldErr("lender_name")} />
        <SelectField label="What type of loan is this? *" value={String(state.q_ca_loan_type || "")} onChange={(v) => update("q_ca_loan_type", v)} options={ELIGIBLE_LOAN_TYPES.map((t) => ({ value: t, label: t }))} help="Only Commercial Mortgage and Other Secured Loan are eligible." />
        <DateField label="What is the loan funding date? *" value={String(state.loan_funding_date || "")} onChange={(v) => update("loan_funding_date", v)} withTodayButton />
        <DateField label="What date do you need this policy to start? *" value={String(state.policy_start_date || "")} onChange={(v) => update("policy_start_date", v)} withTodayButton />
        <SelectField label="What is the purpose of the loan? *" value={String(state.loan_purpose || "")} onChange={(v) => update("loan_purpose", v)} options={LOAN_PURPOSES} help="Internal records only. Does not affect carrier eligibility." />
        <div>
          <label className={LABEL_CLS}>Is this a CSBFP backed loan?</label>
          <YesNoButtons name="csbfp_backed" value={typeof state.csbfp_backed === "boolean" ? state.csbfp_backed : null} onChange={(v) => update("csbfp_backed", v)} />
        </div>
        <div>
          <label className={LABEL_CLS}>Does this loan have a guaranteed cap amount?</label>
          <YesNoButtons name="loan_has_guaranteed_cap" value={typeof state.loan_has_guaranteed_cap === "boolean" ? state.loan_has_guaranteed_cap : null} onChange={(v) => update("loan_has_guaranteed_cap", v)} />
        </div>
        <div>
          <label className={LABEL_CLS}>Are you personally guaranteeing this loan? *</label>
          <YesNoButtons name="personally_guaranteeing" value={typeof state.personally_guaranteeing === "boolean" ? state.personally_guaranteeing : null} onChange={(v) => update("personally_guaranteeing", v)} />
        </div>
      </div>

      {/* Declarations — Yes/No buttons (v337) */}
      <h2 className={SECTION_H_CLS}>Declarations</h2>
      <p className="text-xs text-sky-200/70 mb-3">All 11 declarations must be answered. Any "yes" answer requires a brief explanation.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {DECLARATIONS.map(({ k, label, adverse }) => {
          const val = String(state.declarations?.[k] || "");
          const showReason = !!adverse && val === adverse;
          return (
            <div key={k} className={`p-2 rounded bg-sky-500/5 border border-sky-300/20 ${showReason ? "md:col-span-2" : ""}`}>
              <label className="text-sm text-sky-100 block mb-2">{label}</label>
              <YesNoStr name={k} value={val} onChange={(v) => updateDecl(k, v)} />
              {showReason && (
                <textarea className={`${INPUT_CLS} mt-2`} rows={2} placeholder="Please explain…" value={String(state.declarations?.[`${k}_reason`] || "")} onChange={(e) => updateDecl(`${k}_reason`, e.target.value)} />
              )}
            </div>
          );
        })}
        <div className="md:col-span-2 p-2 rounded bg-sky-500/5 border border-sky-300/40 mt-2">
          <label className="text-sm text-sky-100 block mb-2">I confirm that all answers above are true to the best of my knowledge. If anyone else completed this form on my behalf, I confirm they were authorized to do so and that their answers are accurate.</label>
          <AgreeButtons name="section_3_c" value={String(state.declarations?.section_3_c || "")} onChange={(v) => updateDecl("section_3_c", v)} />
          {String(state.declarations?.section_3_c) === "Disagree" && (
            <textarea className={`${INPUT_CLS} mt-2`} rows={2} placeholder="Please explain…" value={String(state.declarations?.section_3_c_reason || "")} onChange={(e) => updateDecl("section_3_c_reason", e.target.value)} />
          )}
        </div>
      </div>

      {/* Consents — 5 internal compliance opt-ins */}
      <h2 className={SECTION_H_CLS}>Consents <span className="text-xs font-normal text-sky-200/60">(document uploads happen on the next step)</span></h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
        {CONSENTS.map(({ k, label }) => (
          <label key={k} className="flex items-start gap-2 p-2 rounded bg-sky-500/5 border border-sky-300/20 cursor-pointer">
            <input type="checkbox" className="mt-1" checked={!!state.consents?.[k]} onChange={(e) => updateConsent(k, e.target.checked)} />
            <span className="text-sm text-sky-100">{label}</span>
          </label>
        ))}
      </div>

      {error && <div className="text-rose-300 mb-3" role="alert">{error}</div>}

      <div className="flex gap-3 mt-6 items-center">
        <button type="button" onClick={handleSave} className="px-6 py-2 border border-sky-300/50 rounded text-sky-100 hover:bg-sky-500/20">Save</button>
        <button type="button" onClick={handleSubmit} disabled={submitting} className="px-6 py-2 bg-sky-500 text-white rounded disabled:opacity-50 hover:bg-sky-400">{submitting ? "Submitting…" : "Submit"}</button>
        {savedAt && <span className="text-xs text-sky-200/70">✓ Saved {new Date(savedAt).toLocaleTimeString()}</span>}
      </div>
    </div>
  );
}
