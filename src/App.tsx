// BI_WEBSITE_BLOCK_v89_REVERT_WRONG_API_DOCS_v1
// BI_WEBSITE_BLOCK_v82_APP_FOOTER_WIRING_v1
// Adds the new Footer below <main> and wraps the whole tree in a
// flex column so the footer hugs the viewport bottom on short pages.
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useParams, useLocation } from "react-router-dom";
import RouteMeta from "./seo/RouteMeta"; // BI_WEBSITE_BLOCK_v789_AUDIT_ROUND2 [146]
import NotFound from "./pages/NotFound"; // BI_WEBSITE_BLOCK_v789_AUDIT_ROUND2 [152]
import Header from "./components/Header";
import Footer from "./components/Footer";
// BI_WEBSITE_BLOCK_v346_MOBILE_FIRST_LAUNCH_v1
import ScrollToTop from "./components/ScrollToTop";
import LegacyReferrerRedirect from "./components/LegacyReferrerRedirect"; // BI_WEBSITE_BLOCK_v784_OCT11_AUDIT_v1
import RouteTracker from "./components/RouteTracker";
import ConsentBanner from "./components/ConsentBanner";
import Home from "./pages/Home";
// BI_WEBSITE_BLOCK_v90_LENDER_API_DOCS_v1
// BI_WEBSITE_BLOCK_v94_LAUNCH_HARDENING_v1
import Privacy from "./pages/Privacy";
import DeleteAccount from "./pages/DeleteAccount"; // BI_WEBSITE_DELETE_ACCOUNT_v273
import Terms from "./pages/Terms";
import LenderApiDocs from "./pages/LenderApiDocs";
import LenderSandbox from "./pages/LenderSandbox"; // BI_WEBSITE_BLOCK_v131_LENDER_SANDBOX_PANEL_v1
// BI_WEBSITE_BLOCK_v91_API_BASE_AND_DOCS_STAGE_v1
import PgiDocuments from "./pages/PgiDocuments";
// BI_WEBSITE_BLOCK_v84_ROUTES_RESKIN_AND_SCORE_TC_v1 — mount marketing pages
import Contact from "./pages/Contact";
// BI_WEBSITE_BLOCK_v99_MARKETING_HOME_v1
import NewApplication from "./pages/NewApplication";
import QuickApply from "./pages/QuickApply"; // BI_WEBSITE_QUICK_APPLY_v1
import PgiConsent from "./pages/PgiConsent"; // BI_WEBSITE_PGI_CONSENT_v1
import { MarketProvider } from "./lib/market";
import USLenders, { USBrokers, USChooser } from "./pages/USLenders";
import Country from "./pages/Country";
import Score from "./pages/Score";
import ScoreResult from "./pages/ScoreResult";
import Application from "./pages/Application";
import Thanks from "./pages/Thanks";
import Status from "./pages/Status"; // BI_WEBSITE_BLOCK_v134_APPLICANT_STATUS_PAGE_v1
import Saved from "./pages/Saved"; // BI_WEBSITE_BLOCK_v130_DEFER_DOCS_FLOW_v1
import LenderPortal from "./pages/LenderPortal";
import LenderApplicationDemo from "./pages/LenderApplicationDemo"; // BI_WEBSITE_BLOCK_v125_LENDER_FIXES_AND_PUBLIC_POLISH_v1
import ReferralLandingPgi from "./pages/ReferralLandingPgi"; // BI_WEBSITE_REFERRAL_LANDING_v1
import LenderApplicationNew from "./pages/LenderApplicationNew";
import LenderLogin from "./pages/LenderLogin"; // BI_WEBSITE_BLOCK_v120_MULTI_LENDER_PUBLIC_AND_LENDER_DOCS_AND_LOGIN_v1
import LenderApplicationDetail from "./pages/LenderApplicationDetail";
import LenderApplicationTimeline from "./pages/LenderApplicationTimeline"; // BI_WEBSITE_BLOCK_v126_DEMO_SANDBOX_AND_CARRIER_FEEDBACK_v1

// BI_WEBSITE_BLOCK_v403 — bare /applications/:publicId (the BF->BI handoff SMS
// link, and any link missing a sub-route) redirects to the form, so OTP no
// longer dead-ends on the catch-all "*" -> "/" (the main page).
function ApplicationIndexRedirect() {
  const { publicId } = useParams();
  return <Navigate to={`/applications/${publicId}/form`} replace />;
}

