import { useNavigate } from "react-router-dom";

export default function Thanks() {
  const nav = useNavigate();
  return (
    <div className="bi-card">
      <h1>Application submitted</h1>
      <p>Our team will review your documents and submit your application to the carrier.</p>
      <p>You'll get an email when there's an update.</p>
      <button className="primary" onClick={() => nav("/")}>Return Home</button>
    </div>
  );
}
