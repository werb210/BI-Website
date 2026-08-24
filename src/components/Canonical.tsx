// BI_WEBSITE_CANONICAL_v268
// index.html shipped a single static <link rel="canonical" href="https://boreal.financial">
// in the document shell, so every page of boreal.insure declared itself a duplicate of a
// different company's homepage. Nothing overrode it: src/components/SEO.tsx emits no
// canonical and has no importers.
//
// This mounts inside BrowserRouter and rewrites the canonical to the current path on
// every navigation. The query string is deliberately excluded - a canonical identifies
// the page, not the visit.
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const CANONICAL_ORIGIN = "https://www.boreal.insure";

export default function Canonical() {
  const { pathname } = useLocation();
  useEffect(() => {
    try {
      let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!el) {
        el = document.createElement("link");
        el.rel = "canonical";
        document.head.appendChild(el);
      }
      el.href = `${CANONICAL_ORIGIN}${pathname}`;
    } catch { /* SEO must never break the page */ }
  }, [pathname]);
  return null;
}
