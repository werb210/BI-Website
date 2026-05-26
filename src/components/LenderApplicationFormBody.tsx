import React, { useMemo } from "react";
import {
  ACCEPT_PARTNER_DOCS,
  AgreeRadio,
  docSlotsFor,
  ELIGIBLE_LOAN_TYPES,
  emptyCoGuarantor,
  Field,
  INPUT,
  LBL,
  LenderFormState,
  PROVINCES_NO_QC,
  RELATIONSHIPS,
  SECTION_H,
  TextIn,
  YesNoRadio,
  type DeclarationsState,
  type YN,
} from "./lenderFormShared";

const DECLARATIONS_WITH_REASON: { k: keyof DeclarationsState; label: string; needsReason: boolean }[] = [
  { k: "section_1_a", label: "Does the business carry insurance coverage for all physical assets covered by the personal guarantee?", needsReason: false },
  { k: "section_1_2", label: "Have you ever declared personal bankruptcy?", needsReason: true },
  { k: "section_2_a", label: "Have you ever been barred from serving as a Director, or are you under investigation that could result in being barred?", needsReason: true },
  { k: "section_2_b", label: "Have you ever been a Director of a company that has gone through bankruptcy, receivership, or restructuring proceedings?", needsReason: true },
  { k: "section_2_c", label: "Have you ever been a Director of a company under investigation by the Canada Revenue Agency or Canada Border Services Agency?", needsReason: true },
  { k: "section_2_d", label: "Do you currently have any actual or contingent liability you will not be able to pay within 30 days?", needsReason: true },
  { k: "section_3_a", label: "Does the business currently have any bad or doubtful debts owed to it that materially affect its ability to pay liabilities?", needsReason: true },
  { k: "section_4_a", label: "Has the business lost a significant investor, customer, or supplier in the last 6 months?", needsReason: true },
  { k: "section_5_a", label: "Are you aware of any information that could materially affect the business's obligations over the next 6 months?", needsReason: true },
  { k: "section_6_a", label: "As of today, is the company solvent (able to pay its debts as they become due)?", needsReason: false },
];