// BI_WEBSITE_REP_PAGE_BARE - a rep's contact page (/rep/<code>) is a tool that gets handed to the person the rep is
// talking to, so it carries none of the site's menus, footer or cookie banner.
const isBare = (pathname: string) => pathname.startsWith("/rep/");
function SiteFrame({ part }: { part: "header" | "consent" | "footer" }) {
  const { pathname } = useLocation();
  if (isBare(pathname)) return null;
  return part === "header" ? <Header /> : part === "consent" ? <ConsentBanner /> : <Footer />;
}

export default function App() {
  // BI_WEBSITE_BLOCK_v344_REFERRER_WIRE_BRIDGE_v1
  // Captures ?ref=<value> where value is either:
  //   - short_code: 4-16 char alphanumeric (legacy v135)
  //   - UUID: 36-char dashed hex (v360 server format)
  // Server's v364 normalizer accepts either and looks up by the right column.
  useEffect(() => {
    try {
      const u = new URL(window.location.href);
      const code = u.searchParams.get("ref");
      if (!code) return;
      const isShortCode = /^[a-z0-9]{4,16}$/i.test(code);
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(code);
      if (isShortCode || isUuid) localStorage.setItem("bi.referral_code", code);
    } catch { /* noop */ }
  }, []);
  return (
    <BrowserRouter>
      <MarketProvider>
      <ScrollToTop />
      <RouteMeta />
      {/* BI_WEBSITE_BLOCK_v168_CARRIER_RESKIN_v1 — aurora app shell */}
      <div className="bi-app-shell">
      <div className="flex min-h-screen flex-col">
        <SiteFrame part="header" />
        <RouteTracker />
        <SiteFrame part="consent" />
        <main className="bi-main flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            {/* BI_WEBSITE_US_FIRST_SITE_v1 - the root is the United States site; /ca opens the Canadian one. */}
            <Route path="/ca" element={<Navigate to="/" replace />} />{/* BI_WEBSITE_PGI_COMPLIANCE_v1 - withdrawn after PGI Canada Ltd.'s notice */}
            <Route path="/usa" element={<Navigate to="/" replace />} />{/* BI_WEBSITE_PGI_COMPLIANCE_v1 - withdrawn after PGI Canada Ltd.'s notice */}
            <Route path="/faq" element={<Navigate to="/" replace />} />{/* BI_WEBSITE_PGI_COMPLIANCE_v1 - withdrawn after PGI Canada Ltd.'s notice */}
            <Route path="/quote" element={<Navigate to="/" replace />} />{/* BI_WEBSITE_PGI_COMPLIANCE_v1 - withdrawn after PGI Canada Ltd.'s notice */}
            <Route path="/consent/:token" element={<PgiConsent />} />{/* BI_WEBSITE_PGI_CONSENT_v1 */}
            <Route path="/applications/new" element={<QuickApply />} />{/* BI_WEBSITE_QUICK_APPLY_v1 - PGI's new short form */}
            {/* BI_WEBSITE_BLOCK_v97_OTP_GATE_AND_FLOW_v1 — country picker moved into the score form */}
            <Route path="/applications/new/country" element={<Navigate to="/applications/new" replace />} />
            <Route path="/applications/new/score" element={<Navigate to="/applications/new" replace />} />{/* BI_WEBSITE_QUICK_APPLY_v1 - the score step is gone */}
            <Route path="/applications/:publicId/score-result" element={<ScoreResult />} />
            <Route path="/applications/:publicId/form" element={<Application />} />
            {/* BI_WEBSITE_BLOCK_v91_API_BASE_AND_DOCS_STAGE_v1 — must precede /thanks */}
            <Route path="/applications/:publicId/documents" element={<PgiDocuments />} />
            <Route path="/applications/:publicId/status" element={<Status />} /> {/* BI_WEBSITE_BLOCK_v134_APPLICANT_STATUS_PAGE_v1 */}
            <Route path="/applications/:publicId/thanks" element={<Thanks />} />
            <Route path="/applications/:publicId/saved" element={<Saved />} /> {/* BI_WEBSITE_BLOCK_v130_DEFER_DOCS_FLOW_v1 */}
            {/* BI_WEBSITE_BLOCK_v90_LENDER_API_DOCS_v1 — must precede /lender/* splat */}
            <Route path="/lender/api" element={<LenderApiDocs />} />
            <Route path="/lender/sandbox" element={<LenderSandbox />} /> {/* BI_WEBSITE_BLOCK_v131_LENDER_SANDBOX_PANEL_v1 */}
            <Route path="/lender/*" element={<LenderPortal />} />
            {/* BI_WEBSITE_REFERRAL_LANDING_v1 - referral system unified in BF; PGI landing only */}
            <Route path="/r/:code" element={<ReferralLandingPgi />} />
            <Route path="/application" element={<Navigate to="/applications/new" replace />} />
            <Route path="/referrer/*" element={<LegacyReferrerRedirect />} /> {/* BI_WEBSITE_BLOCK_v784_OCT11_AUDIT_v1 */}
            <Route path="/referral" element={<Navigate to="/" replace />} />
            {/* BI_WEBSITE_BLOCK_v84_ROUTES_RESKIN_AND_SCORE_TC_v1 — mount marketing pages */}
            <Route path="/contact" element={<Contact />} />
            <Route path="/intro" element={<Navigate to="/" replace />} />{/* BI_WEBSITE_PGI_COMPLIANCE_v1 - withdrawn after PGI Canada Ltd.'s notice */}
            <Route path="/what-is-pgi" element={<Navigate to="/" replace />} />{/* BI_WEBSITE_PGI_COMPLIANCE_v1 - withdrawn after PGI Canada Ltd.'s notice */}
            <Route path="/how-it-works" element={<Navigate to="/" replace />} />{/* BI_WEBSITE_PGI_COMPLIANCE_v1 - withdrawn after PGI Canada Ltd.'s notice */}
            <Route path="/coverage" element={<Navigate to="/" replace />} />{/* BI_WEBSITE_PGI_COMPLIANCE_v1 - withdrawn after PGI Canada Ltd.'s notice */}
            <Route path="/why-it-matters" element={<Navigate to="/" replace />} />{/* BI_WEBSITE_PGI_COMPLIANCE_v1 - withdrawn after PGI Canada Ltd.'s notice */}
            {/* BI_WEBSITE_BLOCK_v99_MARKETING_HOME_v1 */}
            <Route path="/sba" element={<Navigate to="/us-lenders" replace />} />{/* BI_WEBSITE_PGI_COMPLIANCE_v1 - withdrawn after PGI Canada Ltd.'s notice */}
            <Route path="/us-lenders" element={<USLenders />} />{/* BI_WEBSITE_PGI_COMPLIANCE_v1 - rewritten: introduction only, no US program details */}
            <Route path="/us" element={<USChooser />} />{/* BI_WEBSITE_PGI_COMPLIANCE_v1 - rewritten: introduction only, no US program details */}
            <Route path="/us-brokers" element={<USBrokers />} />{/* BI_WEBSITE_PGI_COMPLIANCE_v1 - rewritten: introduction only, no US program details */}
            <Route path="/rep/:code" element={<Navigate to="/us" replace />} />{/* BI_WEBSITE_PGI_COMPLIANCE_v1 - rep pages withdrawn: they promised reps a share of commission (PGI notice point 7) */}
            <Route path="/csbfp" element={<Navigate to="/" replace />} />{/* BI_WEBSITE_PGI_COMPLIANCE_v1 - withdrawn after PGI Canada Ltd.'s notice */}
            <Route path="/resources" element={<Navigate to="/" replace />} />{/* BI_WEBSITE_PGI_COMPLIANCE_v1 - withdrawn after PGI Canada Ltd.'s notice */}
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/delete-account" element={<DeleteAccount />} />
            <Route path="/terms" element={<Terms />} />
            {/* BI_WEBSITE_BLOCK_v120_MULTI_LENDER_PUBLIC_AND_LENDER_DOCS_AND_LOGIN_v1 — explicit lender routes BEFORE catchall and BEFORE /lender/* */}
            <Route path="/lender/demo" element={<LenderApplicationDemo />} /> {/* BI_WEBSITE_BLOCK_v125_LENDER_FIXES_AND_PUBLIC_POLISH_v1 */}
            <Route path="/lender/login" element={<LenderLogin />} />
            <Route path="/lender/portal" element={<LenderPortal />} />
            <Route path="/lender/applications/new" element={<LenderApplicationNew />} />
            <Route path="/lender/applications/:code" element={<LenderApplicationDetail />} />
            <Route path="/lender/applications/:code/timeline" element={<LenderApplicationTimeline />} /> {/* BI_WEBSITE_BLOCK_v126_DEMO_SANDBOX_AND_CARRIER_FEEDBACK_v1 */}
            <Route path="/login" element={<NewApplication />} /> {/* BI_WEBSITE_BLOCK_v402_LOGIN_ROUTE_v1 — receives the BF→BI handoff SMS link (https://www.boreal.insure/login?next=/applications/<id>) */}
            <Route path="/applications/:publicId" element={<ApplicationIndexRedirect />} /> {/* BI_WEBSITE_BLOCK_v403 — bare handoff link -> form */}
            <Route path="*" element={<NotFound />} />
      </Routes>
        </main>
        <SiteFrame part="footer" />
      </div>
    </div>
      </MarketProvider>
    </BrowserRouter>
  );
}
