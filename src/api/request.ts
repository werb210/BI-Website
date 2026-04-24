import { getAuthToken } from "../lib/auth";

const API_URL = import.meta.env.VITE_API_URL || "";

export class ApiError extends Error {
  status: number;
  detail?: unknown;

  constructor(status: number, message: string, detail?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

function normalizeBiPath(path: string) {
  if (path.startsWith("/api/v1/application/")) {
    return path.replace("/api/v1/application/", "/api/v1/bi/application/");
  }
  if (path === "/api/v1/application/by-phone") {
    return "/api/v1/bi/application/by-phone";
  }
  return path;
}

export function getApiBaseUrl() {
  return API_URL;
}

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const normalizedPath = normalizeBiPath(path);
  const token = getAuthToken();

  const headers: Record<string, string> = {
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string> | undefined) || {})
  };

  const res = await fetch(`${API_URL}${normalizedPath}`, {
    ...options,
    headers,
    credentials: options.credentials
  });

  if (!res.ok) {
    let detail: unknown;
    let message = `API error ${res.status}`;
    try {
      const errorPayload = await res.json();
      detail = errorPayload?.detail ?? errorPayload;
      if (typeof errorPayload?.error === "string" && errorPayload.error.trim()) {
        message = errorPayload.error;
      } else if (typeof errorPayload?.message === "string" && errorPayload.message.trim()) {
        message = errorPayload.message;
      }
    } catch {
      // keep default message when response is not JSON
    }
    throw new ApiError(res.status, message, detail);
  }

  const raw = (await res.json()) as { status?: string; data?: T } | T;
  if (raw && typeof raw === "object" && "status" in (raw as object) && "data" in (raw as object)) {
    return (raw as { data: T }).data;
  }
  return raw as T;
}

export function apiPost<T = unknown>(path: string, body: unknown, options: RequestInit = {}) {
  return apiRequest<T>(path, {
    method: "POST",
    body: body instanceof FormData ? body : JSON.stringify(body),
    ...options
  });
}

export function apiGet<T = unknown>(path: string, options: RequestInit = {}) {
  return apiRequest<T>(path, { method: "GET", ...options });
}
