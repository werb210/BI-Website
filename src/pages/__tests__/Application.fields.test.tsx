import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

vi.mock("../../lib/api", () => ({
  api: {
    getApp: vi.fn().mockResolvedValue({ application: { score_decision: "approve", score: 720 } }),
    patchApp: vi.fn().mockResolvedValue({ ok: true }),
    submit: vi.fn().mockResolvedValue({ ok: true }),
  },
}));
vi.mock("../../components/UploadAndScrape", () => ({ UploadAndScrape: () => null }));

import Application from "../Application";

describe("BI_WEBSITE_BLOCK_v3 — Application form renders typed inputs", () => {
  it("renders 6 sections with proper input types", async () => {
    render(
      <MemoryRouter initialEntries={["/applications/038DA9E7"]}>
        <Routes><Route path="/applications/:publicId" element={<Application />} /></Routes>
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByText(/Application Form/i)).toBeInTheDocument());
    expect(screen.getByText(/Personal Guarantor/)).toBeInTheDocument();
    expect(screen.getByText(/Business$/)).toBeInTheDocument();
    expect(screen.getByText(/^Loan$/)).toBeInTheDocument();
    expect(screen.getByText(/^Financial$/)).toBeInTheDocument();
    expect(screen.getByText(/^Risk$/)).toBeInTheDocument();
    expect(screen.getByText(/^Consents$/)).toBeInTheDocument();

    const dob = screen.getByLabelText(/Date of birth/i) as HTMLInputElement;
    expect(dob.type).toBe("date");

    const loan = screen.getByLabelText(/Loan amount/i) as HTMLInputElement;
    expect(loan.type).toBe("number");

    const csbfp = screen.getByLabelText(/CSBFP-backed/i) as HTMLInputElement;
    expect(csbfp.type).toBe("checkbox");
    fireEvent.click(csbfp);
    expect(csbfp.checked).toBe(true);
  });
});
