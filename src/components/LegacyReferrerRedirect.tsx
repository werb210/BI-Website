// BI_WEBSITE_BLOCK_v784_OCT11_AUDIT_v1
// Old /referrer/* links used to redirect to /r/x, which the referral landing
// page treated as a real code. Forward a valid ?ref= (short code or UUID, same
// rules as App.tsx's capture) to /r/<code>; otherwise go to the application
// with no ref.
import { Navigate, useLocation } from "react-router-dom";

const SHORT_CODE_RE = /^[a-z0-9]{4,16}$/i;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidRefCode(code: string | null | undefined): code is string {
  return !!code && (SHORT_CODE_RE.test(code) || UUID_RE.test(code));
}

export default function LegacyReferrerRedirect() {
  const { search } = useLocation();
  const code = (new URLSearchParams(search).get("ref") || "").trim();
  const to = isValidRefCode(code) ? `/r/${encodeURIComponent(code)}` : "/applications/new";
  return <Navigate to={to} replace />;
}
