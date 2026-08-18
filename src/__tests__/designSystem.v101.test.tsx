// BI_WEBSITE_DESIGN_v101 - body pages render from the bf.* tailwind tokens, so
// those values are the design system for the whole site.
import { describe, it, expect } from "vitest";
import fs from "fs";

const TW = fs.readFileSync("tailwind.config.ts", "utf8");
const CSS = fs.readFileSync("src/index.css", "utf8");
const HTML = fs.readFileSync("index.html", "utf8");

describe("palette matches the CURRENT BF-Website", () => {
  it("uses boreal navy and gold", () => {
    expect(TW).toContain('surface: "#0B1F3A"');
    expect(TW).toContain('cta: "#BF9B49"');
    expect(TW).toContain('mist: "#F5F8FC"');
  });

  it("dropped the pre-rebuild dark theme values", () => {
    expect(TW).not.toContain("#020817");
    expect(TW).not.toContain("#2563eb");
    expect(CSS).not.toContain("--bf-cta: #2563eb");
  });

  it("css variables stay in step with the tailwind tokens", () => {
    expect(CSS).toContain("--bf-cta: #BF9B49");
    expect(CSS).toContain("--bf-surface: #0B1F3A");
  });
});

describe("typography matches BF-Website", () => {
  it("declares both faces in tailwind", () => {
    expect(TW).toContain("'Libre Caslon Text'");
    expect(TW).toContain("'Public Sans'");
  });

  it("applies them at the root", () => {
    expect(CSS).toContain('font-family: "Public Sans"');
    expect(CSS).toContain('font-family: "Libre Caslon Text"');
  });

  it("loads them without blocking render", () => {
    expect(HTML).toContain("Libre+Caslon+Text");
    expect(HTML).toContain('media="print"');
  });
});
