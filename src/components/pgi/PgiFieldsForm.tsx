// PGI_API_ALIGN_v57 — collects exactly the 17 required + 1 optional carrier fields.
// No address, no DOB, no SSN/SIN, no partner data, no industry description.
// If the carrier ever publishes a fuller schema, expand THIS component.

import type { PgiSubmission, FieldErrors, AllowedCountry } from "../../lib/pgi/fields";
import { ALLOWED_COUNTRIES } from "../../lib/pgi/fields";

type Props = { value: PgiSubmission; onChange: (next: PgiSubmission) => void; errors: FieldErrors; columns?: 2 | 3 };

export default function PgiFieldsForm({ value, onChange, errors, columns = 2 }: Props) {
  const f = value.form_data;
  const set = (next: Partial<PgiSubmission>) => onChange({ ...value, ...next });
  const setF = (next: Partial<typeof f>) => onChange({ ...value, form_data: { ...f, ...next } });
  const grid = columns === 3 ? "md:grid-cols-3" : "md:grid-cols-2";
  const num = (n: number) => Number.isFinite(n) && n !== 0 ? String(n) : "";

  return (
    <div className={`grid gap-4 ${grid}`}>
      <Section title="Business" />
      <Field label="Business name*" error={errors.business_name}>
        <input className="input" value={value.business_name} onChange={(e) => set({ business_name: e.target.value })} />
      </Field>
      <Field label="Lender name (optional)">
        <input className="input" value={value.lender_name ?? ""} onChange={(e) => set({ lender_name: e.target.value })} />
      </Field>
      <Field label="Country*" error={errors["form_data.country"]}>
        <select className="input" value={f.country} onChange={(e) => setF({ country: e.target.value as AllowedCountry })}>
          {ALLOWED_COUNTRIES.map((c) => <option key={c} value={c}>{c === "CA" ? "Canada" : "United States"}</option>)}
        </select>
      </Field>
      <Field label="NAICS code* (6 digits)" error={errors["form_data.naics_code"]} hint="e.g. 541511 for software development">
        <input className="input" inputMode="numeric" maxLength={6}
               value={f.naics_code}
               onChange={(e) => setF({ naics_code: e.target.value.replace(/\D/g, "").slice(0, 6) })} />
      </Field>
      <Field label="Formation date*" error={errors["form_data.formation_date"]} hint="YYYY-MM-DD">
        <input className="input" type="date" value={f.formation_date} onChange={(e) => setF({ formation_date: e.target.value })} />
      </Field>

      <Section title="Guarantor" />
      <Field label="Guarantor full name*" error={errors.guarantor_name}>
        <input className="input" value={value.guarantor_name} onChange={(e) => set({ guarantor_name: e.target.value })} />
      </Field>
      <Field label="Guarantor email*" error={errors.guarantor_email}>
        <input className="input" type="email" value={value.guarantor_email} onChange={(e) => set({ guarantor_email: e.target.value })} />
      </Field>

      <Section title="Loan & coverage" />
      <Field label="Loan amount*" error={errors["form_data.loan_amount"]}>
        <input className="input" type="number" value={num(f.loan_amount)} onChange={(e) => setF({ loan_amount: Number(e.target.value) || 0 })} />
      </Field>
      <Field label="PGI coverage limit*" error={errors["form_data.pgi_limit"]} hint="Must be ≤ loan amount">
        <input className="input" type="number" value={num(f.pgi_limit)} onChange={(e) => setF({ pgi_limit: Number(e.target.value) || 0 })} />
      </Field>

      <Section title="Financials" />
      <Field label="Annual revenue*" error={errors["form_data.annual_revenue"]}>
        <input className="input" type="number" value={num(f.annual_revenue)} onChange={(e) => setF({ annual_revenue: Number(e.target.value) || 0 })} />
      </Field>
      <Field label="EBITDA*" hint="Can be negative">
        <input className="input" type="number" value={num(f.ebitda)} onChange={(e) => setF({ ebitda: Number(e.target.value) || 0 })} />
      </Field>
      <Field label="Total debt*" error={errors["form_data.total_debt"]}>
        <input className="input" type="number" value={num(f.total_debt)} onChange={(e) => setF({ total_debt: Number(e.target.value) || 0 })} />
      </Field>
      <Field label="Monthly debt service*" error={errors["form_data.monthly_debt_service"]}>
        <input className="input" type="number" value={num(f.monthly_debt_service)} onChange={(e) => setF({ monthly_debt_service: Number(e.target.value) || 0 })} />
      </Field>
      <Field label="Collateral value*" error={errors["form_data.collateral_value"]}>
        <input className="input" type="number" value={num(f.collateral_value)} onChange={(e) => setF({ collateral_value: Number(e.target.value) || 0 })} />
      </Field>
      <Field label="Enterprise value*" error={errors["form_data.enterprise_value"]} hint="Rough estimate: assets − debt + market premium">
        <input className="input" type="number" value={num(f.enterprise_value)} onChange={(e) => setF({ enterprise_value: Number(e.target.value) || 0 })} />
      </Field>

      <Section title="Disclosures" />
      <Check label="Bankruptcy history" checked={f.bankruptcy_history} onChange={(v) => setF({ bankruptcy_history: v })} />
      <Check label="Insolvency history" checked={f.insolvency_history} onChange={(v) => setF({ insolvency_history: v })} />
      <Check label="Judgment history" checked={f.judgment_history} onChange={(v) => setF({ judgment_history: v })} />
    </div>
  );
}

function Section({ title }: { title: string }) {
  return <h3 className="md:col-span-full mt-4 text-lg font-semibold text-white/90 border-b border-white/10 pb-1">{title}</h3>;
}
function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-white/60">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-300">{error}</p>}
    </div>
  );
}
function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}
