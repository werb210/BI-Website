// BI_WEBSITE_BLOCK_v84_ROUTES_RESKIN_AND_SCORE_TC_v1 — palette parity
import PageNextSteps from "../components/PageNextSteps"; // BI_WEBSITE_US_READY_v1
import { money, useMarket } from "../lib/market";
export default function Coverage() {
  const { terms } = useMarket();
  return (
    <main className="min-h-screen bg-bf-bg px-6 py-12 text-white">
      <div className="mx-auto max-w-4xl rounded-xl border border-white/10 bg-bf-surface p-8">
        <h1 className="mb-6 text-3xl font-bold">Coverage</h1>

        <p className="mb-4 text-bf-textMuted">PGI can cover {terms.shareText} of an enforceable personal guarantee.{terms.deductibleText ? ` The deductible is ${terms.deductibleText}.` : ""}</p>
        <p className="mb-4 text-bf-textMuted">Maximum coverage is {money(terms, terms.limit)}.</p>
        <p className="text-bf-textMuted">
          Final terms depend on loan structure, borrower profile, and lender underwriting requirements.
        </p>
        <PageNextSteps />
      </div>
    </main>
  );
}
