// BI_WEBSITE_BLOCK_v344_REFERRER_WIRE_BRIDGE_v1
import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

const src = fs.readFileSync(path.resolve(__dirname, "../App.tsx"), "utf8");

describe("v344 — App.tsx ref capture accepts both short_code and UUID", () => {
  it("short code regex preserved", () => {
    expect(src).toMatch(/\^\[a-z0-9\]\{4,16\}\$/i);
  });
  it("UUID regex added", () => {
    expect(src).toMatch(/\^\[0-9a-f\]\{8\}-\[0-9a-f\]\{4\}-\[0-9a-f\]\{4\}-\[0-9a-f\]\{4\}-\[0-9a-f\]\{12\}\$/i);
  });
  it("either format triggers localStorage write", () => {
    expect(src).toMatch(/if \(isShortCode \|\| isUuid\) localStorage\.setItem/);
  });
});
