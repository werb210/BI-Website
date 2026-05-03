// BI_WEBSITE_BLOCK_v3_FULL_FIELD_RENDER_v1
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { CoreBadge } from "../components/CoreBadge";
import { Section } from "../components/Section";
import { UploadAndScrape } from "../components/UploadAndScrape";

type FieldType = "text" | "email" | "phone" | "date" | "currency" | "number" | "boolean" | "select" | "naics";
type FieldDef = { key: string; label: string; type: FieldType; required?: boolean; options?: { value: string; label: string }[]; help?: string };

const SECTIONS: Array<{ title: string; fields: FieldDef[] }> = [
  { title: "Personal Guarantor", fields: [
    { key: "guarantor_name", label: "Full legal name", type: "text", required: true },
    { key: "guarantor_dob", label: "Date of birth", type: "date", required: true },
    { key: "guarantor_address", label: "Address", type: "text", required: true },
    { key: "guarantor_email", label: "Email", type: "email", required: true },
    { key: "guarantor_phone", label: "Phone", type: "phone", required: true },
  ]},
  { title: "Business", fields: [
    { key: "country", label: "Country", type: "select", required: true,
      options: [{ value: "CA", label: "Canada" }] },
    { key: "business_name", label: "Legal business name", type: "text", required: true },
    { key: "business_address", label: "Business address", type: "text", required: true },
    { key: "business_website", label: "Website (optional)", type: "text" },
    { key: "entity_type", label: "Entity type", type: "select", required: true,
      options: ["Corporation","Partnership","Sole Proprietorship","LLC","Other"].map(v=>({value:v,label:v})) },
    { key: "business_number", label: "Business number", type: "text", required: true },
    { key: "naics_code", label: "NAICS code (6 digits)", type: "naics", required: true },
    { key: "formation_date", label: "Date of formation", type: "date", required: true },
  ]},
  { title: "Loan", fields: [
    { key: "loan_amount", label: "Loan amount (CAD)", type: "currency", required: true },
    { key: "pgi_limit", label: "PGI coverage limit (≤80% of loan)", type: "currency", required: true },
    { key: "lender_name", label: "Lender name", type: "text", required: true },
    { key: "loan_funding_date", label: "Loan funding date", type: "date", required: true },
    { key: "loan_purpose", label: "Loan purpose", type: "text", required: true },
    { key: "policy_start_date", label: "Policy start date", type: "date", required: true },
    { key: "csbfp_backed", label: "Is the loan CSBFP-backed?", type: "boolean" },
    { key: "loan_has_guaranteed_cap", label: "Loan has a guaranteed cap?", type: "boolean" },
    { key: "personally_guaranteeing", label: "Personally guaranteeing this loan?", type: "boolean" },
    { key: "has_other_guarantors", label: "Are there other guarantors?", type: "boolean" },
  ]},
  { title: "Financial", fields: [
    { key: "annual_revenue", label: "Annual revenue (CAD)", type: "currency", required: true },
    { key: "ebitda", label: "EBITDA (CAD, must be ≥ $50,000)", type: "currency", required: true },
    { key: "total_debt", label: "Total debt (CAD)", type: "currency", required: true },
    { key: "monthly_debt_service", label: "Monthly debt service (CAD)", type: "currency", required: true },
    { key: "collateral_value", label: "Collateral value (CAD)", type: "currency", required: true },
    { key: "enterprise_value", label: "Enterprise value (CAD)", type: "currency", required: true },
  ]},
  { title: "Risk", fields: [
    { key: "payables_threatening", label: "Any payables threatening collection?", type: "boolean", required: true },
    { key: "upcoming_adverse_events", label: "Any upcoming adverse events?", type: "boolean", required: true },
    { key: "bankruptcy_history", label: "Bankruptcy history?", type: "boolean", required: true },
    { key: "insolvency_history", label: "Insolvency history?", type: "boolean", required: true },
    { key: "judgment_history", label: "Judgment history?", type: "boolean", required: true },
    { key: "personal_investigations", label: "Personal investigations?", type: "boolean", required: true },
    { key: "business_investigations", label: "Business investigations?", type: "boolean", required: true },
    { key: "property_insurance_in_force", label: "Property insurance in force?", type: "boolean", required: true },
    { key: "personal_judgments", label: "Personal judgments outstanding?", type: "boolean", required: true },
    { key: "business_judgments", label: "Business judgments outstanding?", type: "boolean", required: true },
  ]},
  { title: "Consents", fields: [
    { key: "electronic_signature", label: "I consent to electronic signatures.", type: "boolean", required: true },
    { key: "info_accurate", label: "All information provided is accurate.", type: "boolean", required: true },
    { key: "business_solvent", label: "The business is currently solvent.", type: "boolean", required: true },
    { key: "no_undisclosed_events", label: "No material events have been omitted.", type: "boolean", required: true },
    { key: "data_use", label: "I consent to my data being used per the privacy policy.", type: "boolean", required: true },
    { key: "credit_pull", label: "I authorize a credit check.", type: "boolean", required: true },
    { key: "coverage_understood", label: "I understand the PGI coverage terms.", type: "boolean", required: true },
  ]},
];

const TOTAL_FIELDS = SECTIONS.reduce((n, s) => n + s.fields.length, 0);

type State = Record<string, any> & { consents?: Record<string, boolean> };

function isAnswered(field: FieldDef, state: State): boolean {
  const v = field.key in (state.consents ?? {}) && SECTIONS.find(s=>s.title==="Consents")?.fields.includes(field)
    ? state.consents![field.key]
    : state[field.key];
  if (field.type === "boolean") return v === true || v === false;
  if (field.type === "currency" || field.type === "number") return typeof v === "number" || (typeof v === "string" && v.trim() !== "");
  return v !== undefined && v !== null && v !== "";
}

