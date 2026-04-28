// BI_QUOTE_PUBLIC_v44 — V1 BI-2: route LenderPortal, ReferrerPortal,
// PGIApplication, QuoteResult, Contact, Intro. Existing routes are preserved.
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Lender from "./pages/Lender";
import Quote from "./pages/Quote";
import Referral from "./pages/Referral";
import Application from "./pages/Application";
import Documents from "./pages/Documents";
import Signature from "./pages/Signature";
import LenderApplication from "./pages/LenderApplication";
import LenderDocuments from "./pages/LenderDocuments";
import LenderSignature from "./pages/LenderSignature";
import WhatIsPGI from "./pages/WhatIsPGI";
import HowItWorks from "./pages/HowItWorks";
import Coverage from "./pages/Coverage";
import WhyItMatters from "./pages/WhyItMatters";
// BI_QUOTE_PUBLIC_v44 — formerly orphan pages
import LenderPortal from "./pages/LenderPortal";
import ReferrerPortal from "./pages/ReferrerPortal";
import PGIApplication from "./pages/PGIApplication";
import QuoteResult from "./pages/QuoteResult";
import Contact from "./pages/Contact";
import Intro from "./pages/Intro";

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/intro" element={<Intro />} />
        <Route path="/contact" element={<Contact />} />

        <Route path="/quote" element={<Quote />} />
        <Route path="/quote/result" element={<QuoteResult />} />

        <Route path="/application" element={<Application />} />
        <Route path="/application/documents" element={<Documents />} />
        <Route path="/application/signature" element={<Signature />} />
        <Route path="/application/pgi" element={<PGIApplication />} />

        <Route path="/referral" element={<Referral />} />
        <Route path="/referrer" element={<ReferrerPortal />} />
        <Route path="/referrer/portal" element={<ReferrerPortal />} />

        <Route path="/lender" element={<Lender />} />
        <Route path="/lender/quote" element={<Quote />} />
        <Route path="/lender/portal" element={<LenderPortal />} />
        <Route path="/lender/application" element={<LenderApplication />} />
        <Route path="/lender/application/documents" element={<LenderDocuments />} />
        <Route path="/lender/application/signature" element={<LenderSignature />} />

        <Route path="/what-is-pgi" element={<WhatIsPGI />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/coverage" element={<Coverage />} />
        <Route path="/why-it-matters" element={<WhyItMatters />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
