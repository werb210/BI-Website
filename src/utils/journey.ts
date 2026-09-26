// BI_WEBSITE_BLOCK_v569_VISITOR_JOURNEY
// Anonymous page-by-page journey for boreal.insure, the same idea as boreal.financial's.
// A durable session id, one pageview per route with dwell time, flushed to BI-Server.
// Sent as text/plain (a CORS "simple" request) so beacons never need a preflight.
// BI-Server links the visit to the application as soon as the visitor reaches any
// /applications/<id>/... page. Never throws: tracking must not break the site.
import { API_BASE } from "../config";

const SESSION_KEY = "bi_journey_session";
const ATTRIBUTION_KEY = "bi_attribution";
const endpoint = () => `${API_BASE}/api/v1/bi/track/journey`;

type JourneyEvent = { type: string; path?: string; title?: string; dwellMs?: number };

export function shouldTrack(path: string): boolean {
  // Lender and referrer portals are staff-like users, not prospects.
  return !/^\/(lender|referrer)(\/|$)/.test(path);
}

export function getJourneySessionId(): string {
  let id = window.localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = window.crypto?.randomUUID?.() ?? `s_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function captureAttribution(href: string, referrer: string): Record<string, string> {
  const url = new URL(href);
  const out: Record<string, string> = { landing_page: url.pathname };
  if (referrer && !referrer.startsWith(url.origin)) out.referrer = referrer;
  for (const k of ["gclid", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]) {
    const v = url.searchParams.get(k);
    if (v) out[k] = v;
  }
  return out;
}

function attribution(): Record<string, unknown> {
  try {
    const raw = window.localStorage.getItem(ATTRIBUTION_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

let queue: JourneyEvent[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
let currentPath: string | null = null;
let enteredAt = 0;
let started = false;

function post(useBeacon: boolean): void {
  if (!queue.length) return;
  const body = JSON.stringify({ sessionId: getJourneySessionId(), attribution: attribution(), events: queue });
  queue = [];
  try {
    if (useBeacon && navigator.sendBeacon) {
      navigator.sendBeacon(endpoint(), new Blob([body], { type: "text/plain" }));
      return;
    }
    void fetch(endpoint(), { method: "POST", headers: { "Content-Type": "text/plain" }, body, keepalive: true }).catch(() => {});
  } catch { /* never break the page */ }
}

export function trackPageview(path: string): void {
  try {
    const now = Date.now();
    if (currentPath !== null) {
      queue.push({ type: "pageview", path: currentPath, title: document.title, dwellMs: now - enteredAt });
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => post(false), 2000);
    }
    currentPath = shouldTrack(path) ? path : null;
    enteredAt = now;
  } catch { /* never break the page */ }
}

export function startJourney(): void {
  if (started) return;
  started = true;
  try {
    if (!window.localStorage.getItem(ATTRIBUTION_KEY)) {
      window.localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(captureAttribution(window.location.href, document.referrer)));
    }
    getJourneySessionId();
    const finish = () => {
      if (currentPath !== null) {
        queue.push({ type: "pageview", path: currentPath, title: document.title, dwellMs: Date.now() - enteredAt });
        currentPath = null;
      }
      post(true);
    };
    window.addEventListener("pagehide", finish);
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") finish(); });
  } catch { /* never break the page */ }
}
