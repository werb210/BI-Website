// BI_WEBSITE_BLOCK_v106_DIAGRAM_AND_QUOTE_MODAL_v1
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const MAX_LOAN = 1_000_000, MIN_LOAN = 10_000;
const RATE = { secured: 0.016, unsecured: 0.04 };
const fmt = (n: number) => n.toLocaleString("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });

export default function QuoteModal() {
  const [params, setParams] = useSearchParams();
  const open = params.get("quote") === "1";
  const nav = useNavigate();
  const [loan, setLoan] = useState(500_000);
  const [pct, setPct] = useState(0.5);
  const [type, setType] = useState<"secured" | "unsecured">("secured");
  const cov = useMemo(() => Math.round(Math.min(Math.max(loan, 0), MAX_LOAN) * pct), [loan, pct]);
  const prem = useMemo(() => Math.round(cov * RATE[type]), [cov, type]);

  function close() {
    const next = new URLSearchParams(params);
    next.delete("quote");
    setParams(next, { replace: true });
  }
  function applyNow() {
    sessionStorage.setItem("bi.quote", JSON.stringify({ loan, coveragePct: pct, type, coverageAmount: cov, annualPremium: prem }));
    close();
    nav("/applications/new");
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/70 p-4 sm:p-8" onClick={close} role="dialog" aria-modal="true" aria-label="Get a PGI quote">
      <div className="relative w-full max-w-2xl my-4 sm:my-8" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={close} aria-label="Close" className="absolute -top-3 -right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-bf-bg border border-white/20 text-white text-xl hover:bg-white/10">×</button>
        <div className="rounded-2xl border border-white/10 bg-bf-surface p-6 md:p-8">
          <h2 className="text-2xl font-bold text-white text-center md:text-3xl">Get your PGI quote</h2>
          <p className="mt-2 text-center text-sm text-slate-400">Three quick questions. Indicative annual premium.</p>
          <div className="mt-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">1. How much debt to cover?</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                <input type="number" inputMode="numeric" min={MIN_LOAN} max={MAX_LOAN} step={1000} value={loan} onChange={(e) => setLoan(Math.min(Math.max(Number(e.target.value || 0), 0), MAX_LOAN))} className="w-full rounded-lg border border-white/15 bg-bf-bg px-9 py-3 text-white outline-none focus:border-blue-500" />
              </div>
              <p className="mt-1 text-xs text-slate-500">Min {fmt(MIN_LOAN)} · Max {fmt(MAX_LOAN)}</p>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm text-white mb-2"><span>2. Coverage</span><span className="text-lg font-semibold">{Math.round(pct * 100)}%</span></div>
              <input type="range" min={5} max={80} step={5} value={Math.round(pct * 100)} onChange={(e) => setPct(Number(e.target.value) / 100)} className="w-full accent-blue-600" />
              <div className="flex justify-between text-xs text-slate-500"><span>5%</span><span>Max 80%</span></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">3. Debt type</label>
              <div className="grid grid-cols-2 gap-3">
                {(["secured", "unsecured"] as const).map((t) => (
                  <button key={t} type="button" onClick={() => setType(t)} className={"rounded-lg border p-3 text-left transition " + (type === t ? "border-blue-500 bg-blue-600/10" : "border-white/15 bg-bf-bg hover:border-white/30")}>
                    <div className="font-semibold text-white capitalize">{t}</div>
                    <div className="mt-1 text-xs text-slate-400">{(RATE[t] * 100).toFixed(1)}% rate</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-blue-500/30 bg-blue-600/10 p-5 text-center">
              <p className="text-sm text-slate-300">To cover <span className="font-semibold text-white">{Math.round(pct * 100)}%</span> of <span className="font-semibold text-white">{fmt(loan)}</span>, annual premium is</p>
              <p className="mt-2 text-3xl font-bold text-white md:text-4xl">{fmt(prem)}</p>
              <p className="mt-1 text-xs text-slate-400">Indicative. Final premium subject to underwriting.</p>
            </div>
            <button type="button" onClick={applyNow} disabled={loan < MIN_LOAN || pct <= 0} className="w-full rounded-full bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-400">Apply Now</button>
          </div>
        </div>
      </div>
    </div>
  );
}
