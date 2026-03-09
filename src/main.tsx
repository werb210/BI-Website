import "./index.css";
import { validateEnv } from "./config/envGuard";
validateEnv();

import { captureCampaign } from "./lib/campaignTracker"
captureCampaign()
captureReferral()

import { captureReferral } from "./lib/referralTracker"
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import "./styles.css";
import { processQueue } from "./lib/uploadQueue";
import { initAnalytics } from "./lib/analytics";

initAnalytics();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js");
  });
}

window.addEventListener("online", () => {
  processQueue();
});
