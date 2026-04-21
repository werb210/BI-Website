import { getApiBaseUrl } from "../api/request";

export type EnvValidationResult = {
  apiBaseUrl: string;
  hasSubmitSecret: boolean;
};

export function validateEnv(): EnvValidationResult {
  const apiBaseUrl = getApiBaseUrl();
  const hasSubmitSecret = Boolean(import.meta.env.VITE_SUBMIT_SECRET);

  if (!hasSubmitSecret) {
    console.warn("Missing VITE_SUBMIT_SECRET. Submission features may be limited.");
  }

  return {
    apiBaseUrl,
    hasSubmitSecret,
  };
}
