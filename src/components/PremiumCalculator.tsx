// BI_WEBSITE_BLOCK_v121_BRAND_RATE_AND_LEASE_v1 — secured-only, loan-type select removed.
// BI_WEBSITE_QUOTE_MONTHLY_2_6_v2 - rate 2.6%, MONTHLY figure only.
// Monthly is the annual premium divided by 12; the annual number is deliberately
// not shown. The carrier underwrites and can come in lower, so every surface
// states plainly that this is a non-binding estimate, not a quote.
import { useState } from "react";
import Card from "./ui/Card";

const RATE = 0.026;
const MONTHS_PER_YEAR = 12;

export default function PremiumCalculator() {
  const [amount, setAmount] = useState(500000);
  const premium = amount * RATE;
  const monthly = premium / MONTHS_PER_YEAR;

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

      <p className="mt-2 text-xs text-white/60">Estimate based on {(RATE * 100).toFixed(2)}% per year.</p>

      <div className="mt-6 font-semibold text-lg">
        Estimated Monthly Premium: {monthly.toLocaleString("en-CA", { style: "currency", currency: "CAD", minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      <p className="mt-2 text-xs text-white/60">
        This is an estimate only and is not a binding quote. The final premium is set by
        the carrier after underwriting and may be lower.
      </p>
    </Card>
  );
}
