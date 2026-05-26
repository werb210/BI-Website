// BI_WEBSITE_BLOCK_v339_REFERRER_PORTAL_FIX_v1
import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

const src = fs.readFileSync(path.resolve(__dirname, "../ReferrerPortal.tsx"), "utf8");

describe("ReferrerPortal v339 — STAGES is the 5 carrier stages", () => {
  it("STAGES has exactly 5 entries (the carrier stages)", () => {
    const m = src.match(/const STAGES = \[(.*?)\] as const/s);
    expect(m).toBeTruthy();
    const entries = m![1].match(/"[a-z_]+"/g) || [];
    expect(entries.length).toBe(5);
    expect(entries).toContain('"submitted"');
    expect(entries).toContain('"under_review"');
    expect(entries).toContain('"information_required"');
    expect(entries).toContain('"policy_issued"');
    expect(entries).toContain('"declined"');
  });
  it("Pre-submission/Boreal-added stages NOT in STAGES", () => {
    const m = src.match(/const STAGES = \[(.*?)\] as const/s);
    expect(m![1]).not.toMatch(/"new"/);
    expect(m![1]).not.toMatch(/"in_progress"/);
    expect(m![1]).not.toMatch(/"ready_for_submission"/);
    expect(m![1]).not.toMatch(/"approved"/);
  });
  it("STAGE_LABELS uses lender-portal labels (SUBMITTED / UNDERWRITING / CONDITIONAL / BOUND / DECLINED)", () => {
    expect(src).toMatch(/submitted:\s*"SUBMITTED"/);
    expect(src).toMatch(/under_review:\s*"UNDERWRITING"/);
    expect(src).toMatch(/information_required:\s*"CONDITIONAL"/);
    expect(src).toMatch(/policy_issued:\s*"BOUND"/);
    expect(src).toMatch(/declined:\s*"DECLINED"/);
  });
  it("Pre-submission labels still present for the list-below view", () => {
    expect(src).toMatch(/created:\s*"Draft"/);
    expect(src).toMatch(/in_progress:\s*"In progress"/);
    expect(src).toMatch(/ready_for_submission:\s*"Ready"/);
  });
});

describe("ReferrerPortal v339 — referrals list below pipeline", () => {
  it("'Your referrals' heading rendered", () => {
    expect(src).toMatch(/Your referrals/);
  });
  it("empty-state message rendered when no referrals", () => {
    expect(src).toMatch(/You haven't added any referrals yet/);
  });
  it("table has Name / Company / Contact / Status / Added columns", () => {
    expect(src).toMatch(/<th[^>]*>Name<\/th>/);
    expect(src).toMatch(/<th[^>]*>Company<\/th>/);
    expect(src).toMatch(/<th[^>]*>Contact<\/th>/);
    expect(src).toMatch(/<th[^>]*>Status<\/th>/);
    expect(src).toMatch(/<th[^>]*>Added<\/th>/);
  });
});

describe("ReferrerPortal v339 — phone inputs tightened", () => {
  it("at least one input uses type=tel", () => {
    expect(src).toMatch(/type="tel"/);
  });
  it("at least one input uses inputMode=tel", () => {
    expect(src).toMatch(/inputMode="tel"/);
  });
  it("at least one input uses autoComplete=tel", () => {
    expect(src).toMatch(/autoComplete="tel"/);
  });
  it("placeholder hints at the expected format", () => {
    expect(src).toMatch(/\+1 \(555\) 555-5555/);
  });
});
