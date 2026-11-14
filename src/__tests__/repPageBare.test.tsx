// BI_WEBSITE_REP_PAGE_BARE - the rep's page is handed to strangers: no site menus, footer or cookie banner on it.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../api/request", () => ({ apiRequest: vi.fn(async () => ({ ok: true })) }));
vi.mock("../lib/analytics", () => ({ track: vi.fn(), initAnalytics: vi.fn(), trackPageView: vi.fn() }));
import App from "../App";

const open = (path: string) => { window.history.pushState({}, "", path); return render(<App />); };

describe("the site frame", () => {
  beforeEach(() => localStorage.clear());
  it("is absent on a rep's page", async () => {
    open("/rep/ab12cd");
    expect(await screen.findByLabelText("PIN")).toBeTruthy();
    expect(screen.queryByRole("link", { name: /Lender Login/ })).toBeNull();
    expect(screen.queryByText(/UNDERWRITTEN BY/i)).toBeNull();
    expect(screen.queryByRole("button", { name: "Accept" })).toBeNull();
  });
  it("is present on the lender page", async () => {
    open("/us-lenders");
    expect(await screen.findByTestId("us-lenders")).toBeTruthy();
    expect(screen.getAllByRole("link", { name: /Lender Login/ }).length).toBeGreaterThan(0);
  });
});
