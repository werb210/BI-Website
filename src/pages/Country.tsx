// BI_WEBSITE_BLOCK_v168_CARRIER_RESKIN_v1
import { useNavigate } from "react-router-dom";

export default function Country() {
  const nav = useNavigate();
  return (
    <div className="bi-card">
      <h1>Select Your Country</h1>
      <p>This helps us ask the right questions for your region.</p>
      <button
        type="button"
        className="bi-country"
        onClick={() => nav("/applications/new/score?country=CA")}
      >
        <span>Canada</span>
        <span aria-hidden="true">🇨🇦</span>
      </button>
      {/* BI_WEBSITE_v792_US_APPLICATIONS */}
      <button
        type="button"
        className="bi-country"
        onClick={() => nav("/applications/new/score?country=US")}
      >
        <span>United States</span>
        <span aria-hidden="true">🇺🇸</span>
      </button>
    </div>
  );
}
