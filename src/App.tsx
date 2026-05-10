// BI_WEBSITE_BLOCK_v89_REVERT_WRONG_API_DOCS_v1
// BI_WEBSITE_BLOCK_v82_APP_FOOTER_WIRING_v1
// Adds the new Footer below <main> and wraps the whole tree in a
// flex column so the footer hugs the viewport bottom on short pages.
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import QuoteModal from "./components/QuoteModal";
import FaqModal, { FaqPage } from "./components/Faq";
import Home from "./pages/Home";
// BI_WEBSITE_BLOCK_v90_LENDER_API_DOCS_v1
// BI_WEBSITE_BLOCK_v94_LAUNCH_HARDENING_v1
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import LenderApiDocs from "./pages/LenderApiDocs";
// BI_WEBSITE_BLOCK_v91_API_BASE_AND_DOCS_STAGE_v1
import PgiDocuments from "./pages/PgiDocuments";
// BI_WEBSITE_BLOCK_v84_ROUTES_RESKIN_AND_SCORE_TC_v1 — mount marketing pages
import Contact from "./pages/Contact";
import WhatIsPGI from "./pages/WhatIsPGI";
import HowItWorks from "./pages/HowItWorks";
import Coverage from "./pages/Coverage";
import WhyItMatters from "./pages/WhyItMatters";
// BI_WEBSITE_BLOCK_v99_MARKETING_HOME_v1
import CSBFP from "./pages/CSBFP";
import Resources from "./pages/Resources";
import Intro from "./pages/Intro";
import NewApplication from "./pages/NewApplication";
import Country from "./pages/Country";
import Score from "./pages/Score";
import ScoreResult from "./pages/ScoreResult";
import Application from "./pages/Application";
import Thanks from "./pages/Thanks";
import Quote from "./pages/Quote";
import LenderPortal from "./pages/LenderPortal";
import ReferrerPortal from "./pages/ReferrerPortal";

export default function App() {
  return (
    <BrowserRouter>
      {/* BI_WEBSITE_BLOCK_v168_CARRIER_RESKIN_v1 — aurora app shell */}
      <div className="bi-app-shell">
      <div className="flex min-h-screen flex-col">
        <Header />
        <QuoteModal />
        <FaqModal />
        <main className="bi-main flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/quote" element={<Quote />} />
            <Route path="/applications/new" element={<NewApplication />} />
            {/* BI_WEBSITE_BLOCK_v97_OTP_GATE_AND_FLOW_v1 — country picker moved into the score form */}
            <Route path="/applications/new/country" element={<Navigate to="/applications/new" replace />} />
            <Route path="/applications/new/score" element={<Score />} />
            <Route path="/applications/:publicId/score-result" element={<ScoreResult />} />
            <Route path="/applications/:publicId/form" element={<Application />} />
            {/* BI_WEBSITE_BLOCK_v91_API_BASE_AND_DOCS_STAGE_v1 — must precede /thanks */}
            <Route path="/applications/:publicId/documents" element={<PgiDocuments />} />
            <Route path="/applications/:publicId/thanks" element={<Thanks />} />
            {/* BI_WEBSITE_BLOCK_v90_LENDER_API_DOCS_v1 — must precede /lender/* splat */}
            <Route path="/lender/api" element={<LenderApiDocs />} />
            <Route path="/lender/*" element={<LenderPortal />} />
            {/* BI_WEBSITE_BLOCK_v96_LAUNCH_UX_v2 — referrer portal restored */}
            <Route path="/referrer/*" element={<ReferrerPortal />} />
            <Route path="/application" element={<Navigate to="/applications/new" replace />} />
            {/* BI_WEBSITE_BLOCK_v96_LAUNCH_UX_v2 — /referral redirect restored */}
            <Route path="/referral" element={<Navigate to="/referrer/login" replace />} />
            {/* BI_WEBSITE_BLOCK_v84_ROUTES_RESKIN_AND_SCORE_TC_v1 — mount marketing pages */}
            <Route path="/contact" element={<Contact />} />
            <Route path="/intro" element={<Intro />} />
            <Route path="/what-is-pgi" element={<WhatIsPGI />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/coverage" element={<Coverage />} />
            <Route path="/why-it-matters" element={<WhyItMatters />} />
            {/* BI_WEBSITE_BLOCK_v99_MARKETING_HOME_v1 */}
            <Route path="/csbfp" element={<CSBFP />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </div>
    </BrowserRouter>
  );
}
