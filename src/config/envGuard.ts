export function validateEnv() {
  if (!import.meta.env.VITE_API_BASE) {
    throw new Error("VITE_API_BASE is not configured");
  }

  if (!import.meta.env.VITE_SUBMIT_SECRET) {
    throw new Error("VITE_SUBMIT_SECRET is not configured");
  }
}
