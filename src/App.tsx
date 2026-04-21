import { BrowserRouter, Routes, Route } from "react-router-dom"

import Home from "./pages/Home"
import PGIApplication from "./pages/PGIApplication"
import LenderPortal from "./pages/LenderPortal"
import ReferrerPortal from "./pages/ReferrerPortal"
import Contact from "./pages/Contact"
import MayaChat from "./components/MayaChat"
import SubmitGuard from "./components/SubmitGuard"

export default function App() {

  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/apply" element={<SubmitGuard><PGIApplication /></SubmitGuard>} />
        <Route path="/lender" element={<SubmitGuard><LenderPortal /></SubmitGuard>} />
        <Route path="/referrer" element={<SubmitGuard><ReferrerPortal /></SubmitGuard>} />
        <Route path="/contact" element={<SubmitGuard><Contact /></SubmitGuard>} />

      </Routes>
      <MayaChat />

    </BrowserRouter>
  )

}
