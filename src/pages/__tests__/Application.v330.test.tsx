// BI_WEBSITE_BLOCK_v330_PUBLIC_APP_FIXES_v1
import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

const src = fs.readFileSync(path.resolve(__dirname, "../Application.tsx"), "utf8");

describe("Application.tsx v330 — public fixes", () => {
  it("calls api.getApp (not api.get) — the v327 runtime bug fix", () => {
    expect(src).toMatch(/api\.getApp\(/);
    expect(src).not.toMatch(/api\.get\(`/);
  });

  it("calls api.patchApp and api.submit (not api.patch/api.post)", () => {
    expect(src).toMatch(/api\.patchApp\(/);
    expect(src).toMatch(/api\.submit\(/);
    expect(src).not.toMatch(/api\.patch\(`/);
    expect(src).not.toMatch(/api\.post\(`/);
  });

  it("pre-fills phone from api.getMyPendingApplication", () => {
    expect(src).toMatch(/getMyPendingApplication/);
    expect(src).toMatch(/guarantor_phone/);
  });

  it("uses structured address fields (line1/city/province/postal_code)", () => {
    expect(src).toMatch(/AddressInputGroup/);
    expect(src).toMatch(/postal_code/);
    expect(src).toMatch(/POSTAL_RE/);
  });

  it("has a 'Use today' button on date inputs", () => {
    expect(src).toMatch(/withTodayButton/);
    expect(src).toMatch(/Use today/);
  });

  it("has a BN lookup popup button (federal Canada Business Registries)", () => {
    expect(src).toMatch(/openBnLookup/);
    expect(src).toMatch(/Look up by name/);
    expect(src).toMatch(/ised-isde\.canada\.ca/);
  });

  it("uses light-blue input styling (sky-500 bg + white text)", () => {
    expect(src).toMatch(/bg-sky-500/);
    expect(src).toMatch(/text-white/);
  });

  it("does NOT use Section accordion wrappers", () => {
    expect(src).not.toMatch(/import.+Section.+from.+components\/Section/);
    expect(src).not.toMatch(/<Section\s/);
  });

  it("renders fields in 2-column grid layout", () => {
    expect(src).toMatch(/grid-cols-1 md:grid-cols-2/);
  });

  it("Section 6 renamed — consents only, uploads on next step", () => {
    expect(src).toMatch(/Consents/);
    expect(src).toMatch(/document uploads happen on the next step/);
  });
});
