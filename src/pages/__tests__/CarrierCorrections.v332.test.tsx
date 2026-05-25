// BI_WEBSITE_BLOCK_v332_CARRIER_CORRECTIONS_v1
import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

const appSrc = fs.readFileSync(path.resolve(__dirname, "../Application.tsx"), "utf8");
const lenderSrc = fs.readFileSync(path.resolve(__dirname, "../LenderApplicationNew.tsx"), "utf8");
const sharedSrc = fs.readFileSync(path.resolve(__dirname, "../../components/lenderFormShared.tsx"), "utf8");

describe("v332 — Application.tsx authoritative declaration wording", () => {
  // The OLD inferred wording must be GONE — any remaining occurrence is a regression.
  it("removes inferred wording (v327/v330)", () => {
    expect(appSrc).not.toMatch(/Personal bankruptcy history/);
    expect(appSrc).not.toMatch(/Business insolvency \/ receivership/);
    expect(appSrc).not.toMatch(/Outstanding personal judgments/);
    expect(appSrc).not.toMatch(/Criminal proceedings/);
    expect(appSrc).not.toMatch(/Regulatory investigations/);
    expect(appSrc).not.toMatch(/Anticipated material adverse change \(12mo\)/);
    expect(appSrc).not.toMatch(/Certify information is accurate/);
  });
  it("contains the authoritative wording verbatim", () => {
    expect(appSrc).toMatch(/Have you ever declared personal bankruptcy/);
    expect(appSrc).toMatch(/Have you ever been barred from serving as a Director/);
    expect(appSrc).toMatch(/under investigation by the Canada Revenue Agency/);
    expect(appSrc).toMatch(/actual or contingent liability/);
    expect(appSrc).toMatch(/bad or doubtful debts/);
    expect(appSrc).toMatch(/significant investor, customer, or supplier in the last 6 months/);
    expect(appSrc).toMatch(/over the next 6 months/);
    expect(appSrc).toMatch(/is the company solvent/);
    expect(appSrc).toMatch(/insurance coverage for all physical assets/);
    expect(appSrc).toMatch(/all answers above are true to the best of my knowledge/);
  });
  it("section_1_a, section_6_a, section_3_c are in the Declarations section now (not Consents)", () => {
    // Old consents items that moved away
    expect(appSrc).not.toMatch(/k:\s*"info_accurate"/);
    expect(appSrc).not.toMatch(/k:\s*"business_solvent"/);
  });
  it("Government ID fields are in the Policy Holder section", () => {
    expect(appSrc).toMatch(/q_ca_id_type/);
    expect(appSrc).toMatch(/q_ca_id_number/);
    expect(appSrc).toMatch(/Driving Licence/);
  });
  it("$50K floor is enforced client-side", () => {
    expect(appSrc).toMatch(/LOAN_AMOUNT_MIN\s*=\s*50_000/);
    expect(appSrc).toMatch(/below the 50,000 minimum/);
  });
  it("renders startup-doc inline warning when business is <3 years old", () => {
    expect(appSrc).toMatch(/under 3 years old/);
    expect(appSrc).toMatch(/founder CV/);
    expect(appSrc).toMatch(/financial forecast/);
  });
});

describe("v332 — Lender wizard same updates", () => {
  it("removes inferred wording", () => {
    expect(lenderSrc).not.toMatch(/label:\s*"Personal bankruptcy history\?"/);
    expect(lenderSrc).not.toMatch(/label:\s*"Criminal proceedings/);
    expect(lenderSrc).not.toMatch(/label:\s*"Regulatory investigations\?"/);
    expect(lenderSrc).not.toMatch(/label:\s*"Agree to PGI policy terms\?"/);
  });
  it("contains the authoritative wording", () => {
    expect(lenderSrc).toMatch(/insurance coverage for all physical assets/);
    expect(lenderSrc).toMatch(/declared personal bankruptcy/);
    expect(lenderSrc).toMatch(/barred from serving as a Director/);
    expect(lenderSrc).toMatch(/Canada Revenue Agency or the Canada Border Services Agency/);
    expect(lenderSrc).toMatch(/all answers above are true to the best of my knowledge/);
    expect(lenderSrc).toMatch(/is the company solvent/);
  });
  it("Government ID fields rendered", () => {
    expect(lenderSrc).toMatch(/q_ca_id_type/);
    expect(lenderSrc).toMatch(/q_ca_id_number/);
  });
  it("$50K floor check present", () => {
    expect(lenderSrc).toMatch(/LOAN_AMOUNT_MIN/);
    expect(lenderSrc).toMatch(/below the 50,000 minimum/);
  });
});

describe("v332 — lenderFormShared type + required keys", () => {
  it("LenderFormState declares the two new ID fields", () => {
    expect(sharedSrc).toMatch(/q_ca_id_type:\s*"" \| "Passport"/);
    expect(sharedSrc).toMatch(/q_ca_id_number:\s*string/);
  });
  it("REQUIRED_KEYS includes the two ID fields", () => {
    expect(sharedSrc).toMatch(/"q_ca_id_type"/);
    expect(sharedSrc).toMatch(/"q_ca_id_number"/);
  });
  it("LOAN_AMOUNT_MIN exported = 50_000", () => {
    expect(sharedSrc).toMatch(/LOAN_AMOUNT_MIN\s*=\s*50_000/);
  });
  it("buildLenderSubmitBody passes the ID fields through to the guarantor block", () => {
    expect(sharedSrc).toMatch(/q_ca_id_type:\s*f\.q_ca_id_type/);
    expect(sharedSrc).toMatch(/q_ca_id_number:\s*f\.q_ca_id_number\.trim\(\)/);
  });
});
