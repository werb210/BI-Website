import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config";
import { safeRequest } from "../api/request";

export default function Quote() {
  const nav = useNavigate();
  const [amount, setAmount] = useState(250000);
  const [term, setTerm] = useState(60);

  async function handleQuote() {
    const data = await safeRequest(
      axios.post(`${API_BASE}/quote`, {
        guaranteeAmount: amount,
        termMonths: term
      })
    );

    localStorage.setItem("biLeadId", data.leadId);
    localStorage.setItem("biQuote", JSON.stringify(data));

    nav("/apply");
  }

  return (
    <div className="container">
      <h1>Instant Insurance Quote</h1>

      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
      />

      <input
        type="number"
        value={term}
        onChange={(e) => setTerm(Number(e.target.value))}
      />

      <button onClick={handleQuote}>
        Get Quote
      </button>
    </div>
  );
}
