import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Lender from "./pages/Lender";
import Quote from "./pages/Quote";
import Referral from "./pages/Referral";

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/referral" element={<Referral />} />
        <Route path="/lender/*" element={<Lender />} />
        <Route path="/lender/quote" element={<Quote />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
