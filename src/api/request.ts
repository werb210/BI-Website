const DEFAULT_API = "https://server.boreal.financial";

export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_URL || DEFAULT_API;
}

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const base = getApiBaseUrl();
  const url = path.startsWith("http://") || path.startsWith("https://")
    ? path
    : `${base}${path}`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export function apiCall<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  return apiRequest<T>(path, options);
}

export function apiPost<T = unknown>(path: string, body: unknown): Promise<T> {
  return apiRequest<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
