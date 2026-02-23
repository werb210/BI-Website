import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate
} from "react-router-dom";
import { useEffect, useState } from "react";

const API = "https://api.boreal.financial/bi";

/* ================= AUTH ================= */

const getToken = () => localStorage.getItem("bi_token");
const getRole = () => localStorage.getItem("bi_role");

function Protected({ children, role }: any) {
  if (!getToken()) return <Navigate to="/login" />;
  if (role && role !== getRole() && getRole() !== "admin")
    return <Navigate to="/" />;
  return children;
}

/* ================= NAV ================= */

function Nav() {
  const role = getRole();
  const navigate = useNavigate();

  return (
    <div className="nav">
      <h2>Boreal Insurance</h2>

      <div>
        <Link to="/">Home</Link>
        <Link to="/apply">Apply</Link>

        {!role && <Link to="/login">Login</Link>}

        {role && (
          <>
            <Link to={`/${role}-dashboard`}>Dashboard</Link>
            {role === "admin" && <Link to="/admin-dashboard">Admin</Link>}
            <button
              onClick={() => {
                localStorage.clear();
                navigate("/");
              }}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ================= HOME ================= */

function Home() {
  return (
    <div className="container">
      <h1>Personal Guarantee Insurance</h1>
      <p>
        Protect your personal assets against business loan default.
        Coverage up to 80% of loan amount (max $1,400,000 CAD).
      </p>
    </div>
  );
}

/* ================= APPLY ================= */

function Apply() {
  const navigate = useNavigate();
  const role = getRole();

  const [form, setForm] = useState<any>({
    loanType: "Secured"
  });

  const update = (k: string, v: any) =>
    setForm({ ...form, [k]: v });

  const calculate = () => {
    const loan = parseFloat(form.loanAmount || 0);
    const insuredAmount = Math.min(loan * 0.8, 1400000);
    const rate = form.loanType === "Secured" ? 0.016 : 0.04;
    const annualPremium = insuredAmount * rate;

    return { insuredAmount, annualPremium };
  };

  const submit = async () => {
    const quote = calculate();

    await fetch(`${API}/applications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken() || ""}`
      },
      body: JSON.stringify({
        ...form,
        ...quote,
        referrerEmail:
          role === "referrer"
            ? localStorage.getItem("bi_email")
            : null
      })
    });

    navigate("/");
  };

  return (
    <div className="container">
      <h1>Apply for PGI</h1>

      <input placeholder="Full Name" onChange={(e) => update("name", e.target.value)} />
      <input placeholder="Email" onChange={(e) => update("email", e.target.value)} />
      <input placeholder="Business Name" onChange={(e) => update("businessName", e.target.value)} />
      <input placeholder="Loan Amount (CAD)" onChange={(e) => update("loanAmount", e.target.value)} />

      <select onChange={(e) => update("loanType", e.target.value)}>
        <option value="Secured">Secured (1.6%)</option>
        <option value="Unsecured">Unsecured (4.0%)</option>
      </select>

      <button onClick={submit}>Submit Application</button>
    </div>
  );
}

/* ================= LENDER DASHBOARD ================= */

function LenderDashboard() {
  const [apps, setApps] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API}/applications`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
      .then((r) => r.json())
      .then(setApps);
  }, []);

  return (
    <div className="container">
      <h1>Lender Dashboard</h1>

      {apps.map((a) => (
        <div key={a.id} className="card">
          <p><strong>{a.business_name}</strong></p>
          <p>Status: {a.status}</p>
          <p>Annual Premium: ${Number(a.annual_premium).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}

/* ================= REFERRER DASHBOARD ================= */

function ReferrerDashboard() {
  const [ledger, setLedger] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API}/commission/ledger`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
      .then((r) => r.json())
      .then(setLedger);
  }, []);

  const total = ledger.reduce(
    (sum, l) => sum + Number(l.commission_amount),
    0
  );

  return (
    <div className="container">
      <h1>Referrer Dashboard</h1>

      <h2>Total Commission Earned</h2>
      <h1>${total.toLocaleString()}</h1>

      {ledger.map((l) => (
        <div key={l.id} className="card">
          <p>Year: {l.year_number}</p>
          <p>Premium: ${Number(l.premium).toLocaleString()}</p>
          <p>Commission: ${Number(l.commission_amount).toLocaleString()}</p>
          <p>Status: {l.payout_status}</p>
        </div>
      ))}
    </div>
  );
}

/* ================= ADMIN DASHBOARD ================= */

function AdminDashboard() {
  const [summary, setSummary] = useState<any>({});

  useEffect(() => {
    fetch(`${API}/admin/summary`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
      .then((r) => r.json())
      .then(setSummary);
  }, []);

  return (
    <div className="container">
      <h1>Admin Summary</h1>

      <div className="card">
        <h3>Total Annual Premium Written</h3>
        <h2>${Number(summary.totalPremium || 0).toLocaleString()}</h2>

        <h3>Total Commission Generated (10%)</h3>
        <h2>${Number(summary.totalCommission || 0).toLocaleString()}</h2>
      </div>
    </div>
  );
}

/* ================= LOGIN ================= */

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("lender");

  const login = async () => {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role })
    });

    const data = await res.json();

    localStorage.setItem("bi_token", data.token);
    localStorage.setItem("bi_role", role);
    localStorage.setItem("bi_email", email);

    navigate(`/${role}-dashboard`);
  };

  return (
    <div className="container">
      <h1>Login</h1>

      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="lender">Lender</option>
        <option value="referrer">Referrer</option>
        <option value="admin">Admin</option>
      </select>

      <input
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <button onClick={login}>Login</button>
    </div>
  );
}

/* ================= APP ================= */

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/apply" element={<Apply />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/lender-dashboard"
          element={
            <Protected role="lender">
              <LenderDashboard />
            </Protected>
          }
        />

        <Route
          path="/referrer-dashboard"
          element={
            <Protected role="referrer">
              <ReferrerDashboard />
            </Protected>
          }
        />

        <Route
          path="/admin-dashboard"
          element={
            <Protected role="admin">
              <AdminDashboard />
            </Protected>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
