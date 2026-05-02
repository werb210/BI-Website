import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { CoreBadge } from "../components/CoreBadge";
import { Section } from "../components/Section";
import { UploadAndScrape } from "../components/UploadAndScrape";

const ENTITY_TYPES = [
  ["sole_proprietorship", "Sole Proprietorship"],
  ["partnership", "Partnership"],
  ["corporation", "Corporation"],
  ["llc", "LLC"],
  ["other", "Other"],
];
const LOAN_PURPOSES = [
  ["working_capital", "Working capital"],
  ["equipment", "Equipment purchase"],
  ["expansion", "Business expansion"],
  ["acquisition", "Business acquisition"],
  ["real_estate", "Real estate"],
  ["refinance", "Refinance existing debt"],
  ["other", "Other"],
];

type State = Record<string, any>;

export default function Application() {
  const { publicId } = useParams<{ publicId: string }>();
  const nav = useNavigate();
  const [s, setS] = useState<State>({});
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api.getApp(publicId!).then((r) => {
      if (r.application.score_decision !== "approve") { nav("/"); return; }
      setS(r.application);
      setLoaded(true);
    });
  }, [publicId, nav]);

  function set<K extends string>(k: K, v: any) { setS((p) => ({ ...p, [k]: v })); }
  function setConsent(k: string, v: boolean) {
    setS((p) => ({ ...p, consents: { ...(p.consents ?? {}), [k]: v } }));
  }

  async function saveDraft() {
    setBusy(true); setErr(null);
    try { await api.patchApp(publicId!, s); }
    catch (ex: any) { setErr(ex.message ?? "Save failed"); }
    finally { setBusy(false); }
  }

  async function submit() {
    setBusy(true); setErr(null);
    try {
      await api.patchApp(publicId!, s);
      await api.submit(publicId!);
      nav(`/applications/${publicId}/thanks`);
    } catch (ex: any) {
      const data = ex.data ?? {};
      if (data.fields?.length) setErr(`Missing: ${data.fields.join(", ")}`);
      else setErr(ex.message ?? "Could not submit");
    } finally {
      setBusy(false);
    }
  }

  const counts = useMemo(() => ({
    holder: [s.guarantor_name, s.guarantor_dob, s.guarantor_address, s.guarantor_email, s.guarantor_phone].filter(Boolean).length,
    business: [s.country, s.business_name, s.business_address, s.business_website, s.entity_type, s.business_number, s.naics_code, s.formation_date].filter(Boolean).length,
    loan: [s.loan_amount, s.csbfp_backed != null, s.loan_has_guaranteed_cap != null, s.pgi_limit, s.lender_name, s.loan_funding_date, s.loan_purpose, s.personally_guaranteeing != null, s.has_other_guarantors != null, s.policy_start_date].filter(Boolean).length,
    financial: [s.annual_revenue, s.ebitda, s.total_debt, s.monthly_debt_service, s.collateral_value, s.enterprise_value].filter(Boolean).length,
    risk: [s.payables_threatening != null, s.upcoming_adverse_events != null, s.bankruptcy_history != null, s.insolvency_history != null, s.personal_investigations != null, s.business_investigations != null, s.property_insurance_in_force != null, s.personal_judgments != null, s.business_judgments != null].filter(Boolean).length,
    consents: ["electronic_signature", "info_accurate", "business_solvent", "no_undisclosed_events", "data_use", "credit_pull", "coverage_understood"].filter(k => s.consents?.[k]).length,
  }), [s]);

  const totalAnswered = counts.holder + counts.business + counts.loan + counts.financial + counts.risk + counts.consents;
  const totalQuestions = 5 + 8 + 10 + 6 + 9 + 7;

  if (!loaded) return <div className="bi-card">Loading…</div>;

  return <div className="bi-app-wrap" />;
}

function Q({ n, label, children }: { n: number; label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bi-q">
      <div className="bi-q-label"><span className="bi-q-num">{n}.</span> {label}</div>
      {children}
    </div>
  );
}

function YesNo({ value, onChange }: { value: boolean | null | undefined; onChange: (v: boolean) => void }) {
  return (
    <div className="bi-yesno">
      <button type="button" className={`bi-pill ${value === true ? "selected" : ""}`} onClick={() => onChange(true)}>Yes</button>
      <button type="button" className={`bi-pill ${value === false ? "selected" : ""}`} onClick={() => onChange(false)}>No</button>
    </div>
  );
}

function Consent({ n, label, k, s, on }: { n: number; label: string; k: string; s: State; on: (k: string, v: boolean) => void }) {
  return (
    <Q n={n} label={label}>
      <label className="bi-consent">
        <input type="checkbox" checked={!!s.consents?.[k]} onChange={(e) => on(k, e.target.checked)} />
        Yes
      </label>
    </Q>
  );
}
