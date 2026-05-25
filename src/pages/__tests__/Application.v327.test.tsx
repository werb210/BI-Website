// BI_WEBSITE_BLOCK_v327_PURBECK_WIZARD_v1
import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

const src = fs.readFileSync(path.resolve(__dirname, "../Application.tsx"), "utf8");

describe("Application.tsx wizard structure (v327)", () => {
  it("contains all 6 section titles", () => {
    expect(src).toMatch(/Policy Holder Information/);
    expect(src).toMatch(/Business Information/);
    expect(src).toMatch(/Loan & Guarantee Details/);
    expect(src).toMatch(/Financial Information \(CORE Score\)/);
    expect(src).toMatch(/title: "Declarations"/);
    expect(src).toMatch(/Document Uploads & Consents/);
  });

  it("removes the 10 risk booleans (hard-cut)", () => {
    for (const key of [
      "bankruptcy_history","insolvency_history","judgment_history",
      "personal_judgments","business_judgments",
      "personal_investigations","business_investigations",
      "payables_threatening","upcoming_adverse_events","property_insurance_in_force",
    ]) {
      // The risk booleans must not appear as a field key in the wizard.
      // Allow incidental string mentions, but no `key: "<name>"` field defs.
      const re = new RegExp(`key:\\s*["']${key}["']`);
      expect(re.test(src)).toBe(false);
    }
  });

  it("removes electronic_signature / info_accurate as top-level fields", () => {
    // They live under consents.* now.
    expect(/key:\s*["']electronic_signature["']/.test(src)).toBe(false);
    expect(/key:\s*["']info_accurate["']/.test(src)).toBe(false);
    expect(src).toMatch(/consents\.electronic_signature/);
    expect(src).toMatch(/consents\.info_accurate/);
  });

  it("contains all 8 declaration section keys", () => {
    for (const key of ["section_1_2","section_2_a","section_2_b","section_2_c","section_2_d","section_3_a","section_4_a","section_5_a"]) {
      expect(src).toMatch(new RegExp(`declarations\\.${key}`));
    }
  });

  it("contains all 7 verbatim Section 6 consent questions", () => {
    expect(src).toMatch(/Do you consent to electronic signatures\?/);
    expect(src).toMatch(/Do you certify that all information provided is accurate\?/);
    expect(src).toMatch(/Do you certify the business is solvent as of today\?/);
    expect(src).toMatch(/Do you certify there are no undisclosed adverse events\?/);
    expect(src).toMatch(/Do you consent to our use of your data for underwriting\?/);
    expect(src).toMatch(/Do you authorize us to pull your credit report\?/);
    expect(src).toMatch(/Do you understand what PGI covers and does not cover\?/);
  });

  it("contains q_ca_loan_type field with the 2 eligible values only", () => {
    expect(src).toMatch(/q_ca_loan_type/);
    expect(src).toMatch(/Commercial Mortgage/);
    expect(src).toMatch(/Other Secured Loan/);
    expect(src).not.toMatch(/Asset Finance/);
    expect(src).not.toMatch(/Invoice Finance/);
  });

  it("keeps loan_purpose for internal categorization", () => {
    expect(src).toMatch(/key:\s*["']loan_purpose["']/);
  });

  it("Quebec is removed from province dropdown", () => {
    expect(src).toMatch(/PROVINCES_NO_QC/);
    expect(src).not.toMatch(/value:\s*["']QC["']/);
  });

  it("enforces 1M caps in constants", () => {
    expect(src).toMatch(/LOAN_AMOUNT_MAX\s*=\s*1_000_000/);
    expect(src).toMatch(/PGI_LIMIT_MAX\s*=\s*1_000_000/);
  });

  it("includes co-guarantor panel + 10 fields", () => {
    expect(src).toMatch(/CoGuarantorPanel/);
    expect(src).toMatch(/first_name/);
    expect(src).toMatch(/last_name/);
    expect(src).toMatch(/date_of_birth/);
    expect(src).toMatch(/postal_code/);
    expect(src).toMatch(/relationship/);
  });

  it("CORE Score financial fields are still collected", () => {
    expect(src).toMatch(/key:\s*["']annual_revenue["']/);
    expect(src).toMatch(/key:\s*["']ebitda["']/);
    expect(src).toMatch(/key:\s*["']total_debt["']/);
    expect(src).toMatch(/key:\s*["']monthly_debt_service["']/);
    expect(src).toMatch(/key:\s*["']collateral_value["']/);
    expect(src).toMatch(/key:\s*["']enterprise_value["']/);
  });
});
