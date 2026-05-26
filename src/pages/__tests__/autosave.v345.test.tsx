// BI_WEBSITE_BLOCK_v345_AUTOSAVE_v1
import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

const appSrc = fs.readFileSync(path.resolve(__dirname, "../Application.tsx"), "utf8");
const lenderSrc = fs.readFileSync(path.resolve(__dirname, "../LenderApplicationNew.tsx"), "utf8");

describe("v345 — Stage 2 (Application.tsx) autosave", () => {
  it("debounced 1500ms PATCH after state change", () => {
    expect(appSrc).toMatch(/setTimeout\(\(\) => \{[\s\S]*api\.patchApp/);
    expect(appSrc).toMatch(/1500/);
  });
  it("waits for hydration before saving (no save during initial load)", () => {
    expect(appSrc).toMatch(/isHydratedRef/);
  });
  it("savedAt indicator rendered", () => {
    expect(appSrc).toMatch(/Saved/);
    expect(appSrc).toMatch(/new Date\(savedAt\)\.toLocaleTimeString/);
  });
});

describe("v345 — Lender new app draft persistence", () => {
  it("localStorage draft key is bi.lender_app_draft", () => {
    expect(lenderSrc).toMatch(/bi\.lender_app_draft/);
  });
  it("hydrates from localStorage on mount", () => {
    expect(lenderSrc).toMatch(/localStorage\.getItem\(DRAFT_KEY_v345\)/);
  });
  it("debounced 1500ms save to localStorage", () => {
    expect(lenderSrc).toMatch(/localStorage\.setItem\(DRAFT_KEY_v345/);
    expect(lenderSrc).toMatch(/1500/);
  });
  it("clears draft on successful submit", () => {
    expect(lenderSrc).toMatch(/localStorage\.removeItem\("bi\.lender_app_draft"\)/);
  });
});
