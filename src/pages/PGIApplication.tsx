import { useEffect, useState } from "react";
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadExisting() {
      const res = await fetch(`/api/bi/application/by-phone?phone=${phone}`);
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setAppId(data.id);
          setForm(data.data);
        }
      }
    }

    if (phone) {
      loadExisting();
    }
  }, [phone]);

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
    setLoading(true);
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
    setLoading(false);
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
          <p>Upload required documents now, or continue and provide them later.</p>

          <input
            type="file"
            multiple
            onChange={async (e: any) => {
              const files = e.target.files;
              const formData = new FormData();

              for (let i = 0; i < files.length; i++) {
                formData.append("files", files[i]);
              }

              await fetch(`/api/bi/application/${appId}/documents`, {
                method: "POST",
                body: formData,
              });

              alert("Documents uploaded");
            }}
          />

          <button disabled={loading} onClick={submit}>
            {loading ? "Submitting..." : "Submit & Provide Documents Later"}
          </button>
        </>
      )}

      {step === 99 && premium && (
        <>
          <h1>Premium Estimate</h1>

          <div className="premium-box">
            <h2>${premium.annualPremium.toLocaleString()}</h2>
            <p>Estimated Annual Premium</p>

            <p>Coverage up to ${premium.insuredAmount.toLocaleString()}</p>
            <p>Rate Applied: {(premium.rate * 100).toFixed(2)}%</p>
          </div>

          <p>
            Your file is now in <strong>Documents Pending</strong>. Our team will package and
            forward your application to Purbeck.
          </p>
        </>
      )}

      {form.referralId && <p>This application was referred by a registered partner.</p>}
    </div>
  );
}
