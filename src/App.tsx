import { Helmet } from "react-helmet-async";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Quote from "./pages/Quote";
import Application from "./pages/Application";
import ThankYou from "./pages/ThankYou";
import PolicyLookup from "./pages/PolicyLookup";
import About from "./pages/About";
import HowItWorks from "./pages/HowItWorks";
import Faq from "./pages/Faq";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const PAGE_META: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Boreal Insurance | Personal Guarantee Insurance",
    description: "Protect personal assets linked to business borrowing with Boreal Insurance."
  },
  "/quote": {
    title: "Get a Quote | Boreal Insurance",
    description: "Generate an instant personal guarantee insurance quote online."
  },
  "/apply": {
    title: "Apply | Boreal Insurance",
    description: "Complete your Boreal Insurance personal guarantee application securely."
  },
  "/lender/apply": {
    title: "Lender Application | Boreal Insurance",
    description: "Submit a lender-assisted personal guarantee insurance application."
  },
  "/policy-status": {
    title: "Policy Status | Boreal Insurance",
    description: "Check the status of your Boreal Insurance policy and application."
  },
  "/thank-you": {
    title: "Thank You | Boreal Insurance",
    description: "Thanks for submitting your Boreal Insurance application."
  },
  "/about": {
    title: "About | Boreal Insurance",
    description: "Learn about Boreal Insurance and our business protection mission."
  },
  "/how-it-works": {
    title: "How It Works | Boreal Insurance",
    description: "Understand how personal guarantee insurance works with Boreal."
  },
  "/faq": {
    title: "FAQ | Boreal Insurance",
    description: "Find answers to common personal guarantee insurance questions."
  },
  "/contact": {
    title: "Contact | Boreal Insurance",
    description: "Contact Boreal Insurance for quote and application support."
  }
};

export default function App() {
  const { pathname } = useLocation();
  const meta = PAGE_META[pathname] ?? {
    title: "Page Not Found | Boreal Insurance",
    description: "The requested page could not be found."
  };

  return (
    <>
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
      </Helmet>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/quote" element={<Quote />} />
        <Route path="/apply" element={<Application />} />
        <Route path="/lender/apply" element={<Application lenderMode />} />
        <Route path="/policy-status" element={<PolicyLookup />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="/about" element={<About />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
