import { trackConversion } from "../lib/conversion"
import { useState, useEffect } from "react";
import BIAuthGate from "../components/BIAuthGate";
import LoadingButton from "../components/LoadingButton";
import { apiPost } from "../lib/api";
import { track } from "../lib/analytics";
import { emailValid, phoneValid, required } from "../lib/validation";

export default function ReferrerPortal() {
  const [phone, setPhone] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loadingAgreement, setLoadingAgreement] = useState(false);
  const [loadingReferral, setLoadingReferral] = useState(false);
  const [form, setForm] = useState({
    company_name: "",
    full_name: "",
    email: "",
    phone: ""
  });

  const referralValid =
    required(form.company_name) &&
    required(form.full_name) &&
    emailValid(form.email) &&
    phoneValid(form.phone);

  useEffect(() => {
    if (phone) {
      loadProfile();
    }
  }, [phone]);

  async function loadProfile() {
    const res = await fetch(`/api/v1/referrer/profile?phone=${phone}`, {
      credentials: "include"
    });
    const data = await res.json();
    setProfile(data.profile);
    setReferrals(data.referrals || []);
  }

  async function requestAgreement() {
    if (!phone) return;

    setLoadingAgreement(true);
    try {
      await apiPost("/api/v1/referrer/request-agreement", { phone });
      alert("Agreement sent for signing.");
    } finally {
      setLoadingAgreement(false);
    }
  }

  async function addReferral() {
    if (!phone || !referralValid) {
      alert("Please provide valid referral details.");
      return;
    }

    setLoadingReferral(true);
    try {
      await apiPost("/api/v1/referrer/add-referral", { ...form, phone });
      track("referral_submitted");
      setForm({
        company_name: "",
        full_name: "",
        email: "",
        phone: ""
      });
      loadProfile();
    } finally {
      setLoadingReferral(false);
    }
  }

  if (!phone) {
    return <BIAuthGate onVerified={setPhone} />;
  }

  return (
    <div className="application-wrapper">
      <h1>Referrer Portal</h1>

      {!profile?.is_active && (
        <>
          <p>You must sign the referral agreement before submitting referrals.</p>
          <LoadingButton loading={loadingAgreement} onClick={requestAgreement}>
            Sign Agreement
          </LoadingButton>
        </>
      )}

      {profile?.is_active && (
        <>
          <h2>Add Referral</h2>

          <input
            placeholder="Company Name"
            value={form.company_name}
            onChange={e => setForm({ ...form, company_name: e.target.value })}
          />

          <input
            placeholder="Full Name"
            value={form.full_name}
            onChange={e => setForm({ ...form, full_name: e.target.value })}
          />

          <input
            placeholder="Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />

          <input
            placeholder="Phone"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
          />

          <LoadingButton loading={loadingReferral} onClick={addReferral} disabled={!referralValid}>
            Add To List
          </LoadingButton>

          <h2>Your Referrals</h2>
          {referrals.map(r => (
            <div key={r.id} className="crm-card">
              <strong>{r.full_name}</strong>
              <p>{r.company_name}</p>
              <p>Status: {r.status}</p>
              <p>
                {r.application_created
                  ? "Application Submitted"
                  : "No Application Yet"}
              </p>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
