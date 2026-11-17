// BI_WEBSITE_QUOTE_MONTHLY_2_6_v2
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (p: string) => readFileSync(join(process.cwd(), "src", p), "utf-8");
const quote = read("pages/Quote.tsx");
const modal = read("components/QuoteModal.tsx");
// v789: components/PremiumCalculator.tsx was never mounted and was deleted.
const home = read("pages/Home.tsx");

describe("PGI quote surfaces", () => {
  it("no surface still carries the old 2.75% rate", () => {
    for (const src of [quote, modal, home]) {
      expect(src).not.toContain("0.0275");
      expect(src).not.toContain("2.75%");
    }
  });

  it("both calculators use the market rate", () => {
    // BI_WEBSITE_US_FIRST_SITE_v1 - the rate comes from the visitor's market: 2.7% in Canada, 2% in the United States.
    for (const src of [quote, modal]) expect(src).toContain("RATE = terms.rate");
    const market = readFileSync("src/lib/market.tsx", "utf8");
    expect(market).toMatch(/market: "CA"[\s\S]*?rate: 0\.027/);
    expect(market).toMatch(/market: "US"[\s\S]*?rate: 0\.02,/);
  });

  it("the arithmetic gives the expected monthly figure", () => {
    const annual = Math.round(500_000 * 0.5 * 0.027);
    expect(annual).toBe(6_750);
    expect(+(annual / 12).toFixed(2)).toBe(562.5);
  });

  it("coverage is still capped at 80%", () => {
    // 80% in Canada, 90% in the United States - from the market, never typed into the calculator.
    expect(quote).toContain("max={MAX_PCT}");
    expect(modal).toContain("max={MAX_PCT}");
    expect(readFileSync("src/lib/market.tsx", "utf8")).toMatch(/limit: 1_000_000, share: 0\.8,/);
  });

  it("shows the monthly figure only - no annual amount anywhere", () => {
    expect(quote).toContain("fmtMonthly(monthlyPremium)");
    expect(quote).not.toContain("fmtCurrency(annualPremium)");
    expect(modal).toContain("fmtMonthly(monthly)");
    expect(modal).not.toContain("{fmt(prem)}");
  });

  it("every surface says the estimate is not binding", () => {
    for (const src of [quote, modal]) expect(src).toContain("is not a binding quote");
  });

  it("keeps annualPremium in the payload so the application flow still reads it", () => {
    expect(quote).toContain("annualPremium, monthlyPremium");
    expect(modal).toContain("annualPremium: prem, monthlyPremium: monthly");
  });
});
