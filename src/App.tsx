import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

function Navbar() {
  return (
    <div className="nav">
      <h2>Boreal Insurance</h2>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/what-is-pgi">What is PGI</Link>
        <Link to="/claims">Claims</Link>
        <Link to="/resources">Resources</Link>
        <Link to="/contact">Contact</Link>
        <Link to="/apply" className="button-primary">Apply Now</Link>
      </div>
    </div>
  );
}

/* ---------- UNDERWRITING LOGIC ---------- */

function calculatePremium(data: any) {
  let baseRate = 0.02;

  if (data.priorDefault === "Yes") baseRate += 0.01;
  if (data.legalDisputes === "Yes") baseRate += 0.01;
  if (parseInt(data.yearsOperating) < 2) baseRate += 0.005;

  const loan = parseFloat(data.loanAmount || 0);
  const premium = loan * baseRate;

  return {
    premium: Math.max(premium, 1500), // minimum premium
    rate: baseRate
  };
}

function underwritingSummary(data: any, premium: number, rate: number) {
  return `
UNDERWRITING SUMMARY
---------------------
Applicant: ${data.name}
Business: ${data.businessName}
Province: ${data.province}

Loan Amount: $${data.loanAmount}
Lender: ${data.lender}
Years Operating: ${data.yearsOperating}

Risk Indicators:
- Prior Default: ${data.priorDefault}
- Legal Disputes: ${data.legalDisputes}

Calculated Rate: ${(rate * 100).toFixed(2)}%
Annual Premium: $${premium.toLocaleString()} CAD

Recommendation: ${
    rate <= 0.025 ? "Standard Acceptance"
      : rate <= 0.035 ? "Refer to Underwriting"
      : "High Risk – Manual Review Required"
  }
`;
}

/* ---------- APPLICATION FLOW ---------- */

function Apply() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<any>({});

  const update = (field: string, value: any) =>
    setForm({ ...form, [field]: value });

  const next = () => setStep(step + 1);
  const back = () => setStep(step - 1);

  const generate = () => {
    const result = calculatePremium(form);
    navigate("/quote", { state: { ...form, ...result } });
  };

  return (
    <div className="container">
      <h1>Personal Guarantee Insurance Application</h1>
      <p>Step {step} of 4</p>

      {step === 1 && (
        <>
          <h2>Applicant</h2>
          <input placeholder="Full Name" onChange={(e) => update("name", e.target.value)} />
          <input placeholder="Email" onChange={(e) => update("email", e.target.value)} />
          <input placeholder="Phone" onChange={(e) => update("phone", e.target.value)} />
          <input placeholder="Province" onChange={(e) => update("province", e.target.value)} />
          <button className="button-primary" onClick={next}>Next</button>
        </>
      )}

      {step === 2 && (
        <>
          <h2>Business</h2>
          <input placeholder="Business Name" onChange={(e) => update("businessName", e.target.value)} />
          <input placeholder="Industry" onChange={(e) => update("industry", e.target.value)} />
          <input placeholder="Years Operating" onChange={(e) => update("yearsOperating", e.target.value)} />
          <input placeholder="Annual Revenue (CAD)" onChange={(e) => update("revenue", e.target.value)} />
          <button onClick={back}>Back</button>
          <button className="button-primary" onClick={next}>Next</button>
        </>
      )}

      {step === 3 && (
        <>
          <h2>Loan</h2>
          <input placeholder="Loan Amount (CAD)" onChange={(e) => update("loanAmount", e.target.value)} />
          <input placeholder="Lender Name" onChange={(e) => update("lender", e.target.value)} />
          <button onClick={back}>Back</button>
          <button className="button-primary" onClick={next}>Next</button>
        </>
      )}

      {step === 4 && (
        <>
          <h2>Risk Questions</h2>

          <label>Has the business ever defaulted?</label>
          <select onChange={(e) => update("priorDefault", e.target.value)}>
            <option>No</option>
            <option>Yes</option>
          </select>

          <label>Are there active legal disputes?</label>
          <select onChange={(e) => update("legalDisputes", e.target.value)}>
            <option>No</option>
            <option>Yes</option>
          </select>

          <br /><br />
          <button onClick={back}>Back</button>
          <button className="button-primary" onClick={generate}>
            Generate Quote
          </button>
        </>
      )}
    </div>
  );
}

/* ---------- QUOTE PAGE ---------- */

function Quote() {
  const location = useLocation();
  const navigate = useNavigate();
  const data: any = location.state;

  if (!data) {
    return (
      <div className="container">
        <h1>No Quote Data</h1>
      </div>
    );
  }

  const summary = underwritingSummary(data, data.premium, data.rate);

  const downloadSummary = () => {
    const blob = new Blob([summary], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Boreal_PGI_Underwriting_Summary.txt";
    a.click();
  };

  return (
    <div className="container">
      <h1>Your PGI Quote</h1>

      <div className="card">
        <h2>${data.premium.toLocaleString()} CAD</h2>
        <p>Rate: {(data.rate * 100).toFixed(2)}%</p>
        <p>Loan Amount: ${data.loanAmount}</p>
      </div>

      <br />

      <h3>Underwriting Summary</h3>
      <pre style={{ background: "#102a52", padding: 20 }}>
        {summary}
      </pre>

      <button className="button-primary" onClick={downloadSummary}>
        Download Submission Summary
      </button>

      <br /><br />

      <button onClick={() => navigate("/")}>
        Return Home
      </button>
    </div>
  );
}

/* ---------- PLACEHOLDER PAGES ---------- */

function Placeholder({ title }: { title: string }) {
  return (
    <div className="container">
      <h1>{title}</h1>
      <p>Content to be completed.</p>
    </div>
  );
}

/* ---------- APP ---------- */

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Placeholder title="Home" />} />
        <Route path="/apply" element={<Apply />} />
        <Route path="/quote" element={<Quote />} />
        <Route path="/what-is-pgi" element={<Placeholder title="What is Personal Guarantee Insurance" />} />
        <Route path="/claims" element={<Placeholder title="Claims Process" />} />
        <Route path="/resources" element={<Placeholder title="Resources & Case Studies" />} />
        <Route path="/contact" element={<Placeholder title="Contact Boreal Insurance" />} />
      </Routes>
    </BrowserRouter>
  );
}
