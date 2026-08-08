import { describe, expect, it } from "vitest";
import { CA_REGIONS, US_REGIONS, isValidPostal, normalizePostal, postalLabel, regionLabel, regionsFor, toCountryCode } from "../lib/regions";

describe("US application regions", () => {
  it("normalizes current and legacy country values", () => {
    for (const value of ["US", "us", "USA", "United States"]) expect(toCountryCode(value)).toBe("US");
    for (const value of ["CA", "Canada", "", null, undefined]) expect(toCountryCode(value)).toBe("CA");
  });

  it("provides Canada without Quebec and all states plus DC", () => {
    expect(CA_REGIONS.map(({ value }) => value)).not.toContain("QC");
    expect(US_REGIONS).toHaveLength(51);
    expect(US_REGIONS.map(({ value }) => value)).toContain("DC");
    expect(regionsFor("US").map(({ value }) => value)).toContain("TX");
  });

  it("uses country-specific field labels", () => {
    expect(regionLabel("US")).toBe("State");
    expect(regionLabel("CA")).toBe("Province");
    expect(postalLabel("US")).toBe("ZIP code");
    expect(postalLabel("CA")).toBe("Postal code");
  });

  it("formats Canadian postal codes and US ZIP codes independently", () => {
    expect(normalizePostal("CA", "t3p-1p6")).toBe("T3P 1P6");
    expect(normalizePostal("US", "73301")).toBe("73301");
    expect(normalizePostal("US", "733011234")).toBe("73301-1234");
  });

  it("validates only the selected country's postal format", () => {
    expect(isValidPostal("CA", "T3P 1P6")).toBe(true);
    expect(isValidPostal("CA", "73301")).toBe(false);
    expect(isValidPostal("US", "73301-1234")).toBe(true);
    expect(isValidPostal("US", "T3P 1P6")).toBe(false);
    expect(isValidPostal("CA", "D3P 1P6")).toBe(false);
  });
});
