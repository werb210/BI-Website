// BI_WEBSITE_REP_FIELD_FORMATS_v1
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

const h = vi.hoisted(() => ({ apiRequest: vi.fn() }));
vi.mock("../api/request", () => ({ apiRequest: h.apiRequest }));
vi.mock("../lib/analytics", () => ({ track: vi.fn() }));

import RepPage from "../pages/RepPage";
import { REP_TOKEN_KEY, shownPhone, typedEmail, typedEmailOrPhone, typedPhone } from "../lib/fieldRep";

describe("fields that tidy themselves", () => {
  it("a phone number is shaped as it is typed and stops at ten digits", () => {
    expect(typedPhone("5")).toBe("5");
    expect(typedPhone("5125")).toBe("(512) 5");
    expect(typedPhone("5125550")).toBe("(512) 555-0");
    expect(typedPhone("5125550142")).toBe("(512) 555-0142");
    expect(typedPhone("55555555555555555555")).toBe("(555) 555-5555");
    expect(typedPhone("+1 512-555-0142")).toBe("(512) 555-0142");
    expect(typedPhone("(512) 555-014")).toBe("(512) 555-014");
  });
  it("a saved number is shown the same way, and an email loses spaces and capitals", () => {
    expect(shownPhone("+15125550142")).toBe("(512) 555-0142");
    expect(shownPhone("+442071234567")).toBe("+442071234567");
    expect(shownPhone(null)).toBe("");
    expect(typedEmail(" Pat@Bank.COM ")).toBe("pat@bank.com");
    expect(typedEmailOrPhone("5125550142")).toBe("(512) 555-0142");
    expect(typedEmailOrPhone("Pat@Bank.com")).toBe("pat@bank.com");
  });
});

describe("the rep's page uses them", () => {
  beforeEach(() => {
    h.apiRequest.mockReset();
    localStorage.setItem(REP_TOKEN_KEY("ab12cd"), "tok");
    h.apiRequest.mockResolvedValue({
      ok: true, rep: { code: "ab12cd", full_name: "Sam Rep", company_name: null },
      links: { share: "https://www.boreal.insure/us?rep=ab12cd", share_lender: "https://www.boreal.insure/us-lenders?rep=ab12cd", share_broker: "https://www.boreal.insure/us-brokers?rep=ab12cd", book: "https://www.boreal.financial/book-pgi?rep=ab12cd" },
      counts: { total: 1, opened: 0 },
      contacts: [{ id: "1", full_name: "Pat Example", company_name: "First Bank", email: "pat@example.com", phone_e164: "+15125550142", status: "Emailed", created_at: "2026-11-14" }],
    });
  });
  it("in the quick box, the full form and the contact list", async () => {
    render(<MemoryRouter initialEntries={["/rep/ab12cd"]}><Routes><Route path="/rep/:code" element={<RepPage />} /></Routes></MemoryRouter>);
    const quick = (await screen.findByLabelText("Their email or mobile")) as HTMLInputElement;
    fireEvent.change(quick, { target: { value: "55555555555555555555" } });
    expect(quick.value).toBe("(555) 555-5555");
    fireEvent.change(quick, { target: { value: "Pat@Bank.com" } });
    expect(quick.value).toBe("pat@bank.com");
    fireEvent.click(screen.getByRole("button", { name: "Add full details by hand" }));
    const mobile = screen.getByLabelText("Mobile") as HTMLInputElement;
    fireEvent.change(mobile, { target: { value: "5125550142" } });
    expect(mobile.value).toBe("(512) 555-0142");
    fireEvent.click(screen.getByRole("button", { name: /my contacts/i }));
    expect(await screen.findByText(/\(512\) 555-0142/)).toBeTruthy();
  });
});
