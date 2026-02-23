export function validateEnv() {
  if (!import.meta.env.VITE_API_BASE) {
    throw new Error("Missing VITE_API_BASE");
  }

  if (!import.meta.env.VITE_SUBMIT_SECRET) {
    throw new Error("Missing VITE_SUBMIT_SECRET");
  }
}
