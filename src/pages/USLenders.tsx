// BI_WEBSITE_US_LENDERS_v1 - the United States page for banks and commercial loan brokers: what Personal Guarantee
// Insurance is, the OCC's interpretive letter on it, how to introduce a borrower, and how to reach us. Its QR code
// (public/qr-us-lenders.svg) points back to this page, for handing out at events.
// Nothing here names an underwriter or a compensation arrangement: those are added once the carrier confirms them.
import { useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/request";
import { track } from "../lib/analytics";
import { emailValid, phoneValid, required } from "../lib/validation";
import { OPERATOR_PHONE_DISPLAY, OPERATOR_PHONE_HREF } from "../lib/operator";

export const OCC_LETTER_URL = "https://www.occ.gov/topics/charters-and-licensing/interpretations-and-decisions/2026/int1194.pdf";
export const US_LENDERS_CONSENT = "I agree that Boreal Risk Management may contact me by phone, email or text about this inquiry.";
const ROLES = ["Bank", "Credit union", "Commercial loan broker", "Other lender"];

type Form = { name: string; institution: string; role: string; email: string; phone: string; consent: boolean };
const EMPTY: Form = { name: "", institution: "", role: ROLES[0]!, email: "", phone: "", consent: false };

export function usLendersErrors(f: Form): string[] {
  const e: string[] = [];
  if (!required(f.name)) e.push("Enter your full name.");
  if (!required(f.institution)) e.push("Enter your bank or brokerage.");
  if (!emailValid(f.email.trim())) e.push("Enter a valid email address.");
  if (!phoneValid(f.phone.replace(/[^\d+]/g, ""))) e.push("Enter a valid phone number.");
  if (!f.consent) e.push("Tick the box so we can contact you.");
  return e;
}

const H2 = "text-2xl font-bold text-[#0B1F3A]";
const BODY = "mt-3 text-bf-body";
const INPUT = "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[#0B1F3A]";
const LABEL = "block text-sm font-semibold text-[#0B1F3A]";

export default function USLenders() {
  const [form, setForm] = useState<Form>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    const errors = usLendersErrors(form);
    if (errors.length) { setStatus({ ok: false, text: errors.join(" ") }); return; }
    setBusy(true); setStatus(null);
    try {
      await apiRequest("/api/v1/crm/lead", {
        method: "POST",
        body: JSON.stringify({
          company: `${form.institution.trim()} (${form.role}) - US lender page`,
          name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(),
          casl_consent: true, casl_consent_text: US_LENDERS_CONSENT,
        }),
      });
      track("us_lenders_inquiry");
      setForm(EMPTY);
      setStatus({ ok: true, text: "Thank you. We will be in touch within one business day." });
    } catch {
      setStatus({ ok: false, text: `We could not send that. Please try again, or call us at ${OPERATOR_PHONE_DISPLAY}.` });
    } finally { setBusy(false); }
  }

  return (
    <main className="min-h-screen bg-white text-[#0B1F3A]" data-testid="us-lenders">
      <section className="bg-bf-bg">
        <div className="mx-auto max-w-5xl px-5 py-16 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-bf-cta">For United States banks and commercial loan brokers</p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">Give your borrowers a way to insure the personal guarantee.</h1>
          <p className="mx-auto mt-4 max-w-3xl text-base text-bf-textMuted sm:text-lg">Personal Guarantee Insurance (PGI) covers the person who signs the guarantee on a business loan. You introduce the borrower. We take it from there, and we are your contact from first question to policy.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a href="#talk" className="bf-btn bf-btn--primary">Talk to us</a>
            <a href="#how" className="bf-btn bf-btn--secondary">How it works</a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-14">
        <h2 className={H2}>What PGI is</h2>
        <p className={BODY}>When a business borrows, the lender usually asks the owners to guarantee the loan personally. If the business cannot repay, the guarantee is called and the owner&apos;s home and savings are on the line. PGI is insurance for that guarantor: if the guarantee is called and a covered claim is made, the policy pays most of it.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[["Up to 80%", "of the enforceable personal guarantee can be covered"], ["Up to $1,000,000", "policy limit for each guarantor"], ["Minutes", "to a preliminary indication, before any full application"]].map(([a, b]) => (
            <div key={a} className="rounded-2xl border border-bf-line bg-bf-mist p-5"><div className="text-2xl font-bold">{a}</div><div className="mt-1 text-sm text-bf-body">{b}</div></div>
          ))}
        </div>
      </section>

      <section className="border-y border-bf-line bg-bf-mist">
        <div className="mx-auto max-w-5xl px-5 py-14">
          <h2 className={H2}>What the OCC has said</h2>
          <p className={BODY}>On September 3, 2026 the Office of the Comptroller of the Currency published Interpretive Letter 1194. A national bank asked whether it could offer PGI, as an optional product, to its commercial loan customers. The OCC&apos;s Chief Counsel&apos;s Office concluded that PGI is credit-related insurance, an authorized product under section 302 of the Gramm-Leach-Bliley Act, and that offering it as proposed is permissible for a national bank under 12 U.S.C. 24(Seventh).</p>
          <p className={BODY}>The letter also notes that a guarantor&apos;s financial strength is part of loan underwriting, and that a risk mitigant such as PGI supports the payment a guarantor would otherwise owe.</p>
          <p className="mt-4"><a href={OCC_LETTER_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#1e3a8a] underline">Read OCC Interpretive Letter 1194 (PDF)</a></p>
          <p className="mt-4 rounded-xl border border-bf-line bg-white p-4 text-sm text-bf-body">The letter is limited to the facts that bank presented, and the OCC says different facts could lead to a different conclusion. It speaks to national banks. Whether and how your institution may offer PGI depends on your charter, your state and your own counsel&apos;s advice. This page is information, not legal advice.</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-14">
        <h2 className={H2}>Why lenders and brokers bring it up</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {[
            ["Fewer deals lost at the guarantee", "The personal guarantee is where many approved loans stall. An insured guarantee is easier to sign."],
            ["A stronger guarantor behind the loan", "A guarantor with cover in place is better able to meet the guarantee if it is ever called."],
            ["Optional for the borrower", "PGI is offered to the guarantor as a choice. It is never a condition of the loan."],
            ["Works with the loans you already make", "Term loans, lines of credit, equipment and real estate loans, acquisitions, and SBA loans."],
          ].map(([t, d]) => (<li key={t} className="rounded-2xl border border-bf-line p-5"><div className="font-semibold">{t}</div><div className="mt-1 text-sm text-bf-body">{d}</div></li>))}
        </ul>
      </section>

      <section id="how" className="border-y border-bf-line bg-bf-mist">
        <div className="mx-auto max-w-5xl px-5 py-14">
          <h2 className={H2}>How it works with Boreal</h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["1", "You introduce the borrower", "Share your link or QR code, enter the file in the lender portal, or send it through our API."],
              ["2", "The guarantor gets an indication", "A few questions about the loan and the business, and an indicative premium in minutes."],
              ["3", "Underwriting", "The guarantor completes the application and uploads documents. The insurer underwrites and issues the policy."],
              ["4", "You are kept informed", "You see the status of every file you introduced, and the guarantor can share proof of cover with you."],
            ].map(([n, t, d]) => (<li key={n} className="rounded-2xl border border-bf-line bg-white p-5"><div className="text-xl font-bold text-bf-ctaInk">{n}</div><div className="mt-1 font-semibold">{t}</div><div className="mt-1 text-sm text-bf-body">{d}</div></li>))}
          </ol>
          <p className="mt-6 text-sm text-bf-body">Who qualifies: businesses with at least $50,000 of EBITDA and 12 months of revenue history. Each guarantor is underwritten and insured separately.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link to="/lender/login" className="bf-btn bf-btn--secondary !border-[#0B1F3A] !text-[#0B1F3A]">Lender portal</Link>
            <Link to="/sba" className="bf-btn bf-btn--secondary !border-[#0B1F3A] !text-[#0B1F3A]">PGI on an SBA loan</Link>
          </div>
        </div>
      </section>

      <section id="talk" className="mx-auto max-w-5xl px-5 py-14">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className={H2}>Talk to us</h2>
            <p className={BODY}>Tell us who you are and we will call you back within one business day to set you up and answer your questions.</p>
            <p className="mt-4 text-lg font-semibold"><a href={OPERATOR_PHONE_HREF} className="underline" style={{ color: "#0B1F3A" }}>{OPERATOR_PHONE_DISPLAY}</a></p>
            <p className="text-sm text-bf-body">Monday to Friday, 10am to 8pm Eastern</p>
            <div className="mt-8 flex items-center gap-4 rounded-2xl border border-bf-line p-4">
              <img src="/qr-us-lenders.svg" alt="QR code for this page" width={132} height={132} className="h-[132px] w-[132px] flex-none" />
              <div><div className="font-semibold">Share this page</div><div className="mt-1 text-sm text-bf-body">Point a phone camera at the code to open boreal.insure/us-lenders.</div></div>
            </div>
          </div>
          <form onSubmit={submit} noValidate className="rounded-2xl border border-bf-line bg-bf-mist p-6" aria-label="Talk to us">
            <label className={LABEL}>Your name<input className={INPUT} name="name" autoComplete="name" value={form.name} onChange={(e) => set("name", e.target.value)} /></label>
            <label className={`${LABEL} mt-4`}>Bank or brokerage<input className={INPUT} name="organization" autoComplete="organization" value={form.institution} onChange={(e) => set("institution", e.target.value)} /></label>
            <label className={`${LABEL} mt-4`}>You are a<select className={INPUT} name="role" value={form.role} onChange={(e) => set("role", e.target.value)}>{ROLES.map((r) => <option key={r}>{r}</option>)}</select></label>
            <label className={`${LABEL} mt-4`}>Email<input className={INPUT} type="email" name="email" autoComplete="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></label>
            <label className={`${LABEL} mt-4`}>Phone<input className={INPUT} type="tel" name="tel" autoComplete="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} /></label>
            <label className="mt-4 flex items-start gap-3 text-sm text-bf-body"><input type="checkbox" className="mt-1 h-5 w-5 flex-none" style={{ appearance: "auto", accentColor: "#0B1F3A", background: "#fff", border: "1px solid #64748b" }} checked={form.consent} onChange={(e) => set("consent", e.target.checked)} /><span>{US_LENDERS_CONSENT}</span></label>
            <button type="submit" disabled={busy} className="bf-btn bf-btn--primary mt-5 w-full">{busy ? "Sending..." : "Request a call"}</button>
            {status ? <p role={status.ok ? "status" : "alert"} className={`mt-3 text-sm font-semibold ${status.ok ? "text-green-700" : "text-red-700"}`}>{status.text}</p> : null}
          </form>
        </div>
        <p className="mt-10 text-xs text-bf-body">Boreal Risk Management is a referral and risk advisory partner. We are not a licensed insurance broker, agent, or adviser. Insurance is arranged only through appropriately licensed insurance entities, and coverage is subject to underwriting, eligibility, policy terms, conditions and exclusions. Boreal Risk Management is not affiliated with the Office of the Comptroller of the Currency or the U.S. Small Business Administration.</p>
      </section>
    </main>
  );
}
