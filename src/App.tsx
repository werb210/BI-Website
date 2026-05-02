import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Quote from "./pages/Quote";
import Application from "./pages/Application";
import ApplicationDocuments from "./pages/ApplicationDocuments";
import ApplicationSignature from "./pages/ApplicationSignature";
import LenderPortal from "./pages/LenderPortal";
import ReferrerPortal from "./pages/ReferrerPortal";
import Contact from "./pages/Contact";

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/quote" element={<Quote />} />
        <Route path="/application" element={<Application />} />
        <Route path="/application/documents" element={<ApplicationDocuments />} />
        <Route path="/application/signature" element={<ApplicationSignature />} />
        <Route path="/lender/*" element={<LenderPortal />} />
        <Route path="/referrer/*" element={<ReferrerPortal />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
