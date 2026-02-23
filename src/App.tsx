import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

/* ================= NAVBAR ================= */

function Navbar() {
  return (
    <div className="nav">
      <h2>Boreal Insurance</h2>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/apply" className="button-primary">Apply Now</Link>
      </div>
    </div>
  );
}

/* ================= PRODUCT RULES ================= */

function calculateQuote(data: any) {
  const loan = parseFloat(data.loanAmount || 0);

  const coverageCap = 1400000;
  const maxCoverageByLoan = loan * 0.8;

  const insuredAmount = Math.min(maxCoverageByLoan, coverageCap);

  const rate = data.loanType === "Secured" ? 0.016 : 0.04;

  const annualPremium = insuredAmount * rate;

  return {
    insuredAmount,
    annualPremium,
    rate
  };
}

function underwritingSummary(data: any, quote: any) {
  return `
BOREAL INSURANCE – PGI SUMMARY
---------------------------------------

Applicant: ${data.name}
Business: ${data.businessName}
Province: ${data.province}

Loan Amount: $${Number(data.loanAmount).toLocaleString()} CAD
Loan Type: ${data.loanType}

Maximum Coverage (80% rule): $${(Number(data.loanAmount) * 0.8).toLocaleString()} CAD
Coverage Cap: $1,400,000 CAD

Approved Insured Amount: $${quote.insuredAmount.toLocaleString()} CAD

Rate Applied: ${(quote.rate * 100).toFixed(2)}%
Annual Premium: $${quote.annualPremium.toLocaleString()} CAD

Terms:
• Coverage limited to 80% of loan amount
• Maximum insured amount $1,400,000 CAD
• Premium payable annually
`;
}

/* ================= APPLICATION FLOW ================= */

function Apply() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<any>({ loanType: "Secured" });

  const update = (field: string, value: any) =>
    setForm({ ...form, [field]: value });

  const next = () => setStep(step + 1);
  const back = () => setStep(step - 1);

  const generate = () => {
    const quote = calculateQuote(form);
    navigate("/quote", { state: { ...form, quote } });
  };

  return (
    <div className="container">
      <h1>Personal Guarantee Insurance Application</h1>
      <p>Step {step} of 3</p>

      {step === 1 && (
        <>
          <h2>Applicant Details</h2>
          <input placeholder="Full Name" onChange={(e) => update("name", e.target.value)} />
          <input placeholder="Email" onChange={(e) => update("email", e.target.value)} />
          <input placeholder="Province" onChange={(e) => update("province", e.target.value)} />
          <button className="button-primary" onClick={next}>Next</button>
        </>
      )}

      {step === 2 && (
        <>
          <h2>Business Details</h2>
          <input placeholder="Business Name" onChange={(e) => update("businessName", e.target.value)} />
          <input placeholder="Loan Amount (CAD)" onChange={(e) => update("loanAmount", e.target.value)} />

          <label>Loan Type</label>
          <select onChange={(e) => update("loanType", e.target.value)}>
            <option value="Secured">Secured (1.6%)</option>
            <option value="Unsecured">Unsecured (4.0%)</option>
          </select>

          <br /><br />
          <button onClick={back}>Back</button>
          <button className="button-primary" onClick={generate}>Generate Quote</button>
        </>
      )}
    </div>
  );
}

/* ================= QUOTE PAGE ================= */

function Quote() {
  const location = useLocation();
  const navigate = useNavigate();
  const data: any = location.state;

  if (!data) {
    return <div className="container"><h1>No Quote Data</h1></div>;
  }

  const summary = underwritingSummary(data, data.quote);

  const downloadSummary = () => {
    const blob = new Blob([summary], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Boreal_PGI_Summary.txt";
    a.click();
  };

  return (
    <div className="container">
      <h1>Your PGI Quote</h1>

      <div className="card">
        <h2>Insured Amount</h2>
        <h3>${data.quote.insuredAmount.toLocaleString()} CAD</h3>

        <h2>Annual Premium</h2>
        <h3>${data.quote.annualPremium.toLocaleString()} CAD</h3>

        <p>Rate: {(data.quote.rate * 100).toFixed(2)}%</p>
      </div>

      <br />

      <pre style={{ background: "#102a52", padding: 20 }}>
        {summary}
      </pre>

      <button className="button-primary" onClick={downloadSummary}>
        Download Summary
      </button>

      <br /><br />

      <button onClick={() => navigate("/")}>
        Return Home
      </button>
    </div>
  );
}

/* ================= APP ================= */

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Apply />} />
        <Route path="/apply" element={<Apply />} />
        <Route path="/quote" element={<Quote />} />
      </Routes>
    </BrowserRouter>
  );
}
