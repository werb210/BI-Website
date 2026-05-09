// BI_WEBSITE_BLOCK_v95_LAUNCH_UX_v1 — 3-step centered quote wizard with live premium calc.
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const MAX_LOAN = 1_000_000;
const MIN_LOAN = 10_000;
const RATE = { secured: 0.016, unsecured: 0.04 };

function fmtCurrency(n: number) {
  return n.toLocaleString("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });
}

function StepLabel({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
        {n}
      </span>
      <h2 className="text-lg font-semibold text-white md:text-xl">{children}</h2>
    </div>
  );
}

export default function Quote() {
  const nav = useNavigate();
  const [loan, setLoan] = useState(500_000);
  const [coveragePct, setCoveragePct] = useState(0.5);
  const [type, setType] = useState<"secured" | "unsecured">("secured");

  const coverageAmount = useMemo(
    () => Math.round(Math.min(Math.max(loan, 0), MAX_LOAN) * coveragePct),
    [loan, coveragePct]
  );
  const annualPremium = useMemo(
    () => Math.round(coverageAmount * RATE[type]),
    [coverageAmount, type]
  );

  function applyNow() {
    sessionStorage.setItem(
      "bi.quote",
      JSON.stringify({ loan, coveragePct, type, coverageAmount, annualPremium })
    );
    nav("/applications/new");
  }

  const canApply = loan >= MIN_LOAN && coveragePct > 0;

  return (
    <main className="min-h-screen bg-bf-bg text-slate-200">
      <section className="mx-auto w-full max-w-2xl px-5 py-12 md:px-8 md:py-16">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-white md:text-4xl">Get Your PGI Quote</h1>
          <p className="mt-3 text-base text-slate-400 md:text-lg">
            Three quick questions. Indicative annual premium in seconds.
          </p>
        </header>

        <div className="space-y-8 rounded-2xl border border-white/10 bg-bf-surface p-6 md:p-8">
          <div>
            <StepLabel n={1}>How much is your debt to cover with PGI?</StepLabel>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                $
              </span>
              <input
                type="number"
                inputMode="numeric"
                min={MIN_LOAN}
                max={MAX_LOAN}
                step={1000}
                value={loan}
                onChange={(e) =>
                  setLoan(Math.min(Math.max(Number(e.target.value || 0), 0), MAX_LOAN))
                }
                className="w-full rounded-lg border border-white/15 bg-bf-bg px-9 py-3 text-lg text-white outline-none transition focus:border-blue-500"
                placeholder="500,000"
                aria-label="Debt amount"
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Minimum {fmtCurrency(MIN_LOAN)} · Maximum {fmtCurrency(MAX_LOAN)}
            </p>
          </div>

          <div>
            <StepLabel n={2}>Select the percentage of coverage</StepLabel>
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>Coverage</span>
              <span className="text-lg font-semibold text-white">{Math.round(coveragePct * 100)}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={80}
              step={5}
              value={Math.round(coveragePct * 100)}
              onChange={(e) => setCoveragePct(Number(e.target.value) / 100)}
              className="mt-2 w-full accent-blue-600"
              aria-label="Coverage percentage"
            />
            <div className="mt-1 flex justify-between text-xs text-slate-500">
              <span>5%</span>
              <span>Max 80%</span>
            </div>
          </div>

          <div>
            <StepLabel n={3}>Is the debt secured or unsecured?</StepLabel>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setType("secured")}
                className={`rounded-lg border p-4 text-left transition ${
                  type === "secured"
                    ? "border-blue-500 bg-blue-600/10"
                    : "border-white/15 bg-bf-bg hover:border-white/30"
                }`}
              >
                <div className="font-semibold text-white">Secured</div>
                <div className="mt-1 text-xs text-slate-400">
                  Backed by tangible collateral. Lower rate ({(RATE.secured * 100).toFixed(1)}%).
                </div>
              </button>
              <button
                type="button"
                onClick={() => setType("unsecured")}
                className={`rounded-lg border p-4 text-left transition ${
                  type === "unsecured"
                    ? "border-blue-500 bg-blue-600/10"
                    : "border-white/15 bg-bf-bg hover:border-white/30"
                }`}
              >
                <div className="font-semibold text-white">Unsecured</div>
                <div className="mt-1 text-xs text-slate-400">
                  No specific collateral. Higher rate ({(RATE.unsecured * 100).toFixed(1)}%).
                </div>
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-blue-500/30 bg-blue-600/10 p-5 text-center">
            <p className="text-sm text-slate-300">
              To cover{" "}
              <span className="font-semibold text-white">{Math.round(coveragePct * 100)}%</span> of
              the debt amount{" "}
              <span className="font-semibold text-white">{fmtCurrency(loan)}</span> would have
              annual premiums of
            </p>
            <p className="mt-3 text-3xl font-bold text-white md:text-4xl">
              {fmtCurrency(annualPremium)}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Indicative. Final premium subject to underwriting.
            </p>
          </div>

          <button
            type="button"
            onClick={applyNow}
            disabled={!canApply}
            className="w-full rounded-full bg-blue-600 px-6 py-4 text-base font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            Apply Now
          </button>
        </div>
      </section>
    </main>
  );
}
