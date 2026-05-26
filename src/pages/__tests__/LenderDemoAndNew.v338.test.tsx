// BI_WEBSITE_BLOCK_v338_LENDER_DEMO_PARITY_v1
import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

const sharedSrc = fs.readFileSync(path.resolve(__dirname, "../../components/lenderFormShared.tsx"), "utf8");
const demoSrc = fs.readFileSync(path.resolve(__dirname, "../LenderApplicationDemo.tsx"), "utf8");
const newSrc = fs.readFileSync(path.resolve(__dirname, "../LenderApplicationNew.tsx"), "utf8");

describe("v338 — demoLenderForm restored on the shared module", () => {
  it("export exists", () => {
    expect(sharedSrc).toMatch(/export const demoLenderForm:\s*LenderFormState/);
  });
  it("includes Gov ID + Purbeck declarations + no financials (matches v335 schema)", () => {
    const block = sharedSrc.match(/export const demoLenderForm[\s\S]*?\};\s*\n/);
    expect(block).toBeTruthy();
    const b = block![0];
    expect(b).toMatch(/q_ca_id_type:\s*"Driving Licence"/);
    expect(b).toMatch(/q_ca_id_number:/);
    expect(b).toMatch(/q_ca_loan_type:\s*"Commercial Mortgage"/);
    expect(b).toMatch(/section_1_a:\s*"yes"/);
    // No financial keys (v335 removed them from the type).
    expect(b).not.toMatch(/annual_revenue:/);
    expect(b).not.toMatch(/ebitda:/);
  });
});

describe("v338 — demo session writes real-token backup", () => {
  it("LenderApplicationDemo writes bi.real_token_backup BEFORE fetch", () => {
    expect(demoSrc).toMatch(/localStorage\.setItem\("bi\.real_token_backup"/);
  });
  it("LenderApplicationDemo uses demoLenderForm (not blankLenderForm) as initial state", () => {
    expect(demoSrc).toMatch(/useState<LenderFormState>\(demoLenderForm\)/);
  });
});

describe("v338 — LenderApplicationNew button position", () => {
  it("Cancel + Submit are inside a 3-column grid so they sit under the left column", () => {
    // Look for the closing grid + flex pattern after the docs section.
    expect(newSrc).toMatch(/grid grid-cols-1 md:grid-cols-3 gap-3 mt-4/);
    // No remaining full-width flex-only button row.
    const tail = newSrc.substring(newSrc.lastIndexOf("Submit application"));
    expect(tail.length).toBeLessThan(500);
  });
});
