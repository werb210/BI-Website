const REQUEST_TIMEOUT_MS = 15000;

export function getApiBaseUrl(): string {
  const apiBaseUrl = import.meta.env.VITE_API_URL?.trim();

  if (!apiBaseUrl) {
    throw new Error("Missing VITE_API_URL");
  }

  return apiBaseUrl.replace(/\/$/, "");
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Request failed (${response.status})`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

export function apiPost<T = unknown>(path: string, body: unknown): Promise<T> {
  return apiRequest<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
