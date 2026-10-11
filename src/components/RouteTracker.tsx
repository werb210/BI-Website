import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { startJourney, trackPageview } from "../utils/journey"; // BI_WEBSITE_BLOCK_v569_VISITOR_JOURNEY
import { CONSENT_EVENT, hasAnalyticsConsent } from "../lib/consent";

// #57 - fire a GTM page_view on every SPA route change.
export default function RouteTracker() {
  const location = useLocation();
  // BI_WEBSITE_BLOCK_v789_AUDIT_ROUND2 [139] - our own journey record is
  // analytics, so it only starts once the visitor has pressed Accept.
  const [consented, setConsented] = useState(hasAnalyticsConsent);
  useEffect(() => {
    const onConsent = () => setConsented(hasAnalyticsConsent());
    window.addEventListener(CONSENT_EVENT, onConsent);
    return () => window.removeEventListener(CONSENT_EVENT, onConsent);
  }, []);

  useEffect(() => {
    if (!consented) return;
    startJourney();
    trackPageview(location.pathname);
  }, [consented, location.pathname, location.search]);

  useEffect(() => {
    // GTM itself honours Consent Mode, so the page_view event is always pushed.
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
