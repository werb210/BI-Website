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
    expect(FOOTER).toContain('pt-4 flex justify-between text-xs text-white/55');
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
  for (const phrase of [
    "We are not a licensed insurance broker",
    "underwritten by Markel Canada Limited",
    "Not available to Quebec residents",
    "no cost to the policyholder",
    "may receive referral compensation",
    "does not prevent business failure",
    "Questions about this referral service",
  ]) {
    it(`still states: ${phrase}`, () => {
      expect(FOOTER).toContain(phrase);
    });
  }
});
