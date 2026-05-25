// BI_WEBSITE_BLOCK_v328_LENDER_PURBECK_WIZARD_v1
import { describe, it, expect } from "vitest";
import {
  blankLenderForm,
  buildLenderSubmitBody,
  declarationsComplete,
  blankDeclarations,
  DOC_SLOTS,
  ELIGIBLE_LOAN_TYPES,
  REQUIRED_KEYS,
  PROVINCES_NO_QC,
} from "../lenderFormShared";

describe("lenderFormShared v328 — Purbeck alignment", () => {
  it("REQUIRED_KEYS does NOT include risk booleans (hard-cut)", () => {
    const dropped = ["bankruptcy_history","insolvency_history","judgment_history","payables_threatening","upcoming_adverse_events","personal_investigations","business_investigations","property_insurance_in_force","personal_judgments","business_judgments"];
    for (const k of dropped) {
      expect(REQUIRED_KEYS as readonly string[]).not.toContain(k);
    }
  });
  it("REQUIRED_KEYS includes new q_ca_loan_type + business_province", () => {
    expect(REQUIRED_KEYS as readonly string[]).toContain("q_ca_loan_type");
    expect(REQUIRED_KEYS as readonly string[]).toContain("business_province");
  });
  it("PROVINCES_NO_QC excludes Quebec", () => {
    const codes = PROVINCES_NO_QC.map((p) => p.value);
    expect(codes).not.toContain("QC"); expect(codes).toContain("ON"); expect(codes).toContain("AB");
  });
  it("DOC_SLOTS includes loan_agreement as 8th required doc", () => {
    const slot = DOC_SLOTS.find((d) => d.key === "loan_agreement"); expect(slot).toBeDefined(); expect(slot?.required).toBe(true);
  });
  it("ELIGIBLE_LOAN_TYPES has exactly 2 values", () => {
    expect([...ELIGIBLE_LOAN_TYPES]).toEqual(["Commercial Mortgage", "Other Secured Loan"]);
  });
  it("declarationsComplete returns false on a blank state", () => { expect(declarationsComplete(blankDeclarations)).toBe(false); });
  it("declarationsComplete returns true on a fully-answered non-adverse state", () => {
    const d = { ...blankDeclarations, section_1_a: "yes" as const, section_1_2: "no" as const, section_2_a: "no" as const, section_2_b: "no" as const, section_2_c: "no" as const, section_2_d: "no" as const, section_3_a: "no" as const, section_3_c: "Agree" as const, section_4_a: "no" as const, section_5_a: "no" as const, section_6_a: "yes" as const };
    expect(declarationsComplete(d)).toBe(true);
  });
  it("declarationsComplete requires reason when section_1_2 is yes", () => {
    const d = { ...blankDeclarations, section_1_a: "yes" as const, section_1_2: "yes" as const, section_2_a: "no" as const, section_2_b: "no" as const, section_2_c: "no" as const, section_2_d: "no" as const, section_3_a: "no" as const, section_3_c: "Agree" as const, section_4_a: "no" as const, section_5_a: "no" as const, section_6_a: "yes" as const };
    expect(declarationsComplete(d)).toBe(false);
    expect(declarationsComplete({ ...d, section_1_2_reason: "Loan called by RBC in 2018; settled." })).toBe(true);
  });
  it("buildLenderSubmitBody produces nested wire shape WITHOUT risk.* keys", () => {
    const body = buildLenderSubmitBody({ ...blankLenderForm, company_name: "X", q_ca_loan_type: "Commercial Mortgage" });
    expect((body as any).risk).toBeUndefined(); expect(body.declarations).toBeDefined(); expect(Array.isArray((body as any).co_guarantors)).toBe(true);
  });
  it("buildLenderSubmitBody body.business.province is included for QC server-side block", () => {
    const body = buildLenderSubmitBody({ ...blankLenderForm, business_province: "ON" }); expect((body as any).business.province).toBe("ON");
  });
  it("buildLenderSubmitBody body.loan.q_ca_loan_type is included", () => {
    const body = buildLenderSubmitBody({ ...blankLenderForm, q_ca_loan_type: "Commercial Mortgage" }); expect((body as any).loan.q_ca_loan_type).toBe("Commercial Mortgage");
  });
  it("buildLenderSubmitBody omits empty adverse reasons", () => {
    const body = buildLenderSubmitBody({ ...blankLenderForm }); const decl = (body as any).declarations as Record<string, unknown>; expect(decl.section_1_2_reason).toBeUndefined(); expect(decl.section_2_a_reason).toBeUndefined();
  });
});
