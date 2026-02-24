import { useState } from "react";

export default function PremiumCalculator(){

  const [amount,setAmount]=useState(500000);
  const [type,setType]=useState("secured");

  const rate = type==="secured" ? 0.016 : 0.04;
  const premium = amount * rate;

  return (
    <div className="bg-brand-surface border border-card rounded-xl p-6 mt-10">
      <h3 className="text-xl font-semibold mb-4">
        Premium Estimate
      </h3>

      <label className="block text-sm text-white/80 mb-2">
        Loan Amount
      </label>
      <input
        type="number"
        className="w-full p-2 rounded-md bg-brand-bgAlt border border-card"
        value={amount}
        onChange={e=>setAmount(Number(e.target.value))}
      />

      <label className="block text-sm text-white/80 mt-4 mb-2">
        Loan Type
      </label>
      <select
        className="w-full p-2 rounded-md bg-brand-bgAlt border border-card"
        value={type}
        onChange={e=>setType(e.target.value)}
      >
        <option value="secured">Secured (1.6%)</option>
        <option value="unsecured">Unsecured (4.0%)</option>
      </select>

      <div className="mt-6 font-semibold text-lg">
        Estimated Annual Premium: ${premium.toLocaleString()}
      </div>
    </div>
  )
}
