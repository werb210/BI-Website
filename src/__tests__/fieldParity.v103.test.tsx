// BI_WEBSITE_DESIGN_v103 - the application form ran on a sky-blue palette
// unrelated to anything else, and gave keyboard users almost no focus signal.
import { describe, it, expect } from "vitest";
import fs from "fs";

const APP = fs.readFileSync("src/pages/Application.tsx", "utf8");
const CSS = fs.readFileSync("src/index.css", "utf8");

describe("form fields use the shared treatment", () => {
  it("dropped the sky-blue palette", () => {
    expect(APP).not.toContain("bg-sky-500/15");
    expect(APP).not.toContain("border-sky-300");
    expect(APP).not.toContain("text-sky-100");
    expect(APP).not.toContain("text-rose-300");
    expect(APP).not.toContain("sky-");
  });

  it("uses the shared field class", () => {
    expect(APP).toContain('const INPUT_CLS = "bf-field"');
  });
});

describe("the field has a visible focus state", () => {
  it("rings gold, like every button and every other property", () => {
    expect(CSS).toContain(".bf-field:focus");
    expect(CSS).toContain("border-color: #BF9B49");
    expect(CSS).toContain("rgba(191, 155, 73, 0.45)");
  });

  it("matches the bf-client field geometry", () => {
    const field = CSS.slice(CSS.indexOf(".bf-field {"), CSS.indexOf(".bf-field::placeholder"));
    expect(field).toContain("height: 48px");
    expect(field).toContain("min-height: 44px");
    expect(field).toContain("border-radius: 8px");
  });

  it("handles select and textarea, which cannot use a fixed height", () => {
    expect(CSS).toContain("textarea.bf-field");
    expect(CSS).toContain("height: auto");
  });
});
