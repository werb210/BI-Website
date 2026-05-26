// BI_WEBSITE_BLOCK_v336_REFERRER_PORTAL_v1
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = ((import.meta as any).env?.VITE_API_URL
  || (import.meta as any).env?.VITE_BI_API_URL
  || "https://bi-server-cse0apamgkheb9d5.canadacentral-01.azurewebsites.net").replace(/\/$/, "");

export default function ReferrerAddReferral() {
  const nav = useNavigate();
  const [company, setCompany] = useState("");
  const [guarantor, setGuarantor] = useState("");
  const [phone, setPhone] = useState("");
  const [guarantorPhone, setGuarantorPhone] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const token = localStorage.getItem("bi.referrer_token") || "";
      const r = await fetch(`${API_BASE}/api/v1/referrer/referrals`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ company_name: company, guarantor_name: guarantor, phone, guarantor_phone: guarantorPhone, email }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      nav("/referrer/dashboard");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl text-white">
      <h1 className="text-2xl font-semibold mb-4">Add Referral</h1>
      <form className="space-y-3" onSubmit={onSubmit}>
        <label className="block">
          <span className="text-sm text-sky-100">Company</span>
          <input className="w-full bg-sky-500/15 border border-sky-300/40 text-white placeholder:text-sky-100/50 rounded px-3 py-2" value={company} onChange={(e) => setCompany(e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm text-sky-100">Guarantor</span>
          <input className="w-full bg-sky-500/15 border border-sky-300/40 text-white placeholder:text-sky-100/50 rounded px-3 py-2" value={guarantor} onChange={(e) => setGuarantor(e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm text-sky-100">Phone</span>
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+1 (555) 555-5555"
            className="w-full bg-sky-500/15 border border-sky-300/40 text-white placeholder:text-sky-100/50 rounded px-3 py-2"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-sm text-sky-100">Guarantor phone</span>
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+1 (555) 555-5555"
            className="w-full bg-sky-500/15 border border-sky-300/40 text-white placeholder:text-sky-100/50 rounded px-3 py-2"
            value={guarantorPhone}
            onChange={(e) => setGuarantorPhone(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-sm text-sky-100">Email</span>
          <input className="w-full bg-sky-500/15 border border-sky-300/40 text-white placeholder:text-sky-100/50 rounded px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        {error && <div className="text-sm text-rose-300">{error}</div>}
        <button className="px-4 py-2 bg-sky-500 rounded" disabled={busy}>{busy ? "Saving…" : "Save referral"}</button>
      </form>
    </div>
  );
}
