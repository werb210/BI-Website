// BI_WEBSITE_BLOCK_v100_SCORE_LAYOUT_AND_BRAND_v2 — v100_FAVICON_INJECT
import faviconUrl from "../assets/logos/fav.png";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
// BI_WEBSITE_BLOCK_v168_CARRIER_RESKIN_v1 — carrier-aligned theme
import "./styles/carrier.css";

// BI_WEBSITE_BLOCK_v103_OTP_BASE_FIX_AND_WARMUP_v1 — wake the B1 worker on first paint.
try {
  const __apiBase = ((import.meta.env.VITE_API_URL as string | undefined)
    || (import.meta.env.VITE_BI_API_URL as string | undefined)
    || window.location.origin).replace(/\/$/, "");
  fetch(__apiBase + "/health", { method: "GET", mode: "cors" }).catch(() => {});
} catch { /* noop */ }

// BI_WEBSITE_BLOCK_v132_PORTAL_RE_OTP_EVERY_VISIT_v1
// Strict re-OTP: every page load wipes any persisted portal auth
// tokens BEFORE React mounts so the LenderPortal / ReferrerPortal
// session-bootstrap effects find no token and redirect to /lender/login
// or /referrer/login. Within-SPA navigation after a successful OTP
// still works because the post-OTP setItem writes the token AFTER
// this block has already run.
function clearPortalAuthTokens() {
  const KEYS = [
    "bi.lender_token",
    "bi.ref_token",
    "bi.lender_phone",
    "bi.lender_id",
    "bi.real_token_backup",
    "bi.is_demo_session",
    "bi.demo_session_started_at",
  ];
  try {
    for (const k of KEYS) {
      try { window.localStorage.removeItem(k); } catch { /* private mode */ }
      try { window.sessionStorage.removeItem(k); } catch { /* private mode */ }
    }
  } catch {
    /* SSR or storage disabled */
  }
}
if (typeof window !== "undefined") {
  clearPortalAuthTokens();
  // bfcache restore: browsers can restore a page from cache without
  // re-running module code. The pageshow event with event.persisted
  // === true tells us a bfcache restore happened — treat as a new
  // visit and clear again.
  window.addEventListener("pageshow", (event: PageTransitionEvent) => {
    if (event.persisted) clearPortalAuthTokens();
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.warn("SW registration failed:", err);
    });
  });
}

const __fav = document.createElement("link");
__fav.rel = "icon"; __fav.type = "image/png"; __fav.href = faviconUrl;
document.head.appendChild(__fav);
