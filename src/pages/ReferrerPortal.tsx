import { useState } from "react";

type Referrer = {
  company: string;
  name: string;
  email: string;
  phone: string;
};

type Referral = {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
};

const emptyReferral: Referral = {
  businessName: "",
  contactName: "",
  email: "",
  phone: ""
};

export default function ReferrerPortal() {
  const [step, setStep] = useState(1);
  const [referrer, setReferrer] = useState<Referrer>({
    company: "",
    name: "",
    email: "",
    phone: ""
  });
  const [referrals, setReferrals] = useState<Referral[]>([{ ...emptyReferral }]);

  const updateReferral = (index: number, key: keyof Referral, value: string) => {
    setReferrals(prev =>
      prev.map((item, i) => (i === index ? { ...item, [key]: value } : item))
    );
  };

  const addReferral = () => setReferrals(prev => [...prev, { ...emptyReferral }]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await fetch("/api/referrals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ referrer, referrals })
    });
    alert("Submitted");
  };

  if (step === 1) {
    return (
      <div className="content-section">
        <h1>Referrer Registration</h1>
        <input
          placeholder="Company Name"
          onChange={e => setReferrer({ ...referrer, company: e.target.value })}
        />
        <input
          placeholder="Full Name"
          onChange={e => setReferrer({ ...referrer, name: e.target.value })}
        />
        <input
          placeholder="Email"
          type="email"
          onChange={e => setReferrer({ ...referrer, email: e.target.value })}
        />
        <input
          placeholder="Cell Number"
          onChange={e => setReferrer({ ...referrer, phone: e.target.value })}
        />
        <button type="button" onClick={() => setStep(2)}>Continue</button>
      </div>
    );
  }

  return (
    <form className="content-section" onSubmit={handleSubmit}>
      <h1>Add Referrals</h1>
      {referrals.map((referral, index) => (
        <div key={index} className="card">
          <h3>Referral {index + 1}</h3>
          <input
            required
            placeholder="Business Name"
            onChange={e => updateReferral(index, "businessName", e.target.value)}
          />
          <input
            required
            placeholder="Contact Name"
            onChange={e => updateReferral(index, "contactName", e.target.value)}
          />
          <input
            required
            type="email"
            placeholder="Contact Email"
            onChange={e => updateReferral(index, "email", e.target.value)}
          />
          <input
            required
            placeholder="Contact Phone"
            onChange={e => updateReferral(index, "phone", e.target.value)}
          />
        </div>
      ))}

      <button type="button" onClick={addReferral}>+ Add Another Referral</button>
      <button type="submit">Submit Referrals</button>
    </form>
  );
}
