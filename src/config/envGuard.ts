import { getApiBaseUrl } from "../api/request";

export function validateEnv() {
  getApiBaseUrl();

  if (!import.meta.env.VITE_SUBMIT_SECRET) {
    throw new Error("Missing VITE_SUBMIT_SECRET");
  }
}
