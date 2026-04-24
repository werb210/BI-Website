import { FormEvent, useMemo, useState } from "react";
import { apiPost } from "../lib/api";
import BIAuthGate from "../components/BIAuthGate";
import { getAuthUser, AuthUser } from "../lib/auth";

type ReferralForm = {
  company: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

const initialForm: ReferralForm = {
  company: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
};

export default function Referral() {
  const [user, setUser] = useState<AuthUser | null>(getAuthUser());
  const [form, setForm] = useState<ReferralForm>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const payload = useMemo(
    () => ({
      ...form,
      tag: "BI_REFERRAL",
      submittedAt: new Date().toISOString(),
      source: "referral_portal",
    }),
    [form],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setLoading(true);
    try {
      await apiPost("/api/v1/bi/referrer/add-referral", {
        company_name: form.company,
        full_name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        phone: form.phone
      });
      setSubmitted(true);
      setForm(initialForm);
    } catch {
      setSubmitted(false);
      setError("Unable to submit referral right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <main className="min-h-screen bg-[#07182E] p-10 text-white">
        <BIAuthGate userType="referrer" onVerified={setUser} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07182E] p-10 text-white">
      <div className="mx-auto max-w-2xl rounded-lg border border-white/10 bg-white/5 p-8">
        <h1 className="mb-2 text-3xl font-semibold">Referral Portal</h1>
        <p className="mb-8 text-white/80">Refer your contacts and get paid</p>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <input
            required
            value={form.company}
            placeholder="Company"
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            className="rounded border border-white/20 bg-[#0A2348] px-3 py-2"
          />
          <input
            required
            value={form.firstName}
            placeholder="First Name"
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            className="rounded border border-white/20 bg-[#0A2348] px-3 py-2"
          />
          <input
            required
            value={form.lastName}
            placeholder="Last Name"
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            className="rounded border border-white/20 bg-[#0A2348] px-3 py-2"
          />
          <input
            required
            type="email"
            value={form.email}
            placeholder="Email"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="rounded border border-white/20 bg-[#0A2348] px-3 py-2"
          />
          <input
            required
            type="tel"
            value={form.phone}
            placeholder="Phone"
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="rounded border border-white/20 bg-[#0A2348] px-3 py-2"
          />

          <button type="submit" disabled={loading} className="rounded bg-blue-600 p-3 font-semibold transition hover:bg-blue-700 disabled:opacity-60">
            {loading ? "Submitting..." : "Add Referral"}
          </button>
        </form>

        {submitted && (
          <p className="mt-4 text-sm text-green-300">Referral submitted and queued for CRM sync.</p>
        )}
        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
      </div>
    </main>
  );
}
