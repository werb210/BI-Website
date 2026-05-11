// BI_WEBSITE_BLOCK_v121_BRAND_RATE_AND_LEASE_v1 — secured-only, rate 2.75%, loan-type select removed.
import { useState } from "react";
import Card from "./ui/Card";

const RATE = 0.0275;

export default function PremiumCalculator() {
  const [amount, setAmount] = useState(500000);
  const premium = amount * RATE;

  return (
    <Card className="mt-10">
      <h3 className="text-xl font-semibold mb-4">Premium Estimate</h3>

      <label className="block text-sm text-white/80 mb-2">Loan Amount</label>
      <input
        type="number"
        className="w-full p-2 rounded-md bg-brand-bgAlt border border-card"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
      />

      <p className="mt-2 text-xs text-white/60">Indicative rate {(RATE * 100).toFixed(2)}%.</p>

      <div className="mt-6 font-semibold text-lg">
        Estimated Annual Premium: ${premium.toLocaleString()}
      </div>
    </Card>
  );
}
