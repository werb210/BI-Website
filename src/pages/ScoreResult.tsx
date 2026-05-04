import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
// BI_WEBSITE_BLOCK_v87_RESULT_CONFETTI_v1
import confetti from "canvas-confetti";

export default function ScoreResult() {
  const { publicId } = useParams<{ publicId: string }>();
  const nav = useNavigate();
  const [app, setApp] = useState<any>(null);

  useEffect(() => {
    api.getApp(publicId!).then((r) => setApp(r.application)).catch(() => setApp(null));
  }, [publicId]);

  // BI_WEBSITE_BLOCK_v87_RESULT_CONFETTI_v1 — celebrate approve scores
  useEffect(() => {
    if (!app || app.score_decision !== "approve") return;
    const reduce = typeof window !== "undefined"
      && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const end = Date.now() + 1200;
    const tick = () => {
      confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 } });
      confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 } });
      if (Date.now() < end) requestAnimationFrame(tick);
    };
    tick();
  }, [app]);

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
