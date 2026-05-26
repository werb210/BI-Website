// BI_WEBSITE_BLOCK_v337_PUBLIC_APP_RESCUE_v1
import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

const src = fs.readFileSync(path.resolve(__dirname, "../Application.tsx"), "utf8");

describe("Application.tsx v337 — 1-char-bug fix", () => {
  it("all helper components are at MODULE LEVEL (not nested in Application)", () => {
    // Helper functions appear OUTSIDE the export default function body.
    // Specifically they should be declared at top-level before the component.
    const appStart = src.indexOf("export default function Application");
    expect(appStart).toBeGreaterThan(-1);
    const beforeApp = src.substring(0, appStart);
    expect(beforeApp).toMatch(/^function TextField\(/m);
    expect(beforeApp).toMatch(/^function SelectField\(/m);
    expect(beforeApp).toMatch(/^function DateField\(/m);
    expect(beforeApp).toMatch(/^function AddressFieldGroup\(/m);
    expect(beforeApp).toMatch(/^function YesNoStr\(/m);
    expect(beforeApp).toMatch(/^function AgreeButtons\(/m);
  });

  it("Application body does NOT redefine the helper components inside", () => {
    const body = src.substring(src.indexOf("export default function Application"));
    // No nested function-component declarations.
    expect(body).not.toMatch(/^\s\sfunction TextField\(/m);
    expect(body).not.toMatch(/^\s\sfunction SelectField\(/m);
    expect(body).not.toMatch(/^\s\sfunction AddressInputGroup\(/m);
  });
});

describe("Application.tsx v337 — feature corrections", () => {
  it("does NOT import UploadAndScrape (Todd: 'I do not want to scrap')", () => {
    expect(src).not.toMatch(/UploadAndScrape/);
  });

  it("Stage-1 fields are NOT re-asked in Step 2", () => {
    // Each of these used to have its own TextField/NumberField. Now read-only summary only.
    expect(src).not.toMatch(/label="What is the NAICS code/);
    expect(src).not.toMatch(/label="What month-year did this business/);
    expect(src).not.toMatch(/label="Business revenue last year/);
    expect(src).not.toMatch(/label="EBITDA last year/);
    expect(src).not.toMatch(/label="Total business debt/);
    expect(src).not.toMatch(/label="Total monthly business loan payments/);
    expect(src).not.toMatch(/label="Business collateral pledged/);
    expect(src).not.toMatch(/label="Estimated enterprise value/);
    expect(src).not.toMatch(/label="Loan Amount from Bank/);
    expect(src).not.toMatch(/label="Please declare your desired PGI limit/);
    expect(src).not.toMatch(/Financial Information \(from CORE Score\)/);
    expect(src).not.toMatch(/Which country is the loan agreement based in/);
  });

  it("Read-only summary at top shows CORE Score fields", () => {
    expect(src).toMatch(/From your CORE Score/);
  });

  it("80% PGI cap enforced", () => {
    expect(src).toMatch(/PGI_COVERAGE_RATIO\s*=\s*0\.80/);
    expect(src).toMatch(/loan \* PGI_COVERAGE_RATIO/);
  });

  it("Declarations are buttons, not <select>", () => {
    const declStart = src.indexOf("Declarations");
    const declSection = src.substring(declStart, declStart + 3000);
    expect(declSection).toMatch(/YesNoStr/);
    expect(declSection).toMatch(/AgreeButtons/);
    // YesNoSelect dropdown (from v332/v334) must NOT be used here.
    expect(declSection).not.toMatch(/<YesNoSelect/);
  });

  it("Gov ID number has 'identifier on the government ID' help text", () => {
    expect(src).toMatch(/The identifier on the government ID/);
  });

  it("Country defaults to Canada", () => {
    expect(src).toMatch(/country:\s*app\.country\s*\|\|\s*"Canada"/);
  });
});
