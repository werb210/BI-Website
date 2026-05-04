// BI_WEBSITE_BLOCK_v89_REVERT_WRONG_API_DOCS_v1
// BI_WEBSITE_BLOCK_v82_APP_FOOTER_WIRING_v1
// Adds the new Footer below <main> and wraps the whole tree in a
// flex column so the footer hugs the viewport bottom on short pages.
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
// BI_WEBSITE_BLOCK_v84_ROUTES_RESKIN_AND_SCORE_TC_v1 — mount marketing pages
import Contact from "./pages/Contact";
import WhatIsPGI from "./pages/WhatIsPGI";
import HowItWorks from "./pages/HowItWorks";
import Coverage from "./pages/Coverage";
import WhyItMatters from "./pages/WhyItMatters";
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
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="bi-main flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/quote" element={<Quote />} />
            <Route path="/applications/new" element={<NewApplication />} />
            <Route path="/applications/new/country" element={<Country />} />
            <Route path="/applications/new/score" element={<Score />} />
            <Route path="/applications/:publicId/score-result" element={<ScoreResult />} />
            <Route path="/applications/:publicId/form" element={<Application />} />
            <Route path="/applications/:publicId/thanks" element={<Thanks />} />
            <Route path="/lender/*" element={<LenderPortal />} />
            <Route path="/referrer/*" element={<ReferrerPortal />} />
            <Route path="/application" element={<Navigate to="/applications/new" replace />} />
            <Route path="/referral" element={<Navigate to="/referrer/login" replace />} />
            {/* BI_WEBSITE_BLOCK_v84_ROUTES_RESKIN_AND_SCORE_TC_v1 — mount marketing pages */}
            <Route path="/contact" element={<Contact />} />
            <Route path="/intro" element={<Intro />} />
            <Route path="/what-is-pgi" element={<WhatIsPGI />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/coverage" element={<Coverage />} />
            <Route path="/why-it-matters" element={<WhyItMatters />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
