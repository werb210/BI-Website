// BI_WEBSITE_BLOCK_v331_LENDER_EXPERT_GRID_v1
// Lender shared module. v331 swap from inline-style helpers (which clashed
// with page styling in v328) to className-based Tailwind grid helpers.
// Wire shape (buildLenderSubmitBody) unchanged from v328 — still produces
// nested {guarantor, business, loan, financials, declarations, co_guarantors}
// that bi-server v350 expects.
import React from "react";

export type YN = "" | "yes" | "no";

// Compact Tailwind classes for the 3-column expert grid.
export const INPUT = "w-full bg-sky-500/15 border border-sky-300/40 text-white placeholder:text-sky-100/50 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-sky-300 focus:bg-sky-500/25";
export const LBL = "block text-[11px] font-medium text-sky-100 mb-0.5";
export const SECTION_H = "text-base font-semibold text-sky-100 mt-5 mb-2 border-b border-sky-300/30 pb-1";

export function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className={LBL}>{label}</label>
      {children}
    </div>
  );
}

export function TextIn({ value, onChange, placeholder, type = "text", ...rest }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type" | "placeholder" | "className">) {
  return <input type={type} className={INPUT} placeholder={placeholder} value={value ?? ""} onChange={(e) => onChange(e.target.value)} {...rest} />;
}

export function YesNoSelect({ value, onChange }: { value: YN; onChange: (v: YN) => void }) {
  return (
    <select className={INPUT} value={value ?? ""} onChange={(e) => onChange(e.target.value as YN)}>
      <option value="">Select…</option>
      <option value="no" className="text-slate-900">No</option>
      <option value="yes" className="text-slate-900">Yes</option>
    </select>
  );
}

export const num = (s: string | number | null | undefined): number | null => {
  if (s == null || s === "") return null;
  const n = Number(String(s).replace(/[,$\s]/g, ""));
  return Number.isFinite(n) ? n : null;
};
export const yn = (v: YN): boolean | null => (v === "yes" ? true : v === "no" ? false : null);

export const PROVINCES_NO_QC = [
  { value: "AB", label: "Alberta" }, { value: "BC", label: "British Columbia" },
  { value: "MB", label: "Manitoba" }, { value: "NB", label: "New Brunswick" },
  { value: "NL", label: "Newfoundland and Labrador" }, { value: "NS", label: "Nova Scotia" },
  { value: "NT", label: "Northwest Territories" }, { value: "NU", label: "Nunavut" },
  { value: "ON", label: "Ontario" }, { value: "PE", label: "Prince Edward Island" },
  { value: "SK", label: "Saskatchewan" }, { value: "YT", label: "Yukon" },
] as const;

export const ELIGIBLE_LOAN_TYPES = ["Commercial Mortgage", "Other Secured Loan"] as const;
export type EligibleLoanType = typeof ELIGIBLE_LOAN_TYPES[number];

export const RELATIONSHIPS = ["Guarantor", "Co-borrower", "Spouse", "Business Partner", "Other"] as const;

export const LOAN_AMOUNT_MIN = 50_000; // BI_WEBSITE_BLOCK_v332_CARRIER_CORRECTIONS_v1 — Boreal-side floor.
export const LOAN_AMOUNT_MAX = 1_000_000;
export const PGI_LIMIT_MAX = 1_000_000;

export type DeclarationsState = {
  section_1_a: YN;
  section_1_2: YN; section_1_2_reason: string;
  section_2_a: YN; section_2_a_reason: string;
  section_2_b: YN; section_2_b_reason: string;
  section_2_c: YN; section_2_c_reason: string;
  section_2_d: YN; section_2_d_reason: string;
  section_3_a: YN; section_3_a_reason: string;
  section_3_c: "" | "Agree" | "Disagree"; section_3_c_reason: string;
  section_4_a: YN; section_4_a_reason: string;
  section_5_a: YN; section_5_a_reason: string;
  section_6_a: YN;
};
export const blankDeclarations: DeclarationsState = {
  section_1_a: "", section_1_2: "", section_1_2_reason: "",
  section_2_a: "", section_2_a_reason: "",
  section_2_b: "", section_2_b_reason: "",
  section_2_c: "", section_2_c_reason: "",
  section_2_d: "", section_2_d_reason: "",
  section_3_a: "", section_3_a_reason: "",
  section_3_c: "", section_3_c_reason: "",
  section_4_a: "", section_4_a_reason: "",
  section_5_a: "", section_5_a_reason: "",
  section_6_a: "",
};

export type CoGuarantor = {
  first_name: string; last_name: string; email: string; date_of_birth: string;
  phone: string; address: string; city: string; province: string;
  postal_code: string; relationship: string;
};
export const emptyCoGuarantor = (): CoGuarantor => ({
  first_name: "", last_name: "", email: "", date_of_birth: "", phone: "",
  address: "", city: "", province: "", postal_code: "", relationship: "Guarantor",
});

