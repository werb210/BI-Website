// BI_WEBSITE_US_AUDIENCE_v2 - two short United States pages, one for banks and lenders (/us-lenders) and one for
// commercial loan brokers (/us-brokers). They are opened on a phone from a rep's QR code at an event, so each one
// asks for one thing first (an email or a mobile), then says what Personal Guarantee Insurance is, what the OCC has
// said about it, and how that reader can use it: in underwriting for a lender, to win and close business for a broker.
// Nothing here names an underwriter or a compensation arrangement: those are added once the carrier confirms them.
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { bookUrlFor, contactToken, repCode } from "../lib/fieldRep";
import { apiRequest } from "../api/request";
import { track } from "../lib/analytics";
import { emailValid, phoneValid } from "../lib/validation";
import { OPERATOR_PHONE_DISPLAY, OPERATOR_PHONE_HREF } from "../lib/operator";

export const OCC_LETTER_URL = "https://www.occ.gov/topics/charters-and-licensing/interpretations-and-decisions/2026/int1194.pdf";
/** Boreal's booking page: pick a time for a phone call or a Teams meeting. */
export const BOOK_A_CALL_URL = "https://www.boreal.financial/book-pgi";
export const US_LENDERS_QUICK_CONSENT = "By sending this you agree that Boreal Risk Management may contact you about Personal Guarantee Insurance.";
/** One box takes an email address or a mobile number; null when it is neither. */
export function quickContact(raw: string): { email: string } | { phone: string } | null {
  const v = raw.trim();
  if (emailValid(v)) return { email: v };
  const digits = v.replace(/[^\d+]/g, "");
  return !v.includes("@") && phoneValid(digits) ? { phone: v } : null;
}

export type Audience = "lender" | "broker";
type Copy = {
  path: string; other: { path: string; label: string }; eyebrow: string; h1: string; lead: string; placeholder: string; leadCompany: string;
  occNote: string; useTitle: string; uses: Array<[string, string]>; steps: Array<[string, string]>; links: Array<[string, string]>;
};
export const US_COPY: Record<Audience, Copy> = {
  lender: {
    path: "/us-lenders", other: { path: "/us-brokers", label: "I am a loan broker" },
    eyebrow: "For United States banks and lenders",
    h1: "Insurance for the personal guarantee behind your loans.",
    lead: "Personal Guarantee Insurance (PGI) covers the owner who signs the guarantee on a business loan. You introduce the borrower. Your bank takes on no insurance work.",
    placeholder: "you@yourbank.com or (512) 555-0142", leadCompany: "US lender page (event)",
    occNote: "The letter also notes that a guarantor's financial strength is part of loan underwriting, and that a risk mitigant such as PGI supports the payment a guarantor would otherwise owe.",
    useTitle: "How lenders use it in underwriting",
    uses: [
      ["A stronger guarantor behind the loan", "You already weigh the guarantor's financial strength. A guarantor with cover has a source of payment if the guarantee is ever called."],
      ["Fewer approved loans lost at the guarantee", "The personal guarantee is where many approved loans stall. An insured guarantee is easier for an owner to sign."],
      ["Your credit decision stays yours", "PGI is offered to the guarantor as a choice. It is never a condition of the loan and it does not replace your underwriting."],
      ["Proof of cover for the file", "You see the status of every borrower you introduce, and the guarantor can share proof of cover with you."],
    ],
    steps: [
      ["You introduce the borrower", "By link, in the lender portal, or through our API."],
      ["The guarantor gets an indication", "A few questions, and an indicative premium in minutes."],
      ["The insurer underwrites", "The guarantor applies and uploads documents. The insurer issues the policy."],
    ],
    links: [["/lender/login", "Lender portal"], ["/sba", "PGI on an SBA loan"]],
  },
  broker: {
    path: "/us-brokers", other: { path: "/us-lenders", label: "I work at a bank or lender" },
    eyebrow: "For United States commercial loan brokers",
    h1: "Close more of the loans you get approved.",
    lead: "Personal Guarantee Insurance (PGI) covers the owner who signs the guarantee on a business loan. You introduce your client. We take it from there and keep you informed.",
    placeholder: "you@yourfirm.com or (512) 555-0142", leadCompany: "US broker page (event)",
    occNote: "For a broker, it means the banks you place loans with have a federal regulator's written view on PGI to take to their own counsel.",
    useTitle: "How it helps your brokerage",
    uses: [
      ["Fewer deals die at the guarantee", "Owners hesitate when their home and savings go on the line. With cover available, more of them sign and you close."],
      ["Something most clients have never heard", "Most business owners do not know a personal guarantee can be insured. You are the one who tells them."],
      ["No extra work for you", "Introduce the client by link. We handle the questions and the application, and you can see where each file stands."],
      ["Fits the loans you already place", "Term loans, lines of credit, equipment and real estate loans, acquisitions, and SBA loans."],
    ],
    steps: [
      ["You introduce your client", "Send your link, or tell us who to call."],
      ["Your client gets an indication", "A few questions, and an indicative premium in minutes."],
      ["The insurer underwrites", "Your client applies and uploads documents. The insurer issues the policy."],
    ],
    links: [["/sba", "PGI on an SBA loan"]],
  },
};

