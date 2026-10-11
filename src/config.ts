// BI_WEBSITE_BLOCK_v347_TEST1_RUN5_v1 - single source of truth for
// the bi-server URL. Pre-fix: 10 page files each defined their own
// local API_BASE constant with the same Azure raw URL fallback. If
// Azure regenerated the App Service hostname, 10 surfaces would
// silently break in unison. Now all consumers import from here.
// BI_WEBSITE_BLOCK_v789_AUDIT_ROUND2 [151] - src/lib/api.ts and
// src/api/request.ts read it too; they used to fall back to the page's own
// origin and to "" respectively, so a build without VITE_API_URL sent API
// calls to the static site instead of BI-Server.
export const FALLBACK_BI_SERVER_URL =
  "https://bi-server-cse0apamgkheb9d5.canadacentral-01.azurewebsites.net";

type ApiEnv = { VITE_API_URL?: string; VITE_API_BASE_URL?: string; VITE_BI_API_URL?: string };

export function resolveApiBase(env: ApiEnv | undefined): string {
  const envUrl = env?.VITE_API_URL || env?.VITE_API_BASE_URL || env?.VITE_BI_API_URL || "";
  const trimmed = String(envUrl).trim().replace(/\/+$/, "");
  return trimmed || FALLBACK_BI_SERVER_URL;
}

// BI-Server origin, without /api/v1. Callers append /api/v1/... themselves.
export const API_BASE = resolveApiBase((import.meta as { env?: ApiEnv }).env);
