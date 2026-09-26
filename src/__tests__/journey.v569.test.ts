// BI_WEBSITE_BLOCK_v569_VISITOR_JOURNEY
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { captureAttribution, shouldTrack } from "../utils/journey";

describe("v569 visitor journey", () => {
  it("records the ad, campaign and landing page", () => {
    expect(captureAttribution("https://www.boreal.insure/what-is-pgi?utm_source=google&utm_campaign=pgi&gclid=abc", "https://www.google.com/"))
      .toEqual({ landing_page: "/what-is-pgi", referrer: "https://www.google.com/", gclid: "abc", utm_source: "google", utm_campaign: "pgi" });
    expect(captureAttribution("https://www.boreal.insure/", "https://www.boreal.insure/faq")).toEqual({ landing_page: "/" });
  });
  it("tracks prospects, not the lender or referrer portals", () => {
    expect(shouldTrack("/applications/PGI-1/form")).toBe(true);
    expect(shouldTrack("/lender/login")).toBe(false);
    expect(shouldTrack("/referrer")).toBe(false);
  });
  it("sends text/plain to BI-Server and is wired to every route change", () => {
    const src = readFileSync("src/utils/journey.ts", "utf8");
    expect(src).toContain("/api/v1/bi/track/journey");
    expect(src).toContain('"text/plain"');
    const rt = readFileSync("src/components/RouteTracker.tsx", "utf8");
    expect(rt).toContain("trackPageview(location.pathname);");
  });
});
