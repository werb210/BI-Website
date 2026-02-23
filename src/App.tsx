import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
  Navigate
} from "react-router-dom";
import { useState, useEffect } from "react";

/* ================= PRODUCT RULES ================= */

function calculateQuote(data: any) {
  const loan = parseFloat(data.loanAmount || 0);

  const coverageCap = 1400000;
  const insuredAmount = Math.min(loan * 0.8, coverageCap);

  const rate = data.loanType === "Secured" ? 0.016 : 0.04;
  const annualPremium = insuredAmount * rate;

  return { insuredAmount, annualPremium, rate };
}

/* ================= AUTH UTIL ================= */

function getToken() {
  return localStorage.getItem("bi_token");
}

function getRole() {
  return localStorage.getItem("bi_role");
}

function logout(navigate: any) {
  localStorage.removeItem("bi_token");
  localStorage.removeItem("bi_role");
  navigate("/");
}

/* ================= PROTECTED ROUTE ================= */

function ProtectedRoute({ children, role }: any) {
  const token = getToken();
  const userRole = getRole();

  if (!token) return <Navigate to="/login" />;

  if (role && role !== userRole) return <Navigate to="/" />;

  return children;
}

/* ================= NAVBAR ================= */

function Navbar() {
  const navigate = useNavigate();
  const role = getRole();

  return (
    <div className="nav">
      <h2>Boreal Insurance</h2>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/apply">Apply</Link>

        {!role && (
          <Link to="/login" className="button-primary">
            Login
          </Link>
        )}

        {role === "lender" && <Link to="/lender-dashboard">Dashboard</Link>}

        {role === "referrer" && <Link to="/referrer-dashboard">Dashboard</Link>}

        {role && (
          <button
            style={{ marginLeft: 20 }}
            className="button-primary"
            onClick={() => logout(navigate)}
          >
            Logout
          </button>
        )}
      </div>
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
      <h1>Personal Guarantee Insurance</h1>
      <p>Protect up to 80% of your personal exposure.</p>

      <div className="card">
        <input
          placeholder="Loan Amount (CAD)"
          value={loanAmount}
          onChange={(e) => setLoanAmount(e.target.value)}
        />

        <select value={loanType} onChange={(e) => setLoanType(e.target.value)}>
          <option value="Secured">Secured (1.6%)</option>
          <option value="Unsecured">Unsecured (4.0%)</option>
        </select>

        <button className="button-primary" onClick={getQuote}>
          Calculate
        </button>
      </div>
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
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken() || ""}`
      },
      body: JSON.stringify({ ...form, ...quote })
    });

    navigate("/quote", { state: { ...form, quote } });
  };

  return (
    <div className="container">
      <h1>PGI Application</h1>

      <input
        placeholder="Full Name"
        onChange={(e) => update("name", e.target.value)}
      />
      <input placeholder="Email" onChange={(e) => update("email", e.target.value)} />
      <input
        placeholder="Business Name"
        onChange={(e) => update("businessName", e.target.value)}
      />
      <input
        placeholder="Loan Amount (CAD)"
        onChange={(e) => update("loanAmount", e.target.value)}
      />

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

/* ================= LOGIN PAGE ================= */

function Login() {
  const [role, setRole] = useState("lender");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    const res = await fetch("https://api.boreal.financial/bi/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role })
    });

    const data = await res.json();

    localStorage.setItem("bi_token", data.token || "demo_token");
    localStorage.setItem("bi_role", role);

    navigate(`/${role}-dashboard`);
  };

  return (
    <div className="container">
      <h1>Login</h1>

      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="lender">Lender</option>
        <option value="referrer">Referrer</option>
      </select>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button className="button-primary" onClick={handleLogin}>
        Login
      </button>
    </div>
  );
}

/* ================= LENDER DASHBOARD ================= */

function LenderDashboard() {
  const [apps, setApps] = useState<any[]>([]);

  useEffect(() => {
    fetch("https://api.boreal.financial/bi/applications", {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
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
          <p>Premium: ${a.annualPremium?.toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}

/* ================= REFERRER DASHBOARD ================= */

function ReferrerDashboard() {
  const [apps, setApps] = useState<any[]>([]);
  const [commission, setCommission] = useState(0);

  useEffect(() => {
    fetch("https://api.boreal.financial/bi/applications", {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
      .then((r) => r.json())
      .then((data) => {
        setApps(data);

        const approvedPremiumTotal = data
          .filter((a: any) => a.status === "Approved")
          .reduce((sum: number, a: any) => sum + (a.annualPremium || 0), 0);

        setCommission(approvedPremiumTotal * 0.1); // 10% commission
      });
  }, []);

  return (
    <div className="container">
      <h1>Referrer Dashboard</h1>

      <div className="card">
        <h2>Total Commission (10%)</h2>
        <h3>${commission.toLocaleString()}</h3>
      </div>

      {apps.map((a, i) => (
        <div key={i} className="card">
          <p>{a.businessName}</p>
          <p>Status: {a.status}</p>
          <p>Premium: ${a.annualPremium?.toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}

/* ================= QUOTE ================= */

function Quote() {
  const location = useLocation();
  const data: any = location.state;

  if (!data)
    return (
      <div className="container">
        <h1>No Quote</h1>
      </div>
    );

  return (
    <div className="container">
      <h1>Your Quote</h1>

      <div className="card">
        <h2>Insured Amount</h2>
        <h3>${data.quote.insuredAmount.toLocaleString()}</h3>

        <h2>Annual Premium</h2>
        <h3>${data.quote.annualPremium.toLocaleString()}</h3>
      </div>
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
        <Route path="/login" element={<Login />} />

        <Route
          path="/lender-dashboard"
          element={
            <ProtectedRoute role="lender">
              <LenderDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/referrer-dashboard"
          element={
            <ProtectedRoute role="referrer">
              <ReferrerDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
