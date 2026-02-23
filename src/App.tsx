import React, { useState } from "react";

const API = "https://api.boreal.financial/bi";

function App() {
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

  const rate =
    form.loanType === "Secured" ? 0.016 : 0.04;

  const annualPremium = maxCoverage * rate;

  const commission = annualPremium * 0.1;

  function update(field: string, value: any) {
    setForm({ ...form, [field]: value });
  }

  async function submit() {
    await fetch(`${API}/applications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        businessName: form.businessName,
        loanAmount: form.loanAmount,
        loanType: form.loanType,
        insuredAmount: maxCoverage,
        annualPremium: annualPremium,
        referrerEmail: form.referrerEmail || null
      })
    });

    setStep(5);
  }

  return (
    <div style={{ fontFamily: "Arial", padding: 40 }}>
      {/* NAV */}
      <nav style={{ display: "flex", justifyContent: "space-between", marginBottom: 40 }}>
        <h2>Boreal Insurance</h2>
        <div>
          <a href="/lender-login" style={{ marginRight: 20 }}>Lender Login</a>
          <a href="/referrer-login">Referrer Login</a>
        </div>
      </nav>

      {/* STEP 1 */}
      {step === 1 && (
        <div>
          <h1>Personal Guarantee Insurance Application</h1>
          <p>Protect yourself against personal guarantee risk.</p>
          <button onClick={() => setStep(2)}>Start Application</button>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div>
          <h2>Applicant Details</h2>

          <input
            placeholder="Full Name"
            value={form.name}
            onChange={e => update("name", e.target.value)}
          />
          <br /><br />

          <input
            placeholder="Email"
            value={form.email}
            onChange={e => update("email", e.target.value)}
          />
          <br /><br />

          <input
            placeholder="Business Name"
            value={form.businessName}
            onChange={e => update("businessName", e.target.value)}
          />
          <br /><br />

          <button onClick={() => setStep(3)}>Next</button>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div>
          <h2>Loan Details</h2>

          <input
            type="number"
            placeholder="Loan Amount"
            value={form.loanAmount}
            onChange={e => update("loanAmount", Number(e.target.value))}
          />
          <br /><br />

          <select
            value={form.loanType}
            onChange={e => update("loanType", e.target.value)}
          >
            <option value="Secured">Secured (1.6%)</option>
            <option value="Unsecured">Unsecured (4.0%)</option>
          </select>
          <br /><br />

          <input
            placeholder="Referrer Email (optional)"
            value={form.referrerEmail}
            onChange={e => update("referrerEmail", e.target.value)}
          />
          <br /><br />

          <button onClick={() => setStep(4)}>Review</button>
        </div>
      )}

      {/* STEP 4 */}
      {step === 4 && (
        <div>
          <h2>Coverage Summary</h2>

          <p>Loan Amount: ${form.loanAmount.toLocaleString()}</p>
          <p>Max Coverage (80% capped $1.4M): ${maxCoverage.toLocaleString()}</p>
          <p>Annual Premium: ${annualPremium.toLocaleString()}</p>

          <hr />
          <small>Internal Commission (10%): ${commission.toLocaleString()}</small>

          <br /><br />
          <button onClick={submit}>Submit Application</button>
        </div>
      )}

      {/* SUCCESS */}
      {step === 5 && (
        <div>
          <h2>Application Submitted</h2>
          <p>Our team will contact you shortly.</p>
        </div>
      )}
    </div>
  );
}

export default App;
