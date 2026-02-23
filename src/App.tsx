import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
  Navigate
} from "react-router-dom";
import { useState } from "react";

/* ================= PRODUCT RULES ================= */

function calculateQuote(data: any) {
  const loan = parseFloat(data.loanAmount || 0);
  const insuredAmount = Math.min(loan * 0.8, 1400000);
  const rate = data.loanType === "Secured" ? 0.016 : 0.04;
  const annualPremium = insuredAmount * rate;
  return { insuredAmount, annualPremium, rate };
}

/* ================= NAVBAR ================= */

function Navbar() {
  return (
    <div className="nav">
      <h2>Boreal Insurance</h2>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/what-is-pgi">What is PGI</Link>
        <Link to="/claims">Claims</Link>
        <Link to="/case-studies">Case Studies</Link>
        <Link to="/contact">Contact</Link>
        <Link to="/apply" className="button-primary">Apply</Link>
        <Link to="/login">Login</Link>
      </div>
    </div>
  );
}

/* ================= FOOTER ================= */

function Footer() {
  return (
    <div style={{ marginTop: 80, padding: 40, background: "#041a35" }}>
      <p>© {new Date().getFullYear()} Boreal Insurance</p>
      <p>Personal Guarantee Insurance for Canadian Business Owners</p>
    </div>
  );
}

/* ================= HOME ================= */

function Home() {
  const [loanAmount, setLoanAmount] = useState("");
  const [loanType, setLoanType] = useState("Secured");
  const navigate = useNavigate();

  const getQuote = () => {
    const result = calculateQuote({ loanAmount, loanType });
    navigate("/quote", { state: { loanAmount, loanType, quote: result } });
  };

  return (
    <div className="container">
      <h1>Protect Your Personal Assets</h1>
      <p>
        When you sign a personal guarantee, your home, savings,
        and personal assets may be at risk.
      </p>

      <div className="card">
        <h2>Instant Premium Estimate</h2>

        <input
          placeholder="Loan Amount (CAD)"
          value={loanAmount}
          onChange={(e) => setLoanAmount(e.target.value)}
        />

        <select
          value={loanType}
          onChange={(e) => setLoanType(e.target.value)}
        >
          <option value="Secured">Secured (1.6%)</option>
          <option value="Unsecured">Unsecured (4.0%)</option>
        </select>

        <button className="button-primary" onClick={getQuote}>
          Calculate Premium
        </button>
      </div>

      <h2>Coverage Overview</h2>
      <ul>
        <li>Up to 80% of loan exposure</li>
        <li>Maximum insured amount $1,400,000 CAD</li>
        <li>Annual premium based on loan type</li>
        <li>Designed for Canadian lenders & directors</li>
      </ul>
    </div>
  );
}

/* ================= WHAT IS PGI ================= */

function WhatIsPGI() {
  return (
    <div className="container">
      <h1>What is Personal Guarantee Insurance?</h1>

      <p>
        A personal guarantee makes a director personally liable
        for business debt if the company cannot repay.
      </p>

      <h2>Why It Matters</h2>
      <p>
        If the business defaults, lenders may pursue your
        personal assets including property and savings.
      </p>

      <h2>How PGI Helps</h2>
      <p>
        Personal Guarantee Insurance reimburses a portion
        of the enforced guarantee, reducing personal exposure.
      </p>
    </div>
  );
}

/* ================= CLAIMS ================= */

function Claims() {
  return (
    <div className="container">
      <h1>Claims Process</h1>

      <ol>
        <li>Business defaults on loan.</li>
        <li>Lender enforces the personal guarantee.</li>
        <li>Required documentation submitted.</li>
        <li>Claim assessed per policy terms.</li>
        <li>Payment issued.</li>
      </ol>

      <h2>Required Documents</h2>
      <ul>
        <li>Loan agreement</li>
        <li>Signed personal guarantee</li>
        <li>Default notice</li>
        <li>Enforcement documentation</li>
      </ul>
    </div>
  );
}

/* ================= CASE STUDIES ================= */

function CaseStudies() {
  return (
    <div className="container">
      <h1>Case Studies</h1>

      <div className="card">
        <h3>Construction Company</h3>
        <p>Loan: $1,000,000 secured</p>
        <p>Insured: $800,000</p>
        <p>Premium: $12,800 annually</p>
      </div>

      <div className="card">
        <h3>Retail Startup</h3>
        <p>Loan: $400,000 unsecured</p>
        <p>Insured: $320,000</p>
        <p>Premium: $12,800 annually</p>
      </div>
    </div>
  );
}

/* ================= CONTACT ================= */

function Contact() {
  const [form, setForm] = useState<any>({});

  const update = (field: string, value: any) =>
    setForm({ ...form, [field]: value });

  const submit = async () => {
    await fetch("https://api.boreal.financial/bi/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    alert("Message sent.");
  };

  return (
    <div className="container">
      <h1>Contact Boreal Insurance</h1>

      <input placeholder="Name" onChange={(e) => update("name", e.target.value)} />
      <input placeholder="Email" onChange={(e) => update("email", e.target.value)} />
      <textarea placeholder="Message" onChange={(e) => update("message", e.target.value)} />

      <button className="button-primary" onClick={submit}>
        Send
      </button>
    </div>
  );
}

/* ================= APPLICATION ================= */

function Apply() {
  const navigate = useNavigate();
  const [form, setForm] = useState<any>({ loanType: "Secured" });

  const update = (field: string, value: any) =>
    setForm({ ...form, [field]: value });

  const submit = async () => {
    const quote = calculateQuote(form);

    await fetch("https://api.boreal.financial/bi/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, ...quote })
    });

    navigate("/quote", { state: { ...form, quote } });
  };

  return (
    <div className="container">
      <h1>PGI Application</h1>

      <input placeholder="Full Name" onChange={(e) => update("name", e.target.value)} />
      <input placeholder="Email" onChange={(e) => update("email", e.target.value)} />
      <input placeholder="Business Name" onChange={(e) => update("businessName", e.target.value)} />
      <input placeholder="Loan Amount (CAD)" onChange={(e) => update("loanAmount", e.target.value)} />

      <select onChange={(e) => update("loanType", e.target.value)}>
        <option value="Secured">Secured</option>
        <option value="Unsecured">Unsecured</option>
      </select>

      <button className="button-primary" onClick={submit}>
        Submit Application
      </button>
    </div>
  );
}

/* ================= QUOTE ================= */

function Quote() {
  const location = useLocation();
  const data: any = location.state;

  if (!data) return <Navigate to="/" />;

  return (
    <div className="container">
      <h1>Your PGI Quote</h1>

      <div className="card">
        <h2>Insured Amount</h2>
        <h3>${data.quote.insuredAmount.toLocaleString()}</h3>

        <h2>Annual Premium</h2>
        <h3>${data.quote.annualPremium.toLocaleString()}</h3>

        <p>Rate: {(data.quote.rate * 100).toFixed(2)}%</p>
      </div>
    </div>
  );
}

/* ================= LOGIN ================= */

function Login() {
  return (
    <div className="container">
      <h1>Login</h1>
      <p>Lender and Referrer authentication handled via BI-server.</p>
    </div>
  );
}

/* ================= APP ================= */

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/what-is-pgi" element={<WhatIsPGI />} />
        <Route path="/claims" element={<Claims />} />
        <Route path="/case-studies" element={<CaseStudies />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/apply" element={<Apply />} />
        <Route path="/quote" element={<Quote />} />
        <Route path="/login" element={<Login />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
