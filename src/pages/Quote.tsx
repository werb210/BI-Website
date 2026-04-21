import { Link } from "react-router-dom";
import { useMemo, useState } from "react";

export default function Quote() {
  const [amount, setAmount] = useState(500000);
  const [coverage, setCoverage] = useState(80);
  const [type, setType] = useState("secured");

  const insuredAmount = useMemo(() => amount * (coverage / 100), [amount, coverage]);

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

        <label className="mb-1 block">Coverage %: {coverage}%</label>
        <input
          type="range"
          min={0}
          max={80}
          step={1}
          value={coverage}
          onChange={(e) => setCoverage(Math.min(80, Number(e.target.value)))}
          className="mb-4 w-full"
        />

        <label className="mb-1 block">Loan Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="mb-4 w-full rounded p-2 text-black"
        >
          <option value="secured">Secured</option>
          <option value="unsecured">Unsecured</option>
        </select>

        <div className="mt-4 space-y-2">
          <p>Loan Type: {type === "secured" ? "Secured" : "Unsecured"}</p>
          <p>Insured Amount: ${insuredAmount.toLocaleString()}</p>
        </div>

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
