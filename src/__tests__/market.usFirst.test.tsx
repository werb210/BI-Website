// BI_WEBSITE_US_FIRST_SITE_v1
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("../api/request", () => ({ apiRequest: vi.fn(async () => ({ ok: true })) }));
vi.mock("../lib/analytics", () => ({ track: vi.fn() }));
vi.mock("../lib/api", () => ({ api: { getApp: vi.fn(async () => ({ application: null })) } }));

import { MARKETS, MarketPrompt, MarketProvider, MarketSwitch, limitWords, looksCanadian, money, storedMarket, useMarket } from "../lib/market";
import Home from "../pages/Home";
import USLenders, { US_KEY_TERMS } from "../pages/USLenders";
import { faqItems } from "../components/Faq";
import { apiRequest } from "../api/request";

const Show = () => { const { market } = useMarket(); return <span data-testid="m">{market}</span>; };
const site = (ui: React.ReactNode, initial?: "US" | "CA") => render(<MemoryRouter><MarketProvider initial={initial}>{ui}</MarketProvider></MemoryRouter>);

beforeEach(() => { localStorage.clear(); });

describe("which site a visitor sees", () => {
  it("is the United States site unless they chose Canada", () => {
    expect(storedMarket()).toBe("US");
    localStorage.setItem("bi.market", "CA");
    expect(storedMarket()).toBe("CA");
  });
  it("recognises a Canadian device from its time zone or language, and nothing else", () => {
    expect(looksCanadian("America/Edmonton", ["en-US"])).toBe(true);
    expect(looksCanadian("America/Chicago", ["fr-CA", "en"])).toBe(true);
    expect(looksCanadian("America/New_York", ["en-US"])).toBe(false);
    expect(looksCanadian(undefined, undefined)).toBe(false);
  });
  it("asks a Canadian visitor once and remembers the answer", () => {
    const zone = vi.spyOn(Intl.DateTimeFormat.prototype, "resolvedOptions").mockReturnValue({ timeZone: "America/Toronto" } as any);
    const first = site(<><MarketPrompt /><Show /></>);
    expect(screen.getByTestId("market-prompt").textContent).toContain("It looks like you're in Canada. Would you like to visit the Canadian site?");
    expect(screen.getByTestId("m").textContent).toBe("US");
    fireEvent.click(screen.getByRole("button", { name: "Visit the Canadian site" }));
    expect(screen.getByTestId("m").textContent).toBe("CA");
    expect(screen.queryByTestId("market-prompt")).toBeNull();
    first.unmount();
    site(<><MarketPrompt /><Show /></>);
    expect(screen.queryByTestId("market-prompt")).toBeNull();
    expect(screen.getByTestId("m").textContent).toBe("CA");
    zone.mockRestore();
  });
  it("does not ask a visitor in the United States, and the footer can always switch", () => {
    const zone = vi.spyOn(Intl.DateTimeFormat.prototype, "resolvedOptions").mockReturnValue({ timeZone: "America/Chicago" } as any);
    site(<><MarketPrompt /><MarketSwitch /><Show /></>);
    expect(screen.queryByTestId("market-prompt")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Switch to the Canada site" }));
    expect(screen.getByTestId("m").textContent).toBe("CA");
    zone.mockRestore();
  });
});

describe("the figures each site states", () => {
  it("United States: $5 million, 90% secured / 70% unsecured, deductible from 10%, 2%, A (Excellent), and the dates", () => {
    const t = MARKETS.US;
    expect([limitWords(t), t.share, t.rate, money(t, t.limit)]).toEqual(["$5 million", 0.9, 0.02, "$5,000,000"]);
    expect(t.shareText).toBe("up to 90% on secured loans and up to 70% on unsecured loans");
    expect(t.deductibleText).toContain("from 10%");
    expect(t.insurerText).toBe("an insurer rated A (Excellent) by AM Best");
    expect(t.timeline).toEqual(["Live in Canada today.", "US quotes open January 1, 2027.", "US policies can start from March 1, 2027."]);
  });
  it("Canada is as it was: $1 million, 80%, Markel", () => {
    const t = MARKETS.CA;
    expect([limitWords(t), t.share, t.rate]).toEqual(["$1 million", 0.8, 0.026]);
    expect(t.insurerText).toContain("Markel Canada Limited");
  });
  it("the United States home page shows US terms, the dates, the interest list and no Canadian underwriter", async () => {
    site(<Home />, "US");
    const terms = screen.getByTestId("home-key-terms").textContent ?? "";
    expect(terms).toContain("Key terms (United States)");
    expect(terms).toContain("personal guarantees up to $5 million");
    expect(terms).toContain("up to 90% on secured loans and up to 70% on unsecured loans");
    expect(terms).toContain("about 2% of the insured amount a year");
    expect(screen.getByTestId("home-timeline").textContent).toBe("US quotes open January 1, 2027. US policies can start from March 1, 2027.");
    expect(document.body.textContent).not.toContain("Markel");
    expect(document.body.textContent).not.toContain("Quebec");
    fireEvent.change(screen.getByLabelText(/Not ready to apply/), { target: { value: "pat@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Keep me posted" }));
    expect((await screen.findByRole("status")).textContent).toContain("You are on the list");
    expect((apiRequest as any).mock.calls.at(-1)[0]).toBe("/api/v1/crm/lead");
    expect(JSON.parse((apiRequest as any).mock.calls.at(-1)[1].body)).toMatchObject({ source: "us_interest_list", email: "pat@example.com" });
  });
  it("the Canadian home page shows Canadian terms and has no US dates or interest list", () => {
    site(<Home />, "CA");
    const terms = screen.getByTestId("home-key-terms").textContent ?? "";
    expect(terms).toContain("Key terms (Canada)");
    expect(terms).toContain("personal guarantees up to $1 million");
    expect(terms).toContain("about 2.6% of the insured amount a year");
    expect(screen.queryByTestId("home-timeline")).toBeNull();
    expect(screen.queryByTestId("us-interest")).toBeNull();
    expect(document.body.textContent).toContain("Not available to Quebec residents");
  });
  it("the FAQ answers follow the market", () => {
    const us = faqItems(MARKETS.US).map((x) => x.a).join(" ");
    expect(us).toContain("$5,000,000");
    expect(us).not.toContain("Markel");
    expect(faqItems(MARKETS.CA).map((x) => x.a).join(" ")).toContain("Not available to Quebec residents");
  });
  it("the US lender page carries the one-pager's terms, the lender benefits and the dates", () => {
    site(<USLenders />, "US");
    expect(US_KEY_TERMS.map((x) => x[0])).toEqual(["Up to $5,000,000", "Up to 90%", "From 10%", "A (Excellent)", "SBA and conventional", "Claims-made"]);
    expect(screen.getByTestId("us-key-terms").textContent).toContain("up to 70% on unsecured loans");
    expect(screen.getByTestId("us-lender-why").textContent).toContain("No captive, no capital and no new operations.");
    expect(screen.getByTestId("us-lender-why").textContent).toContain("additional insured");
    expect(screen.getByTestId("us-timeline").textContent).toContain("January 1, 2027");
    expect(screen.getByTestId("us-timeline").textContent).toContain("March 1, 2027");
    expect(document.body.textContent).not.toContain("$1,000,000");
  });
});
