import { useNavigate } from "react-router-dom";

export default function Country() {
  const nav = useNavigate();
  return (
    <div className="bi-card">
      <h1>Select Your Country</h1>
      <p>This helps us ask the right questions for your region.</p>
      <button className="bi-country" onClick={() => nav("/applications/new/score?country=CA")}>
        Canada 🇨🇦
      </button>
      <button className="bi-country disabled" disabled>
        United States 🇺🇸 — coming soon
      </button>
    </div>
  );
}
