// BI_WEBSITE_US_AUDIENCE_v2 - the two short United States pages: banks and lenders, and commercial loan brokers.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { readFileSync } from "node:fs";

const h = vi.hoisted(() => ({ apiRequest: vi.fn(async () => ({ ok: true })) }));
vi.mock("../api/request", () => ({ apiRequest: h.apiRequest }));
vi.mock("../lib/analytics", () => ({ track: vi.fn() }));

import USLenders, { OCC_LETTER_URL, USBrokers, US_COPY, quickContact } from "../pages/USLenders";
import { ROUTES } from "../seo/routeMeta";

const lender = (path = "/us-lenders") => render(<MemoryRouter initialEntries={[path]}><USLenders /></MemoryRouter>);
const broker = (path = "/us-brokers") => render(<MemoryRouter initialEntries={[path]}><USBrokers /></MemoryRouter>);

describe("the United States lender and broker pages", () => {
  beforeEach(() => { cleanup(); h.apiRequest.mockClear(); });

  it("both say what the OCC letter says, with its limits (including the bank's own reinsurance), and link to it", () => {
    for (const open of [lender, broker]) {
      cleanup(); open();
      expect(screen.getByText(/Interpretive Letter 1194\. A national bank asked/)).toBeTruthy();
      expect(screen.getByText(/limited to the facts that bank presented, which included the bank reinsuring the policies through its own subsidiary/)).toBeTruthy();
      expect(screen.getByRole("link", { name: /Read OCC Interpretive Letter 1194/ }).getAttribute("href")).toBe(OCC_LETTER_URL);
    }
    expect(OCC_LETTER_URL).toMatch(/^https:\/\/www\.occ\.gov\/.*int1194\.pdf$/);
  });

  // BI_WEBSITE_PGI_COMPLIANCE_v1 - introduction only: lenders only make borrowers aware; brokers never sell.
  it("the lender page asks lenders only to make borrowers aware; the broker page says brokers never sell", () => {
    lender();
    expect(screen.getByRole("heading", { name: "The lender's part" })).toBeTruthy();
    expect(screen.getByText("Make borrowers aware it exists")).toBeTruthy();
    cleanup(); broker();
    expect(screen.getByRole("heading", { name: "Your part" })).toBeTruthy();
    expect(screen.getByText("You never sell insurance")).toBeTruthy();
  });

  it("each page links to the other and keeps the rep's code", () => {
    lender("/us-lenders?rep=ab12cd");
    expect(screen.getByRole("link", { name: "I am a loan broker" }).getAttribute("href")).toBe("/us-brokers?rep=ab12cd");
    cleanup(); broker();
    expect(screen.getByRole("link", { name: "I work at a bank or lender" }).getAttribute("href")).toBe("/us-lenders");
  });

  it("names no underwriter and no commission (added only once the carrier confirms them)", () => {
    const src = readFileSync("src/pages/USLenders.tsx", "utf8");
    expect(src).not.toMatch(/Markel/);
    expect(src).not.toMatch(/commission|% of premium|referral fee/i);
    expect(src).toMatch(/PGI America Ltd\./);
    expect(src).not.toMatch(/EBITDA|\$5,000,000|90%|deductible|revenue share|stronger guarant|additional insured|January 1, 2027/i);
    expect(JSON.stringify(US_COPY)).not.toMatch(/guarantee[sd]? approval|risk[- ]free/i);
  });

  it("asks for one thing first: an email or a mobile, in one box, before any button", async () => {
    expect(quickContact("pat@firstsample.example")).toEqual({ email: "pat@firstsample.example" });
    expect(quickContact(" (512) 555-0142 ")).toEqual({ phone: "(512) 555-0142" });
    expect(quickContact("pat@")).toBeNull();
    expect(quickContact("12")).toBeNull();
    broker("/us-brokers?rep=ab12cd");
    const box = screen.getByLabelText(/email or mobile/);
    const book = screen.getAllByRole("link", { name: /Book a call/ })[0]!;
    expect(box.compareDocumentPosition(book) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Send me the details" }));
    expect(h.apiRequest).not.toHaveBeenCalled();
    fireEvent.change(box, { target: { value: "pat@firstsample.example" } });
    fireEvent.click(screen.getByRole("button", { name: "Send me the details" }));
    await waitFor(() => expect(h.apiRequest).toHaveBeenCalledTimes(1));
    const [path, init] = h.apiRequest.mock.calls[0] as unknown as [string, { body: string }];
    expect(path).toBe("/api/v1/crm/lead");
    expect(JSON.parse(init.body)).toMatchObject({ source: "us_lenders_quick", audience: "broker", rep: "ab12cd", company: "US broker page (event)", email: "pat@firstsample.example" });
    expect(JSON.parse(init.body).phone).toBeUndefined();
    await screen.findByRole("status");
  });

  it("offers a contact card to save, a number to call and a time to book", () => {
    lender();
    expect(screen.getByRole("link", { name: "Save our contact" }).getAttribute("href")).toBe("/boreal-pgi.vcf");
    const card = readFileSync("public/boreal-pgi.vcf", "utf8");
    expect(card).toMatch(/^BEGIN:VCARD/);
    expect(card).toContain("TEL;TYPE=WORK,VOICE:+18447976700");
    expect(JSON.parse(readFileSync("public/staticwebapp.config.json", "utf8")).mimeTypes[".vcf"]).toBe("text/vcard");
    expect(screen.getByRole("link", { name: /^Call \(844\)/ }).getAttribute("href")).toBe("tel:+18447976700");
    expect(screen.getByRole("link", { name: "Book a call" }).getAttribute("href")).toBe("https://www.boreal.financial/book-pgi");
  });

  it("both pages are kept out of search results for now", () => {
    for (const p of ["/us-lenders", "/us-brokers"]) expect(ROUTES.find((r) => r.path === p)).toMatchObject({ noindex: true, sitemap: false });
  });
});
