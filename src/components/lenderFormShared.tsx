// BI_WEBSITE_BLOCK_v328_LENDER_PURBECK_WIZARD_v1
// Shared lender form module — Purbeck-aligned. Risk booleans dropped.
// Declarations + co-guarantors added. q_ca_loan_type + q_business_province
// added (with QC excluded from the province dropdown).
import React from "react";

export type YN = "" | "yes" | "no";

export const ISTYLE: React.CSSProperties = {
  width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "0.375rem", fontSize: "0.875rem",
};
export const SECTION: React.CSSProperties = {
  marginBottom: "1.5rem", padding: "1rem", border: "1px solid #e5e7eb", borderRadius: "0.5rem", background: "#fff",
};
export const SECTION_TITLE: React.CSSProperties = {
  fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem", paddingBottom: "0.5rem", borderBottom: "1px solid #e5e7eb",
};
export const FLD_LABEL: React.CSSProperties = {
  display: "block", fontSize: "0.8125rem", color: "#374151", marginBottom: "0.25rem",
};

export function Field(props: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "0.75rem" }}>
      <label style={FLD_LABEL}>{props.label}</label>
      {props.children}
    </div>
  );
}

export function TextIn(props: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      style={ISTYLE}
      type={props.type || "text"}
      value={props.value}
      placeholder={props.placeholder}
      onChange={(e) => props.onChange(e.target.value)}
    />
  );
}

export function YesNoSelect(props: { value: YN; onChange: (v: YN) => void }) {
  return (
    <select style={ISTYLE} value={props.value} onChange={(e) => props.onChange(e.target.value as YN)}>
      <option value="">Select…</option>
      <option value="no">No</option>
      <option value="yes">Yes</option>
    </select>
  );
}

export const num = (s: string): number | null => {
  if (s == null || s === "") return null;
  const n = Number(String(s).replace(/[,$\s]/g, ""));
  return Number.isFinite(n) ? n : null;
};
export const yn = (v: YN): boolean | null =>
  v === "yes" ? true : v === "no" ? false : null;

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

export const LOAN_AMOUNT_MAX = 1_000_000;
export const PGI_LIMIT_MAX = 1_000_000;

