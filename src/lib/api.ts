// BI_WEBSITE_BLOCK_PGI_FULL_APP_v1
const BASE = (import.meta.env.VITE_BI_API_URL || window.location.origin).replace(/\/$/, "") + "/api/v1";

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
  score: (body: any) => jsonFetch("/applications/score", { method: "POST", body: JSON.stringify(body) }),
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
  quoteCalc: (loan: number, coverage: number, type: "secured" | "unsecured") =>
    jsonFetch(`/quote/calculate?loan=${loan}&coverage=${coverage}&type=${type}`),
};

export const API = api;
