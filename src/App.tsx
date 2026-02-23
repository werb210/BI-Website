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
        {role && <Link to="/policies">Policies</Link>}
        {role === "admin" && <Link to="/admin">Admin</Link>}
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
        Secured: 1.6% annually. Unsecured: 4.0% annually.
        Coverage up to 80% of loan (max $1,400,000 CAD).
      </p>
    </div>
  );
}

/* ================= POLICY LIST ================= */

function PolicyList() {
  const [policies, setPolicies] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API}/policies`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
      .then((r) => r.json())
      .then(setPolicies);
  }, []);

  return (
    <div className="container">
      <h1>Policies</h1>

      {policies.map((p) => (
        <div key={p.id} className="card">
          <Link to={`/policy/${p.id}`}>
            <strong>{p.business_name}</strong>
          </Link>
          <p>Status: {p.status}</p>
          <p>Premium: ${Number(p.annual_premium).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}

/* ================= POLICY DETAIL ================= */

function PolicyDetail() {
  const { id } = useParams();
  const [policy, setPolicy] = useState<any>(null);

  useEffect(() => {
    fetch(`${API}/policies/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
      .then((r) => r.json())
      .then(setPolicy);
  }, [id]);

  if (!policy) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <h1>Policy #{policy.policy_number || id}</h1>
      <p>Status: {policy.status}</p>
      <p>Start: {policy.start_date}</p>
      <p>End: {policy.end_date}</p>

      <h2>Commission History</h2>
      {policy.commissions.map((c: any) => (
        <div key={c.id} className="card">
          <p>Year {c.year_number}</p>
          <p>Premium: ${Number(c.premium).toLocaleString()}</p>
          <p>Commission: ${Number(c.commission_amount).toLocaleString()}</p>
          <p>Status: {c.payout_status}</p>
        </div>
      ))}
    </div>
  );
}

/* ================= ADMIN DASHBOARD ================= */

function AdminDashboard() {
  const [metrics, setMetrics] = useState<any>({});
  const [aging, setAging] = useState<any>({});
  const [referrers, setReferrers] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API}/admin/metrics`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
      .then((r) => r.json())
      .then(setMetrics);

    fetch(`${API}/admin/commission-aging`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
      .then((r) => r.json())
      .then(setAging);

    fetch(`${API}/admin/referrer-performance`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
      .then((r) => r.json())
      .then(setReferrers);
  }, []);

  return (
    <div className="container">
      <h1>Admin Dashboard</h1>

      <div className="card">
        <h3>Active Policies: {metrics.activePolicies}</h3>
        <h3>Cancelled Policies: {metrics.cancelledPolicies}</h3>
        <h3>Churn Rate: {(metrics.churnRate * 100 || 0).toFixed(2)}%</h3>
        <h3>Total Premium: ${Number(metrics.totalPremium || 0).toLocaleString()}</h3>
        <h3>Total Commission: ${Number(metrics.totalCommission || 0).toLocaleString()}</h3>
      </div>

      <h2>Commission Aging</h2>
      <div className="card">
        <p>Current: ${Number(aging.current || 0).toLocaleString()}</p>
        <p>30+ Days: ${Number(aging.over_30 || 0).toLocaleString()}</p>
        <p>60+ Days: ${Number(aging.over_60 || 0).toLocaleString()}</p>
        <p>90+ Days: ${Number(aging.over_90 || 0).toLocaleString()}</p>
      </div>

      <h2>Referrer Ranking</h2>
      {referrers.map((r) => (
        <div key={r.referrer_email} className="card">
          <p>{r.referrer_email}</p>
          <p>Total Commission: ${Number(r.total_commission).toLocaleString()}</p>
          <p>Policies: {r.total_policies}</p>
        </div>
      ))}
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

    navigate("/");
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
        <Route path="/apply" element={<Home />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/policies"
          element={
            <Protected>
              <PolicyList />
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

        <Route
          path="/admin"
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
