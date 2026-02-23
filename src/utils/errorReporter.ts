export function reportError(error: unknown) {
  if (import.meta.env.PROD) {
    fetch("/error-log", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ error: String(error) })
    });
  }
}
