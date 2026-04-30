import { describe, it, expect } from "vitest";
import { validatePgi, buildSubmission, initialPgiSubmission } from "../fields";

const VALID = {
  guarantor_name: "Sarah Chen",
  guarantor_email: "sarah@example.com",
  business_name: "Maple Leaf Tech Inc.",
  lender_name: "RBC",
  form_data: {
    country: "CA" as const, naics_code: "541511", formation_date: "2019-03-15",
    loan_amount: 500000, pgi_limit: 250000, annual_revenue: 2000000,
    ebitda: 400000, total_debt: 300000, monthly_debt_service: 8000,
    collateral_value: 600000, enterprise_value: 3000000,
    bankruptcy_history: false, insolvency_history: false, judgment_history: false,
  },
};

describe("PGI_API_ALIGN_v57 client validation", () => {
  it("flags an empty submission", () => {
    expect(validatePgi(initialPgiSubmission()).ok).toBe(false);
  });
  it("accepts a valid 17+1 submission", () => {
    expect(validatePgi(VALID).ok).toBe(true);
  });
  it("rejects pgi_limit > loan_amount", () => {
    const r = validatePgi({ ...VALID, form_data: { ...VALID.form_data, pgi_limit: 600000 } });
    expect(r.errors["form_data.pgi_limit"]).toBeTruthy();
  });
});

describe("PGI_API_ALIGN_v57 buildSubmission strips extras", () => {
  it("emits exactly 4 top-level keys + form_data when lender_name present", () => {
    const out = buildSubmission(VALID);
    expect(Object.keys(out).sort()).toEqual(["business_name", "form_data", "guarantor_email", "guarantor_name", "lender_name"].sort());
  });
  it("omits lender_name when blank", () => {
    const out = buildSubmission({ ...VALID, lender_name: "" });
    expect((out as unknown as Record<string, unknown>).lender_name).toBeUndefined();
  });
  it("emits exactly 14 form_data keys", () => {
    const out = buildSubmission(VALID);
    expect(Object.keys(out.form_data).length).toBe(14);
  });
  it("strips ad-hoc UI-only state if added to the submission object", () => {
    const dirty = { ...VALID, ui_step: 2, draft_id: "abc", form_data: { ...VALID.form_data, address: "123 Main" } } as unknown as typeof VALID;
    const out = buildSubmission(dirty);
    expect((out as unknown as Record<string, unknown>).ui_step).toBeUndefined();
    expect((out as unknown as Record<string, unknown>).draft_id).toBeUndefined();
    expect((out.form_data as unknown as Record<string, unknown>).address).toBeUndefined();
  });
});
