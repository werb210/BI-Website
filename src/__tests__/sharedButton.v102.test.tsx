// BI_WEBSITE_DESIGN_v102 - the gold CTA must carry navy text, not white.
// White on #BF9B49 fails WCAG AA, and PageSpeed already flagged contrast
// failures on every boreal.insure page.
import { describe, it, expect } from "vitest";
import fs from "fs";

const CSS = fs.readFileSync("src/index.css", "utf8");
const HOME = fs.readFileSync("src/pages/Home.tsx", "utf8");

describe("shared button", () => {
  it("is defined once with all interactive states", () => {
    expect(CSS).toContain(".bf-btn {");
    expect(CSS).toContain(".bf-btn:focus-visible");
    expect(CSS).toContain(".bf-btn:active:not(:disabled)");
    expect(CSS).toContain(".bf-btn:disabled");
  });

  it("puts navy on gold, never white on gold", () => {
    const primary = CSS.slice(CSS.indexOf(".bf-btn--primary {"), CSS.indexOf(".bf-btn--secondary"));
    expect(primary).toContain("background: #BF9B49");
    expect(primary).toContain("color: #0B1F3A");
    expect(primary).not.toContain("color: #ffffff");
  });

  it("matches the bf-client button geometry", () => {
    expect(CSS).toContain("height: 48px");
    expect(CSS).toContain("border-radius: 8px");
    expect(CSS).toContain("padding: 0 24px");
  });
});

describe("pages use it", () => {
  it("Home no longer hand-rolls the CTA", () => {
    expect(HOME).toContain("bf-btn bf-btn--primary");
    expect(HOME).not.toContain("rounded-full bg-bf-cta");
  });
});
