// BI_QUOTE_PUBLIC_v44 — V1 BI-1.
// Public page with no auth gate. Coverage slider 0..0.8 (default 0.8).
// $1M loan cap applied at the input level. Sends `coverage` to the server.
// Server math returns insuredAmount + annualPremium + monthlyPremium.
import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { ApiError } from "../api/request";
import { apiPost } from "../lib/api";

const MAX_LOAN_AMOUNT = 1_000_000;
const MAX_COVERAGE_RATIO = 0.8;

interface EstimateResponse {
  rate: number;
  facilityType: "secured" | "unsecured";
  loanAmount: number;
  coverageRatio: number;
  insuredAmount: number;
  annualPremium: number;
  monthlyPremium: number;
  capped: boolean;
  maxLoanAmount: number;
  maxCoverageRatio: number;
}

function clampLoan(n: number): number {
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(n, MAX_LOAN_AMOUNT);
}

export default function Quote() {
  const nav = useNavigate();
  const [amount, setAmount] = useState(500_000);
  const [type, setType] = useState<"secured" | "unsecured">("secured");
  const [coverage, setCoverage] = useState(MAX_COVERAGE_RATIO); // ratio 0..0.8
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<EstimateResponse | null>(null);

  const cappedNote = useMemo(() => {
    if (amount > MAX_LOAN_AMOUNT) {
      return `Loans above $${MAX_LOAN_AMOUNT.toLocaleString()} are capped at the maximum.`;
    }
    return null;
  }, [amount]);

  async function getEstimate() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiPost<EstimateResponse>("/api/v1/bi/quote/estimate", {
        facilityType: type,
        loanAmount: clampLoan(amount),
        coverage,
      });
      setEstimate(res);
      try { sessionStorage.setItem("quote", JSON.stringify(res)); } catch { /* ignore */ }
    } catch (e) {
      setEstimate(null);
      setError(e instanceof ApiError ? e.message : "Failed to fetch quote estimate");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#07182E] px-6 py-10 text-white">
      <div className="mx-auto max-w-xl rounded-xl border border-white/10 bg-[#112A4D] p-6">
        <h1 className="mb-2 text-2xl font-semibold">Personal Guarantee Insurance Quote</h1>
        <p className="mb-6 text-white/70">No login required. Estimates are indicative; final pricing is set on application.</p>

        <label className="mb-1 block">Loan amount</label>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={MAX_LOAN_AMOUNT}
          step={1000}
          value={amount}
          onChange={(e) => setAmount(clampLoan(Number(e.target.value) || 0))}
          className="mb-1 w-full rounded p-2 text-black"
          aria-describedby="loan-cap-note"
          data-testid="loan-amount-input"
        />
        <p id="loan-cap-note" className="mb-4 text-xs text-white/60">
          Maximum: ${MAX_LOAN_AMOUNT.toLocaleString()}.
          {cappedNote ? <span className="ml-1 text-amber-300">{cappedNote}</span> : null}
        </p>

        <label className="mb-1 block">Facility type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as "secured" | "unsecured")}
          className="mb-4 w-full rounded p-2 text-black"
          data-testid="facility-type-select"
        >
          <option value="secured">Secured</option>
          <option value="unsecured">Unsecured</option>
        </select>

        <label htmlFor="coverage-slider" className="mb-1 block">
          Coverage: <span className="font-mono">{Math.round(coverage * 100)}%</span> of loan
        </label>
        <input
          id="coverage-slider"
          type="range"
          min={0}
          max={MAX_COVERAGE_RATIO}
          step={0.01}
          value={coverage}
          onChange={(e) => setCoverage(Number(e.target.value))}
          className="mb-4 w-full"
          data-testid="coverage-slider"
        />
        <p className="mb-4 text-xs text-white/60">Maximum {Math.round(MAX_COVERAGE_RATIO * 100)}% per the policy.</p>

        {estimate && (
          <div className="mb-4 rounded bg-white/5 p-4 text-sm">
            <p>Insured amount: <strong>${estimate.insuredAmount.toLocaleString()}</strong></p>
            <p>Annual premium: <strong>${estimate.annualPremium.toLocaleString()}</strong></p>
            <p>Monthly premium: <strong>${estimate.monthlyPremium.toLocaleString()}</strong></p>
            {estimate.capped && (
              <p className="mt-2 text-amber-300">Capped at maximum loan amount of ${estimate.maxLoanAmount.toLocaleString()}.</p>
            )}
          </div>
        )}
        {error && <p className="mb-4 text-red-300">{error}</p>}

        <button
          type="button"
          onClick={getEstimate}
          disabled={loading || amount <= 0}
          className="mb-3 inline-flex w-full justify-center rounded bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-900"
          data-testid="get-estimate-btn"
        >
          {loading ? "Calculating..." : "Get estimate"}
        </button>

        <div className="grid grid-cols-2 gap-2">
          <Link
            to="/quote/result"
            className="inline-flex justify-center rounded bg-white/10 py-3 font-semibold text-white hover:bg-white/20"
          >
            Quote details
          </Link>
          <button
            type="button"
            onClick={() => nav("/application")}
            className="inline-flex justify-center rounded bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700"
          >
            Apply now
          </button>
        </div>
      </div>
    </main>
  );
}
