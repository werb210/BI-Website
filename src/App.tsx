import { BrowserRouter, Routes, Route } from "react-router-dom"

import Home from "./pages/Home"
import PGIApplication from "./pages/PGIApplication"
import LenderPortal from "./pages/LenderPortal"
import ReferrerPortal from "./pages/ReferrerPortal"
import Contact from "./pages/Contact"
import MayaChat from "./components/MayaChat"

export default function App() {

  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/apply" element={<PGIApplication />} />
        <Route path="/lender" element={<LenderPortal />} />
        <Route path="/referrer" element={<ReferrerPortal />} />
        <Route path="/contact" element={<Contact />} />

      </Routes>
      <MayaChat />

    </BrowserRouter>
  )

}
