// BI_WEBSITE_BLOCK_v101_HOME_MARKETING_v1
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import MarkelBadge from "../components/MarkelBadge";
// BI_WEBSITE_BLOCK_v105_MARKETING_TIER_2_v1 — inline SVG icon set (no extra deps).
const ICN = {
  bolt:"M13 2L3 14h7l-1 8 10-12h-7l1-8z",
  doc:"M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M9 13l2 2 4-4",
  shield:"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  bank:"M3 10h18 M3 14h18 M5 10V6h14v4 M3 22V10 M21 22V10 M9 22v-8 M15 22v-8",
  cal:"M3 4h18v18H3z M16 2v4 M8 2v4 M3 10h18",
  card:"M2 6h20v12H2z M2 10h20",
  tool:"M14.7 6.3l3 3L7 20H4v-3L14.7 6.3z M13 6l5 5",
  leaf:"M21 3c-9 0-18 9-18 18 0 0 9-1 12-4 4-4 6-9 6-14z",
  eye:"M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z M12 9a3 3 0 100 6 3 3 0 000-6z",
  warn:"M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01"
};
function Icon({ d, className = "h-6 w-6" }: { d: string; className?: string }) {
  return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}><path d={d} /></svg>);
}
type Row = { public_id: string };
const STEPS = [{n:"1",i:ICN.bolt,t:"Quote in 60 seconds",d:"Tell us about your loan and business. We show a coverage range and target premium immediately — no broker call required."},{n:"2",i:ICN.doc,t:"Underwriting decision",d:"Submit a few documents (CRA notice, bank statements, financials). Markel's underwriters respond within 5 business days."},{n:"3",i:ICN.shield,t:"Coverage live at signature",d:"Sign the policy, pay the first premium. Your personal guarantee is insured up to your declared limit. Annual renewals."}];
const COVERAGE = ["Covers the personal guarantee on your business loan — not the loan itself.","Pays the lender if your guarantee is called after the business is unable to repay.","Available for Canadian businesses with $50K+ EBITDA and 12+ months of revenue history."];
const LOANS = [{i:ICN.bank,t:"CSBFP loans",d:"Canada Small Business Financing Program loans with the 25% personal guarantee."},{i:ICN.cal,t:"Term loans",d:"Bank term loans secured by a personal guarantee from a director or shareholder."},{i:ICN.card,t:"Lines of credit",d:"Operating lines and revolving facilities backed by a personal guarantee."},{i:ICN.tool,t:"Equipment financing",d:"Equipment loans and leases where the lender requires a personal guarantee."}];
const WHY = [{i:ICN.leaf,t:"Canadian-built",d:"Designed for Canadian SMEs, underwritten by Markel — A-rated by AM Best, S&P, Fitch."},{i:ICN.bolt,t:"Fast decisions",d:"Quote in 60 seconds. Underwriting in 5 business days. No broker required."},{i:ICN.eye,t:"Transparent pricing",d:"See your premium before you submit. No hidden fees. Known annual renewal."}];
const HOW_PGI = [{n:"1",t:"You sign + insure",d:"The bank requires a personal guarantee on your loan. You buy a Boreal PGI policy at the same time — premium is a fraction of the loan size.",i:ICN.doc,c:"text-bf-cta",b:"border-bf-cta/30",bg:"bg-bf-cta/5"},{n:"2",t:"Business defaults",d:"Worst case: revenue drops, the business can’t repay. The bank moves to call your personal guarantee.",i:ICN.warn,c:"text-amber-400",b:"border-amber-400/30",bg:"bg-amber-400/5"},{n:"3",t:"Markel pays the bank",d:"Your PGI policy pays the lender directly, up to your declared limit. Your home, RRSP, and family savings stay protected.",i:ICN.shield,c:"text-emerald-400",b:"border-emerald-400/30",bg:"bg-emerald-400/5"}];
const FAQ = [{q:"What does PGI actually cover?",a:"PGI covers your personal guarantee. If your business defaults and the lender calls the guarantee, the insurance pays the lender up to your declared limit."},{q:"How is this different from credit insurance?",a:"Credit insurance protects the lender. PGI protects you, the guarantor. Different policy, different beneficiary."},{q:"What does it cost?",a:"Premiums depend on loan size, business financials, and coverage limit. A $500K loan with $400K coverage is typically in the low thousands per year."},{q:"Can I add coverage to a loan I already have?",a:"Yes. Existing personal guarantees are eligible as long as the loan is in good standing."},{q:"What if the business is sold or refinanced?",a:"Coverage ends when the underlying loan is repaid or the personal guarantee is released. Premiums stop accordingly."},{q:"Is this available across Canada?",a:"Yes — all 10 provinces and 3 territories. US coverage is in development."},{q:"Will this affect my credit?",a:"No. Applying for PGI does not pull credit. Only Markel underwriting reviews your financial documents — no credit bureau involvement."},{q:"How fast does the lender accept this policy?",a:"Most Canadian lenders accept Markel coverage immediately. We provide a certificate of insurance you can forward to your loan officer the same day."},{q:"What happens if my business closes?",a:"If the underlying loan is paid off through dissolution, the policy ends with the loan. If the lender calls the guarantee, the policy pays — that is exactly what it is for."},{q:"What documents do I need?",a:"Most recent T2 corporate return (CRA Notice of Assessment), 6 months of business bank statements, current year-to-date financials, and your loan agreement or term sheet."},{q:"Can a co-guarantor be covered too?",a:"Yes. Each guarantor is underwritten and insured separately. Apply once and we coordinate the joint policy."}];

