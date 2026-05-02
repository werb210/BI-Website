import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";

export default function ScoreResult() {
  const { publicId } = useParams<{ publicId: string }>();
  const nav = useNavigate();
  const [app, setApp] = useState<any>(null);

  useEffect(() => {
    api.getApp(publicId!).then((r) => setApp(r.application)).catch(() => setApp(null));
  }, [publicId]);

  if (!app) return <div className="bi-card">Loading…</div>;

  if (app.score_decision === "approve") {
    return (
      <div className="bi-card score-result approve">
        <div className="core-mark">CORE</div>
        <div className="core-engine">CLIENT OPTIMIZED RISK ENGINE</div>
        <div className="core-circle">
          <div className="core-number">{app.score_value}</div>
          <div className="core-label">CORE SCORE</div>
        </div>
        <div className="core-status">Your application qualifies!</div>
        <div className="core-validity">Quote valid for 30 days</div>
        <div className="bi-actions">
          <button onClick={() => nav("/")}>Return</button>
          <button className="primary" onClick={() => nav(`/applications/${publicId}/form`)}>Apply for Quote</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bi-card score-result decline">
      <h2>Thanks for applying</h2>
      <p>Based on the information you provided, your application doesn't meet the eligibility criteria for Personal Guarantee Insurance at this time.</p>
      <p>If your circumstances change, you're welcome to apply again.</p>
      <button className="primary" onClick={() => nav("/")}>Return Home</button>
    </div>
  );
}
