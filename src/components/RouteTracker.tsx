import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { startJourney, trackPageview } from "../utils/journey"; // BI_WEBSITE_BLOCK_v569_VISITOR_JOURNEY

// #57 — fire a GTM page_view on every SPA route change.
export default function RouteTracker() {
  const location = useLocation();
  useEffect(() => {
    // BI_WEBSITE_BLOCK_v569_VISITOR_JOURNEY - same route change, our own journey record.
    startJourney();
    trackPageview(location.pathname);
    const w = window as unknown as { dataLayer?: unknown[] };
    if (Array.isArray(w.dataLayer)) {
      w.dataLayer.push({
        event: "page_view",
        page_path: location.pathname + location.search,
        page_location: window.location.href,
        page_title: document.title,
        timestamp: Date.now(),
      });
    }
  }, [location.pathname, location.search]);
  return null;
}
