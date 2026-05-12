// BI_WEBSITE_BLOCK_v125_LENDER_FIXES_AND_PUBLIC_POLISH_v1
// Module-scope helpers shared by LenderApplicationNew and LenderApplicationDemo.
// MUST be at module scope (not inside any component) — otherwise React remounts
// the underlying <input> on every keystroke and the field loses focus after the
// first character.
import React from "react";

export type YN = "" | "yes" | "no";

export const ISTYLE: React.CSSProperties = {
  background: "#0a1120", border: "1px solid #2c3a52", color: "#e5e7eb",
  padding: "10px 12px", borderRadius: 8, width: "100%", fontSize: 14,
};
export const SECTION: React.CSSProperties = {
  background: "#0f1729", border: "1px solid #1c2538", borderRadius: 12,
  padding: 16, marginBottom: 16,
};
export const SECTION_TITLE: React.CSSProperties = {
  fontSize: 12, letterSpacing: 1, opacity: 0.7,
  margin: "0 0 12px", textTransform: "uppercase",
};
export const FLD_LABEL: React.CSSProperties = {
  fontSize: 12, opacity: 0.7, marginBottom: 6,
};

export function Field(props: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block", marginBottom: 12 }}>
      <div style={FLD_LABEL}>{props.label}</div>
      {props.children}
    </label>
  );
}

export function TextIn(props: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <input
      type={props.type || "text"}
      value={props.value}
      placeholder={props.placeholder}
      inputMode={props.inputMode}
      onChange={(e) => props.onChange(e.target.value)}
      style={ISTYLE}
    />
  );
}

export function YesNoSelect(props: { value: YN; onChange: (v: YN) => void }) {
  return (
    <select
      value={props.value}
      onChange={(e) => props.onChange(e.target.value as YN)}
      style={ISTYLE}
    >
      <option value="">—</option>
      <option value="no">No</option>
      <option value="yes">Yes</option>
    </select>
  );
}

export const num = (s: string): number | null => {
  if (!s) return null;
  const v = Number(String(s).replace(/[,$\s]/g, ""));
  return Number.isFinite(v) ? v : null;
};

export const yn = (v: YN): boolean | null =>
  v === "yes" ? true : v === "no" ? false : null;

export type LenderFormState = {
  company_name: string; guarantor_name: string; guarantor_phone: string; guarantor_email: string;
  guarantor_dob: string; guarantor_address: string;
  entity_type: "" | "Corporation" | "Partnership" | "Sole Proprietorship" | "LLC" | "Other";
  business_number: string; business_address: string; business_website: string;
  naics: string; business_start_date: string; country: "CA" | "US";
  loan_amount: string; pgi_limit: string;
  use_of_proceeds: "expansion" | "refinance" | "equipment" | "acquisition" | "working_capital" | "real_estate";
  loan_funding_date: string; policy_start_date: string;
  monthly_debt_service: string; collateral_value: string; enterprise_value: string;
  csbfp_backed: YN; loan_has_guaranteed_cap: YN; personally_guaranteeing: YN; has_other_guarantors: YN;
  annual_revenue: string; ebitda: string; total_debt: string;
  bankruptcy_history: YN; insolvency_history: YN; judgment_history: YN;
  payables_threatening: YN; upcoming_adverse_events: YN;
  personal_investigations: YN; business_investigations: YN;
  property_insurance_in_force: YN; personal_judgments: YN; business_judgments: YN;
};

export const blankLenderForm: LenderFormState = {
  company_name: "", guarantor_name: "", guarantor_phone: "", guarantor_email: "",
  guarantor_dob: "", guarantor_address: "",
  entity_type: "", business_number: "", business_address: "", business_website: "",
  naics: "", business_start_date: "", country: "CA",
  loan_amount: "", pgi_limit: "", use_of_proceeds: "expansion",
  loan_funding_date: "", policy_start_date: "",
  monthly_debt_service: "", collateral_value: "", enterprise_value: "",
  csbfp_backed: "", loan_has_guaranteed_cap: "", personally_guaranteeing: "", has_other_guarantors: "",
  annual_revenue: "", ebitda: "", total_debt: "",
  bankruptcy_history: "", insolvency_history: "", judgment_history: "",
  payables_threatening: "", upcoming_adverse_events: "",
  personal_investigations: "", business_investigations: "",
  property_insurance_in_force: "", personal_judgments: "", business_judgments: "",
};

