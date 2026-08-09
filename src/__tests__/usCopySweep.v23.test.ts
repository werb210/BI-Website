// BI_WEBSITE_US_COPY_SWEEP_v23
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const files = {
  badge: readFileSync("src/components/MarkelBadge.tsx", "utf8"),
  home: readFileSync("src/pages/Home.tsx", "utf8"),
  footer: readFileSync("src/components/Footer.tsx", "utf8"),
  faq: readFileSync("src/components/Faq.tsx", "utf8"),
  application: readFileSync("src/pages/Application.tsx", "utf8"),
};

describe("no page claims Canada-only coverage", () => {
  it("the shared Markel badge names both countries", () => {
    expect(files.badge).not.toContain("9 provinces & 3 territories");
    expect(files.badge).toContain("Canada & United States");
  });

  it("the homepage stat is not a Canadian province count", () => {
    expect(files.home).not.toContain(">9 + 3<");
    expect(files.home).toContain("CA & US");
  });

  it("the homepage hero does not limit regulation to provinces", () => {
    expect(files.home).not.toContain("provincial regulatory requirements");
  });

  it("the footer strapline names both countries", () => {
    expect(files.footer).toContain("Canadian and United States Business Owners");
  });

  it("the footer disclosure does not limit regulation to provinces", () => {
    expect(files.footer).not.toContain("provincial insurance regulation");
  });

  it("the FAQ does not claim only Canadian lenders accept it", () => {
    expect(files.faq).not.toContain("Most Canadian lenders accept");
  });

  it("the loan-type error is not Canada-specific", () => {
    expect(files.application).not.toContain("Canadian PGI coverage");
  });
});

describe("the Canada-specific facts that must survive", () => {
  it("Quebec is still excluded", () => {
    expect(files.footer).toContain("Quebec");
    expect(files.faq).toContain("Quebec");
  });

  it("Markel Canada Limited is still named, and only in a Canada-scoped sentence", () => {
    // Extending a Canadian underwriting entity to US business would be false.
    expect(files.footer).toContain("Markel Canada Limited");
  });

  it("the availability answers name both countries explicitly", () => {
    expect(files.faq).toContain("United States");
    expect(files.footer).toContain("United States");
  });
});
