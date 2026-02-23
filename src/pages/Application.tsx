import { useState } from "react";
import { submitApplication } from "../lib/api";

type Step =
  | "personal"
  | "address"
  | "business"
  | "loan"
  | "financial"
  | "declaration"
  | "review";

export default function Application() {
  const [step, setStep] = useState<Step>("personal");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState<any>({});

  const update = (key: string, value: any) =>
    setForm((prev: any) => ({ ...prev, [key]: value }));

  const calculatePremium = () => {
    const loan = Number(form.loanAmount || 0);
    const secured = form.securedType === "secured";
    const rate = secured ? 0.016 : 0.04;

    const insuredAmount = Math.min(loan * 0.8, 1400000);
    const premium = insuredAmount * rate;
    const commission = premium * 0.1;

    return { insuredAmount, premium, commission };
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const calc = calculatePremium();

      const payload = {
        ...form,
        insuredAmount: calc.insuredAmount,
        annualPremium: calc.premium,
        borealCommission: calc.commission
      };

      await submitApplication(payload);

      setSubmitted(true);
    } catch (e) {
      alert("Submission failed");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="container">
        <h1>Application Submitted</h1>
        <p>Your application has been received. Our team will review and contact you.</p>
      </div>
    );
  }

  return (
    <div className="container app-container">
      <h1>Personal Guarantee Insurance Application</h1>

      {step === "loan" && (
        <>
          <h2>Loan Details</h2>
          <input
            placeholder="Loan Amount"
            onChange={(e) => update("loanAmount", e.target.value)}
          />
          <select onChange={(e) => update("securedType", e.target.value)}>
            <option value="">Select Type</option>
            <option value="secured">Secured</option>
            <option value="unsecured">Unsecured</option>
          </select>

          {form.loanAmount && form.securedType && (
            <div className="premium-box">
              {(() => {
                const calc = calculatePremium();
                return (
                  <>
                    <p>Insured Amount: ${calc.insuredAmount.toLocaleString()}</p>
                    <p>Annual Premium: ${calc.premium.toLocaleString()}</p>
                  </>
                );
              })()}
            </div>
          )}

          <button onClick={() => setStep("financial")}>Next</button>
        </>
      )}

      {step === "financial" && (
        <>
          <h2>Financial Information</h2>
          <input placeholder="Annual Turnover" onChange={(e) => update("turnover", e.target.value)} />
          <input placeholder="Net Profit" onChange={(e) => update("netProfit", e.target.value)} />

          <div className="btn-row">
            <button onClick={() => setStep("loan")}>Back</button>
            <button onClick={() => setStep("review")}>Next</button>
          </div>
        </>
      )}

      {step === "review" && (
        <>
          <h2>Review</h2>
          <div className="review-box">
            <pre>{JSON.stringify(form, null, 2)}</pre>
          </div>

          <button onClick={() => setStep("financial")}>Back</button>
          <button className="btn large" onClick={handleSubmit} disabled={loading}>
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </>
      )}
    </div>
  );
}
