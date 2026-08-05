// BI_WEBSITE_QUOTE_MONTHLY_2_6_v2
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (p: string) => readFileSync(join(process.cwd(), "src", p), "utf-8");
const quote = read("pages/Quote.tsx");
const modal = read("components/QuoteModal.tsx");
const calc = read("components/PremiumCalculator.tsx");
const home = read("pages/Home.tsx");

describe("PGI quote surfaces", () => {
  it("no surface still carries the old 2.75% rate", () => {
    for (const src of [quote, modal, calc, home]) {
      expect(src).not.toContain("0.0275");
      expect(src).not.toContain("2.75%");
    }
  });

  it("the three calculators use 2.6%", () => {
    for (const src of [quote, modal, calc]) expect(src).toContain("const RATE = 0.026;");
  });

  it("the arithmetic gives the expected monthly figure", () => {
    const annual = Math.round(500_000 * 0.5 * 0.026);
    expect(annual).toBe(6_500);
    expect(+(annual / 12).toFixed(2)).toBe(541.67);
  });

  it("coverage is still capped at 80%", () => {
    expect(quote).toContain("max={80}");
    expect(modal).toContain("max={80}");
  });

  it("shows the monthly figure only - no annual amount anywhere", () => {
    expect(quote).toContain("fmtMonthly(monthlyPremium)");
    expect(quote).not.toContain("fmtCurrency(annualPremium)");
    expect(modal).toContain("fmtMonthly(monthly)");
    expect(modal).not.toContain("{fmt(prem)}");
    expect(calc).toContain("Estimated Monthly Premium");
    expect(calc).not.toContain("Estimated Annual Premium");
  });

  it("every surface says the estimate is not binding", () => {
    for (const src of [quote, modal, calc]) expect(src).toContain("is not a binding quote");
  });

  it("keeps annualPremium in the payload so the application flow still reads it", () => {
    expect(quote).toContain("annualPremium, monthlyPremium");
    expect(modal).toContain("annualPremium: prem, monthlyPremium: monthly");
  });
});
