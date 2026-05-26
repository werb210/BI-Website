// BI_WEBSITE_BLOCK_v340_LENDER_API_DOCS_V2_v1
import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

const src = fs.readFileSync(path.resolve(__dirname, "../LenderApiDocs.tsx"), "utf8");

describe("LenderApiDocs v340 — v2 carrier-aligned content", () => {
  it("page heading mentions v2 carrier-aligned", () => {
    expect(src).toMatch(/v2 · carrier-aligned/);
  });

  it("includes Eligibility rules call-out at the top", () => {
    expect(src).toMatch(/Eligibility rules \(carrier-enforced\)/);
    expect(src).toMatch(/Canada only/);
    expect(src).toMatch(/Quebec excluded/);
    expect(src).toMatch(/80% of/);
    expect(src).toMatch(/\$50,000/);
    expect(src).toMatch(/\$1,000,000/);
  });

  it("sample body uses the v2 nested shape (guarantor / business / loan / declarations)", () => {
    expect(src).toMatch(/"guarantor":\s*\{[\s\S]*?"name":/);
    expect(src).toMatch(/"business":\s*\{[\s\S]*?"naics":/);
    expect(src).toMatch(/"loan":\s*\{[\s\S]*?"q_ca_loan_type":/);
    expect(src).toMatch(/"declarations":\s*\{[\s\S]*?"section_1_a":/);
  });

  it("sample body has all 11 declaration keys", () => {
    for (const k of ["section_1_a", "section_1_2", "section_2_a", "section_2_b", "section_2_c", "section_2_d", "section_3_a", "section_3_c", "section_4_a", "section_5_a", "section_6_a"]) {
      expect(src).toContain(`"${k}"`);
    }
  });

  it("doc upload sample uses the 5 required doc_types", () => {
    expect(src).toMatch(/loan_agreement/);
    expect(src).toMatch(/profit_loss/);
    expect(src).toMatch(/balance_sheet/);
    expect(src).toMatch(/ar_aging/);
    expect(src).toMatch(/ap_aging/);
  });

  it("doc upload section mentions the 2 startup-conditional types", () => {
    expect(src).toMatch(/founder_cv/);
    expect(src).toMatch(/financial_forecast/);
    expect(src).toMatch(/last 3 years/);
  });

  it("doc upload section mentions size + MIME constraints", () => {
    expect(src).toMatch(/5 MB max per file/);
    expect(src).toMatch(/PDF\/DOCX\/XLS\/XLSX\/CSV\/MD/);
  });

  it("v1 stale fields are NOT in the sample body", () => {
    // The OLD v1 booleans must not appear as top-level keys.
    expect(src).not.toMatch(/"bankruptcy_history":\s*false/);
    expect(src).not.toMatch(/"insolvency_history":\s*false/);
    expect(src).not.toMatch(/"judgment_history":\s*false/);
    // The OLD flat top-level required fields must not appear at the top level.
    expect(src).not.toMatch(/^  "annual_revenue":/m);
  });

  it("status enum uses canonical v351 stages", () => {
    expect(src).toMatch(/policy_issued/);
    expect(src).toMatch(/under_review/);
    expect(src).toMatch(/information_required/);
    expect(src).not.toMatch(/new_application/);
    expect(src).not.toMatch(/sent_to_pgi/);
  });

  it("includes a migration-from-v1 section explaining the deprecation", () => {
    expect(src).toMatch(/Migration from v1/);
    expect(src).toMatch(/2026-12-31/);
  });

  it("offers all 3 language samples (curl, node, python)", () => {
    expect(src).toMatch(/cURL/);
    expect(src).toMatch(/Node\.js/);
    expect(src).toMatch(/Python/);
  });
});
