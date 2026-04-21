import { useState } from "react";

export default function Quote() {
  const [amount, setAmount] = useState(500000);
  const [coverage, setCoverage] = useState(80);
  const [type, setType] = useState("secured");

  const insuredAmount = Math.min((amount * coverage) / 100, amount * 0.8);
  const rate = type === "secured" ? 0.016 : 0.04;
  const premium = insuredAmount * rate;

  return (
    <div className="text-white">
      <h1 className="mb-6 text-2xl">Quote Tool</h1>

      <div className="max-w-xl rounded bg-[#112A4D] p-6">
        <label className="mb-1 block">Loan Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="mb-4 w-full rounded p-2 text-black"
        />

        <label className="mb-1 block">Coverage % (max 80)</label>
        <input
          type="number"
          value={coverage}
          onChange={(e) => setCoverage(Math.min(80, Number(e.target.value)))}
          className="mb-4 w-full rounded p-2 text-black"
        />

        <label className="mb-1 block">Loan Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="mb-4 w-full rounded p-2 text-black"
        >
          <option value="secured">Secured (1.6%)</option>
          <option value="unsecured">Unsecured (4.0%)</option>
        </select>

        <div className="mt-4">
          <p>Insured Amount: ${insuredAmount.toLocaleString()}</p>
          <p className="mt-2 text-lg font-bold">Estimated Premium: ${premium.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
