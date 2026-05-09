// BI_WEBSITE_BLOCK_PGI_FULL_APP_v1
// BI_WEBSITE_BLOCK_v91_API_BASE_AND_DOCS_STAGE_v1 — read VITE_API_URL
// (what .env actually sets) AND keep VITE_BI_API_URL as fallback.
const BASE = ((import.meta.env.VITE_API_URL as string | undefined)
  || (import.meta.env.VITE_BI_API_URL as string | undefined)
  || window.location.origin).replace(/\/$/, "") + "/api/v1";

// BI_WEBSITE_BLOCK_v97_OTP_GATE_AND_FLOW_v1 — applicant token helpers (OTP gate before CORE)
const APPLICANT_TOKEN_KEY = "bi.applicant_token";
export function getApplicantToken(): string | null {
  try { return localStorage.getItem(APPLICANT_TOKEN_KEY); } catch { return null; }
}
export function setApplicantToken(tok: string) {
  try { localStorage.setItem(APPLICANT_TOKEN_KEY, tok); } catch { /* noop */ }
}
export function clearApplicantToken() {
  try { localStorage.removeItem(APPLICANT_TOKEN_KEY); } catch { /* noop */ }
}

async function jsonFetch(path: string, init?: RequestInit) {
  const r = await fetch(BASE + path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(data?.error ?? `HTTP ${r.status}`), { status: r.status, data });
  return data;
}

export const api = {
  // BI_WEBSITE_BLOCK_v97_OTP_GATE_AND_FLOW_v1 — score requires applicant JWT (server uses phone from token)
  score: (body: any) => {
    const tok = getApplicantToken();
    return jsonFetch("/applications/score", {
      method: "POST",
      body: JSON.stringify(body),
      headers: tok ? { Authorization: `Bearer ${tok}` } : {},
    });
  },
  applicantOtpStart: (phone: string) =>
    jsonFetch("/applicants/otp/start", { method: "POST", body: JSON.stringify({ phone }) }),
  applicantOtpVerify: (phone: string, code: string) =>
    jsonFetch("/applicants/otp/verify", { method: "POST", body: JSON.stringify({ phone, code }) }),
  getApp: (publicId: string) => jsonFetch(`/applications/${publicId}`),
  patchApp: (publicId: string, body: any) =>
    jsonFetch(`/applications/${publicId}`, { method: "PATCH", body: JSON.stringify(body) }),
  submit: (publicId: string) =>
    jsonFetch(`/applications/${publicId}/submit`, { method: "POST" }),
  scrape: async (publicId: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    const r = await fetch(`${BASE}/applications/${publicId}/scrape`, { method: "POST", body: fd });
    if (!r.ok) throw new Error(`scrape ${r.status}`);
    return r.json();
  },
  // BI_WEBSITE_BLOCK_v91_API_BASE_AND_DOCS_STAGE_v1
  uploadDocs: async (publicId: string, files: Array<{ docType: string; file: File }>) => {
    const fd = new FormData();
    for (const { docType, file } of files) {
      fd.append("files", file);
      fd.append("doc_types", docType);
    }
    const r = await fetch(`${BASE}/applications/${publicId}/documents`, { method: "POST", body: fd });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(new Error(data?.error ?? `HTTP ${r.status}`), { status: r.status, data });
    return data;
  },
  listDocs: async (publicId: string) => {
    const r = await fetch(`${BASE}/applications/${publicId}/documents`);
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(new Error(data?.error ?? `HTTP ${r.status}`), { status: r.status, data });
    return data;
  },
  quoteCalc: (loan: number, coverage: number, type: "secured" | "unsecured") =>
    jsonFetch(`/quote/calculate?loan=${loan}&coverage=${coverage}&type=${type}`),
};

export const API = api;