// BI_WEBSITE_BLOCK_v332_CARRIER_CORRECTIONS_v1 — q_ca_id_type + q_ca_id_number promoted from
// deferred to required carrier fields.
export type LenderFormState = {
  company_name: string; guarantor_name: string; guarantor_phone: string; guarantor_email: string;
  guarantor_dob: string; guarantor_address: string;
  q_ca_id_type: "" | "Passport" | "National ID" | "Driving Licence" | "Other";
  q_ca_id_number: string;
  entity_type: "" | "Corporation" | "Partnership" | "Sole Proprietorship" | "LLC" | "Other";
  business_number: string; business_address: string; business_website: string;
  business_province: string;
  naics: string; business_start_date: string; country: "CA" | "US";
  loan_amount: string; pgi_limit: string;
  q_ca_loan_type: "" | EligibleLoanType;
  use_of_proceeds: "expansion" | "refinance" | "equipment" | "acquisition" | "working_capital" | "real_estate";
  loan_funding_date: string; policy_start_date: string;
  monthly_debt_service: string; collateral_value: string; enterprise_value: string;
  csbfp_backed: YN; loan_has_guaranteed_cap: YN; personally_guaranteeing: YN;
  annual_revenue: string; ebitda: string; total_debt: string;
  declarations: DeclarationsState;
  co_guarantors: CoGuarantor[];
};
export const blankLenderForm: LenderFormState = {
  company_name: "", guarantor_name: "", guarantor_phone: "", guarantor_email: "",
  guarantor_dob: "", guarantor_address: "",
  q_ca_id_type: "", q_ca_id_number: "",
  entity_type: "", business_number: "", business_address: "", business_website: "",
  business_province: "",
  naics: "", business_start_date: "", country: "CA",
  loan_amount: "", pgi_limit: "",
  q_ca_loan_type: "", use_of_proceeds: "expansion",
  loan_funding_date: "", policy_start_date: "",
  monthly_debt_service: "", collateral_value: "", enterprise_value: "",
  csbfp_backed: "", loan_has_guaranteed_cap: "", personally_guaranteeing: "",
  annual_revenue: "", ebitda: "", total_debt: "",
  declarations: { ...blankDeclarations },
  co_guarantors: [],
};

export type DocSlot = { key: string; label: string; required: boolean };
export const DOC_SLOTS: DocSlot[] = [
  { key: "loan_agreement", label: "Lender Agreement / Term Sheet (carrier requires)", required: true },
  { key: "annual_y1",      label: "Year-end Financials — most recent year",            required: true },
  { key: "annual_y2",      label: "Year-end Financials — 2 years ago",                 required: true },
  { key: "annual_y3",      label: "Year-end Financials — 3 years ago",                 required: true },
  { key: "profit_loss",    label: "Interim Profit & Loss (last 12 months)",            required: true },
  { key: "balance_sheet",  label: "Interim Balance Sheet (most recent)",               required: true },
  { key: "ar_aging",       label: "Accounts Receivable Aging",                         required: true },
  { key: "ap_aging",       label: "Accounts Payable Aging",                            required: true },
];

export const PARTNER_ALLOWED_MIME = new Set<string>([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "text/markdown",
]);
export const PARTNER_MAX_BYTES = 5 * 1024 * 1024;
export const ACCEPT_PARTNER_DOCS = "application/pdf,.pdf,.docx,.xlsx,.xls,.csv,.md,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,text/markdown";

export const API_BASE = ((import.meta as any).env?.VITE_API_URL
  || (import.meta as any).env?.VITE_BI_API_URL
  || "https://bi-server-cse0apamgkheb9d5.canadacentral-01.azurewebsites.net").replace(/\/$/, "");

export function getLenderToken(): string {
  try { return localStorage.getItem("bi.lender_token") || ""; } catch { return ""; }
}

export const REQUIRED_KEYS: (keyof LenderFormState)[] = [
  "company_name", "guarantor_name", "guarantor_phone", "guarantor_email",
  "guarantor_dob", "guarantor_address",
  "q_ca_id_type", "q_ca_id_number",
  "entity_type", "business_number", "business_address", "business_province",
  "naics", "business_start_date",
  "loan_amount", "pgi_limit", "q_ca_loan_type",
  "loan_funding_date", "policy_start_date",
  "monthly_debt_service", "collateral_value", "enterprise_value",
  "csbfp_backed", "loan_has_guaranteed_cap", "personally_guaranteeing",
  "annual_revenue", "ebitda", "total_debt",
];

export function declarationsComplete(d: DeclarationsState): boolean {
  if (!d.section_1_a || !d.section_1_2 || !d.section_2_a || !d.section_2_b) return false;
  if (!d.section_2_c || !d.section_2_d || !d.section_3_a || !d.section_3_c) return false;
  if (!d.section_4_a || !d.section_5_a || !d.section_6_a) return false;
  if (d.section_1_2 === "yes" && !d.section_1_2_reason.trim()) return false;
  if (d.section_2_a === "yes" && !d.section_2_a_reason.trim()) return false;
  if (d.section_2_b === "yes" && !d.section_2_b_reason.trim()) return false;
  if (d.section_2_c === "yes" && !d.section_2_c_reason.trim()) return false;
  if (d.section_2_d === "yes" && !d.section_2_d_reason.trim()) return false;
  if (d.section_3_a === "yes" && !d.section_3_a_reason.trim()) return false;
  if (d.section_4_a === "yes" && !d.section_4_a_reason.trim()) return false;
  if (d.section_5_a === "yes" && !d.section_5_a_reason.trim()) return false;
  if (d.section_3_c === "Disagree" && !d.section_3_c_reason.trim()) return false;
  return true;
}

