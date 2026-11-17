// BI_WEBSITE_REP_AGREEMENT_v2 - the link in the agreement email: sign first, page and PIN come after by email.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

const h = vi.hoisted(() => ({ apiRequest: vi.fn() }));
vi.mock("../api/request", () => ({ apiRequest: h.apiRequest }));
vi.mock("../lib/analytics", () => ({ track: vi.fn() }));

import RepPage from "../pages/RepPage";

const page = (path: string) => render(<MemoryRouter initialEntries={[path]}><Routes><Route path="/rep/:code" element={<RepPage />} /></Routes></MemoryRouter>);

describe("the agreement link a new rep is emailed", () => {
  beforeEach(() => { h.apiRequest.mockReset(); localStorage.clear(); });

  it("shows the agreement to sign, with no PIN box, and sends them to the signing page", async () => {
    h.apiRequest.mockResolvedValue({ signed: false, url: "https://sign.example/fresh" });
    const assign = vi.fn();
    Object.defineProperty(window, "location", { value: { ...window.location, assign }, writable: true });
    page("/rep/ab12cd?sign=tok123");
    expect(await screen.findByRole("heading", { name: "Your Introducer Agreement" })).toBeTruthy();
    expect(screen.queryByLabelText("PIN")).toBeNull();
    expect(h.apiRequest.mock.calls[0]).toEqual(["/api/v1/field/agreement-link", { headers: { Authorization: "Bearer tok123" } }]);
    const button = screen.getByRole("button", { name: "Read and sign the agreement" });
    await waitFor(() => expect((button as HTMLButtonElement).disabled).toBe(false));
    fireEvent.click(button);
    await waitFor(() => expect(assign).toHaveBeenCalledWith("https://sign.example/fresh"));
  });
  it("once signed, says the page and PIN are on their way by email", async () => {
    h.apiRequest.mockResolvedValue({ signed: true, url: null });
    page("/rep/ab12cd?sign=tok123");
    expect(await screen.findByRole("heading", { name: "Thank you. It is signed." })).toBeTruthy();
    expect(screen.getByText(/emailed you your personal page and your PIN/)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Open my page" }).getAttribute("href")).toBe("/rep/ab12cd");
  });
  it("an old link says so", async () => {
    h.apiRequest.mockRejectedValue({ status: 401 });
    page("/rep/ab12cd?sign=old");
    expect(await screen.findByRole("heading", { name: "This link no longer works" })).toBeTruthy();
  });
  it("without the link, the page still asks for the PIN", () => {
    page("/rep/ab12cd");
    expect(screen.getByLabelText("PIN")).toBeTruthy();
  });
});
