import { useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config";
import { safeRequest } from "../api/request";
import { track } from "../utils/analytics";

export default function Quote() {
  const nav = useNavigate();
  const [amount, setAmount] = useState(250000);
  const [term, setTerm] = useState(60);
  const lastSubmitRef = useRef(0);

  async function handleQuote() {
    if (Date.now() - lastSubmitRef.current < 5000) {
      return;
    }

    lastSubmitRef.current = Date.now();

    const data = await safeRequest(
      axios.post(`${API_BASE}/quote`, {
        guaranteeAmount: amount,
        termMonths: term
      })
    );

    const quoteCreatedAt = Date.now();
    localStorage.setItem("biLeadId", data.leadId);
    localStorage.setItem("biQuote", JSON.stringify(data));
    localStorage.setItem("biQuoteCreatedAt", String(quoteCreatedAt));

    track("quote_generated", {
      guaranteeAmount: amount,
      termMonths: term
    });

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
