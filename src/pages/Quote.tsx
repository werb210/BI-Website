import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Quote() {
  const nav = useNavigate();
  const [amount, setAmount] = useState(250000);
  const [term, setTerm] = useState(60);

  async function handleQuote() {
    const res = await axios.post("https://api.boreal.financial/bi/quote", {
      guaranteeAmount: amount,
      termMonths: term
    });

    localStorage.setItem("biLeadId", res.data.leadId);
    localStorage.setItem("biQuote", JSON.stringify(res.data));

    nav("/apply");
  }

  return (
    <div className="container">
      <h1>Instant Quote</h1>

      <label>Guarantee Amount</label>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
      />

      <label>Term (Months)</label>
      <input
        type="number"
        value={term}
        onChange={(e) => setTerm(Number(e.target.value))}
      />

      <button onClick={handleQuote}>Continue to Application</button>
    </div>
  );
}
