export function reportError(error: unknown) {
  if (import.meta.env.PROD) {
    fetch("/error-log", {
      credentials: "include",
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ error: String(error) })
    });
  }
}
