import { Navigate } from "react-router-dom";

// BI_WEBSITE_BLOCK_v120_MULTI_LENDER_PUBLIC_AND_LENDER_DOCS_AND_LOGIN_v1
// Dedicated lender login route kept explicit at /lender/login.
export default function LenderLogin() {
  return <Navigate to="/lender" replace />;
}
