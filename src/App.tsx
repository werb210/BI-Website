import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

function Navbar() {
  return (
    <div className="nav">
      <h2>Boreal Insurance</h2>
      <div className="nav-links">
        <Link to="/what-is-pgi">What is PGI</Link>
        <Link to="/claims">Claims</Link>
        <Link to="/resources">Resources</Link>
        <Link to="/contact">Contact</Link>
        <Link to="/apply" className="button-primary">Apply Now</Link>
      </div>
    </div>
  );
}

function calculatePremium(data: any) {
  let baseRate = 0.02; // 2% base

  if (data.priorDefault === "Yes") baseRate += 0.01;
  if (data.legalDisputes === "Yes") baseRate += 0.01;
  if (parseInt(data.yearsOperating) < 2) baseRate += 0.005;

  const loan = parseFloat(data.loanAmount || 0);
  return Math.round(loan * baseRate);
}

function Apply() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<any>({});

  const update = (field: string, value: any) =>
    setForm({ ...form, [field]: value });

  const next = () => setStep(step + 1);
  const back = () => setStep(step - 1);

  const generateQuote = () => {
    const premium = calculatePremium(form);
    navigate("/quote-result", { state: { ...form, premium } });
  };

  return (
    <div className="container">
      <h1>PGI Application</h1>
      <p>Step {step} of 4</p>

      {step === 1 && (
        <>
          <h2>Applicant</h2>
          <input placeholder="Full Name" onChange={(e) => update("name", e.target.value)} />
          <input placeholder="Email" onChange={(e) => update("email", e.target.value)} />
          <button className="button-primary" onClick={next}>Next</button>
        </>
      )}

      {step === 2 && (
        <>
          <h2>Business</h2>
          <input placeholder="Business Name" onChange={(e) => update("businessName", e.target.value)} />
          <input placeholder="Years Operating" onChange={(e) => update("yearsOperating", e.target.value)} />
          <input placeholder="Annual Revenue (CAD)" onChange={(e) => update("revenue", e.target.value)} />
          <button onClick={back}>Back</button>
          <button className="button-primary" onClick={next}>Next</button>
        </>
      )}

      {step === 3 && (
        <>
          <h2>Loan Details</h2>
          <input placeholder="Loan Amount (CAD)" onChange={(e) => update("loanAmount", e.target.value)} />
          <input placeholder="Lender Name" onChange={(e) => update("lender", e.target.value)} />
          <button onClick={back}>Back</button>
          <button className="button-primary" onClick={next}>Next</button>
        </>
      )}

      {step === 4 && (
        <>
          <h2>Risk Questions</h2>
          <label>Prior Default?</label>
          <select onChange={(e) => update("priorDefault", e.target.value)}>
            <option>No</option>
            <option>Yes</option>
          </select>

          <label>Legal Disputes?</label>
          <select onChange={(e) => update("legalDisputes", e.target.value)}>
            <option>No</option>
            <option>Yes</option>
          </select>

          <br /><br />
          <button onClick={back}>Back</button>
          <button className="button-primary" onClick={generateQuote}>
            Generate Quote
          </button>
        </>
      )}
    </div>
  );
}

function QuoteResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location?.state as any;

  if (!data) {
    return (
      <div className="container">
        <h1>No Quote Found</h1>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Your Personal Guarantee Insurance Quote</h1>
      <div className="card">
        <h2>${data.premium.toLocaleString()} CAD</h2>
        <p>Coverage based on declared loan of ${data.loanAmount}</p>
        <p>Annual Premium</p>
      </div>

      <br />

      <button
        className="button-primary"
        onClick={() => navigate("/checkout", { state: data })}
      >
        Proceed to Payment
      </button>
    </div>
  );
}

function Checkout() {
  return (
    <div className="container">
      <h1>Secure Payment</h1>
      <p>Stripe integration placeholder.</p>
      <button className="button-primary">Pay Now</button>
    </div>
  );
}

function Placeholder({ title }: { title: string }) {
  return (
    <div className="container">
      <h1>{title}</h1>
      <p>Content coming soon.</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/apply" element={<Apply />} />
        <Route path="/quote-result" element={<QuoteResult />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/what-is-pgi" element={<Placeholder title="What is PGI" />} />
        <Route path="/claims" element={<Placeholder title="Claims" />} />
        <Route path="/resources" element={<Placeholder title="Resources" />} />
        <Route path="/contact" element={<Placeholder title="Contact" />} />
        <Route path="/" element={<Placeholder title="Home" />} />
      </Routes>
    </BrowserRouter>
  );
}
