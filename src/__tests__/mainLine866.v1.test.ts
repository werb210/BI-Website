// BI_WEBSITE_MAIN_LINE_866_v1
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("insurance site footer", () => {
  it("shows the Insurance line as a tap-to-call link", () => {
    // v789: the number lives in src/lib/operator.ts, shown as (844) 797-6700.
    const s = readFileSync("src/components/Footer.tsx", "utf8");
    const op = readFileSync("src/lib/operator.ts", "utf8");
    expect(op).toContain('OPERATOR_PHONE_DISPLAY = "(844) 797-6700";');
    expect(op).toContain('OPERATOR_PHONE_HREF = "tel:+18447976700";');
    expect(s).toContain("const PHONE_DISPLAY = OPERATOR_PHONE_DISPLAY;");
    expect(s).toContain("const PHONE_HREF = OPERATOR_PHONE_HREF;");
    expect(s).toContain("<a href={PHONE_HREF}");
  });
});