// BI_WEBSITE_US_FIRST_SITE_v1 - the United States terms, from PGicover's "US Lenders and Partners" one-pager (November 2026).
export const US_KEY_TERMS: Array<[string, string]> = [
  ["Up to $5,000,000", "personal guarantee cover for each guarantor"],
  ["Up to 90%", "of the guarantee on secured loans, up to 70% on unsecured loans"],
  ["From 10%", "deductible, shown in the policy schedule"],
  ["A (Excellent)", "insurer rating from AM Best"],
  ["SBA and conventional", "business loans are both eligible"],
  ["Claims-made", "cover needs an active policy and timely reporting"],
];
export const US_LENDER_WHY: Array<[string, string]> = [
  ["No insurance risk for the lender", "No captive, no capital and no new operations."],
  ["You can be named on the policy", "The lender may be named as an additional insured and can open a claim through a demand notice."],
  ["Optional for the borrower", "It is never a condition of the loan."],
  ["Separate underwriting", "The insurer does its own underwriting, separate from your credit decision."],
  ["A clear answer at signing", "Owners who hesitate at the guarantee have somewhere to go."],
];
export const US_TIMELINE: Array<[string, string]> = [
  ["Today", "Live in Canada. US lenders and brokers can set up now."],
  ["January 1, 2027", "US quotes open."],
  ["March 1, 2027", "US policies can start."],
];

const H2 = "text-2xl font-bold text-[#0B1F3A]";
const BODY = "mt-3 text-bf-body";
const INPUT = "w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-base text-[#0B1F3A]";
const OUTLINE = "bf-btn bf-btn--secondary !border-[#0B1F3A] !text-[#0B1F3A]";

