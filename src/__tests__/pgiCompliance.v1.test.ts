// BI_WEBSITE_PGI_COMPLIANCE_v1 (2026-11-19) - PGI Canada Ltd.'s written notice: the pages a visitor can reach must not
// publish rates other than the authorized Canadian line, made-up eligibility, uninsurable deal types, "pays the
// bank/lender", "protects your house/savings", lender-benefit claims, negotiating leverage or referral fees.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (f: string) => readFileSync(`src/${f}`, "utf8");
const PAGES = ["pages/Home.tsx", "pages/USLenders.tsx", "components/Footer.tsx", "components/Header.tsx", "pages/ReferralLandingPgi.tsx", "pages/Terms.tsx"];
const BANNED = [
  /2\.6%|2\.7%|~2%|about 2%|1\.5.{0,3}3\.0%/,
  /\$50K|\$50,000 of EBITDA|12\+ months|EBITDA and 12/,
  /pays the (bank|lender)|pays the lender directly/i,
  /RRSP|house,? retirement|savings.{0,20}protected|fully protected|family estate/i,
  /seller note|vendor.?take.?back|surety|floor plan|merchant cash|commercial lease/i,
  /stronger guarantee|better.quality guarantee|lend with confidence|faster.{0,20}recover/i,
  /negotiating leverage|narrower guarantee/i,
  /referral fee|commission/i,
  /Markel/,
];

describe("visitor pages carry only what PGI authorized", () => {
  for (const f of PAGES) {
    it(f, () => {
      const src = read(f);
      for (const re of BANNED) expect(src, `${f} matches ${re}`).not.toMatch(re);
    });
  }
  it("the only Canadian rate statement is the authorized one", () => {
    expect(read("lib/pgiPartner.ts")).toContain("Rates start as low as 1.8% of the limit of insurance.");
  });
  it("withdrawn pages redirect", () => {
    const app = read("App.tsx");
    for (const path of ["/quote", "/faq", "/how-it-works", "/what-is-pgi", "/coverage", "/why-it-matters", "/sba", "/csbfp"]) {
      expect(app).toMatch(new RegExp(`path="${path}" element=\\{<Navigate`));
    }
  });
});

// BI_WEBSITE_OWN_APPLICATION_v1 (2026-11-20) - visitors apply on our own form; nothing sends them to the carrier's site.
describe("applications stay on our site", () => {
  it("no visitor page links to pgicover.com", () => {
    for (const f of ["pages/Home.tsx", "components/Footer.tsx", "components/Header.tsx", "lib/pgiPartner.ts"]) {
      expect(read(f), f).not.toMatch(/pgicover\.com/);
    }
    expect(read("lib/pgiPartner.ts")).toContain('APPLY_PATH = "/applications/new"');
  });
});