export type LenderApplicationFormBodyProps = {
  f: LenderFormState;
  set: <K extends keyof LenderFormState>(k: K, v: LenderFormState[K]) => void;
  files: Record<string, File | { name: string; size: number } | undefined>;
  onPickFile: (slot: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  isDemoMode?: boolean;
};

export function LenderApplicationFormBody({ f, set, files, onPickFile, isDemoMode }: LenderApplicationFormBodyProps) {
  const setDecl = (d: DeclarationsState) => set("declarations", d);
  const docSlots = useMemo(() => docSlotsFor(f.business_start_date), [f.business_start_date]);

  const isStartup = (() => {
    if (!f.business_start_date) return false;
    const dt = new Date(f.business_start_date);
    if (isNaN(dt.getTime())) return false;
    return (Date.now() - dt.getTime()) / (365.25 * 24 * 60 * 60 * 1000) < 3;
  })();

  return (
    <>
      <h2 className={SECTION_H}>Guarantor + Company</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
        <Field label="Company name *"><TextIn value={f.company_name} onChange={(v) => set("company_name", v)} /></Field>
        <Field label="Guarantor full name *"><TextIn value={f.guarantor_name} onChange={(v) => set("guarantor_name", v)} /></Field>
        <Field label="Guarantor DOB *"><TextIn type="date" value={f.guarantor_dob} onChange={(v) => set("guarantor_dob", v)} /></Field>
        <Field label="Guarantor phone *"><TextIn type="tel" value={f.guarantor_phone} onChange={(v) => set("guarantor_phone", v)} /></Field>
        <Field label="Guarantor email *"><TextIn type="email" value={f.guarantor_email} onChange={(v) => set("guarantor_email", v)} /></Field>
        <Field label="Guarantor residential address *"><TextIn value={f.guarantor_address} onChange={(v) => set("guarantor_address", v)} /></Field>
      </div>

      <h2 className={SECTION_H}>Co-guarantors (Canada only)</h2>
      <p className="text-xs text-sky-200/70 mb-2">Add other individuals on the personal guarantee. Our team will reach out to complete the co-guarantor intake separately.</p>
      <div className="grid grid-cols-1 gap-2 mb-2">
        {f.co_guarantors.map((cg, idx) => (
          <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-2 p-2 border border-sky-300/20 rounded bg-sky-500/5">
            <input className={INPUT} placeholder="First name *" value={cg.first_name} onChange={(e) => set("co_guarantors", f.co_guarantors.map((c, i) => i === idx ? { ...c, first_name: e.target.value } : c))} />
            <input className={INPUT} placeholder="Last name *"  value={cg.last_name}  onChange={(e) => set("co_guarantors", f.co_guarantors.map((c, i) => i === idx ? { ...c, last_name: e.target.value } : c))} />
            <input className={INPUT} placeholder="Email *" type="email" value={cg.email} onChange={(e) => set("co_guarantors", f.co_guarantors.map((c, i) => i === idx ? { ...c, email: e.target.value } : c))} />
            <input className={INPUT} placeholder="Phone *" type="tel"   value={cg.phone} onChange={(e) => set("co_guarantors", f.co_guarantors.map((c, i) => i === idx ? { ...c, phone: e.target.value } : c))} />
            <div className="flex gap-2">
              <select className={INPUT} value={cg.relationship} onChange={(e) => set("co_guarantors", f.co_guarantors.map((c, i) => i === idx ? { ...c, relationship: e.target.value } : c))}>
                {RELATIONSHIPS.map((r) => <option key={r} value={r} className="text-slate-900">{r}</option>)}
              </select>
              <button type="button" onClick={() => set("co_guarantors", f.co_guarantors.filter((_, i) => i !== idx))} className="text-rose-300 text-xs">✕</button>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => set("co_guarantors", [...f.co_guarantors, emptyCoGuarantor()])} className="self-start text-sky-200 underline text-sm">+ Add co-guarantor</button>
      </div>

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

      <h2 className={SECTION_H}>Declarations (all 11 Purbeck-required)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
        {DECLARATIONS_WITH_REASON.map(({ k, label, needsReason }) => {
          const val = f.declarations[k] as YN;
          const reasonKey = `${String(k)}_reason` as keyof DeclarationsState;
          const showReason = needsReason && val === "yes";
          return (
            <div key={String(k)} className="p-2 rounded bg-sky-500/5 border border-sky-300/20">
              <label className="text-xs text-sky-100 block mb-1">{label}</label>
              <YesNoRadio name={String(k)} value={val} onChange={(v) => setDecl({ ...f.declarations, [k]: v } as DeclarationsState)} />
              {showReason && (
                <input
                  className={`${INPUT} mt-2`}
                  placeholder="Reason (required)"
                  value={String((f.declarations as any)[reasonKey] || "")}
                  onChange={(e) => setDecl({ ...f.declarations, [reasonKey]: e.target.value } as DeclarationsState)}
                />
              )}
            </div>
          );
        })}
        <div className="md:col-span-2 p-2 rounded bg-sky-500/5 border border-sky-300/40 mt-2">
          <label className="text-xs text-sky-100 block mb-1">I confirm that all answers above are true to the best of my knowledge (and if anyone else completed this form on my behalf, that they were authorized).</label>
          <AgreeRadio name="section_3_c" value={f.declarations.section_3_c} onChange={(v) => setDecl({ ...f.declarations, section_3_c: v })} />
          {f.declarations.section_3_c === "Disagree" && (
            <input className={`${INPUT} mt-2`} placeholder="Please explain (required)" value={f.declarations.section_3_c_reason} onChange={(e) => setDecl({ ...f.declarations, section_3_c_reason: e.target.value })} />
          )}
        </div>
      </div>

      <h2 className={SECTION_H}>Required documents{isDemoMode && <span className="text-xs font-normal text-sky-200/70 ml-2">(demo — all slots pre-loaded)</span>}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {docSlots.map((slot) => {
          const picked = files[slot.key];
          return (
            <div key={slot.key} className="p-2 rounded border border-sky-300/30 bg-sky-500/5">
              <label className={LBL}>{slot.label}{slot.required && " *"}</label>
              {!isDemoMode && (
                <input type="file" accept={ACCEPT_PARTNER_DOCS} onChange={(e) => onPickFile(slot.key, e)} className="text-xs text-sky-100" />
              )}
              {picked && (
                <p className="text-[11px] text-emerald-300 mt-1">
                  ✓ {picked.name}{"size" in picked && picked.size ? ` (${(picked.size / 1024 / 1024).toFixed(1)} MB)` : ""}{isDemoMode && " (pre-loaded)"}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
