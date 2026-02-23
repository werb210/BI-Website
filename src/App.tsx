import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate
} from "react-router-dom";
import { useState } from "react";

const API = "https://api.boreal.financial/bi";

const getToken = () => localStorage.getItem("bi_token");
const getRole = () => localStorage.getItem("bi_role");

function Protected({ children }: any) {
  if (!getToken()) return <Navigate to="/login" />;
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
        {role && <Link to="/dashboard">Dashboard</Link>}
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

/* ================= PREMIUM LOGIC ================= */

function calculatePremium(loanAmount: number, loanType: string) {
  const insuredAmount = Math.min(loanAmount * 0.8, 1400000);
  const rate = loanType === "Secured" ? 0.016 : 0.04;
  const annualPremium = insuredAmount * rate;

  return { insuredAmount, annualPremium, rate };
}

/* ================= HOME ================= */

function Home() {
  return (
    <div className="container">
      <h1>Personal Guarantee Insurance</h1>
      <p>Protect your personal assets from business loan default.</p>
      <Link to="/apply" className="button-primary">
        Get a Quote
      </Link>
    </div>
  );
}

/* ================= MULTI STEP APPLICATION ================= */

function Apply() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<any>({
    loanType: "Secured"
  });

  const update = (k: string, v: any) => setForm({ ...form, [k]: v });

  const validateStep = () => {
    if (step === 1 && (!form.loanAmount || form.loanAmount <= 0))
      return "Loan amount required";

    if (step === 2 && (!form.name || !form.email || !form.businessName))
      return "All personal details required";

    return "";
  };

  const next = () => {
    const validation = validateStep();
    if (validation) {
      setError(validation);
      return;
    }
    setError("");
    setStep(step + 1);
  };

  const back = () => setStep(step - 1);

  const submit = async () => {
    setLoading(true);
    setError("");

    const { insuredAmount, annualPremium } = calculatePremium(
      parseFloat(form.loanAmount),
      form.loanType
    );

    try {
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
          referrerEmail:
            getRole() === "referrer"
              ? localStorage.getItem("bi_email")
              : null
        })
      });

      navigate("/success");
    } catch {
      setError("Submission failed. Try again.");
    }

    setLoading(false);
  };

  const { insuredAmount, annualPremium, rate } = calculatePremium(
    parseFloat(form.loanAmount || 0),
    form.loanType
  );

  return (
    <div className="container">
      <h1>Application</h1>

      {error && <div className="error">{error}</div>}

      {step === 1 && (
        <>
          <h3>Loan Details</h3>

          <input
            placeholder="Loan Amount (CAD)"
            onChange={(e) => update("loanAmount", e.target.value)}
          />

          <select onChange={(e) => update("loanType", e.target.value)}>
            <option value="Secured">Secured (1.6%)</option>
            <option value="Unsecured">Unsecured (4.0%)</option>
          </select>

          <div className="quote-box">
            <p>Coverage: ${insuredAmount.toLocaleString()}</p>
            <p>Annual Premium: ${annualPremium.toLocaleString()}</p>
            <p>Rate: {(rate * 100).toFixed(1)}%</p>
          </div>

          <button onClick={next}>Next</button>
        </>
      )}

      {step === 2 && (
        <>
          <h3>Personal &amp; Business Info</h3>

          <input
            placeholder="Full Name"
            onChange={(e) => update("name", e.target.value)}
          />
          <input
            placeholder="Email"
            onChange={(e) => update("email", e.target.value)}
          />
          <input
            placeholder="Business Name"
            onChange={(e) => update("businessName", e.target.value)}
          />

          <div className="buttons">
            <button onClick={back}>Back</button>
            <button onClick={next}>Review</button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <h3>Review</h3>

          <p>Name: {form.name}</p>
          <p>Email: {form.email}</p>
          <p>Business: {form.businessName}</p>
          <p>Loan: ${form.loanAmount}</p>
          <p>Coverage: ${insuredAmount.toLocaleString()}</p>
          <p>Premium: ${annualPremium.toLocaleString()}</p>

          <div className="buttons">
            <button onClick={back}>Back</button>
            <button disabled={loading} onClick={submit}>
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ================= SUCCESS ================= */

function Success() {
  return (
    <div className="container">
      <h1>Application Submitted</h1>
      <p>
        Thank you. Your Personal Guarantee Insurance application has been
        received.
      </p>
      <Link to="/">Return Home</Link>
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
        <Route path="/apply" element={<Apply />} />
        <Route path="/success" element={<Success />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <Protected>
              <Home />
            </Protected>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
