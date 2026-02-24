import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Claims from "./pages/Claims";
import Contact from "./pages/Contact";
import LenderPortal from "./pages/LenderPortal";
import ReferrerPortal from "./pages/ReferrerPortal";
import PGIApplication from "./pages/PGIApplication";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/claims" element={<Claims />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/lender-login" element={<LenderPortal />} />
        <Route path="/lender" element={<LenderPortal />} />
        <Route path="/referrer-login" element={<ReferrerPortal />} />
        <Route path="/referrer" element={<ReferrerPortal />} />
        <Route path="/apply" element={<PGIApplication />} />
      </Routes>

      <a href="/apply" className="floating-cta">
        💬 Speak With a PGI Specialist
      </a>
    </BrowserRouter>
  );
}
