// BI_WEBSITE_BLOCK_v128_MOBILE_FIRST_AND_LOGO_AND_LEGAL_v1
// Scrolls window to top on every route change. Mounted once in App.tsx.
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    // No hash → top. With hash → let the anchor target scroll itself
    // (handled in the page's own componentDidMount).
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [pathname, hash]);
  return null;
}
