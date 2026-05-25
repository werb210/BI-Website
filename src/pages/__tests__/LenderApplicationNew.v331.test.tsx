// BI_WEBSITE_BLOCK_v331_LENDER_EXPERT_GRID_v1
import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

const lenderSrc = fs.readFileSync(path.resolve(__dirname, "../LenderApplicationNew.tsx"), "utf8");
const sharedSrc = fs.readFileSync(path.resolve(__dirname, "../../components/lenderFormShared.tsx"), "utf8");

describe("LenderApplicationNew.tsx v331 — 3-column expert grid", () => {
  it("uses 3-column grid layout", () => {
    expect(lenderSrc).toMatch(/grid-cols-1 md:grid-cols-3/);
  });

  it("imports className constants (INPUT/LBL/SECTION_H), not inline-style helpers", () => {
    expect(lenderSrc).toMatch(/INPUT/);
    expect(lenderSrc).toMatch(/SECTION_H/);
    expect(lenderSrc).not.toMatch(/style={SECTION}/);
  });

  it("document slots have visible labels (the v328 break is fixed)", () => {
    expect(lenderSrc).toMatch(/DOC_SLOTS\.map/);
    expect(lenderSrc).toMatch(/{slot\.label}/);
  });

  it("declarations rendered inline (no accordion)", () => {
    expect(lenderSrc).toMatch(/section_1_a/);
    expect(lenderSrc).toMatch(/section_5_a/);
    expect(lenderSrc).toMatch(/section_6_a/);
  });

  it("Submit + Cancel are separate buttons (no v328 'Submit applicationCancel' mush)", () => {
    expect(lenderSrc).toMatch(/onClick={onSubmit}/);
    expect(lenderSrc).toMatch(/Cancel/);
    expect(lenderSrc).not.toMatch(/Submit applicationCancel/);
  });

  it("doc accept attribute strips images + 5MB cap enforced", () => {
    expect(lenderSrc).toMatch(/ACCEPT_PARTNER_DOCS/);
    expect(lenderSrc).toMatch(/PARTNER_MAX_BYTES/);
  });
});

describe("lenderFormShared.tsx v331 — className-based helpers", () => {
  it("exports className constants (INPUT/LBL/SECTION_H)", () => {
    expect(sharedSrc).toMatch(/export const INPUT/);
    expect(sharedSrc).toMatch(/export const LBL/);
    expect(sharedSrc).toMatch(/export const SECTION_H/);
  });

  it("buildLenderSubmitBody emits nested wire shape + declarations + co_guarantors", () => {
    expect(sharedSrc).toMatch(/declarations: cleanedDecl/);
    expect(sharedSrc).toMatch(/co_guarantors:/);
    expect(sharedSrc).toMatch(/business:\s*\{/);
    expect(sharedSrc).toMatch(/loan:\s*\{/);
  });

  it("loan_agreement is the 1st DOC_SLOT (carrier priority)", () => {
    const slotsBlock = sharedSrc.match(/DOC_SLOTS[\s\S]*?\];/);
    expect(slotsBlock).toBeTruthy();
    const first = slotsBlock![0].match(/key:\s*"([^"]+)"/);
    expect(first?.[1]).toBe("loan_agreement");
  });
});
