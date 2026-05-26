// BI_WEBSITE_BLOCK_v336_REFERRER_PORTAL_v1
import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

const src = fs.readFileSync(path.resolve(__dirname, "../ReferrerDashboard.tsx"), "utf8");

describe("ReferrerDashboard v336 — 5-stage carrier pipeline + referrals list", () => {
  it("CARRIER_STAGES has exactly 5 entries with the canonical keys", () => {
    expect(src).toMatch(/key:\s*"submitted"/);
    expect(src).toMatch(/key:\s*"under_review"/);
    expect(src).toMatch(/key:\s*"information_required"/);
    expect(src).toMatch(/key:\s*"policy_issued"/);
    expect(src).toMatch(/key:\s*"declined"/);
  });

  it("display labels match the lender portal (SUBMITTED / UNDERWRITING / CONDITIONAL / BOUND / DECLINED)", () => {
    expect(src).toMatch(/label:\s*"SUBMITTED"/);
    expect(src).toMatch(/label:\s*"UNDERWRITING"/);
    expect(src).toMatch(/label:\s*"CONDITIONAL"/);
    expect(src).toMatch(/label:\s*"BOUND"/);
    expect(src).toMatch(/label:\s*"DECLINED"/);
  });

  it("the OLD 9-stage labels are GONE from the dashboard", () => {
    expect(src).not.toMatch(/label:\s*"New"/);
    expect(src).not.toMatch(/label:\s*"In Progress"/);
    expect(src).not.toMatch(/label:\s*"Ready"/);
    expect(src).not.toMatch(/label:\s*"Info Needed"/);
    expect(src).not.toMatch(/label:\s*"Approved"/);
    expect(src).not.toMatch(/label:\s*"Issued"/);
  });

  it("pipeline rendered in a 5-column horizontal grid", () => {
    expect(src).toMatch(/grid-cols-5/);
  });

  it("renders a 'Your referrals' list below the pipeline", () => {
    expect(src).toMatch(/Your referrals/);
    expect(src).toMatch(/<table/);
  });

  it("Pre-submission statuses (created/in_progress/ready_for_submission) are mapped to friendly labels for the list", () => {
    expect(src).toMatch(/case "created":/);
    expect(src).toMatch(/case "in_progress":/);
    expect(src).toMatch(/case "ready_for_submission":/);
  });

  it("Pre-submission referrals do NOT tally into any pipeline column", () => {
    expect(src).toMatch(/if \(map\.has\(r\.status\)\)/);
  });

  it("+ Add Referral button routes to /referrer/referrals/new", () => {
    expect(src).toMatch(/\/referrer\/referrals\/new/);
  });
});
