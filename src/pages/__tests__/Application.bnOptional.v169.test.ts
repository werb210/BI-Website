// BI_WEBSITE_BLOCK_v169_BN_OPTIONAL_v1
// Static config assertions: business_number is no longer required on
// the public application form and surfaces the CBR lookup help text.
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const src = readFileSync(
  resolve(__dirname, "../Application.tsx"),
  "utf8",
);

function findBusinessNumberFieldLine(): string {
  const lines = src.split(/\r?\n/);
  const idx = lines.findIndex((l) => l.includes('key: "business_number"'));
  if (idx < 0) throw new Error("business_number field not found");
  // The field def may span multiple lines after v169 (object literal).
  // Gather until the closing brace.
  let buf = "";
  for (let i = idx - 1; i < lines.length; i++) {
    buf += "\n" + lines[i];
    if (lines[i].includes("},")) break;
  }
  return buf;
}

describe("BI_WEBSITE_BLOCK_v169_BN_OPTIONAL_v1", () => {
  it("business_number field is NOT marked required", () => {
    const field = findBusinessNumberFieldLine();
    // Either `required: true` is absent or it's explicitly false.
    expect(/required:\s*true/.test(field)).toBe(false);
  });

  it("business_number label says it's optional", () => {
    const field = findBusinessNumberFieldLine();
    expect(field).toMatch(/Business number \(optional\)/);
  });

  it("business_number provides the CBR lookup link", () => {
    const field = findBusinessNumberFieldLine();
    expect(field).toMatch(/ised-isde\.canada\.ca\/cbr-rec/);
  });

  it("naics_code is still required (regression)", () => {
    expect(src).toMatch(/key:\s*"naics_code"[\s\S]+required:\s*true/);
  });
});
