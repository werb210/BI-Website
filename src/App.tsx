import { Routes, Route } from "react-router-dom";
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

export default function App() {
  return (
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
  );
}
