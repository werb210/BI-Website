// BI_AUDIT_FIX_v58 — previously a public lender page with hardcoded,
// non-canonical pipeline copy. Replaced with a redirect to /lender/portal,
// which is OTP-gated and aligned with carrier-backed stage data.
import { Navigate } from "react-router-dom";

export default function Lender() {
  return <Navigate to="/lender/portal" replace />;
}
