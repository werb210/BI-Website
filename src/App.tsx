import React, { useState } from "react";

const API = "https://api.boreal.financial/bi";

type Page =
  | "home"
  | "apply"
  | "claims"
  | "contact"
  | "lender"
  | "referrer";

function App() {
  const [page, setPage] = useState<Page>("home");

  return (
    <div style={{ fontFamily: "Arial", padding: 40 }}>
      {/* NAV */}
      <nav style={{ display: "flex", justifyContent: "space-between", marginBottom: 40 }}>
        <h2 style={{ cursor: "pointer" }} onClick={() => setPage("home")}>
          Boreal Insurance
        </h2>

        <div style={{ display: "flex", gap: 20 }}>
          <button onClick={() => setPage("apply")}>Apply Now</button>
          <button onClick={() => setPage("claims")}>Claims</button>
          <button onClick={() => setPage("contact")}>Contact</button>
          <button onClick={() => setPage("lender")}>Lender Login</button>
          <button onClick={() => setPage("referrer")}>Referrer Login</button>
        </div>
      </nav>

      {page === "home" && <Home />}
      {page === "apply" && <Application />}
      {page === "claims" && <Claims />}
      {page === "contact" && <Contact />}
      {page === "lender" && <Login role="lender" />}
      {page === "referrer" && <Login role="referrer" />}
    </div>
  );
}

/* ================= HOME ================= */

function Home() {
  return (
    <div>
      <h1>Personal Guarantee Insurance</h1>
      <p>
        Protect directors and business owners against personal guarantee risk.
      </p>

      <h3>Example Scenario</h3>
      <p>
        A business owner signs a $1,000,000 personal guarantee.
        Coverage protects up to 80% of the exposure.
      </p>

      <ul>
        <li>Secured loans: 1.6% annually</li>
        <li>Unsecured loans: 4.0% annually</li>
        <li>Maximum coverage: $1,400,000</li>
      </ul>
    </div>
  );
}

/* ================= APPLICATION ================= */

function Application() {
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    name: "",
    email: "",
    businessName: "",
    loanAmount: 0,
    loanType: "Secured" as "Secured" | "Unsecured",
    referrerEmail: ""
  });

  const maxCoverage = Math.min(form.loanAmount * 0.8, 1400000);
  const rate = form.loanType === "Secured" ? 0.016 : 0.04;
  const premium = maxCoverage * rate;

  function update(field: string, value: any) {
    setForm({ ...form, [field]: value });
  }

  async function submit() {
    await fetch(`${API}/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        businessName: form.businessName,
        loanAmount: form.loanAmount,
        loanType: form.loanType,
        insuredAmount: maxCoverage,
        annualPremium: premium,
        referrerEmail: form.referrerEmail || null
      })
    });

    setStep(4);
  }

  return (
    <div>
      {step === 1 && (
        <>
          <h2>Applicant Details</h2>
          <input placeholder="Full Name" onChange={e => update("name", e.target.value)} />
          <br /><br />
          <input placeholder="Email" onChange={e => update("email", e.target.value)} />
          <br /><br />
          <input placeholder="Business Name" onChange={e => update("businessName", e.target.value)} />
          <br /><br />
          <button onClick={() => setStep(2)}>Next</button>
        </>
      )}

      {step === 2 && (
        <>
          <h2>Loan Details</h2>
          <input type="number" placeholder="Loan Amount"
            onChange={e => update("loanAmount", Number(e.target.value))}
          />
          <br /><br />
          <select onChange={e => update("loanType", e.target.value)}>
            <option value="Secured">Secured (1.6%)</option>
            <option value="Unsecured">Unsecured (4.0%)</option>
          </select>
          <br /><br />
          <input placeholder="Referrer Email (optional)"
            onChange={e => update("referrerEmail", e.target.value)}
          />
          <br /><br />
          <button onClick={() => setStep(3)}>Review</button>
        </>
      )}

      {step === 3 && (
        <>
          <h2>Coverage Summary</h2>
          <p>Loan Amount: ${form.loanAmount.toLocaleString()}</p>
          <p>Max Coverage (80% capped $1.4M): ${maxCoverage.toLocaleString()}</p>
          <p>Annual Premium: ${premium.toLocaleString()}</p>
          <br />
          <button onClick={submit}>Submit Application</button>
        </>
      )}

      {step === 4 && (
        <>
          <h2>Application Submitted</h2>
          <p>Our underwriting team will contact you.</p>
        </>
      )}
    </div>
  );
}

/* ================= CLAIMS ================= */

function Claims() {
  return (
    <div>
      <h2>Making a Claim</h2>
      <p>
        In the event of lender enforcement under a personal guarantee,
        notify us immediately. Claims are assessed based on policy terms.
      </p>
    </div>
  );
}

/* ================= CONTACT ================= */

function Contact() {
  return (
    <div>
      <h2>Contact Boreal Insurance</h2>
      <input placeholder="Name" /><br /><br />
      <input placeholder="Email" /><br /><br />
      <textarea placeholder="Message" rows={5} /><br /><br />
      <button>Send</button>
    </div>
  );
}

/* ================= LOGIN ================= */

function Login({ role }: { role: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function login() {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const json = await res.json();
    alert(json.token ? "Login successful" : "Login failed");
  }

  return (
    <div>
      <h2>{role === "lender" ? "Lender" : "Referrer"} Login</h2>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <br /><br />
      <input type="password" placeholder="Password"
        onChange={e => setPassword(e.target.value)}
      />
      <br /><br />
      <button onClick={login}>Login</button>
    </div>
  );
}

export default App;
