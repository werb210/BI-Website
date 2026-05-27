// BI_WEBSITE_BLOCK_v347_TEST1_RUN5_v1
import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

const root = path.resolve(__dirname, "..");
const r = (p: string) => fs.readFileSync(path.resolve(root, p), "utf8");

describe("v347 — API_BASE consolidation (R5-#1)", () => {
  const consumerFiles = [
    "pages/LenderLogin.tsx",
    "pages/LenderApiDocs.tsx",
    "pages/LenderApplicationTimeline.tsx",
    "pages/LenderPortal.tsx",
    "pages/LenderApplicationDetail.tsx",
    "pages/LenderSandbox.tsx",
    "pages/ReferrerAddReferral.tsx",
    "pages/ReferrerDashboard.tsx",
    "pages/Status.tsx",
  ];
  for (const file of consumerFiles) {
    it(`${file} imports API_BASE from @/config (no local constant)`, () => {
      const src = r(file);
      expect(src).toMatch(/from\s+['"]@\/config['"]/);
      // No local `const API_BASE =` definition should remain:
      expect(src).not.toMatch(/^\s*const API_BASE\s*=/m);
    });
  }
  it("config.ts exports API_BASE", () => {
    const cfg = r("config.ts");
    expect(cfg).toMatch(/export const API_BASE/);
  });
});

describe("v347 — PWA manifest start_url (R5-#6)", () => {
  it("start_url is /applications/new for app-resume on PWA install", () => {
    const m = JSON.parse(fs.readFileSync(path.resolve(root, "..", "public", "manifest.json"), "utf8"));
    expect(m.start_url).toBe("/applications/new");
  });
});
