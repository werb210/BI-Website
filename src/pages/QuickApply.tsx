// BI_WEBSITE_QUICK_APPLY_v1 (2026-11-20) - the application rebuilt to PGI Canada Ltd.'s new short form (Todd):
// 1 Amounts, 2 the business, 3 contact details confirmed by a 6-digit code. All questions come first; the loan
// documents are asked for afterwards on /applications/:publicId/documents. Answers are kept in this browser until
// the code is confirmed, then one call (POST /applications/quick-apply) creates the application.
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, setApplicantToken } from "../lib/api";
import { NAICS_TOP } from "../data/naicsTop";

const DRAFT_KEY = "bi.quick_apply.v1";
export const LOAN_MIN = 50_000;
export const LOAN_MAX = 5_000_000;
export const GUARANTEE_MAX = 1_000_000;
export const COVER_SHARE = 0.8;
export const PURPOSES = ["Working Capital", "Acquisition", "Expansion", "Equipment Purchase", "Real Estate", "Refinance", "Other"];

type Draft = {
  loan_amount: number; guarantee_amount: number; loan_type: "" | "secured" | "unsecured";
  country: "" | "US" | "CA"; company_name: string; business_address: string; business_number: string;
  naics_code: string; naics_label: string; revenue_start: string; lender_name: string; loan_purpose: string;
  pg_signed: boolean | null; other_guarantors: boolean | null; rate_type: "" | "fixed" | "variable";
  guarantor_name: string; guarantor_email: string; phone: string;
};
const EMPTY: Draft = {
  loan_amount: 500_000, guarantee_amount: 400_000, loan_type: "", country: "", company_name: "", business_address: "",
  business_number: "", naics_code: "", naics_label: "", revenue_start: "", lender_name: "", loan_purpose: "",
  pg_signed: null, other_guarantors: null, rate_type: "", guarantor_name: "", guarantor_email: "", phone: "",
};

const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
export function toE164(raw: string): string | null {
  const d = raw.replace(/\D/g, "");
  if (d.length === 10) return `+1${d}`;
  if (d.length === 11 && d.startsWith("1")) return `+${d}`;
  return null;
}
export function step2Missing(d: Draft): string[] {
  const m: string[] = [];
  if (!d.country) m.push("country");
  if (!d.company_name.trim()) m.push("legal name");
  if (!d.business_address.trim()) m.push("operating address");
  if (!/^\d{6}$/.test(d.naics_code)) m.push("NAICS code");
  if (!/^\d{4}-\d{2}$/.test(d.revenue_start)) m.push("month revenue started");
  if (!d.lender_name.trim()) m.push("lender");
  if (!d.loan_purpose) m.push("loan purpose");
  if (d.pg_signed === null) m.push("guarantee signed");
  if (d.other_guarantors === null) m.push("other guarantors");
  if (!d.rate_type) m.push("fixed or variable rate");
  return m;
}

const card: CSSProperties = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 28, boxShadow: "0 4px 16px rgba(15,23,42,0.06)" };
const input: CSSProperties = { width: "100%", padding: "12px 14px", fontSize: 16, border: "1px solid #cbd5e1", borderRadius: 8, boxSizing: "border-box", color: "#0f172a", background: "#fff" };
const primary = (disabled: boolean): CSSProperties => ({ width: "100%", padding: "14px 20px", fontSize: 17, fontWeight: 700, background: "#BF9B49", color: "#0B1F3A", border: 0, borderRadius: 999, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1, marginTop: 8 });

