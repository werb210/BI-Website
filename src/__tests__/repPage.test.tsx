// BI_WEBSITE_FIELD_REPS_v1
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

const h = vi.hoisted(() => ({ apiRequest: vi.fn() }));
vi.mock("../api/request", () => ({ apiRequest: h.apiRequest }));
vi.mock("../lib/analytics", () => ({ track: vi.fn() }));
vi.mock("../lib/fieldRep", async (orig) => ({ ...(await orig<typeof import("../lib/fieldRep")>()), shrinkPhoto: vi.fn(async () => "data:image/jpeg;base64,AAAA") }));

import RepPage from "../pages/RepPage";
import USLenders from "../pages/USLenders";
import { bookUrlFor, contactToken, qrPath, repCode } from "../lib/fieldRep";

const ME = {
  ok: true, rep: { code: "ab12cd", full_name: "Sam Rep", company_name: null },
  links: { share: "https://www.boreal.insure/us-lenders?rep=ab12cd", share_lender: "https://www.boreal.insure/us-lenders?rep=ab12cd", share_broker: "https://www.boreal.insure/us-brokers?rep=ab12cd", book: "https://www.boreal.financial/book-pgi?rep=ab12cd" },
  counts: { total: 1, opened: 0 },
  contacts: [{ id: "1", full_name: "Pat Example", company_name: "First Bank", email: "pat@example.com", phone_e164: null, status: "Emailed", created_at: "2026-11-14" }],
};
const page = (path = "/rep/ab12cd") => render(<MemoryRouter initialEntries={[path]}><Routes><Route path="/rep/:code" element={<RepPage />} /><Route path="/us-lenders" element={<USLenders />} /></Routes></MemoryRouter>);
const calls = (path: string) => h.apiRequest.mock.calls.filter((c) => c[0] === path);

describe("rep links", () => {
  it("only accepts tidy codes and tokens", () => {
    expect(repCode("AB12cd")).toBe("ab12cd");
    expect(repCode("a b")).toBe("");
    expect(contactToken("abcDEF123456_-abcd")).toBe("abcDEF123456_-abcd");
    expect(contactToken("<script>")).toBe("");
    expect(bookUrlFor("ab12cd")).toBe("https://www.boreal.financial/book-pgi?rep=ab12cd");
  });
  it("draws a QR code as a square grid", () => {
    const q = qrPath("https://www.boreal.insure/us-lenders?rep=ab12cd");
    expect(q.size).toBeGreaterThan(20);
    expect(q.d.startsWith("M")).toBe(true);
  });
});

