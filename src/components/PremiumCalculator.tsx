import { useState } from "react";

export default function PremiumCalculator(){

  const [amount,setAmount]=useState(500000);
  const [type,setType]=useState("secured");

  const rate = type==="secured" ? 0.016 : 0.04;
  const premium = amount * rate;

  return (
    <div className="calculator">
      <h3>Premium Estimate</h3>

      <label>Loan Amount</label>
      <input
        type="number"
        value={amount}
        onChange={e=>setAmount(Number(e.target.value))}
      />

      <label>Loan Type</label>
      <select
        value={type}
        onChange={e=>setType(e.target.value)}
      >
        <option value="secured">Secured (1.6%)</option>
        <option value="unsecured">Unsecured (4.0%)</option>
      </select>

      <div className="calculator-result">
        Estimated Annual Premium: ${premium.toLocaleString()}
      </div>
    </div>
  )
}