function FieldInput({ field, state, set }: { field: FieldDef; state: State; set: (k:string,v:any,inConsents?:boolean)=>void }) {
  const inConsents = SECTIONS.find(s=>s.title==="Consents")?.fields.includes(field) ?? false;
  const value = inConsents ? state.consents?.[field.key] : state[field.key];

  if (field.type === "boolean") {
    return (
      <label className="bi-field flex items-center gap-2">
        <input type="checkbox" checked={!!value} onChange={(e)=>set(field.key, e.target.checked, inConsents)} />
        <span>{field.label}</span>
      </label>
    );
  }

  if (field.type === "select") {
    return (
      <label className="bi-field"><span>{field.label}{field.required && " *"}</span>
        <select value={value ?? ""} onChange={(e)=>set(field.key, e.target.value)}>
          <option value="" disabled>Select…</option>
          {field.options?.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </label>
    );
  }

  if (field.type === "currency") {
    return (
      <label className="bi-field"><span>{field.label}{field.required && " *"}</span>
        <input type="number" inputMode="decimal" min="0" step="0.01"
               value={value ?? ""} onChange={(e)=>set(field.key, e.target.value === "" ? "" : Number(e.target.value))}
               placeholder="0" />
        {field.help && <small>{field.help}</small>}
      </label>
    );
  }

  if (field.type === "number" || field.type === "naics") {
    return (
      <label className="bi-field"><span>{field.label}{field.required && " *"}</span>
        <input type="text" inputMode="numeric" pattern={field.type === "naics" ? "[0-9]{6}" : "[0-9]*"}
               maxLength={field.type === "naics" ? 6 : undefined}
               value={value ?? ""} onChange={(e)=>set(field.key, e.target.value.replace(/[^0-9]/g, ""))} />
      </label>
    );
  }

  if (field.type === "date") {
    return (
      <label className="bi-field"><span>{field.label}{field.required && " *"}</span>
        <input type="date" value={value ?? ""} onChange={(e)=>set(field.key, e.target.value)} />
      </label>
    );
  }

  if (field.type === "phone") {
    return (
      <label className="bi-field"><span>{field.label}{field.required && " *"}</span>
        <input type="tel" value={value ?? ""} onChange={(e)=>set(field.key, e.target.value)} placeholder="+1 555 555 5555" />
      </label>
    );
  }

  return (
    <label className="bi-field"><span>{field.label}{field.required && " *"}</span>
      <input type={field.type === "email" ? "email" : "text"}
             value={value ?? ""} onChange={(e)=>set(field.key, e.target.value)} />
    </label>
  );
}

export default function Application() {
  const { publicId } = useParams<{ publicId: string }>();
  const nav = useNavigate();
  const [s, setS] = useState<State>({ consents: {} });
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [missing, setMissing] = useState<string[]>([]);

  useEffect(() => {
    api.getApp(publicId!).then((r) => {
      if (r.application.score_decision !== "approve") { nav("/"); return; }
      setS({ consents: {}, ...r.application });
      setLoaded(true);
    }).catch((e) => setErr(e?.message ?? "Failed to load application"));
  }, [nav, publicId]);

  function set(k: string, v: any, inConsents = false) {
    setS((p) => inConsents
      ? { ...p, consents: { ...(p.consents ?? {}), [k]: v } }
      : { ...p, [k]: v });
  }

  const answered = useMemo(
    () => SECTIONS.reduce((n, sec) => n + sec.fields.filter((f) => isAnswered(f, s)).length, 0),
    [s]
  );

  async function saveDraft() {
    setBusy(true); setErr(null);
    try { await api.patchApp(publicId!, s); }
    catch (ex: any) { setErr(ex.message ?? "Save failed"); }
    finally { setBusy(false); }
  }

  async function submit() {
    setBusy(true); setErr(null); setMissing([]);
    try {
      await api.patchApp(publicId!, s);
      await api.submit(publicId!);
      nav(`/applications/${publicId}/thanks`);
    } catch (ex: any) {
      if (ex?.data?.fields?.length) {
        setMissing(ex.data.fields);
        setErr(`Please complete: ${ex.data.fields.join(", ")}`);
      } else {
        setErr(ex.message ?? "Could not submit");
      }
    } finally { setBusy(false); }
  }

  if (!loaded) return <div className="bi-card">Loading…</div>;

  return <div className="bi-app-wrap">
    <div className="bi-card">
      <div className="flex items-center justify-between gap-3">
        <h1>Application Form</h1>
        <CoreBadge decision={s.score_decision} score={s.score} />
      </div>
      <p>{answered}/{TOTAL_FIELDS} answered</p>
      <UploadAndScrape publicId={publicId!} onApply={(merged) => setS((p: State) => ({ ...p, ...merged }))} />
      {err && <div className="form-error">{err}</div>}
      {SECTIONS.map((sec) => {
        const a = sec.fields.filter((f) => isAnswered(f, s)).length;
        return (
          <Section key={sec.title} title={sec.title} answered={a} total={sec.fields.length} defaultOpen>
            <div className="grid gap-3 md:grid-cols-2">
              {sec.fields.map((f) => <FieldInput key={f.key} field={f} state={s} set={set} />)}
            </div>
          </Section>
        );
      })}
      <div className="mt-6 flex gap-3">
        <button className="secondary" disabled={busy} onClick={saveDraft}>Save Draft</button>
        <button className="primary" disabled={busy} onClick={submit}>{busy ? "Submitting…" : "Submit"}</button>
      </div>
    </div>
  </div>;
}
