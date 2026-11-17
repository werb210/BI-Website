// BI_WEBSITE_BLOCK_v109_HEADER_LOGO_DIAGRAM_FAQ_v1
import { money, useMarket, type MarketTerms } from "../lib/market";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

// BI_WEBSITE_US_FIRST_SITE_v1 - the answers that differ by country are filled in from the visitor's market.
const items = (t: MarketTerms) => [
  {q:"What does PGI actually cover?",a:`PGI covers your personal guarantee. If your business defaults and the lender calls the guarantee, the insurance pays the lender up to your declared limit. Cover is available on guarantees up to ${money(t, t.limit)}, for ${t.shareText} of the guarantee.`},
  {q:"How is this different from credit insurance?",a:"Credit insurance protects the lender. PGI protects you, the guarantor. Different policy, different beneficiary."},
  {q:"What does it cost?",a:`Premiums depend on loan size, business financials, and coverage limit. As a guide, the annual premium is about ${+(t.rate * 100).toFixed(1)}% of the insured amount: roughly ${money(t, Math.round(400_000 * t.rate))} a year on ${money(t, 400_000)} of cover. The insurer sets the final premium.`},
  {q:"Can I add coverage to a loan I already have?",a:"Yes. Existing personal guarantees are eligible as long as the loan is in good standing."},
  {q:"What if the business is sold or refinanced?",a:"Coverage ends when the underlying loan is repaid or the personal guarantee is released. Premiums stop accordingly."},
  {q:"Can I insure the guarantee on an SBA loan?",a:"Yes. SBA 7(a) and 504 loans generally require a personal guarantee from every owner of 20% or more. The SBA's guarantee protects the lender, not you, so PGI can be placed on your personal guarantee, subject to underwriting and policy terms."},
  {q:"Where is this available?",a: t.market === "US" ? `In the United States. ${(t.timeline ?? []).slice(1).join(" ")} In Canada, visit the Canadian site (link at the bottom of the page).` : "In 9 Canadian provinces and 3 territories. Not available to Quebec residents."},
  {q:"Will this affect my credit?",a:"No. Applying for PGI does not pull credit. Only the insurer's underwriting team reviews your financial documents — no credit bureau involvement."},
  {q:"How fast does the lender accept this policy?",a:"Most lenders accept the coverage immediately. We provide a certificate of insurance you can forward to your loan officer the same day."},
  {q:"What happens if my business closes?",a:"If the underlying loan is paid off through dissolution, the policy ends with the loan. If the lender calls the guarantee, the policy pays — that is exactly what it is for."},
  {q:"What documents do I need?",a:`${t.taxReturn}, 6 months of business bank statements, current year-to-date financials, and your loan agreement or term sheet.`},
  {q:"Can a co-guarantor be covered too?",a:"Yes. Each guarantor is underwritten and insured separately. Apply once and we coordinate the joint policy."},
];
export const faqItems = items;

function List() {
  const [open, setOpen] = useState<number | null>(null);
  const { terms } = useMarket();
  const ITEMS = items(terms);
  return (
    <div className="space-y-2">
      {ITEMS.map((f, i) => (
        <details key={i} open={open === i} onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open ? i : null)} className="rounded-xl border border-card bg-bf-surface px-5 py-3">
          <summary className="cursor-pointer text-white font-medium">{f.q}</summary>
          <p className="mt-2 text-sm text-bf-textMuted">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function FaqPage() {
  return (
    <main className="min-h-screen bg-bf-bg text-slate-200">
      <section className="mx-auto max-w-3xl px-5 py-16">
        <h1 className="text-4xl font-bold text-white text-center">Frequently asked questions</h1>
        <p className="mt-3 text-center text-bf-textMuted">Everything you need to know about Personal Guarantee Insurance.</p>
        <div className="mt-10"><List /></div>
      </section>
    </main>
  );
}

export default function FaqModal() {
  const [params, setParams] = useSearchParams();
  const isOpen = params.get("faq") === "1";
  function close() {
    const next = new URLSearchParams(params);
    next.delete("faq");
    setParams(next, { replace: true });
  }
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/70 p-4 sm:p-8" onClick={close} role="dialog" aria-modal="true" aria-label="Frequently asked questions">
      <div className="relative w-full max-w-3xl my-4 sm:my-8" onClick={(e) => e.stopPropagation()}>
        <button onClick={close} aria-label="Close" className="absolute -top-3 -right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-bf-bg border border-white/20 text-white text-xl hover:bg-white/10">×</button>
        <div className="rounded-2xl border border-white/10 bg-bf-surface p-6 md:p-8">
          <h2 className="text-2xl font-bold text-white">Frequently asked questions</h2>
          <div className="mt-6"><List /></div>
        </div>
      </div>
    </div>
  );
}
