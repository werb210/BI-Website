// BI_WEBSITE_BLOCK_v334_PUBLIC_APP_FIXES_ROUND_2_v1
import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

const src = fs.readFileSync(path.resolve(__dirname, "../Application.tsx"), "utf8");

describe("Application.tsx v334 — round 2 fixes", () => {
  it("country defaults to 'Canada' on load", () => {
    expect(src).toMatch(/country:\s*app\.country\s*\|\|\s*"Canada"/);
  });

  it("NAICS aliases across naics_code | naics | q25_naics_code", () => {
    expect(src).toMatch(/naics_code\s*\|\|\s*app\.naics\s*\|\|\s*app\.q25_naics_code/);
  });

  it("phone pre-fill reads only pending?.phone (dead fallback keys removed)", () => {
    expect(src).toMatch(/pending\?\.phone/);
    expect(src).not.toMatch(/pending\?\.applicant\?\.phone/);
    expect(src).not.toMatch(/pending\?\.applicant_phone/);
  });

  it("address layout — street + city share row 1, province + postal share row 2", () => {
    // Street should NOT be md:col-span-2 anymore (was full-width in v330).
    const streetBlock = src.match(/Street address[\s\S]{0,400}/);
    expect(streetBlock).toBeTruthy();
    expect(streetBlock![0]).not.toMatch(/md:col-span-2/);
  });

  it("redundant top-level business_province field is removed", () => {
    expect(src).not.toMatch(/k="business_province"\s+label="Business operating province/);
  });

  it("QC block reads from business_address.province (the only source)", () => {
    expect(src).toMatch(/state\.business_address\?\.province/);
  });

  it("Declarations rendered in 2-column grid", () => {
    const declBlock = src.match(/Declarations[\s\S]{0,200}grid[\s\S]{0,50}/);
    expect(declBlock).toBeTruthy();
    expect(declBlock![0]).toMatch(/md:grid-cols-2/);
  });
});
