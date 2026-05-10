// BI_WEBSITE_BLOCK_v101_HOME_MARKETING_v1
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import MarkelBadge from "../components/MarkelBadge";
type Row = { public_id: string };
const STEPS = [{n:"1",t:"Quote in 60 seconds",d:"Tell us about your loan and business. We show a coverage range and target premium immediately — no broker call required."},{n:"2",t:"Underwriting decision",d:"Submit a few documents (CRA notice, bank statements, financials). Markel's underwriters respond within 5 business days."},{n:"3",t:"Coverage live at signature",d:"Sign the policy, pay the first premium. Your personal guarantee is insured up to your declared limit. Annual renewals."}];
const COVERAGE = ["Covers the personal guarantee on your business loan — not the loan itself.","Pays the lender if your guarantee is called after the business is unable to repay.","Available for Canadian businesses with $50K+ EBITDA and 12+ months of revenue history."];
const LOANS = [{t:"CSBFP loans",d:"Canada Small Business Financing Program loans with the 25% personal guarantee."},{t:"Term loans",d:"Bank term loans secured by a personal guarantee from a director or shareholder."},{t:"Lines of credit",d:"Operating lines and revolving facilities backed by a personal guarantee."},{t:"Equipment financing",d:"Equipment loans and leases where the lender requires a personal guarantee."}];
const WHY = [{t:"Canadian-built",d:"Designed for Canadian SMEs, underwritten by Markel — A-rated by AM Best, S&P, Fitch."},{t:"Fast decisions",d:"Quote in 60 seconds. Underwriting in 5 business days. No broker required."},{t:"Transparent pricing",d:"See your premium before you submit. No hidden fees. Known annual renewal."}];
const FAQ = [{q:"What does PGI actually cover?",a:"PGI covers your personal guarantee. If your business defaults and the lender calls the guarantee, the insurance pays the lender up to your declared limit."},{q:"How is this different from credit insurance?",a:"Credit insurance protects the lender. PGI protects you, the guarantor. Different policy, different beneficiary."},{q:"What does it cost?",a:"Premiums depend on loan size, business financials, and coverage limit. A $500K loan with $400K coverage is typically in the low thousands per year."},{q:"Can I add coverage to a loan I already have?",a:"Yes. Existing personal guarantees are eligible as long as the loan is in good standing."},{q:"What if the business is sold or refinanced?",a:"Coverage ends when the underlying loan is repaid or the personal guarantee is released. Premiums stop accordingly."},{q:"Is this available across Canada?",a:"Yes — all 10 provinces and 3 territories. US coverage is in development."}];

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
        <h1 className="text-4xl md:text-5xl font-bold text-white">Insurance for the personal guarantee on your business loan.</h1>
        <p className="mt-4 text-lg text-bf-textMuted">Sign with confidence.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/applications/new" className="rounded-full bg-bf-cta hover:bg-bf-ctaHover px-7 py-3 font-medium text-white">Apply Now</Link>
          <Link to="/quote" className="rounded-full border border-white/30 px-7 py-3 font-medium text-white">Get a Free Quote</Link>
        </div>
        <div className="mt-8 flex justify-center"><MarkelBadge /></div>
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
          {STEPS.map((s) => (<div key={s.n} className="rounded-2xl border border-card bg-bf-surface p-6"><div className="text-bf-cta text-2xl font-bold">{s.n}</div><h3 className="mt-2 text-lg font-semibold text-white">{s.t}</h3><p className="mt-2 text-sm text-bf-textMuted">{s.d}</p></div>))}
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-5 py-16 border-t border-subtle">
        <h2 className="text-3xl font-bold text-white text-center">What your policy covers</h2>
        <ul className="mt-8 mx-auto max-w-2xl space-y-4">{COVERAGE.map((c, i) => (<li key={i} className="flex gap-3"><span className="text-bf-cta">●</span><span className="text-bf-textMuted">{c}</span></li>))}</ul>
      </section>
      <section className="mx-auto max-w-5xl px-5 py-16 border-t border-subtle">
        <h2 className="text-3xl font-bold text-white text-center">Loans we can insure</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{LOANS.map((l) => (<div key={l.t} className="rounded-2xl border border-card bg-bf-surface p-5"><h3 className="text-base font-semibold text-white">{l.t}</h3><p className="mt-2 text-sm text-bf-textMuted">{l.d}</p></div>))}</div>
      </section>
      <section className="mx-auto max-w-5xl px-5 py-16 border-t border-subtle">
        <h2 className="text-3xl font-bold text-white text-center">Why Boreal Insurance</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">{WHY.map((w) => (<div key={w.t}><h3 className="text-lg font-semibold text-white">{w.t}</h3><p className="mt-2 text-sm text-bf-textMuted">{w.d}</p></div>))}</div>
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
