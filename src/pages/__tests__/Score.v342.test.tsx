// BI_WEBSITE_BLOCK_v342_SCORE_INLINE_GUARDRAILS_v1
import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

const src = fs.readFileSync(path.resolve(__dirname, "../Score.tsx"), "utf8");

describe("v342 — Stage 1 inline guardrails on Score.tsx", () => {
  it("declares the $1M cap + 80% coverage ratio constants", () => {
    expect(src).toMatch(/LOAN_AMOUNT_MAX_V342\s*=\s*1_000_000/);
    expect(src).toMatch(/PGI_COVERAGE_RATIO_V342\s*=\s*0\.80/);
  });

  it("computes pgiMaxAllowed = floor(min(loan, $1M) × 0.80)", () => {
    expect(src).toMatch(/loanForCap\s*=\s*Math\.max\(0,\s*Math\.min\(/);
    expect(src).toMatch(/pgiMaxAllowed\s*=\s*Math\.floor\(loanForCap\s*\*\s*PGI_COVERAGE_RATIO_V342\)/);
  });

  it("renders inline error 'below the $50,000 minimum' below the loan amount input", () => {
    expect(src).toMatch(/below the \$50,000 minimum/);
  });

  it("renders inline error 'cannot exceed $1,000,000' below the loan amount input", () => {
    expect(src).toMatch(/cannot exceed \$1,000,000/);
  });

  it("renders inline error 'cannot exceed 80% of loan amount' below the PGI slider", () => {
    expect(src).toMatch(/cannot exceed 80% of loan amount/);
  });

  it("PGI slider's max attribute is bound to pgiMaxAllowed (NOT raw loan_amount × 0.80)", () => {
    // The new code uses pgiMaxAllowed; ensure no leftover unbounded computation.
    expect(src).toMatch(/max=\{pgiMaxAllowed\}/);
    // No leftover unguarded `Number(v.loan_amount) * 0.8` in a max= prop.
    const maxAttrs = src.match(/max=\{[^}]+\}/g) || [];
    const bad = maxAttrs.find((m) => /Number\(v\.loan_amount\)\s*\*\s*0\.8\b/.test(m));
    expect(bad).toBeUndefined();
  });
});
