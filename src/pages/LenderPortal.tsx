import { useEffect, useMemo, useState } from "react";
import BIAuthGate from "../components/BIAuthGate";
import LoadingButton from "../components/LoadingButton";
import { apiGet, apiPost } from "../lib/api";
import { getAuthUser, AuthUser } from "../lib/auth";
import { emailValid, phoneValid, required } from "../lib/validation";
import { PGI_STAGE_LABEL } from "../lib/pgiStages";

type LenderApp = {
  id: string;
  stage: string;
  primary_contact_name: string | null;
  company_name: string | null;
  premium_calc: { annualPremium?: number } | null;
  created_at: string;
};

type LenderProfile = {
  company_name: string | null;
  rep_full_name: string | null;
  rep_email: string | null;
} | null;

const initialAppForm = {
  business_name: "",
  guarantor_name: "",
  guarantor_email: "",
  guarantor_phone: "",
  lender_name: "",
  form_data: {
    country: "CA" as "CA" | "US",
    naics_code: "",
    formation_date: "",
    loan_amount: 0,
    pgi_limit: 0,
    annual_revenue: 0,
    ebitda: 0,
    total_debt: 0,
    monthly_debt_service: 0,
    collateral_value: 0,
    enterprise_value: 0,
    bankruptcy_history: false,
    insolvency_history: false,
    judgment_history: false
  }
};

