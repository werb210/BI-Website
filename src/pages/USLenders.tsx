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
// BI_WEBSITE_PGI_COMPLIANCE_v1 (2026-11-19) - rewritten after PGI's written notice. In the United States the program
// will be arranged by PGI America Ltd. under a separate agreement and is not live yet, so these pages publish no rates,
// limits, shares, insurer, eligibility rules, loan types or dates. A lender is only asked to make borrowers
// aware the option exists; the policy is never tied to the credit decision. No compensation talk.
export const US_COPY: Record<Audience, Copy> = {
  lender: {
    path: "/us-lenders", other: { path: "/us-brokers", label: "I am a loan broker" },
    eyebrow: "For United States banks and lenders",
    h1: "Personal Guarantee Insurance is coming to the United States.",
    lead: "Personal Guarantee Insurance can cap a business owner's personal loss on a personal guarantee given to a recognised lender on a business loan. In the United States it will be arranged by PGI America Ltd. Leave your details and we will make sure you hear when it is available.",
    placeholder: "you@yourbank.com or (512) 555-0142", leadCompany: "US lender page (event)",
    occNote: "Any bank that wants to make customers aware of PGI still needs to complete its own due diligence.",
    useTitle: "The lender's part",
    uses: [
      ["Make borrowers aware it exists", "A lender can let business owners know the option exists. That is all."],
      ["Optional, and separate from credit", "It is the borrower's choice. It is never a condition of a loan and never part of the credit decision."],
      ["Details come from PGI", "The offer, the program details and the conditions come from PGI America Ltd., the licensed broker."],
    ],
    steps: [
      ["Leave your details", "We will tell you when the US program is available."],
      ["PGI America Ltd. publishes the program", "Program details are set and published by PGI, not by us."],
      ["Borrowers decide for themselves", "Interested owners go to PGI for the details."],
    ],
    links: [],
  },
  broker: {
    path: "/us-brokers", other: { path: "/us-lenders", label: "I work at a bank or lender" },
    eyebrow: "For United States commercial loan brokers",
    h1: "Personal Guarantee Insurance is coming to the United States.",
    lead: "Personal Guarantee Insurance can cap a business owner's personal loss on a personal guarantee given to a recognised lender on a business loan. In the United States it will be arranged by PGI America Ltd. Leave your details and we will make sure you hear when it is available.",
    placeholder: "you@yourfirm.com or (512) 555-0142", leadCompany: "US broker page (event)",
    occNote: "Banks you work with will make their own decisions and complete their own due diligence.",
    useTitle: "Your part",
    uses: [
      ["Let clients know it exists", "Many business owners do not know a personal guarantee can be insured. You can tell them the option exists."],
      ["You never sell insurance", "Do not quote, sell or negotiate insurance. The offer and the details come from PGI America Ltd., the licensed broker."],
      ["Optional for the client", "It is the client's choice and is never a condition of a loan."],
    ],
    steps: [
      ["Leave your details", "We will tell you when the US program is available."],
      ["PGI America Ltd. publishes the program", "Program details are set and published by PGI, not by us."],
      ["Clients decide for themselves", "Interested owners go to PGI for the details."],
    ],
    links: [],
  },
};

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
        <p className={BODY}>When a business borrows, the owners are often asked to guarantee the loan personally. Personal Guarantee Insurance covers a personal guarantee given to a recognised lender on a business loan, and can cap the owner&apos;s personal loss from an insolvency event. It does not prevent default, insolvency or lender enforcement, and it does not protect all of the owner&apos;s assets. The policy terms and conditions come from PGI.</p>
      </section>


      <section className="mx-auto max-w-3xl px-5 pb-10" data-testid="us-timeline">
        <h2 className={H2}>When it starts</h2>
        <p className={BODY}>The US program is not available yet. PGI America Ltd. will publish the program and its start date. Program details may change before launch, so we do not publish them.</p>
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
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <a href={bookUrl} target="_blank" rel="noopener noreferrer" className="bf-btn bf-btn--primary">Book a call with us</a>
            {copy.links.map(([to, label]) => <Link key={to} to={to} className={OUTLINE}>{label}</Link>)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-8">
        <p className="text-xs text-bf-body">Boreal Risk Management, a trade name of 2630108 Alberta Ltd., makes introductions only. We are not a licensed insurance producer, broker, agent or insurer, and we do not quote, sell, negotiate or bind insurance. In the United States, Personal Guarantee Insurance will be arranged by PGI America Ltd.; it is not yet available. Boreal Risk Management is not affiliated with the Office of the Comptroller of the Currency.</p>
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
