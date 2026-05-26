// BI_WEBSITE_BLOCK_v346_MOBILE_FIRST_LAUNCH_v1
import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

const root = path.resolve(__dirname, "..");
const r = (p: string) => fs.readFileSync(path.resolve(root, p), "utf8");

const app = r("App.tsx");
const home = r("pages/Home.tsx");
const header = r("components/Header.tsx");
const quote = r("pages/Quote.tsx");
const footer = r("components/Footer.tsx");
const quoteModal = r("components/QuoteModal.tsx");

describe("v346 — ScrollToTop wired in App.tsx (b)", () => {
  it("imports ScrollToTop", () => {
    expect(app).toMatch(/import\s+ScrollToTop\s+from/);
  });
  it("renders <ScrollToTop />", () => {
    expect(app).toMatch(/<ScrollToTop\s*\/>/);
  });
});

describe("v346 — 'Get Started' rename (c)", () => {
  for (const [name, src] of Object.entries({ home, header, quote, footer, quoteModal })) {
    it(`${name} has no remaining 'Apply Now' button text`, () => {
      expect(src).not.toMatch(/>\s*Apply Now\s*</);
    });
    it(`${name} has no remaining 'Start eligibility check' text`, () => {
      expect(src).not.toMatch(/>\s*Start eligibility check\s*</);
    });
  }
  it("Home has Get Started in at least 2 places", () => {
    const matches = home.match(/>Get Started</g) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });
});