function Q({ label, hint, children, required = true }: { label: string; hint?: string; children: ReactNode; required?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 600, color: "#0f172a", marginBottom: 6 }}>
        <span>{label}{required && <span style={{ color: "#b91c1c" }}> *</span>}</span>
        {hint && <button type="button" aria-label={`About: ${label}`} onClick={() => setOpen((o) => !o)} style={{ width: 18, height: 18, borderRadius: 999, border: "1px solid #94a3b8", background: "#fff", fontSize: 11, lineHeight: "16px", padding: 0, cursor: "pointer", color: "#475569" }}>?</button>}
      </div>
      {open && hint && <div style={{ fontSize: 13, color: "#475569", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 10px", marginBottom: 6 }}>{hint}</div>}
      {children}
    </div>
  );
}

function Choice<T extends string | boolean>({ value, options, onChange }: { value: T | null | ""; options: Array<[T, string]>; onChange: (v: T) => void }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${options.length}, 1fr)`, gap: 8 }}>
      {options.map(([v, label]) => (
        <button key={String(v)} type="button" aria-pressed={value === v} onClick={() => onChange(v)}
          style={{ padding: "12px 10px", fontSize: 15, borderRadius: 8, cursor: "pointer", border: value === v ? "2px solid #0B1F3A" : "1px solid #cbd5e1", background: value === v ? "#0B1F3A" : "#fff", color: value === v ? "#fff" : "#0f172a", fontWeight: 600 }}>
          {label}
        </button>
      ))}
    </div>
  );
}

function Steps({ step }: { step: 1 | 2 | 3 }) {
  const items = ["Amounts", "Business", "Contact", "Documents"];
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 6, flexWrap: "wrap", margin: "8px 0 20px" }} data-testid="qa-steps">
      {items.map((label, i) => (
        <div key={label} aria-current={i + 1 === step ? "step" : undefined} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 999, border: i + 1 === step ? "1px solid #BF9B49" : "1px solid #cbd5e1", backgroundColor: i + 1 === step ? "#BF9B49" : "#fff", color: i + 1 === step ? "#0B1F3A" : "#475569", fontWeight: i + 1 === step ? 700 : 400 }}>{i + 1} {label}</div>
      ))}
    </div>
  );
}

export default function QuickApply() {
  const nav = useNavigate();
  const [d, setD] = useState<Draft>(() => {
    try { const raw = localStorage.getItem(DRAFT_KEY); if (raw) return { ...EMPTY, ...JSON.parse(raw) }; } catch { /* fresh start */ }
    return EMPTY;
  });
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [codeSentTo, setCodeSentTo] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [naicsOpen, setNaicsOpen] = useState(false);
  const [naicsQuery, setNaicsQuery] = useState("");

  useEffect(() => { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(d)); } catch { /* not saved */ } }, [d]);
  useEffect(() => { try { window.scrollTo(0, 0); } catch { /* not available */ } setErr(null); }, [step]);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((cur) => {
    const next = { ...cur, [k]: v };
    if (k === "loan_amount" && next.guarantee_amount > Number(v)) next.guarantee_amount = Math.max(LOAN_MIN, Number(v));
    return next;
  });
  const guaranteeMax = Math.min(GUARANTEE_MAX, d.loan_amount);
  const naicsResults = useMemo(() => {
    const q = naicsQuery.trim().toLowerCase();
    return q ? NAICS_TOP.filter((e) => e.code.includes(q) || e.title.toLowerCase().includes(q)).slice(0, 20) : [];
  }, [naicsQuery]);
  const missing2 = step2Missing(d);
  const phoneE164 = toE164(d.phone);
  const step3Ready = !!d.guarantor_name.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.guarantor_email.trim()) && !!phoneE164;

  async function sendCode() {
    if (!phoneE164) return;
    setErr(null); setBusy(true);
    try { await api.applicantOtpStart(phoneE164); setCodeSentTo(phoneE164); setCode(""); }
    catch (e: any) { setErr(e?.message === "rate_limited" ? "Too many codes requested. Wait a minute and try again." : "We could not send the code. Check the number and try again."); }
    finally { setBusy(false); }
  }

  async function confirmAndCreate() {
    if (!codeSentTo || code.length !== 6) return;
    setErr(null); setBusy(true);
    try {
      const { token } = await api.applicantOtpVerify(codeSentTo, code);
      if (token) setApplicantToken(token);
      let ref_code: string | undefined;
      try { ref_code = localStorage.getItem("bi.referral_code") || undefined; } catch { /* none */ }
      const r = await api.quickApply({
        loan_amount: d.loan_amount, guarantee_amount: d.guarantee_amount, loan_type: d.loan_type, country: d.country,
        company_name: d.company_name, business_address: d.business_address, business_number: d.business_number,
        naics_code: d.naics_code, naics_label: d.naics_label, revenue_start: d.revenue_start, lender_name: d.lender_name,
        loan_purpose: d.loan_purpose, pg_signed: d.pg_signed, other_guarantors: d.other_guarantors, rate_type: d.rate_type,
        guarantor_name: d.guarantor_name, guarantor_email: d.guarantor_email, code_channel: "sms", ref_code,
      });
      try { localStorage.removeItem(DRAFT_KEY); } catch { /* noop */ }
      nav(`/applications/${r.public_id}/documents`);
    } catch (e: any) {
      const data = e?.data ?? {};
      if (data.error === "quebec_not_available") setErr("Personal Guarantee Insurance is not available to Quebec businesses.");
      else if (data.error === "validation_failed") setErr(`Please check: ${(data.issues ?? []).map((i: { field: string }) => i.field.replace(/_/g, " ")).join(", ")}.`);
      else if (e?.status === 400 || e?.status === 401) setErr("That code did not work. Check it, or send a new one.");
      else setErr("Something went wrong. Please try again.");
    } finally { setBusy(false); }
  }

  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: "24px 16px 64px" }}>
      <Steps step={step} />

      {step === 1 && (
        <div style={card} data-testid="qa-step-1">
          <h1 style={{ fontSize: 28, margin: "0 0 6px", color: "#0B1F3A" }}>Cover your guarantee</h1>
          <p style={{ margin: "0 0 20px", color: "#475569" }}>Start with two numbers. Your loan documents come later.</p>

          <Q label="Loan amount">
            <div style={{ display: "flex", justifyContent: "flex-end", fontSize: 26, fontWeight: 700, color: "#0B1F3A" }} data-testid="qa-loan-value">{money(d.loan_amount)}</div>
            <input type="range" min={LOAN_MIN} max={LOAN_MAX} step={10_000} value={d.loan_amount} onChange={(e) => set("loan_amount", Number(e.target.value))} aria-label="Loan amount" style={{ width: "100%" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b" }}><span>{money(LOAN_MIN)}</span><span>{money(LOAN_MAX)}</span></div>
          </Q>

          <Q label="Personal guarantee amount">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontSize: 18, color: "#0f172a" }}>{money(d.guarantee_amount)}</span>
              <span style={{ fontSize: 26, fontWeight: 700, color: "#0B1F3A" }} data-testid="qa-cover-value">{money(d.guarantee_amount * COVER_SHARE)}</span>
            </div>
            <div style={{ textAlign: "right", fontSize: 12, color: "#64748b" }}>Covered up to {Math.round(COVER_SHARE * 100)}%</div>
            <input type="range" min={LOAN_MIN} max={guaranteeMax} step={10_000} value={Math.min(d.guarantee_amount, guaranteeMax)} onChange={(e) => set("guarantee_amount", Number(e.target.value))} aria-label="Personal guarantee amount" style={{ width: "100%" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b" }}><span>{money(LOAN_MIN)}</span><span>{money(guaranteeMax)}</span></div>
          </Q>

          <Q label="What type of loan are we securing?" hint="Whether the lender holds security (collateral) for the loan.">
            <select value={d.loan_type} onChange={(e) => set("loan_type", e.target.value as Draft["loan_type"])} style={input} data-testid="qa-loan-type">
              <option value="">Select</option>
              <option value="secured">Secured</option>
              <option value="unsecured">Unsecured</option>
            </select>
          </Q>

          <button type="button" disabled={!d.loan_type} onClick={() => setStep(2)} style={primary(!d.loan_type)} data-testid="qa-next-1">Continue</button>
          <p style={{ textAlign: "center", fontSize: 13, color: "#64748b", marginTop: 14 }}>Currently available in Canada, excluding Quebec.</p>
        </div>
      )}

      {step === 2 && (
        <div style={card} data-testid="qa-step-2">
          <button type="button" onClick={() => setStep(1)} style={{ background: "none", border: 0, color: "#475569", cursor: "pointer", padding: 0, marginBottom: 8 }}>← Back</button>
          <h1 style={{ fontSize: 28, margin: "0 0 6px", color: "#0B1F3A" }}>Tell us about the business</h1>
          <p style={{ margin: "0 0 20px", color: "#475569" }}>Only what is needed to price the guarantee.</p>

          <Q label="Which country is the loan agreement based?">
            <Choice value={d.country} options={[["US", "USA"], ["CA", "Canada"]]} onChange={(v) => set("country", v)} />
          </Q>
          <Q label="What is the legal name of the business?" hint="Must match the loan documents exactly.">
            <input style={input} value={d.company_name} onChange={(e) => set("company_name", e.target.value)} autoComplete="organization" />
          </Q>
          <Q label="What is the business operating address?" hint="Used for risk assessment and regulatory filings.">
            <input style={input} value={d.business_address} onChange={(e) => set("business_address", e.target.value)} placeholder="Street, city, province, postal code" autoComplete="street-address" />
          </Q>
          <Q label="What is the business number (BN)?" hint="Optional, but highly recommended. It helps verify the business." required={false}>
            <input style={input} value={d.business_number} onChange={(e) => set("business_number", e.target.value)} inputMode="numeric" />
          </Q>
          <Q label="What is the NAICS code for the business?" hint="Only approved industries are listed. If the industry is not listed, coverage cannot be offered.">
            <button type="button" onClick={() => setNaicsOpen(true)} style={{ ...input, textAlign: "left", cursor: "pointer", color: d.naics_code ? "#0f172a" : "#94a3b8" }} data-testid="qa-naics">
              {d.naics_code ? `${d.naics_code} — ${d.naics_label}` : "Choose the closest match"}
            </button>
          </Q>
          <Q label="What month and year did this business start generating revenue?" hint="Business age is a key factor in risk assessment.">
            <input type="month" style={input} value={d.revenue_start} max={new Date().toISOString().slice(0, 7)} onChange={(e) => set("revenue_start", e.target.value)} data-testid="qa-revenue-start" />
          </Q>
          <Q label="Who is the lender?" hint="The lending institution.">
            <input style={input} value={d.lender_name} onChange={(e) => set("lender_name", e.target.value)} />
          </Q>
          <Q label="What is the purpose of the loan?">
            <select style={input} value={d.loan_purpose} onChange={(e) => set("loan_purpose", e.target.value)}>
              <option value="">Select</option>
              {PURPOSES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </Q>
          <Q label="Has the personal guarantee been signed yet?" hint="Whether the guarantee document has already been signed.">
            <Choice value={d.pg_signed} options={[[true, "Yes"], [false, "No"]]} onChange={(v) => set("pg_signed", v)} />
          </Q>
          <Q label="Are there other guarantors on this loan?" hint="Other guarantors may share the liability.">
            <Choice value={d.other_guarantors} options={[[true, "Yes"], [false, "No"]]} onChange={(v) => set("other_guarantors", v)} />
          </Q>
          <Q label="Is the interest rate fixed or variable?" hint="Variable rates may affect future debt payments.">
            <select style={input} value={d.rate_type} onChange={(e) => set("rate_type", e.target.value as Draft["rate_type"])}>
              <option value="">Select</option>
              <option value="fixed">Fixed</option>
              <option value="variable">Variable</option>
            </select>
          </Q>

          {missing2.length > 0 && <p style={{ fontSize: 13, color: "#64748b" }} data-testid="qa-missing">Still needed: {missing2.join(", ")}.</p>}
          <button type="button" disabled={missing2.length > 0} onClick={() => setStep(3)} style={primary(missing2.length > 0)} data-testid="qa-next-2">Continue</button>
        </div>
      )}

      {step === 3 && (
        <div style={card} data-testid="qa-step-3">
          <button type="button" onClick={() => setStep(2)} style={{ background: "none", border: 0, color: "#475569", cursor: "pointer", padding: 0, marginBottom: 8 }}>← Back</button>
          <h1 style={{ fontSize: 28, margin: "0 0 6px", color: "#0B1F3A" }}>Where should we reach you?</h1>
          <p style={{ margin: "0 0 20px", color: "#475569" }}>After this, we ask for your loan documents.</p>

          <Q label="Personal guarantor's full legal name">
            <input style={input} value={d.guarantor_name} onChange={(e) => set("guarantor_name", e.target.value)} autoComplete="name" />
          </Q>
          <Q label="What is your email address?">
            <input type="email" style={input} value={d.guarantor_email} onChange={(e) => set("guarantor_email", e.target.value)} autoComplete="email" />
          </Q>
          <Q label="What is your phone number?">
            <input type="tel" style={input} value={d.phone} onChange={(e) => { set("phone", e.target.value); setCodeSentTo(null); }} autoComplete="tel" placeholder="(555) 000-0000" />
          </Q>

          {!codeSentTo ? (
            <>
              <p style={{ fontSize: 13, color: "#64748b" }}>We text a 6-digit code to this number to confirm it is you.</p>
              <button type="button" disabled={!step3Ready || busy} onClick={() => void sendCode()} style={primary(!step3Ready || busy)} data-testid="qa-send-code">{busy ? "Sending…" : "Send code by text"}</button>
            </>
          ) : (
            <>
              <Q label={`Enter the 6-digit code sent to ${d.phone}`}>
                <input style={{ ...input, letterSpacing: 6, fontSize: 22, textAlign: "center" }} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" autoFocus data-testid="qa-code" />
              </Q>
              <button type="button" disabled={code.length !== 6 || busy} onClick={() => void confirmAndCreate()} style={primary(code.length !== 6 || busy)} data-testid="qa-confirm">{busy ? "Checking…" : "Confirm and continue to documents"}</button>
              <button type="button" disabled={busy} onClick={() => void sendCode()} style={{ background: "none", border: 0, color: "#0B1F3A", textDecoration: "underline", cursor: "pointer", marginTop: 10, width: "100%" }}>Send a new code</button>
            </>
          )}
          <p style={{ fontSize: 12, color: "#64748b", marginTop: 14 }}>
            By continuing you agree to our <Link to="/terms">terms</Link> and <Link to="/privacy">privacy policy</Link>. We use your details only to prepare your application.
          </p>
        </div>
      )}

      {err && <div role="alert" style={{ marginTop: 12, color: "#b91c1c", fontSize: 14, textAlign: "center" }}>{err}</div>}

      {naicsOpen && (
        <div role="dialog" aria-label="NAICS code lookup" style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 50 }} onClick={() => setNaicsOpen(false)}>
          <div style={{ ...card, width: "100%", maxWidth: 480, maxHeight: "80vh", overflow: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, fontSize: 20, color: "#0B1F3A" }}>NAICS code lookup</h2>
              <button type="button" aria-label="Close" onClick={() => setNaicsOpen(false)} style={{ background: "none", border: 0, fontSize: 20, cursor: "pointer" }}>×</button>
            </div>
            <p style={{ fontSize: 13, color: "#64748b" }}>Only approved industries are shown.</p>
            <input style={input} autoFocus value={naicsQuery} onChange={(e) => setNaicsQuery(e.target.value)} placeholder="Find the business's industry" data-testid="qa-naics-search" />
            {naicsQuery.trim() === "" ? (
              <p style={{ fontSize: 13, color: "#64748b", textAlign: "center", marginTop: 16 }}>Start typing to search. If the industry is not here, coverage cannot be offered.</p>
            ) : naicsResults.length === 0 ? (
              <p style={{ fontSize: 13, color: "#64748b", textAlign: "center", marginTop: 16 }}>No approved industry matches.</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: "12px 0 0" }}>
                {naicsResults.map((n) => (
                  <li key={n.code}>
                    <button type="button" onClick={() => { set("naics_code", n.code); set("naics_label", n.title); setNaicsOpen(false); setNaicsQuery(""); }}
                      style={{ width: "100%", textAlign: "left", padding: "10px 8px", border: 0, borderBottom: "1px solid #f1f5f9", background: "#fff", cursor: "pointer" }}>
                      <strong>{n.code}</strong> — {n.title}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
