import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Application from "./pages/Application";
import Claims from "./pages/Claims";
import Contact from "./pages/Contact";
import LenderLogin from "./pages/LenderLogin";
import ReferrerLogin from "./pages/ReferrerLogin";
import MayaChat from "./components/MayaChat";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/apply" element={<Application />} />
        <Route path="/claims" element={<Claims />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/lender-login" element={<LenderLogin />} />
        <Route path="/referrer-login" element={<ReferrerLogin />} />
      </Routes>
      <MayaChat />
    </>
  );
}
