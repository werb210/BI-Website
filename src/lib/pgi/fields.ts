// PGI_API_ALIGN_v57 — client-side mirror of BI-Server's PGI validator.
// Documented at https://docs.pgicover.com/api/applications.html
// 17 required fields + 1 optional. Anything else MUST NOT be included.

export const ALLOWED_COUNTRIES = ["CA", "US"] as const;
export type AllowedCountry = typeof ALLOWED_COUNTRIES[number];

export type PgiFormData = {
  country: AllowedCountry;
  naics_code: string;
  formation_date: string;
  loan_amount: number;
  pgi_limit: number;
  annual_revenue: number;
  ebitda: number;
  total_debt: number;
  monthly_debt_service: number;
  collateral_value: number;
  enterprise_value: number;
  bankruptcy_history: boolean;
  insolvency_history: boolean;
  judgment_history: boolean;
};

export type PgiSubmission = {
  guarantor_name: string;
  guarantor_email: string;
  business_name: string;
  lender_name?: string;
  form_data: PgiFormData;
};

export const initialPgiSubmission = (): PgiSubmission => ({
  guarantor_name: "",
  guarantor_email: "",
  business_name: "",
  lender_name: "",
  form_data: {
    country: "CA",
    naics_code: "",
    formation_date: "",
    loan_amount: 0,
    pgi_limit: 0,
    annual_revenue: 0,
    ebitda: 0,
    total_debt: 0,
    monthly_debt_service: 0,
    collateral_value: 0,
    enterprise_value: 0,
    bankruptcy_history: false,
    insolvency_history: false,
    judgment_history: false,
  },
});

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const NAICS_RE = /^\d{6}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type FieldErrors = Partial<Record<string, string>>;

export function validatePgi(s: PgiSubmission): { ok: boolean; errors: FieldErrors } {
  const e: FieldErrors = {};
  if (!s.guarantor_name.trim()) e.guarantor_name = "Required";
  if (!EMAIL_RE.test(s.guarantor_email)) e.guarantor_email = "Valid email required";
  if (!s.business_name.trim()) e.business_name = "Required";

  const f = s.form_data;
  if (!ALLOWED_COUNTRIES.includes(f.country)) e["form_data.country"] = "Select CA or US";
  if (!NAICS_RE.test(f.naics_code)) e["form_data.naics_code"] = "Must be 6 digits";
  if (!ISO_DATE_RE.test(f.formation_date)) e["form_data.formation_date"] = "Must be YYYY-MM-DD";
  if (!(f.loan_amount > 0)) e["form_data.loan_amount"] = "Must be > 0";
  if (!(f.pgi_limit > 0)) e["form_data.pgi_limit"] = "Must be > 0";
  if (f.pgi_limit > f.loan_amount) e["form_data.pgi_limit"] = "Cannot exceed loan amount";
  if (!(f.annual_revenue > 0)) e["form_data.annual_revenue"] = "Must be > 0";
  for (const k of ["total_debt", "monthly_debt_service", "collateral_value", "enterprise_value"] as const) {
    if (f[k] < 0) e[`form_data.${k}`] = "Cannot be negative";
  }
  return { ok: Object.keys(e).length === 0, errors: e };
}

export function buildSubmission(s: PgiSubmission): PgiSubmission {
  const lenderName = (s.lender_name ?? "").trim();
  const out: PgiSubmission = {
    guarantor_name: s.guarantor_name.trim(),
    guarantor_email: s.guarantor_email.trim(),
    business_name: s.business_name.trim(),
    form_data: {
      country: s.form_data.country,
      naics_code: s.form_data.naics_code,
      formation_date: s.form_data.formation_date,
      loan_amount: s.form_data.loan_amount,
      pgi_limit: s.form_data.pgi_limit,
      annual_revenue: s.form_data.annual_revenue,
      ebitda: s.form_data.ebitda,
      total_debt: s.form_data.total_debt,
      monthly_debt_service: s.form_data.monthly_debt_service,
      collateral_value: s.form_data.collateral_value,
      enterprise_value: s.form_data.enterprise_value,
      bankruptcy_history: s.form_data.bankruptcy_history,
      insolvency_history: s.form_data.insolvency_history,
      judgment_history: s.form_data.judgment_history,
    },
  };
  if (lenderName.length > 0) out.lender_name = lenderName;
  return out;
}
