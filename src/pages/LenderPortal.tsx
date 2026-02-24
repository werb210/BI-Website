import { useEffect, useState } from "react";
import BIAuthGate from "../components/BIAuthGate";

export default function LenderPortal() {
  const [phone, setPhone] = useState<string | null>(null);
  const [apps, setApps] = useState<any[]>([]);
  const [form, setForm] = useState<any>({
    client_name: "",
    client_phone: "",
    facilityType: "secured",
    loanAmount: 0,
  });

  useEffect(() => {
    if (phone) {
      loadApps();
    }
  }, [phone]);

  async function loadApps() {
    if (!phone) {
      return;
    }

    const res = await fetch(`/api/bi/lender/applications?lenderUserId=${phone}`);
    const data = await res.json();
    setApps(data);
  }

  async function createApplication() {
    await fetch("/api/bi/application/draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: form.client_phone,
        data: {
          client_name: form.client_name,
          facilityType: form.facilityType,
          loanAmount: form.loanAmount,
        },
        createdBy: "lender",
      }),
    });

    loadApps();
  }

  if (!phone) {
    return <BIAuthGate userType="lender" onVerified={setPhone} />;
  }

  return (
    <div className="application-wrapper">
      <h1>Lender Portal</h1>

      <h2>Create Application</h2>

      <input
        placeholder="Client Full Name"
        value={form.client_name}
        onChange={(e) => setForm({ ...form, client_name: e.target.value })}
      />

      <input
        placeholder="Client Phone"
        value={form.client_phone}
        onChange={(e) => setForm({ ...form, client_phone: e.target.value })}
      />

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

      <button onClick={createApplication}>Create Application</button>

      <h2>Your Applications</h2>

      {apps.map((app) => (
        <div key={app.id} className="crm-card">
          <strong>{app.primary_contact_name || "Applicant"}</strong>
          <p>Stage: {app.stage}</p>
          <p>Premium: ${app.premium_calc?.annualPremium?.toLocaleString() || "-"}</p>
        </div>
      ))}
    </div>
  );
}
