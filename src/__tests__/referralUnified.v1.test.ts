// BI_WEBSITE_REFERRAL_LANDING_v1
import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

const root = path.resolve(__dirname, "..");
const r = (p: string) => fs.readFileSync(path.resolve(root, p), "utf8");

describe("bi-website referral unified into BF", () => {
  it("PGI landing exists and links Apply now (with ref) + Learn more", () => {
    const page = r("pages/ReferralLandingPgi.tsx");
    expect(page).toContain("/applications/new?ref=");
    expect(page).toContain("https://www.boreal.insure/");
  });

  it("App mounts /r/:code and no longer serves the old referrer portal", () => {
    const app = r("App.tsx");
    expect(app).toContain('path="/r/:code"');
    expect(app).toContain("ReferralLandingPgi");
    expect(app).not.toContain("./pages/ReferrerPortal");
  });

  // BI_WEBSITE_NO_REFERRER_LOGIN_v1 (Todd, 2026-11-19) - the referrer login is on boreal.financial only.
  it("Header and Footer have no referrer login", () => {
    const header = r("components/Header.tsx");
    const footer = r("components/Footer.tsx");
    expect(header).not.toContain("https://staff.boreal.financial/referrer");
    expect(header).not.toContain('to="/referrer/login"');
    expect(footer).not.toContain("https://staff.boreal.financial/referrer");
    expect(footer).not.toContain('to="/referrer/login"');
  });
});
