import { Link } from "react-router-dom";
import { useState } from "react";
import BIAuthGate from "../components/BIAuthGate";
import { ApiError } from "../api/request";
import { apiPost } from "../lib/api";
import { AuthUser, getAuthUser } from "../lib/auth";

export default function Quote() {
  const [amount, setAmount] = useState(500000);
  const [type, setType] = useState<"secured" | "unsecured">("secured");
  const [user, setUser] = useState<AuthUser | null>(getAuthUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<{ annualPremium: number; monthlyPremium: number } | null>(null);

  async function getEstimate() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiPost<{ annualPremium: number; monthlyPremium: number }>(
        "/api/v1/bi/quote/estimate",
        { facilityType: type, loanAmount: amount }
      );
      setEstimate({ annualPremium: res.annualPremium, monthlyPremium: res.monthlyPremium });
    } catch (e) {
      setEstimate(null);
      setError(e instanceof ApiError ? e.message : "Failed to fetch quote estimate");
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#07182E] px-6 py-10 text-white">
        <BIAuthGate userType="applicant" onVerified={setUser} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07182E] px-6 py-10 text-white">
      <div className="mx-auto max-w-xl rounded-xl border border-white/10 bg-[#112A4D] p-6">
        <h1 className="mb-6 text-2xl">Quote Tool</h1>

        <label className="mb-1 block">Loan Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value) || 0)}
          className="mb-4 w-full rounded p-2 text-black"
        />

        <label className="mb-1 block">Facility Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as "secured" | "unsecured")}
          className="mb-4 w-full rounded p-2 text-black"
        >
          <option value="secured">Secured</option>
          <option value="unsecured">Unsecured</option>
        </select>

        <div className="mt-4 space-y-2">
          <p>Loan Type: {type === "secured" ? "Secured" : "Unsecured"}</p>
          <p className="text-white/80">Indicative quote calculations are generated server-side.</p>
          {estimate && (
            <>
              <p>Annual Premium: ${estimate.annualPremium.toLocaleString()}</p>
              <p>Monthly Premium: ${estimate.monthlyPremium.toLocaleString()}</p>
            </>
          )}
          {error && <p className="text-red-300">{error}</p>}
        </div>

        <button
          type="button"
          onClick={getEstimate}
          disabled={loading || amount <= 0}
          className="mt-4 inline-flex w-full justify-center rounded bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-900"
        >
          {loading ? "Getting estimate..." : "Get Estimate"}
        </button>

        <Link
          to="/application"
          className="mt-6 inline-flex w-full justify-center rounded bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700"
        >
          Apply Now
        </Link>
      </div>
    </main>
  );
}
