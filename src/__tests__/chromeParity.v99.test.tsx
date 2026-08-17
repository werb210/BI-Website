// BI_WEBSITE_CHROME_v99 - BF-Website's Header is the template. These assert the
// shared geometry, so a link cannot drift a few pixels between properties
// without a test going red. BI's own brand strings are asserted separately.
import { describe, it, expect } from "vitest";
import fs from "fs";

const HEADER = fs.readFileSync("src/components/Header.tsx", "utf8");

describe("header geometry matches BF-Website", () => {
  it("uses the template's 80px row", () => {
    expect(HEADER).toContain("min-h-20");
  });

  it("uses the template's 1120px container with 24px padding", () => {
    expect(HEADER).toContain("max-w-[1120px]");
    expect(HEADER).toContain("px-6");
  });

  it("uses the template type scale", () => {
    expect(HEADER).toContain("text-base font-semibold tracking-wide text-white sm:text-xl");
    expect(HEADER).toContain("text-sm");
  });

  it("uses the template nav spacing and breakpoint", () => {
    expect(HEADER).toContain("gap-6");
    expect(HEADER).toContain("md:flex");
    expect(HEADER).toContain("md:hidden");
  });

  it("has hover states on nav links", () => {
    expect(HEADER).toContain("hover:text-white");
  });

  it("uses the template CTA, not the old #3b82f6 pill", () => {
    expect(HEADER).toContain("rounded-full bg-blue-600 px-5 py-2");
    expect(HEADER).not.toContain("#3b82f6");
  });

  it("dropped the hand-rolled style block and inline layout", () => {
    expect(HEADER).not.toContain("bi-header-row");
    expect(HEADER).not.toContain("bi-header-nav-desktop");
    expect(HEADER).not.toContain("max-width: 1200px");
    expect(HEADER).not.toContain("@media (max-width: 767px)");
  });
});

describe("BI keeps its own brand", () => {
  it("wordmark and links are BI's", () => {
    expect(HEADER).toContain("Boreal Risk Management");
    expect(HEADER).toContain("/applications/new");
    expect(HEADER).toContain("/lender/login");
  });

  it("never says insurance in public copy", () => {
    expect(HEADER.toLowerCase()).not.toContain("insurance");
  });
});
