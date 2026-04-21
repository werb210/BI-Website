const API = import.meta.env.VITE_API_URL;

export async function apiRequest(path: string, options: RequestInit = {}) {
  if (!API) {
    throw new Error("VITE_API_URL not set");
  }

  const res = await fetch(`${API}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }

  return res.json();
}
