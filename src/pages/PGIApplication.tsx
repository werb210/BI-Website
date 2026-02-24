import { useState } from "react";
import BIAuthGate from "../components/BIAuthGate";

export default function PGIApplication() {
  const [phone, setPhone] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [appId, setAppId] = useState<string | null>(null);

  const [form, setForm] = useState<any>({
    facilityType: "secured",
    loanAmount: 0,
    bankruptcy: false,
  });

  const [premium, setPremium] = useState<any>(null);

  async function saveDraft() {
    const res = await fetch("/api/bi/application/draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, data: form }),
    });
    const data = await res.json();
    setAppId(data.id);
  }

  async function submit() {
    const res = await fetch("/api/bi/application/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicationId: appId,
        facilityType: form.facilityType,
        loanAmount: form.loanAmount,
        bankruptcy: form.bankruptcy,
      }),
    });

    const data = await res.json();
    setPremium(data.premium);
    setStep(99);
  }

  if (!phone) {
    return <BIAuthGate onVerified={setPhone} />;
  }

  return (
    <div className="application-wrapper">
      {step === 1 && (
        <>
          <h1>Loan & Guarantee Details</h1>

          <select
            value={form.facilityType}
            onChange={(e) => setForm({ ...form, facilityType: e.target.value })}
          >
            <option value="secured">Secured</option>
            <option value="unsecured">Unsecured</option>
          </select>

          <input
            type="number"
            placeholder="Loan Amount"
            onChange={(e) => setForm({ ...form, loanAmount: Number(e.target.value) })}
          />

          <label>
            <input
              type="checkbox"
              onChange={(e) => setForm({ ...form, bankruptcy: e.target.checked })}
            />
            Bankruptcy already filed?
          </label>

          <button onClick={saveDraft}>Save Draft</button>
          <button onClick={() => setStep(2)}>Next</button>
        </>
      )}

      {step === 2 && (
        <>
          <h1>Documents</h1>
          <p>Upload required documents now, or provide later.</p>

          <input type="file" multiple />

          <button onClick={submit}>Submit & Provide Documents Later</button>
        </>
      )}

      {step === 99 && premium && (
        <>
          <h1>Premium Estimate</h1>
          <p>Annual Premium: ${premium.annualPremium}</p>
          <p>Insured Amount: ${premium.insuredAmount}</p>
          <p>Rate Applied: {premium.rate * 100}%</p>
          <p>
            Your application has moved to Documents Pending. Our team will review and package it
            for Purbeck.
          </p>
        </>
      )}
    </div>
  );
}
