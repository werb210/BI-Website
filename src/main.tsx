import "./index.css";
import "./styles.css";

import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import { validateEnv } from "./config/envGuard";
import { getApiBaseUrl } from "./api/request";
import { initAnalytics } from "./lib/analytics";
import { captureCampaign } from "./lib/campaignTracker";
import { flushEvents } from "./lib/marketing/eventQueue";
import { captureReferral } from "./lib/referralTracker";
import { processQueue } from "./lib/uploadQueue";

async function assertApiHealth() {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/health`, {
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error(`API health check failed (${response.status})`);
  }
}

async function bootstrap() {
  validateEnv();
  await assertApiHealth();

  captureCampaign();
  captureReferral();
  initAnalytics();

  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );

  window.addEventListener("load", () => {
    flushEvents();

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js");
    }
  });

  window.addEventListener("online", () => {
    processQueue();
  });
}

bootstrap();