// Declarations object: 11 sections per Purbeck schema.
// section_1_a + section_6_a are non-adverse consents (yes is good).
// section_3_c is Agree/Disagree.
// All others yes/no with "yes" adverse → triggers reason field.
export type DeclarationsState = {
  section_1_a: YN;
  section_1_2: YN;
  section_1_2_reason: string;
  section_2_a: YN;
  section_2_a_reason: string;
  section_2_b: YN;
  section_2_b_reason: string;
  section_2_c: YN;
  section_2_c_reason: string;
  section_2_d: YN;
  section_2_d_reason: string;
  section_3_a: YN;
  section_3_a_reason: string;
  section_3_c: "" | "Agree" | "Disagree";
  section_3_c_reason: string;
  section_4_a: YN;
  section_4_a_reason: string;
  section_5_a: YN;
  section_5_a_reason: string;
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

export type LenderFormState = {
  company_name: string; guarantor_name: string; guarantor_phone: string; guarantor_email: string;
  guarantor_dob: string; guarantor_address: string;
  entity_type: "" | "Corporation" | "Partnership" | "Sole Proprietorship" | "LLC" | "Other";
  business_number: string; business_address: string; business_website: string;
  business_province: string;          // new — for QC block
  naics: string; business_start_date: string; country: "CA" | "US";
  loan_amount: string; pgi_limit: string;
  q_ca_loan_type: "" | EligibleLoanType; // new — carrier eligibility
  use_of_proceeds: "expansion" | "refinance" | "equipment" | "acquisition" | "working_capital" | "real_estate"; // internal
  loan_funding_date: string; policy_start_date: string;
  monthly_debt_service: string; collateral_value: string; enterprise_value: string;
  csbfp_backed: YN; loan_has_guaranteed_cap: YN; personally_guaranteeing: YN;
  annual_revenue: string; ebitda: string; total_debt: string;
  // Declarations replace the 10 risk booleans (HARD-CUT v328).
  declarations: DeclarationsState;
  // Co-guarantors (per PGI expand-modal screenshot).
  co_guarantors: CoGuarantor[];
};

export const blankLenderForm: LenderFormState = {
  company_name: "", guarantor_name: "", guarantor_phone: "", guarantor_email: "",
  guarantor_dob: "", guarantor_address: "",
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

export const demoLenderForm: LenderFormState = {
  ...blankLenderForm,
  company_name: "Demo Lender Sandbox Inc.",
  guarantor_name: "Sarah Chen",
  guarantor_phone: "+14165551234",
  guarantor_email: "sarah@demo.example",
  guarantor_dob: "1985-06-15",
  guarantor_address: "456 Oak Avenue, Toronto, ON M4V 2P7",
  entity_type: "Corporation",
  business_number: "123456789RT0001",
  business_address: "789 King Street West, Toronto, ON M5H 2A9",
  business_website: "https://demo.example",
  business_province: "ON",
  naics: "541511", business_start_date: "2019-03-15", country: "CA",
  loan_amount: "500000", pgi_limit: "250000",
  q_ca_loan_type: "Commercial Mortgage",
  use_of_proceeds: "expansion",
  loan_funding_date: "2026-06-01", policy_start_date: "2026-06-01",
  monthly_debt_service: "8000", collateral_value: "600000", enterprise_value: "3000000",
  csbfp_backed: "no", loan_has_guaranteed_cap: "no", personally_guaranteeing: "yes",
  annual_revenue: "2000000", ebitda: "400000", total_debt: "300000",
  declarations: {
    ...blankDeclarations,
    section_1_a: "yes", section_1_2: "no",
    section_2_a: "no", section_2_b: "no", section_2_c: "no", section_2_d: "no",
    section_3_a: "no", section_3_c: "Agree",
    section_4_a: "no", section_5_a: "no", section_6_a: "yes",
  },
  co_guarantors: [],
};

export type DocSlot = { key: string; label: string; required: boolean };
export const DOC_SLOTS: DocSlot[] = [
  { key: "loan_agreement", label: "Lender Agreement / Term Sheet (REQUIRED by carrier — PDF or DOCX)", required: true },
  { key: "annual_y1",     label: "Year-end Financials (most recent year, accountant-prepared)", required: true },
  { key: "annual_y2",     label: "Year-end Financials (2 years ago, accountant-prepared)",      required: true },
  { key: "annual_y3",     label: "Year-end Financials (3 years ago, accountant-prepared)",      required: true },
  { key: "profit_loss",   label: "Interim Profit & Loss (last 12 months)",                       required: true },
  { key: "balance_sheet", label: "Interim Balance Sheet (most recent)",                          required: true },
  { key: "ar_aging",      label: "Accounts Receivable Aging",                                    required: true },
  { key: "ap_aging",      label: "Accounts Payable Aging",                                       required: true },
];

// BI_WEBSITE_BLOCK_v328_DOC_CONSTRAINTS_v1 — carrier rejects images + files > 5MB.
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
  "entity_type", "business_number", "business_address",
  "business_province",
  "naics", "business_start_date",
  "loan_amount", "pgi_limit",
  "q_ca_loan_type",
  "loan_funding_date", "policy_start_date",
  "monthly_debt_service", "collateral_value", "enterprise_value",
  "csbfp_backed", "loan_has_guaranteed_cap", "personally_guaranteeing",
  "annual_revenue", "ebitda", "total_debt",
];

// Declarations are required separately (each section must have a non-empty answer).
export function declarationsComplete(d: DeclarationsState): boolean {
  if (!d.section_1_a || !d.section_1_2 || !d.section_2_a || !d.section_2_b) return false;
  if (!d.section_2_c || !d.section_2_d || !d.section_3_a || !d.section_3_c) return false;
  if (!d.section_4_a || !d.section_5_a || !d.section_6_a) return false;
  // Adverse-reason pairing.
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

// Build the canonical submit body from form state. Shared by demo + real
// submit. Wire shape stays nested for backward compat with any external
// lender API integrations; v350 server route persists declarations +
// co_guarantors to the v349 storage shape.
export function buildLenderSubmitBody(f: LenderFormState) {
  // Filter out adverse reasons that don't apply (don't ship empty strings to carrier).
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
  if (f.declarations.section_1_2 === "yes" && f.declarations.section_1_2_reason.trim()) cleanedDecl.section_1_2_reason = f.declarations.section_1_2_reason.trim();
  if (f.declarations.section_2_a === "yes" && f.declarations.section_2_a_reason.trim()) cleanedDecl.section_2_a_reason = f.declarations.section_2_a_reason.trim();
  if (f.declarations.section_2_b === "yes" && f.declarations.section_2_b_reason.trim()) cleanedDecl.section_2_b_reason = f.declarations.section_2_b_reason.trim();
  if (f.declarations.section_2_c === "yes" && f.declarations.section_2_c_reason.trim()) cleanedDecl.section_2_c_reason = f.declarations.section_2_c_reason.trim();
  if (f.declarations.section_2_d === "yes" && f.declarations.section_2_d_reason.trim()) cleanedDecl.section_2_d_reason = f.declarations.section_2_d_reason.trim();
  if (f.declarations.section_3_a === "yes" && f.declarations.section_3_a_reason.trim()) cleanedDecl.section_3_a_reason = f.declarations.section_3_a_reason.trim();
  if (f.declarations.section_3_c === "Disagree" && f.declarations.section_3_c_reason.trim()) cleanedDecl.section_3_c_reason = f.declarations.section_3_c_reason.trim();
  if (f.declarations.section_4_a === "yes" && f.declarations.section_4_a_reason.trim()) cleanedDecl.section_4_a_reason = f.declarations.section_4_a_reason.trim();
  if (f.declarations.section_5_a === "yes" && f.declarations.section_5_a_reason.trim()) cleanedDecl.section_5_a_reason = f.declarations.section_5_a_reason.trim();

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
    // BI_WEBSITE_BLOCK_v328 — declarations + co_guarantors (replaces risk.* booleans).
    declarations: cleanedDecl,
    co_guarantors: f.co_guarantors.filter((c) =>
      c.first_name.trim() && c.last_name.trim() && c.email.trim() && c.phone.trim()
    ),
  };
}