describe("the rep's page", () => {
  beforeEach(() => {
    localStorage.clear();
    h.apiRequest.mockReset();
    h.apiRequest.mockImplementation(async (path: string) => {
      if (path === "/api/v1/field/login") return { ok: true, token: "tok" };
      if (path === "/api/v1/field/me") return ME;
      if (path === "/api/v1/field/scan") return { ok: true, found: true, fields: { full_name: "Card Person", company_name: "Card Bank", title: "VP", email: "card@example.com", phone: "2125550142" } };
      if (path === "/api/v1/field/contacts") return { ok: true, created: true, emailed: true };
      return { ok: true };
    });
  });

  it("asks for the PIN first and shows nothing else", () => {
    page();
    expect(screen.getByLabelText("PIN")).toBeTruthy();
    expect(screen.queryByText("Scan a business card")).toBeNull();
    expect(calls("/api/v1/field/me")).toHaveLength(0);
  });

  it("says so when the PIN is wrong", async () => {
    h.apiRequest.mockImplementationOnce(async () => { throw Object.assign(new Error("x"), { status: 401, detail: { message: "That PIN is not right." } }); });
    page();
    fireEvent.change(screen.getByLabelText("PIN"), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: "Open my page" }));
    expect((await screen.findByRole("alert")).textContent).toBe("That PIN is not right.");
  });

  it("after the PIN: the QR code, the share link, booking, and the rep's contacts with their status", async () => {
    page();
    fireEvent.change(screen.getByLabelText("PIN"), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: "Open my page" }));
    expect(await screen.findByText("Hi Sam")).toBeTruthy();
    expect(screen.queryByText(/credited to you/)).toBeNull();
    expect(screen.queryByText(/contacts? so far/)).toBeNull();
    expect(JSON.parse(calls("/api/v1/field/login")[0]![1].body)).toEqual({ code: "ab12cd", pin: "123456" });
    expect(screen.getByRole("img", { name: /QR code/ })).toBeTruthy();
    expect(screen.getByText("https://www.boreal.insure/us-lenders?rep=ab12cd")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Book a call with Boreal" }).getAttribute("href")).toBe("https://www.boreal.financial/book-pgi?rep=ab12cd");
    expect(screen.getByText("Pat Example")).toBeTruthy();
    expect(screen.getByText("Emailed")).toBeTruthy();
    expect(localStorage.getItem("bi.rep.ab12cd")).toBe("tok");
  });

  it("a card photo fills the form for checking, and saving sends it as a card contact", async () => {
    localStorage.setItem("bi.rep.ab12cd", "tok");
    page();
    await screen.findByText("Hi Sam");
    fireEvent.change(screen.getByTestId("rep-card-photo"), { target: { files: [new File(["x"], "card.jpg", { type: "image/jpeg" })] } });
    expect(((await screen.findByLabelText("Name")) as HTMLInputElement).value).toBe("Card Person");
    expect((screen.getByLabelText("Email") as HTMLInputElement).value).toBe("card@example.com");
    expect(calls("/api/v1/field/scan")[0]![1].headers.Authorization).toBe("Bearer tok");
    fireEvent.click(screen.getByRole("button", { name: "Save and send the information" }));
    await waitFor(() => expect(calls("/api/v1/field/contacts")).toHaveLength(1));
    expect(JSON.parse(calls("/api/v1/field/contacts")[0]![1].body)).toMatchObject({ full_name: "Card Person", email: "card@example.com", source: "card" });
    expect((await screen.findByRole("status")).textContent).toBe("Saved. We emailed Card Person the information.");
  });

  it("adding by hand needs an email or a mobile", async () => {
    localStorage.setItem("bi.rep.ab12cd", "tok");
    page();
    await screen.findByText("Hi Sam");
    fireEvent.click(screen.getByRole("button", { name: "Add full details by hand" }));
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "No Details" } });
    fireEvent.click(screen.getByRole("button", { name: "Save and send the information" }));
    expect((await screen.findByRole("alert")).textContent).toBe("Enter an email address or a mobile number.");
    expect(calls("/api/v1/field/contacts")).toHaveLength(0);
    fireEvent.change(screen.getByLabelText("Mobile"), { target: { value: "2125550150" } });
    fireEvent.click(screen.getByRole("button", { name: "Save and send the information" }));
    await waitFor(() => expect(calls("/api/v1/field/contacts")).toHaveLength(1));
    expect(JSON.parse(calls("/api/v1/field/contacts")[0]![1].body).source).toBe("manual");
  });

  it("the rep says who they are talking to: the QR code and the saved contact follow it", async () => {
    localStorage.setItem("bi.rep.ab12cd", "tok");
    page();
    await screen.findByText("Hi Sam");
    expect(screen.getByText("https://www.boreal.insure/us-lenders?rep=ab12cd")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Loan broker" }));
    expect(screen.getByText("https://www.boreal.insure/us-brokers?rep=ab12cd")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Save and send them the information" }));
    expect((await screen.findByRole("alert")).textContent).toBe("Enter an email address or a mobile number.");
    fireEvent.change(screen.getByLabelText("Their email or mobile"), { target: { value: "bo@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Save and send them the information" }));
    await waitFor(() => expect(calls("/api/v1/field/contacts")).toHaveLength(1));
    expect(JSON.parse(calls("/api/v1/field/contacts")[0]![1].body)).toEqual({ email: "bo@example.com", audience: "broker", source: "manual" });
    expect((await screen.findByRole("status")).textContent).toBe("Saved. We emailed bo@example.com the information.");
  });

  it("goes back to the PIN when the sign-in has run out", async () => {
    localStorage.setItem("bi.rep.ab12cd", "old");
    h.apiRequest.mockImplementation(async () => { throw Object.assign(new Error("x"), { status: 401 }); });
    page();
    expect(await screen.findByLabelText("PIN")).toBeTruthy();
    expect(localStorage.getItem("bi.rep.ab12cd")).toBeNull();
  });
});

describe("the information page opened from a rep's QR code or email", () => {
  beforeEach(() => { h.apiRequest.mockReset(); h.apiRequest.mockResolvedValue({ ok: true }); });

  it("credits the rep on a lead, books through the rep's link, and records that the email link was followed", async () => {
    page("/us-lenders?rep=AB12cd&c=abcDEF123456_-abcd");
    await waitFor(() => expect(calls("/api/v1/field/visit")).toHaveLength(1));
    expect(JSON.parse(calls("/api/v1/field/visit")[0]![1].body)).toEqual({ c: "abcDEF123456_-abcd" });
    expect(screen.getByRole("link", { name: "Book a call" }).getAttribute("href")).toBe("https://www.boreal.financial/book-pgi?rep=ab12cd");
    fireEvent.change(screen.getByLabelText(/email or mobile/), { target: { value: "pat@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Send me the details" }));
    await waitFor(() => expect(calls("/api/v1/crm/lead")).toHaveLength(1));
    expect(JSON.parse(calls("/api/v1/crm/lead")[0]![1].body)).toMatchObject({ rep: "ab12cd", audience: "lender", email: "pat@example.com" });
  });

  it("without a rep link nothing extra is sent", async () => {
    page("/us-lenders");
    expect(screen.getByRole("link", { name: "Book a call" }).getAttribute("href")).toBe("https://www.boreal.financial/book-pgi");
    fireEvent.change(screen.getByLabelText(/email or mobile/), { target: { value: "pat@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Send me the details" }));
    await waitFor(() => expect(calls("/api/v1/crm/lead")).toHaveLength(1));
    expect(JSON.parse(calls("/api/v1/crm/lead")[0]![1].body).rep).toBeUndefined();
    expect(calls("/api/v1/field/visit")).toHaveLength(0);
  });
});
