const REQUEST_TIMEOUT_MS = 15000;

export function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL;

  // DEV fallback (Codespaces / local)
  if (!envUrl) {
    console.warn("VITE_API_URL missing — using fallback");
    return "https://server.boreal.financial";
  }

  return envUrl;
}

export async function apiCall<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const url = path.startsWith("http://") || path.startsWith("https://")
      ? path
      : `${getApiBaseUrl()}${path}`;
    const isFormData = options.body instanceof FormData;
    const headers: HeadersInit = isFormData
      ? { ...(options.headers || {}) }
      : {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        };

    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers,
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
