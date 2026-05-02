// BI_WEBSITE_BLOCK_PGI_ALIGNMENT_v1
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const MAX_LOAN = 1_000_000;
const RATE = { secured: 0.016, unsecured: 0.04 };

export default function Quote() {
  const nav = useNavigate();
  const [loan, setLoan] = useState(500_000);
  const [coveragePct, setCoveragePct] = useState(0.5);
  const [type, setType] = useState<"secured" | "unsecured">("secured");

  const coverageAmount = useMemo(() => Math.round(Math.min(loan, MAX_LOAN) * coveragePct), [loan, coveragePct]);
  const annualPremium = useMemo(() => Math.round(coverageAmount * RATE[type]), [coverageAmount, type]);

  function applyNow() {
    sessionStorage.setItem("bi.quote", JSON.stringify({ loan, coveragePct, type, coverageAmount, annualPremium }));
    nav("/application");
  }

  return (
    <div className="quote-page">
      <h1>Personal Guarantee Insurance Quote</h1>
      <label>
        Loan Amount (max $1,000,000)
        <input
          type="number"
          min={1}
          max={MAX_LOAN}
          value={loan}
          onChange={(e) => setLoan(Math.min(Math.max(Number(e.target.value || 0), 0), MAX_LOAN))}
        />
      </label>
      <label>
        Coverage: {Math.round(coveragePct * 100)}% (max 80%)
        <input
          type="range"
          min={0}
          max={80}
          step={1}
          value={Math.round(coveragePct * 100)}
          onChange={(e) => setCoveragePct(Number(e.target.value) / 100)}
        />
      </label>
      <fieldset>
        <legend>Facility Type</legend>
        <label>
          <input type="radio" checked={type === "secured"} onChange={() => setType("secured")} />
          <strong>Secured</strong> — backed by tangible collateral. Lower rate (1.6%).
        </label>
        <label>
          <input type="radio" checked={type === "unsecured"} onChange={() => setType("unsecured")} />
          <strong>Unsecured</strong> — no specific collateral. Higher rate (4.0%).
        </label>
      </fieldset>
      <div className="quote-summary">
        <div>Coverage Amount: <strong>${coverageAmount.toLocaleString()}</strong></div>
        <div>Indicative Annual Premium: <strong>${annualPremium.toLocaleString()}</strong></div>
      </div>
      <button className="primary" onClick={applyNow} disabled={!loan || coveragePct <= 0}>Apply Now</button>
    </div>
  );
}
