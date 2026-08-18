// BI_WEBSITE_LIGHT_v104 - boreal.financial is a white page with navy and mist
// sections. boreal.insure was dark everywhere, which is what still made the
// two read as different companies after the palette matched.
import { describe, it, expect } from "vitest";
import fs from "fs";

const HOME = fs.readFileSync("src/pages/Home.tsx", "utf8");

describe("the page is light", () => {
  it("main is white with navy text", () => {
    expect(HOME).toContain('<main className="min-h-screen bg-white text-[#0B1F3A]">');
    expect(HOME).not.toContain('bg-bf-bg text-slate-200');
  });

  it("the hero stays navy, as the template's does", () => {
    expect(HOME).toContain('<section className="bg-bf-bg">');
  });

  it("mid sections are mist bands with hairlines", () => {
    expect(HOME).toContain('border-y border-bf-line bg-bf-mist');
    expect(HOME).toContain('border-b border-bf-line bg-bf-mist');
  });

  it("cards are white on mist, not dark on dark", () => {
    expect(HOME).toContain('border border-bf-line bg-white p-6');
    expect(HOME).not.toContain('border border-card bg-bf-surface p-6');
  });
});

describe("type inverts with the ground", () => {
  it("headings below the hero are navy, not white", () => {
    expect(HOME).toContain('text-3xl font-bold text-[#0B1F3A] text-center');
    expect(HOME).not.toContain('text-3xl font-bold text-white text-center');
  });
});

describe("copy is untouched", () => {
  for (const phrase of [
    "Stop putting your house on the line",
    "referral and risk advisory partner",
    "How it works",
  ]) {
    it(`still says: ${phrase}`, () => {
      expect(HOME).toContain(phrase);
    });
  }
});
