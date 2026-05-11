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
const LOANS = [{i:ICN.bank,t:"Commercial lending",d:"Term loans, operating lines, CSBFP and BDC facilities, asset-based lending, mezzanine debt, factoring. Banks, credit unions, alternative lenders."},{i:ICN.shield,t:"Commercial real estate",d:"Purchase mortgages, refinances, construction loans, development financing, land acquisition, bridge loans. Owner-occupied and investment properties."},{i:ICN.tool,t:"Equipment & vehicles",d:"Equipment loans and leases, fleet financing, vehicle finance, aircraft and marine, specialty asset finance."},{i:ICN.doc,t:"Acquisitions & succession",d:"Business acquisitions, vendor-takeback notes, management buyouts, franchise purchases, partnership buyouts."},{i:ICN.card,t:"Trade & supplier credit",d:"Supplier lines, floor-plan financing, fuel and fleet accounts, wholesale inventory finance, merchant cash advances."},{i:ICN.warn,t:"Leases & bonds",d:"Commercial real estate leases, equipment rental, performance and surety bonds, customs, license and permit bonds."}];
// v117-coverage-categories
// v111-deals-expanded
const WHY = [{i:ICN.leaf,t:"Canadian-built",d:"Designed for Canadian SMEs, underwritten by Markel — A-rated by AM Best, S&P, Fitch."},{i:ICN.bolt,t:"Fast decisions",d:"Quote in 60 seconds. Underwriting in 5 business days. No broker required."},{i:ICN.eye,t:"Transparent pricing",d:"See your premium before you submit. No hidden fees. Known annual renewal."}];

export default function Home() {
  const nav = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
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
          {/* v111-trust-strip: Backed-by column removed */}
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
        <img src="/pgi-diagram.svg" alt="How PGI protects you: sign loan and PGI, default happens, Markel pays the bank, you stay safe" className="w-full h-auto" />
      </section>
      <section className="mx-auto max-w-5xl px-5 py-16 border-t border-subtle">
        <h2 className="text-3xl font-bold text-white text-center">Deals we can insure</h2>
        <p className="mt-3 text-center text-sm text-bf-textMuted">Bank loans are just the start. Lenders, landlords, suppliers, and counterparties demand personal guarantees across the entire commercial economy.</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{LOANS.map((l) => (<div key={l.t} className="rounded-2xl border border-card bg-bf-surface p-5"><div className="text-bf-cta mb-3"><Icon d={l.i}/></div><h3 className="text-base font-semibold text-white">{l.t}</h3><p className="mt-2 text-sm text-bf-textMuted">{l.d}</p></div>))}</div>
      </section>
      <section className="mx-auto max-w-5xl px-5 py-16 border-t border-subtle">
        <h2 className="text-3xl font-bold text-white text-center">PGI vs the alternatives</h2>
        <p className="mt-3 text-center text-sm text-bf-textMuted">Most guarantors don’t realize there’s a third option.</p>
        <div className="mt-10 overflow-x-auto rounded-2xl border border-card bg-bf-surface"><table className="w-full text-sm min-w-[560px]"><thead><tr><th className="text-left py-4 px-4 font-medium text-bf-textMuted w-[26%]"></th><th className="py-4 px-3 font-medium text-white text-center">Doing nothing</th><th className="py-4 px-3 font-medium text-white text-center">Credit insurance</th><th className="py-4 px-3 font-medium text-bf-cta text-center">PGI (Boreal)</th></tr></thead><tbody><tr className="border-t border-card"><td className="py-4 px-4 text-white font-medium">Who’s protected</td><td className="py-4 px-3 text-bf-textMuted text-center">Nobody</td><td className="py-4 px-3 text-bf-textMuted text-center">The lender</td><td className="py-4 px-3 text-white text-center font-medium">You &amp; your family</td></tr><tr className="border-t border-card"><td className="py-4 px-4 text-white font-medium">Who pays the lender if you default</td><td className="py-4 px-3 text-bf-textMuted text-center">You — from personal assets</td><td className="py-4 px-3 text-bf-textMuted text-center">Insurer pays lender</td><td className="py-4 px-3 text-white text-center font-medium">Insurer pays lender</td></tr><tr className="border-t border-card"><td className="py-4 px-4 text-white font-medium">Your house, RRSP, savings</td><td className="py-4 px-3 text-bf-textMuted text-center">At risk</td><td className="py-4 px-3 text-bf-textMuted text-center">At risk</td><td className="py-4 px-3 text-white text-center font-medium">Protected</td></tr><tr className="border-t border-card"><td className="py-4 px-4 text-white font-medium">Annual cost</td><td className="py-4 px-3 text-bf-textMuted text-center">$0</td><td className="py-4 px-3 text-bf-textMuted text-center">~0.5–1.5% of loan</td><td className="py-4 px-3 text-white text-center font-medium">~0.5–1.5% of loan</td></tr></tbody></table></div>
      </section>
      <section className="mx-auto max-w-5xl px-5 py-16 border-t border-subtle">
        <h2 className="text-3xl font-bold text-white text-center">Why Boreal Insurance</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">{WHY.map((w) => (<div key={w.t}><div className="text-bf-cta mb-2"><Icon d={w.i}/></div><h3 className="text-lg font-semibold text-white">{w.t}</h3><p className="mt-2 text-sm text-bf-textMuted">{w.d}</p></div>))}</div>
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
