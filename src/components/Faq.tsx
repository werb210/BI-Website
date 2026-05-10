// BI_WEBSITE_BLOCK_v109_HEADER_LOGO_DIAGRAM_FAQ_v1
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const ITEMS = [
  {q:"What does PGI actually cover?",a:"PGI covers your personal guarantee. If your business defaults and the lender calls the guarantee, the insurance pays the lender up to your declared limit."},
  {q:"How is this different from credit insurance?",a:"Credit insurance protects the lender. PGI protects you, the guarantor. Different policy, different beneficiary."},
  {q:"What does it cost?",a:"Premiums depend on loan size, business financials, and coverage limit. A $500K loan with $400K coverage is typically in the low thousands per year."},
  {q:"Can I add coverage to a loan I already have?",a:"Yes. Existing personal guarantees are eligible as long as the loan is in good standing."},
  {q:"What if the business is sold or refinanced?",a:"Coverage ends when the underlying loan is repaid or the personal guarantee is released. Premiums stop accordingly."},
  {q:"Is this available across Canada?",a:"Yes — all 10 provinces and 3 territories. US coverage is in development."},
  {q:"Will this affect my credit?",a:"No. Applying for PGI does not pull credit. Only Markel underwriting reviews your financial documents — no credit bureau involvement."},
  {q:"How fast does the lender accept this policy?",a:"Most Canadian lenders accept Markel coverage immediately. We provide a certificate of insurance you can forward to your loan officer the same day."},
  {q:"What happens if my business closes?",a:"If the underlying loan is paid off through dissolution, the policy ends with the loan. If the lender calls the guarantee, the policy pays — that is exactly what it is for."},
  {q:"What documents do I need?",a:"Most recent T2 corporate return (CRA Notice of Assessment), 6 months of business bank statements, current year-to-date financials, and your loan agreement or term sheet."},
  {q:"Can a co-guarantor be covered too?",a:"Yes. Each guarantor is underwritten and insured separately. Apply once and we coordinate the joint policy."},
];

function List() {
  const [open, setOpen] = useState<number | null>(null);
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
