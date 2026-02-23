import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation
} from "react-router-dom";
import { useState, useEffect } from "react";

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
        <Link to="/apply" className="button-primary">Apply</Link>
        <Link to="/lender-login">Lender Login</Link>
        <Link to="/referrer-login">Referrer Login</Link>
      </div>
    </div>
  );
}

/* ================= HOMEPAGE ================= */

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
      <h1>Personal Guarantee Insurance</h1>
      <p>
        Protect up to 80% of your personal exposure when signing business loans.
        Designed for Canadian business owners.
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
          Calculate
        </button>
      </div>

      <h2>Why Boreal</h2>
      <ul>
        <li>Coverage up to $1,400,000 CAD</li>
        <li>80% maximum exposure protection</li>
        <li>Structured underwriting process</li>
        <li>Built for Canadian lenders & directors</li>
      </ul>
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
        Submit
      </button>
    </div>
  );
}

/* ================= QUOTE ================= */

function Quote() {
  const location = useLocation();
  const data: any = location.state;

  if (!data) return <div className="container"><h1>No Quote</h1></div>;

  return (
    <div className="container">
      <h1>Your Quote</h1>

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

/* ================= AUTH PLACEHOLDER ================= */

function Login({ type }: { type: string }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const login = () => {
    localStorage.setItem("biRole", type);
    navigate(`/${type}-dashboard`);
  };

  return (
    <div className="container">
      <h1>{type === "lender" ? "Lender Login" : "Referrer Login"}</h1>
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button className="button-primary" onClick={login}>
        Login
      </button>
    </div>
  );
}

/* ================= DASHBOARDS ================= */

function LenderDashboard() {
  const [apps, setApps] = useState<any[]>([]);

  useEffect(() => {
    fetch("https://api.boreal.financial/bi/applications")
      .then((r) => r.json())
      .then(setApps);
  }, []);

  return (
    <div className="container">
      <h1>Lender Dashboard</h1>
      {apps.map((a, i) => (
        <div key={i} className="card">
          <p>{a.businessName}</p>
          <p>Status: {a.status || "Pending"}</p>
        </div>
      ))}
    </div>
  );
}

function ReferrerDashboard() {
  const [commission, setCommission] = useState(0);

  useEffect(() => {
    fetch("https://api.boreal.financial/bi/commission")
      .then((r) => r.json())
      .then((data) => setCommission(data.total || 0));
  }, []);

  return (
    <div className="container">
      <h1>Referrer Dashboard</h1>
      <div className="card">
        <h2>Total Commission Earned</h2>
        <h3>${commission.toLocaleString()}</h3>
      </div>
    </div>
  );
}

/* ================= SIMPLE CONTENT ================= */

function SimplePage({ title }: { title: string }) {
  return (
    <div className="container">
      <h1>{title}</h1>
      <p>Professional content to be expanded.</p>
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
        <Route path="/lender-login" element={<Login type="lender" />} />
        <Route path="/referrer-login" element={<Login type="referrer" />} />
        <Route path="/lender-dashboard" element={<LenderDashboard />} />
        <Route path="/referrer-dashboard" element={<ReferrerDashboard />} />
        <Route path="/what-is-pgi" element={<SimplePage title="What is Personal Guarantee Insurance" />} />
        <Route path="/claims" element={<SimplePage title="Claims Process" />} />
        <Route path="/case-studies" element={<SimplePage title="Case Studies" />} />
        <Route path="/contact" element={<SimplePage title="Contact Boreal Insurance" />} />
      </Routes>
    </BrowserRouter>
  );
}
