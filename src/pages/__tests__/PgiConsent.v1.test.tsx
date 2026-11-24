// BI_WEBSITE_PGI_CONSENT_v1
import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import PgiConsent from "../PgiConsent";

const REQ = { guarantor_name: "Sarah Chen", business: "Lone Star", already_confirmed: false,
  fee_disclosure: "Boreal Risk Management may receive a fee from PGI Canada Ltd. if you buy coverage.", consent_text: "I consent to sharing." };

function mount() {
  return render(<MemoryRouter initialEntries={["/consent/abcdefghijklmnopqrstuvwx"]}><Routes><Route path="/consent/:token" element={<PgiConsent />} /></Routes></MemoryRouter>);
}
afterEach(() => vi.restoreAllMocks());

describe("guarantor consent page", () => {
  it("needs both boxes, then posts both and thanks the guarantor", async () => {
    const f = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => REQ })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) });
    vi.stubGlobal("fetch", f);
    mount();
    await screen.findByText(/may receive a fee from PGI Canada Ltd\./);
    const btn = screen.getByTestId("consent-confirm") as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    fireEvent.click(screen.getByTestId("consent-fee"));
    expect(btn.disabled).toBe(true);
    fireEvent.click(screen.getByTestId("consent-share"));
    expect(btn.disabled).toBe(false);
    fireEvent.click(btn);
    await screen.findByText("Thank you");
    expect(JSON.parse(f.mock.calls[1][1].body)).toEqual({ fee_disclosure_ack: true, consent_share_pgi: true });
  });
  it("an unknown link says so", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 404 }));
    mount();
    await waitFor(() => expect(screen.getByText(/isn't valid any more/)).toBeTruthy());
  });
});
