import { useEffect, useState } from "react";
import BIAuthGate from "../components/BIAuthGate";
import { useDraft } from "../hooks/useDraft";

const initialFormState = {
  /* Business Info */
  legal_name: "",
  operating_name: "",
  business_number: "",
  incorporation_date: "",
  address_line1: "",
  city: "",
  province: "",
  postal_code: "",
  industry: "",

  /* Directors */
  director_name: "",
  director_dob: "",
  director_address: "",

  /* Loan Details */
  facilityType: "secured",
  lender_name: "",
  loanAmount: 0,
  guarantee_amount: 0,

  /* Financial */
  annual_turnover: 0,
  net_profit: 0,
  total_assets: 0,
  total_liabilities: 0,

  /* Compliance */
  bankruptcy: false,
  consent: false,
  terms: false,
  privacy: false
};

export default function PGIApplication() {
  const [phone, setPhone] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [appId, setAppId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasRestoredDraft] = useState(() => {
    if (typeof window === "undefined") return false;
    return Boolean(localStorage.getItem("bi-application-draft"));
  });

  const { state: form, setState: setForm, clearDraft } = useDraft(
    "bi-application-draft",
    initialFormState
  );

  useEffect(() => {
    if (phone) {
      resume();
    }
  }, [phone]);

  async function resume() {
    const res = await fetch(`/api/bi/application/by-phone?phone=${phone}`);
    if (res.ok) {
      const data = await res.json();
      if (data) {
        setAppId(data.id);
        setForm(prev => ({ ...prev, ...data.data }));
      }
    }
  }

  async function saveDraft() {
    const res = await fetch("/api/bi/application/draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, data: form })
    });

    const data = await res.json();
    setAppId(data.id);
  }

  async function submit() {
    if (!form.consent || !form.terms || !form.privacy) {
      alert("You must accept all compliance confirmations.");
      return;
    }

    setLoading(true);

    await fetch("/api/bi/application/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicationId: appId,
        facilityType: form.facilityType,
        loanAmount: form.loanAmount,
        bankruptcy: form.bankruptcy
      })
    });

    clearDraft();
    setLoading(false);
    setStep(99);
  }

  if (!phone) {
    return <BIAuthGate onVerified={setPhone} />;
  }

  return (
    <div className="application-wrapper">
      {hasRestoredDraft && (
        <div className="bg-brand-bgAlt border border-card rounded-lg p-4 mb-6 text-sm">
          Draft restored from previous session.
        </div>
      )}

      {/* STEP 1 – BUSINESS */}
      {step === 1 && (
        <>
          <h1>Business Information</h1>

          <input
            placeholder="Legal Name"
            value={form.legal_name}
            onChange={e => setForm({ ...form, legal_name: e.target.value })}
          />

          <input
            placeholder="Operating Name"
            value={form.operating_name}
            onChange={e => setForm({ ...form, operating_name: e.target.value })}
          />

          <input
            placeholder="Business Number"
            value={form.business_number}
            onChange={e => setForm({ ...form, business_number: e.target.value })}
          />

          <input
            type="date"
            value={form.incorporation_date}
            onChange={e => setForm({ ...form, incorporation_date: e.target.value })}
          />

          <button onClick={() => setStep(2)}>Next</button>
        </>
      )}

      {/* STEP 2 – DIRECTOR */}
      {step === 2 && (
        <>
          <h1>Director / Guarantor</h1>

          <input
            placeholder="Full Name"
            value={form.director_name}
            onChange={e => setForm({ ...form, director_name: e.target.value })}
          />

          <input
            type="date"
            value={form.director_dob}
            onChange={e => setForm({ ...form, director_dob: e.target.value })}
          />

          <input
            placeholder="Residential Address"
            value={form.director_address}
            onChange={e => setForm({ ...form, director_address: e.target.value })}
          />

          <button onClick={() => setStep(3)}>Next</button>
        </>
      )}

      {/* STEP 3 – LOAN DETAILS */}
      {step === 3 && (
        <>
          <h1>Loan & Guarantee</h1>

          <select
            value={form.facilityType}
            onChange={e => setForm({ ...form, facilityType: e.target.value })}
          >
            <option value="secured">Secured</option>
            <option value="unsecured">Unsecured</option>
          </select>

          <input
            placeholder="Lender Name"
            value={form.lender_name}
            onChange={e => setForm({ ...form, lender_name: e.target.value })}
          />

          <input
            type="number"
            placeholder="Loan Amount"
            value={form.loanAmount}
            onChange={e => setForm({ ...form, loanAmount: Number(e.target.value) })}
          />

          <input
            type="number"
            placeholder="Guarantee Amount"
            value={form.guarantee_amount}
            onChange={e => setForm({ ...form, guarantee_amount: Number(e.target.value) })}
          />

          <button onClick={() => setStep(4)}>Next</button>
        </>
      )}

      {/* STEP 4 – FINANCIALS */}
      {step === 4 && (
        <>
          <h1>Financial Information</h1>

          <input
            type="number"
            placeholder="Annual Turnover"
            value={form.annual_turnover}
            onChange={e => setForm({ ...form, annual_turnover: Number(e.target.value) })}
          />

          <input
            type="number"
            placeholder="Net Profit"
            value={form.net_profit}
            onChange={e => setForm({ ...form, net_profit: Number(e.target.value) })}
          />

          <input
            type="number"
            placeholder="Total Assets"
            value={form.total_assets}
            onChange={e => setForm({ ...form, total_assets: Number(e.target.value) })}
          />

          <input
            type="number"
            placeholder="Total Liabilities"
            value={form.total_liabilities}
            onChange={e => setForm({ ...form, total_liabilities: Number(e.target.value) })}
          />

          <button onClick={() => setStep(5)}>Next</button>
        </>
      )}

      {/* STEP 5 – COMPLIANCE */}
      {step === 5 && (
        <>
          <h1>Declarations</h1>

          <label>
            <input
              type="checkbox"
              checked={form.bankruptcy}
              onChange={e => setForm({ ...form, bankruptcy: e.target.checked })}
            />
            Bankruptcy filed?
          </label>

          <label>
            <input
              type="checkbox"
              checked={form.consent}
              onChange={e => setForm({ ...form, consent: e.target.checked })}
            />
            I confirm information is accurate
          </label>

          <label>
            <input
              type="checkbox"
              checked={form.terms}
              onChange={e => setForm({ ...form, terms: e.target.checked })}
            />
            I accept Terms
          </label>

          <label>
            <input
              type="checkbox"
              checked={form.privacy}
              onChange={e => setForm({ ...form, privacy: e.target.checked })}
            />
            I accept Privacy Policy
          </label>

          <button onClick={saveDraft}>Save Draft</button>
          <button disabled={loading} onClick={submit}>
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </>
      )}

      {/* STEP 99 – CONFIRM */}
      {step === 99 && (
        <>
          <h1>Application Submitted</h1>
          <p>
            Your application has been received and moved to Documents Pending. Our team will
            package it and forward to Purbeck.
          </p>
        </>
      )}
    </div>
  );
}