export default function LenderPortal() {
  const [user, setUser] = useState<AuthUser | null>(getAuthUser());
  const [profile, setProfile] = useState<LenderProfile>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const [profileForm, setProfileForm] = useState({
    full_name: "",
    company_name: "",
    email: "",
    phone: ""
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [apps, setApps] = useState<LenderApp[]>([]);
  const [showAppModal, setShowAppModal] = useState(false);
  const [appForm, setAppForm] = useState(initialAppForm);
  const [submittingApp, setSubmittingApp] = useState(false);
  const [appError, setAppError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    void loadProfile();
  }, [user]);

  async function loadProfile() {
    try {
      const res = await apiGet<{ profile: LenderProfile }>("/api/v1/bi/lender/me");
      setProfile(res.profile);
      if (res.profile) {
        await loadApps();
      } else {
        setProfileForm({
          full_name: user?.name ?? "",
          company_name: "",
          email: user?.email ?? "",
          phone: user?.phone ?? ""
        });
      }
    } catch {
      setProfile(null);
    } finally {
      setProfileLoaded(true);
    }
  }

  async function loadApps() {
    try {
      const res = await apiGet<LenderApp[]>("/api/v1/bi/lender/applications");
      setApps(res || []);
    } catch {
      setApps([]);
    }
  }

  async function saveProfile() {
    const { full_name, company_name, email, phone } = profileForm;
    if (!required(full_name) || !required(company_name) || !emailValid(email) || !phoneValid(phone)) {
      setProfileError("Complete all fields with valid email and phone.");
      return;
    }
    setSavingProfile(true);
    setProfileError(null);
    try {
      await apiPost("/api/v1/bi/lender/profile", { full_name, company_name, email, phone });
      await loadProfile();
    } catch (e) {
      setProfileError(e instanceof Error ? e.message : "Failed to save profile");
    } finally {
      setSavingProfile(false);
    }
  }

  const updateAppTop = (k: keyof typeof initialAppForm, v: string) =>
    setAppForm((f) => ({ ...f, [k]: v }));
  const updateAppFd = (k: keyof typeof initialAppForm.form_data, v: number | string | boolean) =>
    setAppForm((f) => ({ ...f, form_data: { ...f.form_data, [k]: v } }));

  const appFormValid = useMemo(() => {
    const f = appForm;
    const fd = f.form_data;
    return (
      required(f.business_name) &&
      required(f.guarantor_name) &&
      emailValid(f.guarantor_email) &&
      phoneValid(f.guarantor_phone) &&
      required(f.lender_name) &&
      /^\d{6}$/.test(fd.naics_code) &&
      required(fd.formation_date) &&
      fd.loan_amount > 0 &&
      fd.pgi_limit > 0 &&
      fd.pgi_limit <= fd.loan_amount
    );
  }, [appForm]);

  async function submitApp() {
    if (!appFormValid) {
      setAppError("Complete all fields. PGI limit must be ≤ loan amount.");
      return;
    }
    setSubmittingApp(true);
    setAppError(null);
    try {
      await apiPost("/api/v1/bi/lender/application", appForm);
      setAppForm(initialAppForm);
      setShowAppModal(false);
      await loadApps();
    } catch (e) {
      setAppError(e instanceof Error ? e.message : "Failed to submit application");
    } finally {
      setSubmittingApp(false);
    }
  }

  const numInput = (k: keyof typeof initialAppForm.form_data, label: string) => (
    <label key={String(k)} className="block">
      <span className="mb-1 block text-xs">{label}</span>
      <input
        className="input w-full"
        type="number"
        min={0}
        value={(appForm.form_data[k] as number) || ""}
        onChange={(e) => updateAppFd(k, Number(e.target.value))}
      />
    </label>
  );

  if (!user) {
    return (
      <main className="min-h-screen bg-[#07182E] p-10 text-white">
        <BIAuthGate userType="lender" onVerified={setUser} />
      </main>
    );
  }

  if (!profileLoaded) {
    return <main className="min-h-screen bg-[#07182E] p-10 text-white">Loading…</main>;
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-[#07182E] p-10 text-white">
        <div className="mx-auto max-w-lg rounded-xl border border-white/10 bg-white/5 p-6">
          <h1 className="mb-4 text-2xl font-semibold">Complete your profile</h1>
          <input className="input mb-3 w-full" placeholder="Full Name"
            value={profileForm.full_name}
            onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })} />
          <input className="input mb-3 w-full" placeholder="Company Name"
            value={profileForm.company_name}
            onChange={(e) => setProfileForm({ ...profileForm, company_name: e.target.value })} />
          <input className="input mb-3 w-full" type="email" placeholder="Email"
            value={profileForm.email}
            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} />
          {/* OTP-verified phone from auth is the source of truth; keep read-only here. */}
          <input className="input mb-4 w-full" type="tel" placeholder="Mobile phone"
            value={profileForm.phone}
            readOnly />
          {profileError && <p className="mb-3 text-sm text-red-300">{profileError}</p>}
          <LoadingButton loading={savingProfile} onClick={saveProfile}>Continue</LoadingButton>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07182E] p-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Lender Portal</h1>
          <button
            type="button"
            className="rounded bg-blue-600 px-4 py-2 font-semibold hover:bg-blue-700"
            onClick={() => setShowAppModal(true)}
          >
            Add Application
          </button>
        </div>

        <section className="rounded border border-white/10 bg-white/5 p-6">
          <h2 className="mb-3 text-lg font-semibold">Your Applications</h2>
          {apps.length === 0 && <p className="text-sm text-white/60">No applications yet.</p>}
          <div className="space-y-2">
            {apps.map((app) => (
              <article key={app.id} className="flex items-center justify-between rounded border border-white/10 p-3">
                <div>
                  <div className="font-medium">
                    {app.company_name || app.primary_contact_name || "Application"}
                  </div>
                  <div className="text-sm text-white/70">
                    {PGI_STAGE_LABEL[app.stage] || app.stage}
                    {" · "}
                    Premium: {app.premium_calc?.annualPremium
                      ? `$${app.premium_calc.annualPremium.toLocaleString()}`
                      : "—"}
                  </div>
                </div>
                <div className="text-xs text-white/50">
                  {new Date(app.created_at).toLocaleDateString()}
                </div>
              </article>
            ))}
          </div>
        </section>

        {showAppModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-xl bg-[#112A4D] p-6">
              <h2 className="mb-4 text-lg font-semibold">Add Application</h2>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs">Business Name</span>
                  <input className="input w-full" value={appForm.business_name}
                    onChange={(e) => updateAppTop("business_name", e.target.value)} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs">Lender Name</span>
                  <input className="input w-full" value={appForm.lender_name}
                    onChange={(e) => updateAppTop("lender_name", e.target.value)} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs">Guarantor Name</span>
                  <input className="input w-full" value={appForm.guarantor_name}
                    onChange={(e) => updateAppTop("guarantor_name", e.target.value)} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs">Guarantor Email</span>
                  <input className="input w-full" type="email" value={appForm.guarantor_email}
                    onChange={(e) => updateAppTop("guarantor_email", e.target.value)} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs">Guarantor Phone</span>
                  <input className="input w-full" type="tel" value={appForm.guarantor_phone}
                    onChange={(e) => updateAppTop("guarantor_phone", e.target.value)} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs">Country</span>
                  <select className="input w-full" value={appForm.form_data.country}
                    onChange={(e) => updateAppFd("country", e.target.value)}>
                    <option value="CA">Canada</option>
                    <option value="US">United States</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs">NAICS Code (6 digits)</span>
                  <input className="input w-full" maxLength={6} value={appForm.form_data.naics_code}
                    onChange={(e) => updateAppFd("naics_code", e.target.value.replace(/\D/g, ""))} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs">Formation Date</span>
                  <input className="input w-full" type="date" value={appForm.form_data.formation_date}
                    onChange={(e) => updateAppFd("formation_date", e.target.value)} />
                </label>
                {numInput("loan_amount", "Loan Amount")}
                {numInput("pgi_limit", "PGI Limit (≤ loan amount)")}
                {numInput("annual_revenue", "Annual Revenue")}
                {numInput("ebitda", "EBITDA")}
                {numInput("total_debt", "Total Debt")}
                {numInput("monthly_debt_service", "Monthly Debt Service")}
                {numInput("collateral_value", "Collateral Value")}
                {numInput("enterprise_value", "Enterprise Value")}
              </div>

              <div className="mt-3 flex flex-wrap gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={appForm.form_data.bankruptcy_history}
                    onChange={(e) => updateAppFd("bankruptcy_history", e.target.checked)} />
                  Bankruptcy history
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={appForm.form_data.insolvency_history}
                    onChange={(e) => updateAppFd("insolvency_history", e.target.checked)} />
                  Insolvency history
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={appForm.form_data.judgment_history}
                    onChange={(e) => updateAppFd("judgment_history", e.target.checked)} />
                  Judgment history
                </label>
              </div>

              {appError && <p className="mt-3 text-sm text-red-300">{appError}</p>}

              <div className="mt-4 flex justify-end gap-3">
                <button type="button" className="rounded border border-white/20 px-4 py-2"
                  onClick={() => setShowAppModal(false)}>Cancel</button>
                <LoadingButton loading={submittingApp} onClick={submitApp} disabled={!appFormValid}>
                  Submit
                </LoadingButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