export default function Home() {
  const nav = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  useEffect(() => {
    const ids: string[] = JSON.parse(localStorage.getItem("bi.my_apps") || "[]");
    if (!ids.length) return;
    Promise.all(ids.map((id) => api.getApp(id).then((r: any) => r.application).catch(() => null))).then((a) => setRows(a.filter(Boolean) as Row[]));
  }, []);
  return (
    <main className="min-h-screen bg-bf-bg text-slate-200">
      <section className="mx-auto max-w-5xl px-5 py-16 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">Stop putting your house on the line for your business loan.</h1>
        <p className="mt-4 text-base sm:text-lg text-bf-textMuted">Insure your personal guarantee. Protect your family. Quote in 60 seconds.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/applications/new" className="rounded-full bg-bf-cta hover:bg-bf-ctaHover px-7 py-3 font-medium text-white">Apply Now</Link>
          <Link to="?quote=1" className="rounded-full border border-white/30 px-7 py-3 font-medium text-white">Get a Free Quote</Link>
        </div>
        <p className="mt-4 text-sm text-bf-textMuted">Or <a href="tel:+1-000-000-0000" className="text-bf-cta hover:underline">speak with a licensed broker</a></p>
        <div className="mt-8 flex justify-center"><MarkelBadge /></div>
      </section>
      <section className="mx-auto max-w-5xl px-5 py-8 border-t border-subtle">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div><div className="text-2xl font-bold text-white">A-rated</div><div className="mt-1 text-sm text-bf-textMuted">Underwriter rated by AM Best, S&amp;P, Fitch</div></div>
          <div><div className="text-2xl font-bold text-white">All 13</div><div className="mt-1 text-sm text-bf-textMuted">Provinces and territories covered</div></div>
          <div><div className="text-2xl font-bold text-white">Backed by</div><div className="mt-1 text-sm text-bf-textMuted">Boreal Financial — Canadian built</div></div>
        </div>
      </section>
      {rows.length > 0 && (
        <section className="mx-auto max-w-3xl px-5 pb-8">
          <div className="rounded-2xl border border-bf-cta/40 bg-bf-cta/10 p-5 text-center">
            <p className="text-sm text-bf-textMuted">Welcome back — your application is saved.</p>
            <button type="button" onClick={() => nav(`/applications/${rows[0].public_id}/form`)} className="mt-3 rounded-full bg-bf-cta hover:bg-bf-ctaHover px-6 py-2 text-white">Continue your application</button>
          </div>
        </section>
      )}
      <section id="how-it-works" className="mx-auto max-w-5xl px-5 py-16">
        <h2 className="text-3xl font-bold text-white text-center">How it works</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {STEPS.map((s) => (<div key={s.n} className="rounded-2xl border border-card bg-bf-surface p-6"><div className="flex items-start justify-between"><div className="text-bf-cta text-2xl font-bold">{s.n}</div><div className="text-bf-cta opacity-80"><Icon d={s.i}/></div></div><h3 className="mt-2 text-lg font-semibold text-white">{s.t}</h3><p className="mt-2 text-sm text-bf-textMuted">{s.d}</p></div>))}
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-5 py-16 border-t border-subtle">
        <h2 className="text-3xl font-bold text-white text-center">What your policy covers</h2>
        <ul className="mt-8 mx-auto max-w-2xl space-y-4">{COVERAGE.map((c, i) => (<li key={i} className="flex gap-3"><span className="text-bf-cta">●</span><span className="text-bf-textMuted">{c}</span></li>))}</ul>
      </section>
      <section className="mx-auto max-w-5xl px-5 py-16 border-t border-subtle">
        <h2 className="text-3xl font-bold text-white text-center">How PGI protects you</h2>
        <p className="mt-3 text-center text-sm text-bf-textMuted max-w-2xl mx-auto">If the worst happens, your policy steps in so the bank’s recovery doesn’t come from your personal assets.</p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">{HOW_PGI.map((s) => (<div key={s.n} className={"rounded-2xl border p-6 " + s.b + " " + s.bg}><div className="flex items-start justify-between"><span className={"flex h-10 w-10 items-center justify-center rounded-full bg-bf-bg font-bold " + s.c}>{s.n}</span><div className={s.c}><Icon d={s.i} className="h-7 w-7"/></div></div><h3 className="mt-4 text-lg font-semibold text-white">{s.t}</h3><p className="mt-2 text-sm text-bf-textMuted">{s.d}</p></div>))}</div>
      </section>
      <section className="mx-auto max-w-5xl px-5 py-16 border-t border-subtle">
        <h2 className="text-3xl font-bold text-white text-center">Loans we can insure</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{LOANS.map((l) => (<div key={l.t} className="rounded-2xl border border-card bg-bf-surface p-5"><div className="text-bf-cta mb-3"><Icon d={l.i}/></div><h3 className="text-base font-semibold text-white">{l.t}</h3><p className="mt-2 text-sm text-bf-textMuted">{l.d}</p></div>))}</div>
      </section>
      <section className="mx-auto max-w-5xl px-5 py-16 border-t border-subtle">
        <h2 className="text-3xl font-bold text-white text-center">Compare your options</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-card bg-bf-surface p-6"><h3 className="text-lg font-semibold text-white">Doing nothing</h3><p className="mt-2 text-sm text-bf-textMuted">If the business defaults, the lender comes after your personal assets — house, savings, RRSPs.</p></div>
          <div className="rounded-2xl border border-card bg-bf-surface p-6"><h3 className="text-lg font-semibold text-white">Credit insurance</h3><p className="mt-2 text-sm text-bf-textMuted">Protects the bank, not you. The lender is paid; the guarantor is still personally liable.</p></div>
          <div className="rounded-2xl border border-bf-cta bg-bf-cta/10 p-6"><h3 className="text-lg font-semibold text-white">PGI by Boreal</h3><p className="mt-2 text-sm text-bf-textMuted">Protects you, the guarantor. If the guarantee is called, Markel pays the lender up to your declared limit.</p></div>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-5 py-16 border-t border-subtle">
        <h2 className="text-3xl font-bold text-white text-center">Why Boreal Insurance</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">{WHY.map((w) => (<div key={w.t}><div className="text-bf-cta mb-2"><Icon d={w.i}/></div><h3 className="text-lg font-semibold text-white">{w.t}</h3><p className="mt-2 text-sm text-bf-textMuted">{w.d}</p></div>))}</div>
      </section>
      <section className="mx-auto max-w-3xl px-5 py-16 border-t border-subtle">
        <h2 className="text-3xl font-bold text-white text-center">Frequently asked questions</h2>
        <div className="mt-8 space-y-2">
          {FAQ.map((f, i) => (<details key={i} open={openFaq === i} onToggle={(e) => setOpenFaq((e.target as HTMLDetailsElement).open ? i : null)} className="rounded-xl border border-card bg-bf-surface px-5 py-3"><summary className="cursor-pointer text-white font-medium">{f.q}</summary><p className="mt-2 text-sm text-bf-textMuted">{f.a}</p></details>))}
        </div>
      </section>
      <section className="mx-auto max-w-3xl px-5 py-16 text-center">
        <h2 className="text-3xl font-bold text-white">Ready to insure your guarantee?</h2>
        <p className="mt-3 text-bf-textMuted">Quote in 60 seconds. Decision in 5 business days.</p>
        <Link to="/applications/new" className="mt-6 inline-block rounded-full bg-bf-cta hover:bg-bf-ctaHover px-8 py-3 font-medium text-white">Apply Now</Link>
      </section>
      <div className="md:hidden fixed bottom-0 inset-x-0 z-50 p-3 border-t border-card bg-bf-bg/95 backdrop-blur"><Link to="/applications/new" className="block w-full text-center rounded-full bg-bf-cta hover:bg-bf-ctaHover px-6 py-3 font-medium text-white">Apply Now</Link></div>
    </main>
  );
}