export function buildLenderSubmitBody(f: LenderFormState) {
  const cleanedDecl: Record<string, unknown> = {
    section_1_a: f.declarations.section_1_a,
    section_1_2: f.declarations.section_1_2,
    section_2_a: f.declarations.section_2_a,
    section_2_b: f.declarations.section_2_b,
    section_2_c: f.declarations.section_2_c,
    section_2_d: f.declarations.section_2_d,
    section_3_a: f.declarations.section_3_a,
    section_3_c: f.declarations.section_3_c,
    section_4_a: f.declarations.section_4_a,
    section_5_a: f.declarations.section_5_a,
    section_6_a: f.declarations.section_6_a,
  };
  const adverseMap: Array<[keyof DeclarationsState, string, keyof DeclarationsState]> = [
    ["section_1_2", "yes", "section_1_2_reason"],
    ["section_2_a", "yes", "section_2_a_reason"],
    ["section_2_b", "yes", "section_2_b_reason"],
    ["section_2_c", "yes", "section_2_c_reason"],
    ["section_2_d", "yes", "section_2_d_reason"],
    ["section_3_a", "yes", "section_3_a_reason"],
    ["section_4_a", "yes", "section_4_a_reason"],
    ["section_5_a", "yes", "section_5_a_reason"],
    ["section_3_c", "Disagree", "section_3_c_reason"],
  ];
  for (const [k, adv, rk] of adverseMap) {
    if (f.declarations[k] === adv && String(f.declarations[rk]).trim()) {
      cleanedDecl[rk as string] = String(f.declarations[rk]).trim();
    }
  }
  return {
    source: "lender",
    company_name: f.company_name.trim(),
    business_name: f.company_name.trim(),
    lender_name: null,
    guarantor: {
      name: f.guarantor_name.trim(),
      phone: f.guarantor_phone.trim(),
      email: f.guarantor_email.trim() || null,
      dob: f.guarantor_dob,
      address: f.guarantor_address.trim(),
      // BI_WEBSITE_BLOCK_v332_CARRIER_CORRECTIONS_v1 — pass through to bi-server which maps to form_data.q_ca_id_type/_number.
      q_ca_id_type: f.q_ca_id_type || "",
      q_ca_id_number: f.q_ca_id_number.trim() || "",
    },
    business: {
      entity_type: f.entity_type,
      business_number: f.business_number.trim(),
      address: f.business_address.trim(),
      website: f.business_website.trim() || null,
      province: f.business_province,
      naics: f.naics.trim(),
      start_date: f.business_start_date,
      formation_date: f.business_start_date,
      country: f.country,
    },
    loan: {
      amount: num(f.loan_amount),
      pgi_limit: num(f.pgi_limit),
      q_ca_loan_type: f.q_ca_loan_type,
      use_of_proceeds: f.use_of_proceeds,
      loan_funding_date: f.loan_funding_date,
      estimated_close_date: f.loan_funding_date,
      policy_start_date: f.policy_start_date,
      csbfp_backed: yn(f.csbfp_backed),
      loan_has_guaranteed_cap: yn(f.loan_has_guaranteed_cap),
      personally_guaranteeing: yn(f.personally_guaranteeing),
      has_other_guarantors: f.co_guarantors.length > 0,
    },
    financials: {
      revenue_last_year: num(f.annual_revenue),
      ebitda_last_year: num(f.ebitda),
      total_debt: num(f.total_debt),
      monthly_payments: num(f.monthly_debt_service),
      annual_revenue: num(f.annual_revenue),
      ebitda: num(f.ebitda),
      monthly_debt_service: num(f.monthly_debt_service),
      collateral_value: num(f.collateral_value),
      enterprise_value: num(f.enterprise_value),
    },
    declarations: cleanedDecl,
    co_guarantors: f.co_guarantors.filter((c) => c.first_name.trim() && c.last_name.trim() && c.email.trim() && c.phone.trim()),
  };
}


// Legacy style exports kept for compatibility with demo page.
export const SECTION: React.CSSProperties = { background: "rgba(8, 47, 73, 0.35)", border: "1px solid rgba(125, 211, 252, 0.25)", borderRadius: 10, padding: 12, marginBottom: 12 };
export const SECTION_TITLE: React.CSSProperties = { fontSize: 16, fontWeight: 600, marginBottom: 10, color: "#e0f2fe" };

export const demoLenderForm: LenderFormState = { ...blankLenderForm };
