import { useState, useMemo } from "react";

export default function Application() {
  const [form, setForm] = useState<any>({
    firstName: "",
    lastName: "",
    email: "",
    loanAmount: "",
    securedType: ""
  });

  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const update = (k: string, v: any) =>
    setForm((p: any) => ({ ...p, [k]: v }));

  const valid =
    form.firstName &&
    form.lastName &&
    form.email.includes("@") &&
    Number(form.loanAmount) > 0 &&
    form.securedType;

  const calc = useMemo(() => {
    const loan = Number(form.loanAmount || 0);
    if (!loan || !form.securedType) return null;

    const insured = Math.min(loan * 0.8, 1400000);
    const rate = form.securedType === "secured" ? 0.016 : 0.04;
    const premium = insured * rate;

    return { insured, premium };
  }, [form.loanAmount, form.securedType]);

  const submit = async () => {
    if (!valid) {
      setError("Please complete all required fields.");
      return;
    }

    try {
      setError("");

      const res = await fetch(
        import.meta.env.VITE_API_BASE + "/api/applications",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            loanAmount: Number(form.loanAmount)
          })
        }
      );

      if (!res.ok) throw new Error("Submission failed");

      setSubmitted(true);
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (submitted) {
    return (
      <div className="container">
        <h1>Application Submitted</h1>
        <p>Our team will contact you shortly.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Apply for Personal Guarantee Insurance</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <input
        placeholder="First Name *"
        value={form.firstName}
        onChange={e => update("firstName", e.target.value)}
      />

      <input
        placeholder="Last Name *"
        value={form.lastName}
        onChange={e => update("lastName", e.target.value)}
      />

      <input
        placeholder="Email *"
        value={form.email}
        onChange={e => update("email", e.target.value)}
      />

      <input
        placeholder="Loan Amount (CAD) *"
        value={form.loanAmount}
        onChange={e =>
          update("loanAmount", e.target.value.replace(/[^0-9]/g, ""))
        }
      />

      <select
        value={form.securedType}
        onChange={e => update("securedType", e.target.value)}
      >
        <option value="">Select Loan Type *</option>
        <option value="secured">Secured (1.6%)</option>
        <option value="unsecured">Unsecured (4.0%)</option>
      </select>

      {calc && (
        <div className="premium-box">
          <h3>Estimated Coverage</h3>
          <p>
            Insured Amount: ${calc.insured.toLocaleString()}
          </p>
          <p>
            Annual Premium: ${calc.premium.toLocaleString()}
          </p>
        </div>
      )}

      <button
        className="btn"
        disabled={!valid}
        style={{ opacity: valid ? 1 : 0.5 }}
        onClick={submit}
      >
        Submit Application
      </button>
    </div>
  );
}
