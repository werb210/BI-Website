// BI_WEBSITE_BLOCK_v347_TEST1_RUN5_v1 — single source of truth for
// the bi-server URL. Pre-fix: 10 page files each defined their own
// local API_BASE constant with the same Azure raw URL fallback. If
// Azure regenerated the App Service hostname, 10 surfaces would
// silently break in unison. Now all consumers import from here.
const FALLBACK_BI_SERVER_URL =
  "https://bi-server-cse0apamgkheb9d5.canadacentral-01.azurewebsites.net";

function readBiServerUrl(): string {
  const envUrl =
    (import.meta as any)?.env?.VITE_API_URL ??
    (import.meta as any)?.env?.VITE_API_BASE_URL ??
    "";
  const trimmed = String(envUrl ?? "").trim().replace(/\/+$/, "");
  return trimmed || FALLBACK_BI_SERVER_URL;
}

export const API_BASE = readBiServerUrl();
