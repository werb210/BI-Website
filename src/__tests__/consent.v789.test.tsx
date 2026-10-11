// BI_WEBSITE_BLOCK_v789_AUDIT_ROUND2 [139]
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const journey = vi.hoisted(() => ({ startJourney: vi.fn(), trackPageview: vi.fn() }));
vi.mock("../utils/journey", () => journey);

import ConsentBanner from "../components/ConsentBanner";
import RouteTracker from "../components/RouteTracker";
import { CONSENT_KEY } from "../lib/consent";

type W = Window & { dataLayer?: unknown[]; gtag?: unknown };

// Google's own gtag(): what index.html defines before GTM loads.
function installGoogleGtag() {
  const w = window as W;
  w.dataLayer = [];
  w.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    (w.dataLayer as unknown[]).push(arguments);
  };
}

function consentUpdates() {
  return ((window as W).dataLayer ?? []).filter(
    (e) => Object.prototype.toString.call(e) === "[object Arguments]"
      && (e as IArguments)[0] === "consent" && (e as IArguments)[1] === "update",
  ) as IArguments[];
}

function renderWithTracker() {
  return render(
    <MemoryRouter initialEntries={["/what-is-pgi"]}>
      <RouteTracker />
      <ConsentBanner />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  localStorage.clear();
  journey.startJourney.mockClear();
  journey.trackPageview.mockClear();
  installGoogleGtag();
});
afterEach(cleanup);

describe("consent banner", () => {
  it("Accept sends a real gtag consent update (an Arguments object, not an array)", () => {
    renderWithTracker();
    fireEvent.click(screen.getByRole("button", { name: "Accept" }));
    const updates = consentUpdates();
    expect(updates).toHaveLength(1);
    expect(Array.isArray(updates[0])).toBe(false);
    expect(updates[0][2]).toEqual({
      ad_storage: "granted",
      analytics_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
    });
    expect(((window as W).dataLayer ?? []).some((e) => Array.isArray(e))).toBe(false);
    expect(localStorage.getItem(CONSENT_KEY)).toBe("granted");
  });

  it("works even when index.html's gtag is missing", () => {
    delete (window as W).gtag;
    (window as W).dataLayer = undefined;
    renderWithTracker();
    fireEvent.click(screen.getByRole("button", { name: "Accept" }));
    expect(consentUpdates()).toHaveLength(1);
  });

  it("Decline sends a denied update", () => {
    renderWithTracker();
    fireEvent.click(screen.getByRole("button", { name: "Decline" }));
    const updates = consentUpdates();
    expect(updates).toHaveLength(1);
    expect((updates[0][2] as Record<string, string>).analytics_storage).toBe("denied");
  });

  it("re-applies a stored choice on load without showing the banner", () => {
    localStorage.setItem(CONSENT_KEY, "granted");
    renderWithTracker();
    expect(screen.queryByRole("button", { name: "Accept" })).toBeNull();
    expect((consentUpdates()[0][2] as Record<string, string>).ad_storage).toBe("granted");
  });
});

describe("journey tracking waits for consent", () => {
  it("does not start before Accept, and starts on Accept", () => {
    renderWithTracker();
    expect(journey.startJourney).not.toHaveBeenCalled();
    expect(journey.trackPageview).not.toHaveBeenCalled();
    act(() => { fireEvent.click(screen.getByRole("button", { name: "Accept" })); });
    expect(journey.startJourney).toHaveBeenCalledTimes(1);
    expect(journey.trackPageview).toHaveBeenCalledWith("/what-is-pgi");
  });

  it("never starts after Decline", () => {
    renderWithTracker();
    act(() => { fireEvent.click(screen.getByRole("button", { name: "Decline" })); });
    expect(journey.startJourney).not.toHaveBeenCalled();
  });

  it("starts immediately for a returning visitor who accepted", () => {
    localStorage.setItem(CONSENT_KEY, "granted");
    renderWithTracker();
    expect(journey.startJourney).toHaveBeenCalledTimes(1);
  });
});
