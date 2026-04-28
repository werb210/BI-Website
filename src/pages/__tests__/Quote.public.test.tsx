// @ts-nocheck
// BI_QUOTE_PUBLIC_v44 — pin: Quote.tsx is public (no BIAuthGate).
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("BI_QUOTE_PUBLIC_v44 Quote.tsx", () => {
  const file = fs.readFileSync(path.resolve(__dirname, "../Quote.tsx"), "utf8");

  it("does not import BIAuthGate", () => {
    expect(file).not.toMatch(/import\s+.*BIAuthGate/);
  });

  it("contains a coverage slider with max 0.8", () => {
    expect(file).toMatch(/data-testid=\"coverage-slider\"/);
    expect(file).toMatch(/MAX_COVERAGE_RATIO/);
    expect(file).toMatch(/0\.8/);
  });

  it("declares the $1M loan cap", () => {
    expect(file).toMatch(/MAX_LOAN_AMOUNT\s*=\s*1_000_000/);
  });

  it("sends coverage in the estimate request body", () => {
    expect(file).toMatch(/coverage,?\s*\}\)/);
  });
});
