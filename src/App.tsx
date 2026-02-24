import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

import Home from "./pages/Home";
import PGIApplication from "./pages/PGIApplication";
import LenderPortal from "./pages/LenderPortal";
import ReferrerPortal from "./pages/ReferrerPortal";
import Contact from "./pages/Contact";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/apply" element={<PGIApplication />} />
        <Route path="/lender" element={<LenderPortal />} />
        <Route path="/referrer" element={<ReferrerPortal />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </Layout>
  );
}
