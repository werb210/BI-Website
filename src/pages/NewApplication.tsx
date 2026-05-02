import { useNavigate } from "react-router-dom";

export default function NewApplication() {
  const nav = useNavigate();
  return (
    <div className="bi-card">
      <h1>Start Application</h1>
      <p>PGI protects your personal assets when you sign a business loan.</p>
      <button className="primary big" onClick={() => nav("/applications/new/country")}>
        1. Get Your CORE Score
      </button>
      <small>See if your business qualifies before applying. By continuing, you agree to our Terms of Service and Privacy Policy.</small>
    </div>
  );
}
