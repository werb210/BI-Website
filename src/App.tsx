import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
  useParams
} from "react-router-dom";
import { useEffect, useState } from "react";

const API = "https://api.boreal.financial/bi";

/* ================= AUTH ================= */

const getToken = () => localStorage.getItem("bi_token");
const getRole = () => localStorage.getItem("bi_role");

function Protected({ children, role }: any) {
  if (!getToken()) return <Navigate to="/login" />;
  if (role && role !== getRole() && getRole() !== "admin") return <Navigate to="/" />;
  return children;
}

/* ================= NAV ================= */

function Nav() {
  const navigate = useNavigate();
  const role = getRole();

  return (
    <div className="nav">
      <h2>Boreal Insurance</h2>

      <div>
        <Link to="/">Home</Link>
        <Link to="/apply">Apply</Link>

        {role && <Link to={`/${role}-dashboard`}>Dashboard</Link>}
        {role === "admin" && <Link to="/admin-dashboard">Admin</Link>}

        {!role && <Link to="/login">Login</Link>}

        {role && (
          <button
            onClick={() => {
              localStorage.clear();
              navigate("/");
            }}
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
  return (
    <div className="container">
      <h1>Personal Guarantee Insurance</h1>
      <p>
        Coverage up to 80% of loan amount (max $1,400,000 CAD). Secured: 1.6% per year. Unsecured: 4.0% per
        year.
      </p>
    </div>
  );
}

/* ================= APPLY ================= */

function Apply() {
  const navigate = useNavigate();
  const role = getRole();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<any>({ loanType: "Secured" });

  const update = (k: string, v: any) => setForm({ ...form, [k]: v });

  const submit = async () => {
    setLoading(true);

    const loan = parseFloat(form.loanAmount || 0);
    const insuredAmount = Math.min(loan * 0.8, 1400000);
    const rate = form.loanType === "Secured" ? 0.016 : 0.04;
    const annualPremium = insuredAmount * rate;

    await fetch(`${API}/applications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken() || ""}`
      },
      body: JSON.stringify({
        ...form,
        insuredAmount,
        annualPremium,
        referrerEmail: role === "referrer" ? localStorage.getItem("bi_email") : null
      })
    });

    setLoading(false);
    navigate("/");
  };

  return (
    <div className="container">
      <h1>Apply</h1>

      <input placeholder="Full Name" onChange={(e) => update("name", e.target.value)} />
      <input placeholder="Email" onChange={(e) => update("email", e.target.value)} />
      <input placeholder="Business Name" onChange={(e) => update("businessName", e.target.value)} />
      <input placeholder="Loan Amount (CAD)" onChange={(e) => update("loanAmount", e.target.value)} />

      <select onChange={(e) => update("loanType", e.target.value)}>
        <option value="Secured">Secured</option>
        <option value="Unsecured">Unsecured</option>
      </select>

      <button disabled={loading} onClick={submit}>
        {loading ? "Submitting..." : "Submit"}
      </button>
    </div>
  );
}

/* ================= POLICY DETAIL ================= */

function PolicyDetail() {
  const { id } = useParams();
  const [policy, setPolicy] = useState<any>(null);
  const role = getRole();

  useEffect(() => {
    fetch(`${API}/policies/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
      .then((r) => r.json())
      .then(setPolicy);
  }, [id]);

  if (!policy) return <div className="container">Loading...</div>;

  const action = async (endpoint: string) => {
    await fetch(`${API}${endpoint}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    window.location.reload();
  };

  return (
    <div className="container">
      <h1>Policy #{policy.policy_number}</h1>
      <p>Status: {policy.status}</p>
      <p>Start: {policy.start_date}</p>
      <p>End: {policy.end_date}</p>

      {role === "admin" && (
        <>
          <button onClick={() => action(`/policies/${id}/renew`)}>Renew</button>
          <button onClick={() => action(`/policies/${id}/cancel`)}>Cancel</button>
        </>
      )}
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

  return (
    <div className="container">
      <h1>Commission Ledger</h1>

      {ledger.map((l) => (
        <div key={l.id} className="card">
          <p>Policy ID: {l.policy_id}</p>
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

  const exportCSV = () => {
    window.open(`${API}/admin/export`, "_blank");
  };

  return (
    <div className="container">
      <h1>Admin Dashboard</h1>

      <p>Total Premium: ${Number(summary.totalPremium || 0).toLocaleString()}</p>
      <p>Total Commission: ${Number(summary.totalCommission || 0).toLocaleString()}</p>

      <button onClick={exportCSV}>Export CSV</button>
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

      <select onChange={(e) => setRole(e.target.value)}>
        <option value="lender">Lender</option>
        <option value="referrer">Referrer</option>
        <option value="admin">Admin</option>
      </select>

      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
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

        <Route
          path="/policy/:id"
          element={
            <Protected>
              <PolicyDetail />
            </Protected>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
