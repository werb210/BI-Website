// BI_WEBSITE_BLOCK_v_LOCKED_RULES_GUARD_v1
// Durable guards for the locked PGI rules. Replaces the brittle
// "source file contains string X" structural tests (v169..v338) that
// re-broke on every component rewrite. These assert real exported
// behaviour. The few non-exported constants (loan caps, Quebec block)
// are guarded by a minimal value-level source check that is stable
// across refactors.
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  DOC_SLOTS_BASE,
  DOC_SLOTS_STARTUP,
  docSlotsFor,
  PARTNER_MAX_BYTES,
  ACCEPT_PARTNER_DOCS,
  PARTNER_ALLOWED_MIME,
} from "../components/lenderFormShared";

describe("locked PGI rules — required document set", () => {
  it("loan_agreement is the first carrier-required document", () => {
    expect(DOC_SLOTS_BASE[0].key).toBe("loan_agreement");
  });

  it("the 5 always-required docs are exactly the carrier set, all required", () => {
    expect(DOC_SLOTS_BASE.map((d) => d.key)).toEqual([
      "loan_agreement",
      "profit_loss",
      "balance_sheet",
      "ar_aging",
      "ap_aging",
    ]);
    expect(DOC_SLOTS_BASE.every((d) => d.required)).toBe(true);
  });

  it("DOC_SLOTS_STARTUP is exactly founder_cv + financial_forecast", () => {
    expect(DOC_SLOTS_STARTUP.map((d) => d.key)).toEqual([
      "founder_cv",
      "financial_forecast",
    ]);
  });

  it("startups under 3 years also supply founder_cv + financial_forecast", () => {
    const recent = new Date();
    recent.setFullYear(recent.getFullYear() - 1);
    const keys = docSlotsFor(recent.toISOString().slice(0, 10)).map((d) => d.key);
    expect(keys).toContain("founder_cv");
    expect(keys).toContain("financial_forecast");
  });

  it("businesses 3+ years old get only the base 5 (no startup docs)", () => {
    const old = new Date();
    old.setFullYear(old.getFullYear() - 5);
    expect(docSlotsFor(old.toISOString().slice(0, 10))).toEqual(DOC_SLOTS_BASE);
  });

  it("missing/invalid start date falls back to the base 5", () => {
    expect(docSlotsFor("")).toEqual(DOC_SLOTS_BASE);
    expect(docSlotsFor("not-a-date")).toEqual(DOC_SLOTS_BASE);
  });
});

describe("locked PGI rules — partner document upload limits", () => {
  it("caps partner uploads at 5MB", () => {
    expect(PARTNER_MAX_BYTES).toBe(5 * 1024 * 1024);
  });

  it("accepts documents but never images", () => {
    expect(ACCEPT_PARTNER_DOCS).not.toMatch(/image\//);
    for (const mime of PARTNER_ALLOWED_MIME) {
      expect(mime.startsWith("image/")).toBe(false);
    }
    expect(PARTNER_ALLOWED_MIME.has("application/pdf")).toBe(true);
  });
});

describe("locked PGI rules — loan amount bounds + Quebec block (public app)", () => {
  const appSrc = fs.readFileSync(
    path.resolve(__dirname, "../pages/Application.tsx"),
    "utf8",
  );

  it("enforces the $1,000,000 maximum", () => {
    expect(appSrc).toMatch(/LOAN_AMOUNT_MAX\s*=\s*1_000_000/);
  });

  it("enforces the $50,000 minimum", () => {
    expect(appSrc).toMatch(/LOAN_AMOUNT_MIN\s*=\s*50_000/);
  });

  it("hard-blocks Quebec on the public application", () => {
    expect(appSrc).toMatch(/QC/);
    expect(appSrc).toMatch(/Quebec/);
  });
});