export function USAudiencePage({ audience }: { audience: Audience }) {
  const copy = US_COPY[audience];
  const [quick, setQuick] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  // BI_WEBSITE_FIELD_REPS_v1 - a rep's QR code or email link carries ?rep=<code> (who gets the credit) and, from the
  // email, ?c=<token> (which contact followed the link). Both are optional; the page works without them.
  const [params] = useSearchParams();
  const rep = repCode(params.get("rep"));
  const visitor = contactToken(params.get("c"));
  const bookUrl = rep ? bookUrlFor(rep) : BOOK_A_CALL_URL;
  const otherPath = copy.other.path + (rep ? `?rep=${rep}` : "");
  useEffect(() => {
    if (visitor) void apiRequest("/api/v1/field/visit", { method: "POST", body: JSON.stringify({ c: visitor }) }).catch(() => {});
  }, [visitor]);

  async function send(ev: React.FormEvent) {
    ev.preventDefault();
    const c = quickContact(quick);
    if (!c) { setStatus({ ok: false, text: "Enter an email address or a mobile number." }); return; }
    setBusy(true); setStatus(null);
    try {
      await apiRequest("/api/v1/crm/lead", { method: "POST", body: JSON.stringify({ source: "us_lenders_quick", company: copy.leadCompany, audience, ...c, ...(rep ? { rep } : {}), casl_consent: true, casl_consent_text: US_LENDERS_QUICK_CONSENT }) });
      track(audience === "broker" ? "us_brokers_quick" : "us_lenders_quick");
      setQuick("");
      setStatus({ ok: true, text: "Got it. We will send you the details and follow up within one business day." });
    } catch {
      setStatus({ ok: false, text: `We could not send that. Please try again, or call us at ${OPERATOR_PHONE_DISPLAY}.` });
    } finally { setBusy(false); }
  }

  return (
    <main className="min-h-screen bg-white text-[#0B1F3A]" data-testid={audience === "broker" ? "us-brokers" : "us-lenders"}>
      <section className="bg-bf-bg">
        <div className="mx-auto max-w-3xl px-5 py-8 text-center sm:py-14">
          <p className="text-sm font-semibold uppercase tracking-widest text-bf-cta">{copy.eyebrow}</p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl">{copy.h1}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-bf-textMuted sm:text-lg">{copy.lead}</p>
          <form onSubmit={send} noValidate aria-label="Send me the details" className="mx-auto mt-6 max-w-xl rounded-2xl bg-white p-4 text-left">
            <label className="block text-sm font-semibold text-[#0B1F3A]" htmlFor="us-quick">Your email or mobile, and we will send you the details</label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input id="us-quick" className={`${INPUT} flex-1`} inputMode="email" autoComplete="email" placeholder={copy.placeholder} value={quick} onChange={(e) => setQuick(e.target.value)} />
              <button type="submit" disabled={busy} className="bf-btn bf-btn--primary flex-none">{busy ? "Sending..." : "Send me the details"}</button>
            </div>
            {status ? <p role={status.ok ? "status" : "alert"} className={`mt-2 text-sm font-semibold ${status.ok ? "text-green-700" : "text-red-700"}`}>{status.text}</p> : null}
            <p className="mt-2 text-xs text-slate-600">{US_LENDERS_QUICK_CONSENT}</p>
          </form>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a href={bookUrl} target="_blank" rel="noopener noreferrer" className="bf-btn bf-btn--secondary" onClick={() => track("us_lenders_book_call")}>Book a call</a>
            <a href="/boreal-pgi.vcf" download="Boreal-PGI.vcf" className="bf-btn bf-btn--secondary" onClick={() => track("us_lenders_save_contact")}>Save our contact</a>
            <a href={OPERATOR_PHONE_HREF} className="bf-btn bf-btn--secondary">Call {OPERATOR_PHONE_DISPLAY}</a>
          </div>
          <p className="mt-4 text-sm"><Link to={otherPath} className="text-white underline">{copy.other.label}</Link></p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-10">
        <h2 className={H2}>What PGI is</h2>
        <p className={BODY}>When a business borrows, the owners usually guarantee the loan personally. If the business cannot repay, their home and savings are on the line. PGI is a claims-made policy held by the owner who signs the guarantee. If the guarantee is called and a covered claim is made, it caps the owner's personal loss. It does not prevent default or business failure, and the owner still signs the guarantee.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3" data-testid="us-key-terms">
          {US_KEY_TERMS.map(([a, b]) => (
            <div key={a} className="rounded-2xl border border-bf-line bg-bf-mist p-4"><div className="text-xl font-bold">{a}</div><div className="mt-1 text-sm text-bf-body">{b}</div></div>
          ))}
        </div>
      </section>

      {audience === "lender" ? (
        <section className="mx-auto max-w-3xl px-5 pb-10" data-testid="us-lender-why">
          <h2 className={H2}>Why lenders partner on PGI</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {US_LENDER_WHY.map(([t, d]) => (<li key={t} className="rounded-2xl border border-bf-line p-4"><div className="font-semibold">{t}</div><div className="mt-1 text-sm text-bf-body">{d}</div></li>))}
          </ul>
        </section>
      ) : null}

      <section className="mx-auto max-w-3xl px-5 pb-10" data-testid="us-timeline">
        <h2 className={H2}>When it starts</h2>
        <ol className="mt-5 grid gap-3 sm:grid-cols-3">
          {US_TIMELINE.map(([t, d]) => (<li key={t} className="rounded-2xl border border-bf-line bg-bf-mist p-4"><div className="font-semibold">{t}</div><div className="mt-1 text-sm text-bf-body">{d}</div></li>))}
        </ol>
        <h2 className={`${H2} mt-10`}>Ways to work with us</h2>
        <p className={BODY}>{audience === "lender"
          ? "Referral partnerships, revenue share arrangements, technology integrations (our lender portal and API) and lender programs. Terms are agreed with each partner."
          : "Referral partnerships and revenue share arrangements, with terms agreed with each partner. You introduce; you never sell, quote or negotiate insurance."}</p>
      </section>

      <section className="border-y border-bf-line bg-bf-mist">
        <div className="mx-auto max-w-3xl px-5 py-10">
          <h2 className={H2}>What the OCC has said</h2>
          <p className={BODY}>On September 3, 2026 the Office of the Comptroller of the Currency published Interpretive Letter 1194. A national bank asked whether it could offer PGI, as an optional product, to its commercial loan customers. The OCC concluded that PGI is credit-related insurance, an authorized product under section 302 of the Gramm-Leach-Bliley Act, and that offering it as proposed is permissible for a national bank.</p>
          <p className={BODY}>{copy.occNote}</p>
          <p className="mt-4"><a href={OCC_LETTER_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#1e3a8a] underline">Read OCC Interpretive Letter 1194 (PDF)</a></p>
          <p className="mt-4 rounded-xl border border-bf-line bg-white p-4 text-sm text-bf-body">The letter is limited to the facts that bank presented, which included the bank reinsuring the policies through its own subsidiary, and the OCC says different facts could lead to a different conclusion. It speaks to national banks. How it applies to any institution is a question for that institution&apos;s own counsel. This page is information, not legal advice.</p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-10">
        <h2 className={H2}>{copy.useTitle}</h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {copy.uses.map(([t, d]) => (<li key={t} className="rounded-2xl border border-bf-line p-4"><div className="font-semibold">{t}</div><div className="mt-1 text-sm text-bf-body">{d}</div></li>))}
        </ul>
      </section>

      <section id="how" className="border-y border-bf-line bg-bf-mist">
        <div className="mx-auto max-w-3xl px-5 py-10">
          <h2 className={H2}>How it works</h2>
          <ol className="mt-5 grid gap-3 sm:grid-cols-3">
            {copy.steps.map(([t, d], i) => (<li key={t} className="rounded-2xl border border-bf-line bg-white p-4"><div className="text-xl font-bold text-bf-ctaInk">{i + 1}</div><div className="mt-1 font-semibold">{t}</div><div className="mt-1 text-sm text-bf-body">{d}</div></li>))}
          </ol>
          <p className="mt-5 text-sm text-bf-body">Who qualifies: businesses with at least $50,000 of EBITDA and 12 months of revenue history. Each guarantor is underwritten and insured separately.</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <a href={bookUrl} target="_blank" rel="noopener noreferrer" className="bf-btn bf-btn--primary">Book a call with us</a>
            {copy.links.map(([to, label]) => <Link key={to} to={to} className={OUTLINE}>{label}</Link>)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-8">
        <p className="text-xs text-bf-body">Boreal Risk Management is a referral and risk advisory partner. We are not a licensed insurance broker, agent, or adviser. Insurance is arranged only through appropriately licensed insurance entities, and coverage is subject to underwriting, eligibility, policy terms, conditions and exclusions. Boreal Risk Management is not affiliated with the Office of the Comptroller of the Currency or the U.S. Small Business Administration.</p>
      </section>
    </main>
  );
}

/** Where a rep's QR code and the information email land when we do not know who the visitor is: they say so themselves. */
export function USChooser() {
  const [params] = useSearchParams();
  const rep = repCode(params.get("rep"));
  const visitor = contactToken(params.get("c"));
  const query = [rep ? `rep=${rep}` : "", visitor ? `c=${visitor}` : ""].filter(Boolean).join("&");
  const to = (path: string) => (query ? `${path}?${query}` : path);
  const CHOICE = "bf-btn bf-btn--primary block w-full py-5 text-center text-lg";
  return (
    <main className="min-h-screen bg-bf-bg text-white" data-testid="us-chooser">
      <div className="mx-auto max-w-xl px-5 py-12 text-center sm:py-20">
        <p className="text-sm font-semibold uppercase tracking-widest text-bf-cta">Personal Guarantee Insurance</p>
        <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">Insurance for the personal guarantee on a business loan.</h1>
        <p className="mt-4 text-base text-bf-textMuted sm:text-lg">Tell us who you are and we will show you how it works for you.</p>
        <div className="mt-8 grid gap-4">
          <Link to={to("/us-lenders")} className={CHOICE}>I work at a bank or lender</Link>
          <Link to={to("/us-brokers")} className={CHOICE}>I am a loan broker</Link>
        </div>
        <p className="mt-8 text-sm text-bf-textMuted">Or call us at <a href={OPERATOR_PHONE_HREF} className="text-white underline">{OPERATOR_PHONE_DISPLAY}</a></p>
      </div>
    </main>
  );
}

export default function USLenders() { return <USAudiencePage audience="lender" />; }
export function USBrokers() { return <USAudiencePage audience="broker" />; }
