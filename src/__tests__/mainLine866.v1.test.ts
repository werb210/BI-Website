// BI_WEBSITE_MAIN_LINE_866_v1
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("insurance site footer", () => {
  it("shows the 866 main line as a tap-to-call link", () => {
    const s = readFileSync("src/components/Footer.tsx", "utf8");
    expect(s).toContain('const PHONE_DISPLAY = "+1 (866) 631-8939";');
    expect(s).toContain('const PHONE_HREF = "tel:+18666318939";');
    expect(s).toContain("<a href={PHONE_HREF}");
  });
});
