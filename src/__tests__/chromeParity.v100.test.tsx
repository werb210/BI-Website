// BI_WEBSITE_CHROME_v100 - BF-Website's footer is the template. Geometry is
// asserted here; the compliance copy is asserted separately because it is
// regulatory text that must survive any restyling.
import { describe, it, expect } from "vitest";
import fs from "fs";

const FOOTER = fs.readFileSync("src/components/Footer.tsx", "utf8");

describe("footer geometry matches BF-Website", () => {
  it("uses the template shell", () => {
    expect(FOOTER).toContain('bg-[#0a1120] border-t border-[#1c2538] text-white/80 px-6 py-8');
    expect(FOOTER).toContain('max-w-[1200px] mx-auto');
  });

  it("uses the template grid and gap", () => {
    expect(FOOTER).toContain('grid gap-8 mb-6');
    expect(FOOTER).toContain("repeat(auto-fit, minmax(220px, 1fr))");
  });

  it("uses the template type scale on links and the bottom bar", () => {
    expect(FOOTER).toContain('text-sm leading-loose');
    expect(FOOTER).toContain('pt-4 flex justify-between text-xs text-white/75');
  });

  it("carries the logo in the brand column, as the template does", () => {
    expect(FOOTER).toContain('logo-boreal-mountains-white.svg');
    expect(FOOTER).toContain('h-8 w-auto');
  });

  it("dropped the inline style layout", () => {
    expect(FOOTER).not.toContain('padding: "32px 24px 24px"');
    expect(FOOTER).not.toContain('maxWidth: 1200');
    expect(FOOTER).not.toContain('fontSize: 14');
  });
});

describe("compliance copy is preserved verbatim", () => {
  // BI_WEBSITE_PGI_COMPLIANCE_v1 (2026-11-19) - the disclosures PGI Canada Ltd.'s notice requires.
  for (const phrase of [
    "is not a licensed insurance broker, agent or insurer",
    "is a referral partner of {PGI_BROKER}",
    "arranged and administered by {PGI_BROKER}, a licensed",
    "except Quebec residents",
    "will be arranged by PGI America Ltd.",
    "does not prevent business failure",
    "Questions about this referral service",
  ]) {
    it(`still states: ${phrase}`, () => {
      expect(FOOTER).toContain(phrase);
    });
  }
});

describe("nothing PGI has not authorized (BI_WEBSITE_PGI_COMPLIANCE_v1)", () => {
  it("names no insurer brand, rate estimate or referral compensation", () => {
    expect(FOOTER).not.toMatch(/Markel|referral compensation|Premium estimates|AM Best/);
  });
});
