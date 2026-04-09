export function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL;

  // Hard fallback (PROD SERVER)
  const fallback = "https://server.boreal.financial";

  // If env exists → use it
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl;
  }

  // If running in Codespaces / github.dev → ALWAYS force backend
  if (window.location.hostname.includes("github.dev")) {
    return fallback;
  }

  // Default fallback
  return fallback;
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
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error: ${res.status} - ${text}`);
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
