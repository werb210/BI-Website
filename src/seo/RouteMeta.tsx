// BI_WEBSITE_BLOCK_v789_AUDIT_ROUND2 [146] - replaces Canonical.tsx and SEO.tsx.
// Applies the route's title, description, canonical, robots and og/twitter tags
// on every client-side navigation.
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { applyMetaToDocument, metaForPath } from "./routeMeta";

export default function RouteMeta() {
  const { pathname } = useLocation();
  useEffect(() => {
    try {
      applyMetaToDocument(document, metaForPath(pathname));
    } catch { /* SEO must never break the page */ }
  }, [pathname]);
  return null;
}
