// BI_WEBSITE_BLOCK_v335_LENDER_RESTRUCTURE_v1
import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

const lenderSrc = fs.readFileSync(path.resolve(__dirname, "../LenderApplicationNew.tsx"), "utf8");
const sharedSrc = fs.readFileSync(path.resolve(__dirname, "../../components/lenderFormShared.tsx"), "utf8");

describe("LenderApplicationNew v335 — section order + restructure", () => {
  it("Co-guarantors section appears BEFORE Business section", () => {
    const coIdx = lenderSrc.indexOf("Co-guarantors (Canada only)");
    const bizIdx = lenderSrc.search(/<h2 className={SECTION_H}>Business<\/h2>/);
    expect(coIdx).toBeGreaterThan(-1);
    expect(bizIdx).toBeGreaterThan(-1);
    expect(coIdx).toBeLessThan(bizIdx);
  });

  it("Government ID fields appear in the Business section (NOT Guarantor + Company)", () => {
    const guarantorIdx = lenderSrc.indexOf("Guarantor + Company");
    const bizIdx = lenderSrc.search(/<h2 className={SECTION_H}>Business<\/h2>/);
    const govIdx = lenderSrc.indexOf("Government ID type");
    expect(govIdx).toBeGreaterThan(bizIdx);
    // Guarantor section should not also render the Gov ID fields
    const guarantorSlice = lenderSrc.substring(guarantorIdx, bizIdx);
    expect(guarantorSlice).not.toMatch(/Government ID/);
  });

  it("Financials (for CORE Score) section is REMOVED entirely", () => {
    expect(lenderSrc).not.toMatch(/Financials \(for CORE Score\)/);
    expect(lenderSrc).not.toMatch(/Annual revenue/);
    expect(lenderSrc).not.toMatch(/EBITDA/);
    expect(lenderSrc).not.toMatch(/Total debt/);
    expect(lenderSrc).not.toMatch(/Monthly debt service/);
    expect(lenderSrc).not.toMatch(/Collateral value/);
    expect(lenderSrc).not.toMatch(/Enterprise value/);
  });

  it("Declarations use YesNoRadio (radio buttons), NOT YesNoSelect (dropdown)", () => {
    expect(lenderSrc).toMatch(/YesNoRadio/);
    expect(lenderSrc).not.toMatch(/YesNoSelect/);
  });

  it("Declarations are rendered in a 2-column grid", () => {
    const declHeader = lenderSrc.indexOf("Declarations (all 11 Purbeck-required)");
    const slice = lenderSrc.substring(declHeader, declHeader + 800);
    expect(slice).toMatch(/md:grid-cols-2/);
  });

  it("Doc slots are computed via docSlotsFor (dynamic startup append)", () => {
    expect(lenderSrc).toMatch(/docSlotsFor\(f\.business_start_date\)/);
  });
});

describe("lenderFormShared v335 — schema cleanup", () => {
  it("financial fields removed from LenderFormState", () => {
    const typeBlock = sharedSrc.match(/export type LenderFormState[\s\S]*?\};/);
    expect(typeBlock).toBeTruthy();
    expect(typeBlock![0]).not.toMatch(/annual_revenue/);
    expect(typeBlock![0]).not.toMatch(/ebitda:/);
    expect(typeBlock![0]).not.toMatch(/total_debt:/);
    expect(typeBlock![0]).not.toMatch(/collateral_value/);
    expect(typeBlock![0]).not.toMatch(/enterprise_value/);
    expect(typeBlock![0]).not.toMatch(/monthly_debt_service/);
  });

  it("REQUIRED_KEYS does not include financial fields", () => {
    const reqBlock = sharedSrc.match(/REQUIRED_KEYS[\s\S]*?\];/);
    expect(reqBlock).toBeTruthy();
    expect(reqBlock![0]).not.toMatch(/"annual_revenue"/);
    expect(reqBlock![0]).not.toMatch(/"ebitda"/);
    expect(reqBlock![0]).not.toMatch(/"total_debt"/);
  });

  it("DOC_SLOTS_BASE has exactly the 5 carrier-required types", () => {
    const m = sharedSrc.match(/DOC_SLOTS_BASE:\s*DocSlot\[\][\s\S]*?\];/);
    expect(m).toBeTruthy();
    const block = m![0];
    expect(block).toMatch(/"loan_agreement"/);
    expect(block).toMatch(/"profit_loss"/);
    expect(block).toMatch(/"balance_sheet"/);
    expect(block).toMatch(/"ar_aging"/);
    expect(block).toMatch(/"ap_aging"/);
    expect(block).not.toMatch(/"annual_y1"/);
    expect(block).not.toMatch(/"annual_y2"/);
    expect(block).not.toMatch(/"annual_y3"/);
  });

  it("DOC_SLOTS_STARTUP has founder_cv + financial_forecast", () => {
    const m = sharedSrc.match(/DOC_SLOTS_STARTUP:\s*DocSlot\[\][\s\S]*?\];/);
    expect(m).toBeTruthy();
    expect(m![0]).toMatch(/"founder_cv"/);
    expect(m![0]).toMatch(/"financial_forecast"/);
  });

  it("docSlotsFor returns the 7-slot list when business < 3 years old", () => {
    expect(sharedSrc).toMatch(/ageYears\s*<\s*3/);
  });

  it("buildLenderSubmitBody does NOT include a financials key", () => {
    const m = sharedSrc.match(/export function buildLenderSubmitBody[\s\S]*?^}/m);
    expect(m).toBeTruthy();
    expect(m![0]).not.toMatch(/financials:/);
  });

  it("AgreeRadio + YesNoRadio are exported (radio-button helpers)", () => {
    expect(sharedSrc).toMatch(/export function YesNoRadio/);
    expect(sharedSrc).toMatch(/export function AgreeRadio/);
  });
});
