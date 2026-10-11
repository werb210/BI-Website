// BI_WEBSITE_BLOCK_v789_AUDIT_ROUND2 [139]
// Google Consent Mode v2. gtag() must be called with the gtag function so
// dataLayer receives a real Arguments object - GTM ignores a plain array, so
// pushing ["consent", "update", {...}] never updated consent at all.
export const CONSENT_KEY = "boreal_consent_v1";
export const CONSENT_EVENT = "boreal:consent";

export type ConsentChoice = "granted" | "denied";

type Gtag = (...args: unknown[]) => void;
type GtagWindow = Window & { dataLayer?: unknown[]; gtag?: Gtag };

// index.html defines window.gtag before GTM loads; this fallback is the same
// definition Google publishes, for any context where that snippet did not run.
export function getGtag(): Gtag {
  const w = window as GtagWindow;
  w.dataLayer = w.dataLayer || [];
  if (typeof w.gtag !== "function") {
    w.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      (w.dataLayer as unknown[]).push(arguments);
    };
  }
  return w.gtag;
}

export function readConsent(): ConsentChoice | null {
  try {
    const v = window.localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

export function hasAnalyticsConsent(): boolean {
  return readConsent() === "granted";
}

export function applyConsent(granted: boolean): void {
  const value = granted ? "granted" : "denied";
  getGtag()("consent", "update", {
    ad_storage: value,
    analytics_storage: value,
    ad_user_data: value,
    ad_personalization: value,
  });
}

export function saveConsent(granted: boolean): void {
  try { window.localStorage.setItem(CONSENT_KEY, granted ? "granted" : "denied"); } catch { /* private mode */ }
  applyConsent(granted);
  try { window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: { granted } })); } catch { /* noop */ }
}
