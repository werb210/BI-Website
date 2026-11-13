// BI_WEBSITE_US_DECLARATION_v1 / BI_WEBSITE_SBA_PAGE_v1
import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";

describe("United States applicants", () => {
  const app = readFileSync("src/pages/Application.tsx", "utf8");
  const lender = readFileSync("src/components/LenderApplicationFormBody.tsx", "utf8");
  it("are asked the declaration about the IRS and CBP, on both forms", () => {
    expect(app).toContain("Internal Revenue Service (IRS) or U.S. Customs and Border Protection (CBP)");
    expect(app).toMatch(/k === "section_2_c" && country === "US"/);
    expect(lender).toContain("Internal Revenue Service (IRS) or U.S. Customs and Border Protection (CBP)");
  });
  it("can have co-guarantors on a lender file", () => {
    expect(lender).not.toContain("Canada only");
  });
  it("have an SBA page, named on the home page and in the Knowledge Center", () => {
    expect(readFileSync("src/pages/SBA.tsx", "utf8")).toContain("owner of 20% or more");
    expect(readFileSync("src/pages/Home.tsx", "utf8")).toContain("SBA and CSBFP loans");
    expect(readFileSync("src/pages/Resources.tsx", "utf8")).toContain('to:"/sba"');
  });
});
