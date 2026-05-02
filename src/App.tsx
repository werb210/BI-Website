import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import NewApplication from "./pages/NewApplication";
import Country from "./pages/Country";
import Score from "./pages/Score";
import ScoreResult from "./pages/ScoreResult";
import Application from "./pages/Application";
import Thanks from "./pages/Thanks";
import Quote from "./pages/Quote";
import LenderPortal from "./pages/LenderPortal";
import ReferrerPortal from "./pages/ReferrerPortal";

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <main className="bi-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quote" element={<Quote />} />
          <Route path="/applications/new" element={<NewApplication />} />
          <Route path="/applications/new/country" element={<Country />} />
          <Route path="/applications/new/score" element={<Score />} />
          <Route path="/applications/:publicId/score-result" element={<ScoreResult />} />
          <Route path="/applications/:publicId/form" element={<Application />} />
          <Route path="/applications/:publicId/thanks" element={<Thanks />} />
          <Route path="/lender/*" element={<LenderPortal />} />
          <Route path="/referrer/*" element={<ReferrerPortal />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