// Realistic demo data used by /lender/demo. Hardcoded so that on every refresh
// the form resets to this exact state. Tweak freely; nothing else depends on
// these specific values.
export const demoLenderForm: LenderFormState = {
  company_name: "Maple Leaf Manufacturing Inc.",
  guarantor_name: "Sarah Chen",
  guarantor_phone: "+14165550100",
  guarantor_email: "sarah.chen@mapleleaf.example",
  guarantor_dob: "1978-04-12",
  guarantor_address: "742 Yonge Street, Toronto, ON M4Y 2B7",
  entity_type: "Corporation",
  business_number: "123456789RT0001",
  business_address: "1200 King Street West, Toronto, ON M6K 1E3",
  business_website: "https://mapleleaf.example",
  naics: "333511",
  business_start_date: "2017-03-15",
  country: "CA",
  loan_amount: "750000",
  pgi_limit: "500000",
  use_of_proceeds: "expansion",
  loan_funding_date: "2026-06-15",
  policy_start_date: "2026-06-15",
  monthly_debt_service: "8900",
  collateral_value: "1200000",
  enterprise_value: "5000000",
  csbfp_backed: "no",
  loan_has_guaranteed_cap: "no",
  personally_guaranteeing: "yes",
  has_other_guarantors: "no",
  annual_revenue: "4500000",
  ebitda: "600000",
  total_debt: "1000000",
  bankruptcy_history: "no",
  insolvency_history: "no",
  judgment_history: "no",
  payables_threatening: "no",
  upcoming_adverse_events: "no",
  personal_investigations: "no",
  business_investigations: "no",
  property_insurance_in_force: "yes",
  personal_judgments: "no",
  business_judgments: "no",
};

export type DocSlot = { key: string; label: string; required: boolean };
export const DOC_SLOTS: DocSlot[] = [
  { key: "annual_y1",     label: "Year-end Financials (most recent year, accountant-prepared)", required: true },
  { key: "annual_y2",     label: "Year-end Financials (2 years ago, accountant-prepared)",      required: true },
  { key: "annual_y3",     label: "Year-end Financials (3 years ago, accountant-prepared)",      required: true },
  { key: "profit_loss",   label: "Interim Profit & Loss (last 12 months)",                       required: true },
  { key: "balance_sheet", label: "Interim Balance Sheet (most recent)",                          required: true },
  { key: "ar_aging",      label: "Accounts Receivable Aging",                                    required: true },
  { key: "ap_aging",      label: "Accounts Payable Aging",                                       required: true },
];

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
  "naics", "business_start_date",
  "loan_amount", "pgi_limit", "loan_funding_date", "policy_start_date",
  "monthly_debt_service", "collateral_value", "enterprise_value",
  "csbfp_backed", "loan_has_guaranteed_cap",
  "personally_guaranteeing", "has_other_guarantors",
  "annual_revenue", "ebitda", "total_debt",
  "bankruptcy_history", "insolvency_history", "judgment_history",
  "payables_threatening", "upcoming_adverse_events",
  "personal_investigations", "business_investigations",
  "property_insurance_in_force", "personal_judgments", "business_judgments",
];

// Build the canonical submit body from form state. Shared by demo + real
// submit so we never drift.
export function buildLenderSubmitBody(f: LenderFormState) {
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
      naics: f.naics.trim(),
      start_date: f.business_start_date,
      formation_date: f.business_start_date,
      country: f.country,
    },
    loan: {
      amount: num(f.loan_amount),
      pgi_limit: num(f.pgi_limit),
      use_of_proceeds: f.use_of_proceeds,
      loan_funding_date: f.loan_funding_date,
      estimated_close_date: f.loan_funding_date,
      policy_start_date: f.policy_start_date,
      csbfp_backed: yn(f.csbfp_backed),
      loan_has_guaranteed_cap: yn(f.loan_has_guaranteed_cap),
      personally_guaranteeing: yn(f.personally_guaranteeing),
      has_other_guarantors: yn(f.has_other_guarantors),
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
    risk: {
      bankruptcy_history: yn(f.bankruptcy_history),
      insolvency_history: yn(f.insolvency_history),
      judgment_history: yn(f.judgment_history),
      payables_threatening: yn(f.payables_threatening),
      upcoming_adverse_events: yn(f.upcoming_adverse_events),
      personal_investigations: yn(f.personal_investigations),
      business_investigations: yn(f.business_investigations),
      property_insurance_in_force: yn(f.property_insurance_in_force),
      personal_judgments: yn(f.personal_judgments),
      business_judgments: yn(f.business_judgments),
    },
  };
}
