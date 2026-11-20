// BI_WEBSITE_PGI_COMPLIANCE_v1 (2026-11-19) - rebuilt after PGI Canada Ltd.'s written notice of 2026-11-19.
// Only statements PGI has authorized: a referral introduction to PGI Canada Ltd. (the licensed broker), the one
// authorized rate line, what the policy is in PGI's terms, and links to PGI's own site and published material.
// No eligibility rules, coverage shares, limits, insurer brand, claims process, lender benefits or US offer.
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { APPLY_PATH, PGI_BROKER, PGI_RATE_LINE } from "../lib/pgiPartner";

type Row = { public_id: string };

export default function Home() {
  const nav = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => {
    let ids: string[] = [];
    try { ids = JSON.parse(localStorage.getItem("bi.my_apps") || "[]"); } catch { ids = []; }
    if (!ids.length) return;
    Promise.all(ids.map((id) => api.getApp(id).then((r: any) => r.application).catch(() => null))).then((a) => setRows(a.filter(Boolean) as Row[]));
  }, []);
  return (
    <main className="min-h-screen bg-white text-[#0B1F3A]" data-testid="home">
      <section className="bg-bf-bg">
        <div className="mx-auto max-w-4xl px-5 py-16 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">Personal Guarantee Insurance, through {PGI_BROKER}</h1>
          <p className="mt-4 text-base sm:text-lg text-bf-textMuted">
            When a business owner gives a recognised lender a personal guarantee on a business loan, Personal Guarantee
            Insurance can cap the owner&apos;s personal loss if the business becomes insolvent. Boreal Risk Management
            introduces Canadian business owners to {PGI_BROKER}, the licensed insurance broker that arranges and
            administers the program.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to={APPLY_PATH} className="bf-btn bf-btn--primary" data-testid="home-apply">Apply now</Link>
          </div>
          <p className="mt-6 text-sm text-white" data-testid="home-rate">{PGI_RATE_LINE}</p>
        </div>
      </section>

      {rows.length > 0 && (
        <section className="mx-auto max-w-3xl px-5 pt-8">
          <div className="rounded-2xl border border-bf-cta/40 bg-bf-cta/10 p-5 text-center">
            <p className="text-sm text-bf-body">Welcome back. You have an application saved with us.</p>
            <button type="button" onClick={() => nav(`/applications/${rows[0].public_id}/form`)} className="mt-3 bf-btn bf-btn--primary">Continue your application</button>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-3xl px-5 py-14">
        <h2 className="text-2xl font-bold text-[#0B1F3A]">What it is</h2>
        <ul className="mt-5 space-y-3 text-bf-body">
          <li>The policy covers a personal guarantee given to a recognised lender on a business loan.</li>
          <li>It caps the personal loss from an insolvency event. It does not prevent default, insolvency or lender enforcement, and it does not protect all personal assets.</li>
          <li>The insurer pays the named insured, after the insolvency has concluded, as set out in the policy wording.</li>
          <li>It is optional, and it is not part of any lender&apos;s credit decision.</li>
        </ul>
        <p className="mt-6 text-bf-body">
          The offer, the program details and the conditions come from {PGI_BROKER}.
        </p>
      </section>

      <section className="border-t border-bf-line bg-bf-mist">
        <div className="mx-auto max-w-3xl px-5 py-14">
          <h2 className="text-2xl font-bold text-[#0B1F3A]">Our role</h2>
          <p className="mt-4 text-bf-body">
            Boreal Risk Management is a referral partner. We are not a licensed insurance broker, agent or insurer, and
            we do not quote, underwrite, sell or bind insurance. We can tell you the program exists and introduce you to{" "}
            {PGI_BROKER}; everything about the policy comes from them.
          </p>
          <p className="mt-4 text-bf-body">
            Available in Canada, except to Quebec residents. In the United States the program will be arranged by PGI
            America Ltd. and is not yet available;{" "}
            <Link to="/us" className="underline">US lenders and brokers can leave their details</Link>.
          </p>
          <div className="mt-8">
            <Link to={APPLY_PATH} className="bf-btn bf-btn--primary">Start your application</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
