// BI_WEBSITE_US_LENDERS_v1
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { readFileSync } from "node:fs";

const h = vi.hoisted(() => ({ apiRequest: vi.fn(async () => ({ ok: true })) }));
vi.mock("../api/request", () => ({ apiRequest: h.apiRequest }));
vi.mock("../lib/analytics", () => ({ track: vi.fn() }));

import USLenders, { OCC_LETTER_URL, usLendersErrors } from "../pages/USLenders";

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
});
