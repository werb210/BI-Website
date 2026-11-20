// BI_WEBSITE_QUICK_APPLY_v1 - PGI's new short form: amounts, business, contact + code, then documents.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { readFileSync } from "node:fs";

const apiMock = vi.hoisted(() => ({ applicantOtpStart: vi.fn(), applicantOtpVerify: vi.fn(), quickApply: vi.fn() }));
vi.mock("../lib/api", () => ({ api: apiMock, setApplicantToken: vi.fn() }));

import QuickApply, { step2Missing, toE164 } from "../pages/QuickApply";

beforeEach(() => {
  localStorage.clear();
  apiMock.applicantOtpStart.mockReset().mockResolvedValue({ ok: true });
  apiMock.applicantOtpVerify.mockReset().mockResolvedValue({ token: "t" });
  apiMock.quickApply.mockReset().mockResolvedValue({ public_id: "ABC123DEF456" });
});

const renderIt = () => render(
  <MemoryRouter initialEntries={["/applications/new"]}>
    <Routes>
      <Route path="/applications/new" element={<QuickApply />} />
      <Route path="/applications/:id/documents" element={<div>DOCS PAGE</div>} />
    </Routes>
  </MemoryRouter>,
);

describe("QuickApply", () => {
  it("asks every question before the code, then sends one application and opens documents", async () => {
    renderIt();
    expect(screen.getByText("Cover your guarantee")).toBeInTheDocument();
    expect(screen.getByTestId("qa-next-1")).toBeDisabled();
    fireEvent.change(screen.getByTestId("qa-loan-type"), { target: { value: "secured" } });
    fireEvent.click(screen.getByTestId("qa-next-1"));

    expect(screen.getByText("Tell us about the business")).toBeInTheDocument();
    expect(screen.getByTestId("qa-next-2")).toBeDisabled();
    fireEvent.click(screen.getByText("Canada"));
    const inputs = screen.getByTestId("qa-step-2").querySelectorAll("input:not([type=month])");
    fireEvent.change(inputs[0]!, { target: { value: "Acme Ltd." } });
    fireEvent.change(inputs[1]!, { target: { value: "1 Main St, Calgary AB" } });
    fireEvent.click(screen.getByTestId("qa-naics"));
    fireEvent.change(screen.getByTestId("qa-naics-search"), { target: { value: "236115" } });
    fireEvent.click(screen.getByText(/New Single-Family Housing Construction/));
    fireEvent.change(screen.getByTestId("qa-revenue-start"), { target: { value: "2018-06" } });
    fireEvent.change(inputs[3]!, { target: { value: "ATB" } });
    const selects = screen.getByTestId("qa-step-2").querySelectorAll("select");
    fireEvent.change(selects[0]!, { target: { value: "Working Capital" } });
    fireEvent.change(selects[1]!, { target: { value: "fixed" } });
    for (const no of screen.getAllByText("No")) fireEvent.click(no);
    fireEvent.click(screen.getByTestId("qa-next-2"));

    expect(screen.getByText("Where should we reach you?")).toBeInTheDocument();
    const c = screen.getByTestId("qa-step-3").querySelectorAll("input");
    fireEvent.change(c[0]!, { target: { value: "Jane Doe" } });
    fireEvent.change(c[1]!, { target: { value: "jane@example.com" } });
    fireEvent.change(c[2]!, { target: { value: "(403) 555-0101" } });
    expect(screen.getByTestId("qa-send-code")).toBeDisabled();
    fireEvent.click(screen.getByTestId("qa-fee-ack"));
    fireEvent.click(screen.getByTestId("qa-consent"));
    fireEvent.click(screen.getByTestId("qa-send-code"));
    await waitFor(() => expect(apiMock.applicantOtpStart).toHaveBeenCalledWith("+14035550101"));
    fireEvent.change(await screen.findByTestId("qa-code"), { target: { value: "123456" } });
    fireEvent.click(screen.getByTestId("qa-confirm"));

    await screen.findByText("DOCS PAGE");
    expect(apiMock.quickApply).toHaveBeenCalledWith(expect.objectContaining({
      loan_type: "secured", country: "CA", naics_code: "236115", revenue_start: "2018-06", pg_signed: false,
      other_guarantors: false, rate_type: "fixed", guarantor_email: "jane@example.com",
      fee_disclosure_ack: true, consent_share_pgi: true, consent_version: "2026-11-20",
    }));
  });

  it("helpers", () => {
    expect(toE164("403-555-0101")).toBe("+14035550101");
    expect(toE164("123")).toBeNull();
    expect(step2Missing({ country: "", company_name: "", business_address: "", naics_code: "", revenue_start: "", lender_name: "", loan_purpose: "", pg_signed: null, other_guarantors: null, rate_type: "" } as any)).toHaveLength(10);
  });

  it("the application route uses it and the score step redirects", () => {
    const app = readFileSync("src/App.tsx", "utf8");
    expect(app).toContain('<Route path="/applications/new" element={<QuickApply />} />');
    expect(app).toMatch(/path="\/applications\/new\/score" element=\{<Navigate/);
  });
});
