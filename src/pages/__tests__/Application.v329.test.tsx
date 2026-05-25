// BI_WEBSITE_BLOCK_v329_LOAN_PURPOSE_PGI_PARITY_v1
import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

const src = fs.readFileSync(path.resolve(__dirname, "../Application.tsx"), "utf8");

describe("LOAN_PURPOSES PGI parity (v329)", () => {
  it("matches PGI's exact label wording", () => {
    expect(src).toMatch(/label:\s*"Working Capital"/);
    expect(src).toMatch(/label:\s*"Acquisition"/);
    expect(src).toMatch(/label:\s*"Expansion"/);
    expect(src).toMatch(/label:\s*"Equipment Purchase"/);
    expect(src).toMatch(/label:\s*"Real Estate"/);
    expect(src).toMatch(/label:\s*"Refinance"/);
    expect(src).toMatch(/label:\s*"Other"/);
  });

  it("does NOT use sentence-case labels (the pre-v329 spelling)", () => {
    expect(src).not.toMatch(/label:\s*"Working capital"/);
    expect(src).not.toMatch(/label:\s*"Equipment purchase"/);
    expect(src).not.toMatch(/label:\s*"Real estate"/);
    expect(src).not.toMatch(/label:\s*"Business expansion \/ growth"/);
  });

  it("preserves snake_case values so server persistence is unchanged", () => {
    expect(src).toMatch(/value:\s*"working_capital"/);
    expect(src).toMatch(/value:\s*"equipment"/);
    expect(src).toMatch(/value:\s*"real_estate"/);
  });

  it("matches PGI's exact ordering", () => {
    const orderMatch = src.match(/const LOAN_PURPOSES[\s\S]*?\];/);
    expect(orderMatch).toBeTruthy();
    const block = orderMatch![0];
    // Strip out the constant declaration and split into entries.
    const entries: string[] = [];
    const re = /value:\s*"([a-z_]+)"/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(block)) !== null) entries.push(m[1]);
    expect(entries).toEqual([
      "working_capital", "acquisition", "expansion", "equipment", "real_estate", "refinance", "other",
    ]);
  });
});
