import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation
} from "react-router-dom";
import { useState } from "react";

/* ================= PRODUCT RULES ================= */

function calculateQuote(data: any) {
  const loan = parseFloat(data.loanAmount || 0);

  const coverageCap = 1400000;
  const maxCoverageByLoan = loan * 0.8;
  const insuredAmount = Math.min(maxCoverageByLoan, coverageCap);

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
        <Link to="/apply" className="button-primary">Apply Now</Link>
      </div>
    </div>
  );
}

/* ================= HOMEPAGE ================= */

function Home() {
  const [loanAmount, setLoanAmount] = useState("");
  const [loanType, setLoanType] = useState("Secured");
  const navigate = useNavigate();

  const getQuickQuote = () => {
    const result = calculateQuote({ loanAmount, loanType });
    navigate("/quote", {
      state: {
        loanAmount,
        loanType,
        quote: result
      }
    });
  };

  return (
    <div className="container">
      <h1>Protect Your Personal Assets</h1>
      <p>
        Personal Guarantee Insurance protects Canadian business owners
        from personal liability when signing business loans.
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

        <br /><br />

        <button className="button-primary" onClick={getQuickQuote}>
          Calculate Premium
        </button>
      </div>

      <br />

      <h2>Coverage Rules</h2>
      <ul>
        <li>Up to 80% of the loan amount</li>
        <li>Maximum insured amount $1,400,000 CAD</li>
        <li>Secured loans: 1.6% annually</li>
        <li>Unsecured loans: 4.0% annually</li>
      </ul>
    </div>
  );
}

/* ================= FULL APPLICATION ================= */

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
      <h1>Personal Guarantee Insurance Application</h1>

      <input placeholder="Full Name" onChange={(e) => update("name", e.target.value)} />
      <input placeholder="Email" onChange={(e) => update("email", e.target.value)} />
      <input placeholder="Business Name" onChange={(e) => update("businessName", e.target.value)} />
      <input placeholder="Loan Amount (CAD)" onChange={(e) => update("loanAmount", e.target.value)} />

      <select onChange={(e) => update("loanType", e.target.value)}>
        <option value="Secured">Secured</option>
        <option value="Unsecured">Unsecured</option>
      </select>

      <br /><br />

      <button className="button-primary" onClick={submit}>
        Submit Application
      </button>
    </div>
  );
}

/* ================= QUOTE PAGE ================= */

function Quote() {
  const location = useLocation();
  const data: any = location.state;

  if (!data) {
    return <div className="container"><h1>No Quote Found</h1></div>;
  }

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
    </div>
  );
}

/* ================= LENDER SUBMISSION ================= */

function LenderSubmission() {
  return (
    <div className="container">
      <h1>Lender Submission Portal</h1>
      <p>
        Submit applications on behalf of your clients.
        Structured underwriting and secure submission.
      </p>
      <Link to="/apply" className="button-primary">
        Submit New Application
      </Link>
    </div>
  );
}

/* ================= REFERRER SUBMISSION ================= */

function ReferrerSubmission() {
  return (
    <div className="container">
      <h1>Referral Partner Portal</h1>
      <p>
        Submit client referrals. Earn recurring commission
        on approved policies.
      </p>
      <Link to="/apply" className="button-primary">
        Submit Referral
      </Link>
    </div>
  );
}

/* ================= SIMPLE CONTENT PAGES ================= */

function SimplePage({ title }: { title: string }) {
  return (
    <div className="container">
      <h1>{title}</h1>
      <p>Content to be expanded with full marketing copy.</p>
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
        <Route path="/apply" element={<Apply />} />
        <Route path="/quote" element={<Quote />} />
        <Route path="/lender" element={<LenderSubmission />} />
        <Route path="/referrer" element={<ReferrerSubmission />} />
        <Route path="/what-is-pgi" element={<SimplePage title="What is Personal Guarantee Insurance" />} />
        <Route path="/claims" element={<SimplePage title="Claims Process" />} />
        <Route path="/case-studies" element={<SimplePage title="Case Studies" />} />
        <Route path="/contact" element={<SimplePage title="Contact Boreal Insurance" />} />
      </Routes>
    </BrowserRouter>
  );
}
