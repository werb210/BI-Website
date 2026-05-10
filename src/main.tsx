// BI_WEBSITE_BLOCK_v100_SCORE_LAYOUT_AND_BRAND_v2 — v100_FAVICON_INJECT
import faviconUrl from "../assets/logos/fav.png";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
// BI_WEBSITE_BLOCK_v168_CARRIER_RESKIN_v1 — carrier-aligned theme
import "./styles/carrier.css";

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
