// BI_WEBSITE_BLOCK_v789_AUDIT_ROUND2 [3][145]
import { describe, it, expect } from "vitest";
import { existsSync, readdirSync, readFileSync } from "node:fs";

const CI = readFileSync(".github/workflows/ci-audit.yml", "utf8");

describe("CI", () => {
  it("runs on pull_request and push", () => {
    expect(CI).toMatch(/^on:\n {2}push:[\s\S]*?\n {2}pull_request:/m);
  });

  it("runs npm ci, the vitest suite and the build, in that order", () => {
    const steps = ["run: npm ci", "run: npx vitest run --environment=jsdom", "run: npm run build"].map((s) => CI.indexOf(s));
    expect(steps.every((i) => i > 0)).toBe(true);
    expect([...steps].sort((a, b) => a - b)).toEqual(steps);
  });

  it("deploys to Static Web Apps only after the audit job passes, on main", () => {
    const deploy = CI.slice(CI.indexOf("\n  deploy:"));
    expect(deploy).toContain("needs: audit");
    expect(deploy).toContain("if: github.event_name == 'push' && github.ref == 'refs/heads/main'");
    expect(deploy).toContain("Azure/static-web-apps-deploy@v1");
    expect(deploy).toContain("skip_app_build: true");
  });

  it("no other workflow deploys", () => {
    const others = readdirSync(".github/workflows").filter((f) => f !== "ci-audit.yml");
    for (const f of others) {
      expect(readFileSync(`.github/workflows/${f}`, "utf8"), f).not.toContain("static-web-apps-deploy");
    }
    expect(existsSync(".github/workflows/azure-static-web-apps-witty-moss-0886d220f.yml")).toBe(false);
  });
});
