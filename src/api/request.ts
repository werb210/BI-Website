import { API_BASE } from "../config";

const REQUEST_TIMEOUT_MS = 15000;

export function getApiBaseUrl(): string {
  const apiBaseUrl = API_BASE?.trim();

  if (!apiBaseUrl) {
    throw new Error("Missing VITE_API_URL");
  }

  return apiBaseUrl.replace(/\/$/, "");
}

export async function apiCall<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${getApiBaseUrl()}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      credentials: "include",
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error((json as { error?: string })?.error || "API error");
    }

    if (json && typeof json === "object" && "data" in json) {
      return (json as { data: T }).data;
    }

    return json as T;
  } finally {
    clearTimeout(timeout);
  }
}

export function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  return apiCall<T>(path, init);
}

export function apiPost<T = unknown>(path: string, body: unknown): Promise<T> {
  return apiCall<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
