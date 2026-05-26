import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

const bodySrc = fs.readFileSync(path.resolve(__dirname, "../LenderApplicationFormBody.tsx"), "utf8");
const demoSrc = fs.readFileSync(path.resolve(__dirname, "../../pages/LenderApplicationDemo.tsx"), "utf8");
const newSrc = fs.readFileSync(path.resolve(__dirname, "../../pages/LenderApplicationNew.tsx"), "utf8");

describe("v341 — single source of truth for the lender form body", () => {
  it("LenderApplicationFormBody exists and exports the shared body", () => {
    expect(bodySrc).toMatch(/export function LenderApplicationFormBody/);
  });
  it("LenderApplicationNew renders <LenderApplicationFormBody />", () => {
    expect(newSrc).toMatch(/<LenderApplicationFormBody\b/);
  });
  it("LenderApplicationDemo renders <LenderApplicationFormBody />", () => {
    expect(demoSrc).toMatch(/<LenderApplicationFormBody\b/);
  });
});

describe("v341 — LenderApplicationDemo's old OUT-OF-SCHEMA sections are gone", () => {
  it("no Risk section with the 10 boolean dropdowns", () => {
    expect(demoSrc).not.toMatch(/Bankruptcy history\?/);
    expect(demoSrc).not.toMatch(/Insolvency history\?/);
    expect(demoSrc).not.toMatch(/Judgment history\?/);
    expect(demoSrc).not.toMatch(/payables threatening collection/);
    expect(demoSrc).not.toMatch(/upcoming adverse events/);
    expect(demoSrc).not.toMatch(/Personal investigations/);
    expect(demoSrc).not.toMatch(/Business investigations/);
    expect(demoSrc).not.toMatch(/Property insurance in force/);
    expect(demoSrc).not.toMatch(/Personal judgments outstanding/);
    expect(demoSrc).not.toMatch(/Business judgments outstanding/);
  });
  it("no Financials section with the 6 currency inputs", () => {
    expect(demoSrc).not.toMatch(/Monthly debt service/);
    expect(demoSrc).not.toMatch(/Collateral value/);
    expect(demoSrc).not.toMatch(/Enterprise value/);
    expect(demoSrc).not.toMatch(/Annual revenue/);
  });
});

describe("v341 — LenderApplicationDemo demo session safety", () => {
  it("writes bi.real_token_backup on mount BEFORE demo session fetch", () => {
    const backupIdx = demoSrc.indexOf("bi.real_token_backup");
    const fetchIdx = demoSrc.indexOf("/api/v1/lender/demo/session");
    expect(backupIdx).toBeGreaterThan(-1);
    expect(fetchIdx).toBeGreaterThan(-1);
    expect(backupIdx).toBeLessThan(fetchIdx);
  });
  it("uses demoLenderForm as initial state", () => {
    expect(demoSrc).toMatch(/useState<LenderFormState>\(demoLenderForm\)/);
  });
  it("Reset button restores demoLenderForm", () => {
    expect(demoSrc).toMatch(/setF\(demoLenderForm\)/);
  });
});

describe("v341 — shared body renders the carrier-aligned schema", () => {
  it("has all 11 declarations", () => {
    for (const k of ["section_1_a", "section_1_2", "section_2_a", "section_2_b", "section_2_c", "section_2_d", "section_3_a", "section_3_c", "section_4_a", "section_5_a", "section_6_a"]) {
      expect(bodySrc).toMatch(new RegExp(`\\b${k}\\b`));
    }
  });
  it("uses YesNoRadio (buttons) not <select> dropdowns for declarations", () => {
    expect(bodySrc).toMatch(/YesNoRadio/);
    expect(bodySrc).toMatch(/AgreeRadio/);
  });
  it("doc slots are computed dynamically via docSlotsFor", () => {
    expect(bodySrc).toMatch(/docSlotsFor\(f\.business_start_date\)/);
  });
  it("Gov ID fields are inside the Business section, not Guarantor + Company", () => {
    const guarantorStart = bodySrc.indexOf("Guarantor + Company");
    const businessStart = bodySrc.indexOf("<h2 className={SECTION_H}>Business</h2>");
    const govIdIdx = bodySrc.indexOf("Government ID type");
    expect(guarantorStart).toBeGreaterThan(-1);
    expect(businessStart).toBeGreaterThan(guarantorStart);
    expect(govIdIdx).toBeGreaterThan(businessStart);
  });
});
