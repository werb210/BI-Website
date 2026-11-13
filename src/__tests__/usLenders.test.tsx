// BI_WEBSITE_US_LENDERS_v1
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { readFileSync } from "node:fs";

const h = vi.hoisted(() => ({ apiRequest: vi.fn(async () => ({ ok: true })) }));
vi.mock("../api/request", () => ({ apiRequest: h.apiRequest }));
vi.mock("../lib/analytics", () => ({ track: vi.fn() }));

import USLenders, { OCC_LETTER_URL, quickContact, usLendersErrors } from "../pages/USLenders";

describe("the United States banks and brokers page", () => {
  beforeEach(() => h.apiRequest.mockClear());

  it("says what the OCC letter says, with its limits, and links to it", () => {
    render(<MemoryRouter><USLenders /></MemoryRouter>);
    expect(screen.getByText(/Interpretive Letter 1194\. A national bank asked/)).toBeTruthy();
    expect(screen.getByText(/limited to the facts that bank presented/)).toBeTruthy();
    expect(screen.getByRole("link", { name: /Read OCC Interpretive Letter 1194/ }).getAttribute("href")).toBe(OCC_LETTER_URL);
    expect(OCC_LETTER_URL).toMatch(/^https:\/\/www\.occ\.gov\/.*int1194\.pdf$/);
  });

  it("names no underwriter and no commission (added only once the carrier confirms them)", () => {
    const src = readFileSync("src/pages/USLenders.tsx", "utf8");
    expect(src).not.toMatch(/Markel/);
    expect(src).not.toMatch(/commission|% of premium/i);
    expect(src).toMatch(/not a licensed insurance broker, agent, or adviser/);
  });

  it("shows the QR code for this page", () => {
    render(<MemoryRouter><USLenders /></MemoryRouter>);
    expect(screen.getByAltText("QR code for this page").getAttribute("src")).toBe("/qr-us-lenders.svg");
    expect(readFileSync("public/qr-us-lenders.svg", "utf8")).toContain("<svg");
  });

  it("will not send a half-filled inquiry, then sends a complete one as a lead", async () => {
    expect(usLendersErrors({ name: "", institution: "", role: "Bank", email: "x", phone: "1", consent: false })).toHaveLength(5);
    render(<MemoryRouter><USLenders /></MemoryRouter>);
    fireEvent.click(screen.getByRole("button", { name: "Request a call" }));
    expect(h.apiRequest).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText("Your name"), { target: { value: "Pat Lee" } });
    fireEvent.change(screen.getByLabelText("Bank or brokerage"), { target: { value: "First Sample Bank" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "pat@firstsample.example" } });
    fireEvent.change(screen.getByLabelText("Phone"), { target: { value: "512-555-0142" } });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Request a call" }));
    await waitFor(() => expect(h.apiRequest).toHaveBeenCalledTimes(1));
    const [path, init] = h.apiRequest.mock.calls[0] as unknown as [string, { body: string }];
    expect(path).toBe("/api/v1/crm/lead");
    expect(JSON.parse(init.body)).toMatchObject({ name: "Pat Lee", company: "First Sample Bank (Bank) - US lender page", email: "pat@firstsample.example", casl_consent: true });
    await screen.findByRole("status");
  });

  // BI_WEBSITE_US_LENDERS_EVENT - opened from a QR code at an event: nothing to fill in, or one box.
  it("offers a contact card to save and a number to call before asking for anything", () => {
    render(<MemoryRouter><USLenders /></MemoryRouter>);
    const save = screen.getByRole("link", { name: "Save our contact" });
    expect(save.getAttribute("href")).toBe("/boreal-pgi.vcf");
    const card = readFileSync("public/boreal-pgi.vcf", "utf8");
    expect(card).toMatch(/^BEGIN:VCARD/);
    expect(card).toContain("TEL;TYPE=WORK,VOICE:+18666318939");
    expect(card).toContain("URL:https://www.boreal.insure/us-lenders");
    expect(JSON.parse(readFileSync("public/staticwebapp.config.json", "utf8")).mimeTypes[".vcf"]).toBe("text/vcard");
    expect(screen.getByRole("link", { name: /^Call \(866\)/ }).getAttribute("href")).toBe("tel:+18666318939");
  });

  it("takes an email or a mobile in one box", async () => {
    expect(quickContact("pat@firstsample.example")).toEqual({ email: "pat@firstsample.example" });
    expect(quickContact(" (512) 555-0142 ")).toEqual({ phone: "(512) 555-0142" });
    expect(quickContact("pat@")).toBeNull();
    expect(quickContact("12")).toBeNull();
    render(<MemoryRouter><USLenders /></MemoryRouter>);
    fireEvent.click(screen.getByRole("button", { name: "Send me the details" }));
    expect(h.apiRequest).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText(/leave an email or mobile/), { target: { value: "pat@firstsample.example" } });
    fireEvent.click(screen.getByRole("button", { name: "Send me the details" }));
    await waitFor(() => expect(h.apiRequest).toHaveBeenCalledTimes(1));
    const [path, init] = h.apiRequest.mock.calls[0] as unknown as [string, { body: string }];
    expect(path).toBe("/api/v1/crm/lead");
    expect(JSON.parse(init.body)).toMatchObject({ source: "us_lenders_quick", email: "pat@firstsample.example" });
    expect(JSON.parse(init.body).phone).toBeUndefined();
  });
});
