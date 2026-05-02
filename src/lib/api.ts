export const API = (import.meta.env.VITE_BI_API_URL || window.location.origin)
  .replace(/\/$/, "") + "/api/v1";
