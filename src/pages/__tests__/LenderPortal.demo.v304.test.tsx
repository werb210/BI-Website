import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LenderPortal from "../LenderPortal";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn() };
});

describe("LenderPortal demo cleanup v304", () => {
  const originalReload = window.location.reload;

  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    localStorage.setItem("bi.lender_token", "demo-token");
    vi.spyOn(window.location, "reload").mockImplementation(() => {});
  });

  afterEach(() => {
    window.location.reload = originalReload;
  });

  it('does not render the "▶ Live Demo" anchor', async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({ ok: true, json: async () => [] } as any);
    render(<MemoryRouter><LenderPortal /></MemoryRouter>);
    expect(screen.queryByText("▶ Live Demo")).not.toBeInTheDocument();
  });

  it("posts cleanup payload on exit demo when session start exists", async () => {
    const fetchSpy = vi.spyOn(global, "fetch")
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) } as any)
      .mockResolvedValueOnce({ ok: true, json: async () => [] } as any)
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) } as any);

    localStorage.setItem("bi.is_demo_session", "1");
    localStorage.setItem("bi.real_token_backup", "real-token");
    localStorage.setItem("bi.demo_session_started_at", "2026-05-19T00:00:00.000Z");

    render(<MemoryRouter><LenderPortal /></MemoryRouter>);
    fireEvent.click(await screen.findByText("Exit demo"));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining("/api/v1/bi/lender/demo/cleanup"), expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer demo-token" }),
        body: JSON.stringify({ session_started_at: "2026-05-19T00:00:00.000Z" }),
      }));
    });
  });

  it("reloads and restores token even when cleanup fetch throws", async () => {
    const fetchSpy = vi.spyOn(global, "fetch")
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) } as any)
      .mockResolvedValueOnce({ ok: true, json: async () => [] } as any)
      .mockRejectedValueOnce(new Error("no endpoint"));

    localStorage.setItem("bi.is_demo_session", "1");
    localStorage.setItem("bi.real_token_backup", "real-token");
    localStorage.setItem("bi.demo_session_started_at", "2026-05-19T00:00:00.000Z");

    render(<MemoryRouter><LenderPortal /></MemoryRouter>);
    fireEvent.click(await screen.findByText("Exit demo"));

    await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
    expect(localStorage.getItem("bi.lender_token")).toBe("real-token");
    expect(localStorage.getItem("bi.real_token_backup")).toBeNull();
    expect(localStorage.getItem("bi.is_demo_session")).toBeNull();
    expect(localStorage.getItem("bi.demo_session_started_at")).toBeNull();
    expect(window.location.reload).toHaveBeenCalled();
  });
});
