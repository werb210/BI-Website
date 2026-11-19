// BI_WEBSITE_BLOCK_v84_ROUTES_RESKIN_AND_SCORE_TC_v1 — palette parity
import PageNextSteps from "../components/PageNextSteps"; // BI_WEBSITE_US_READY_v1
// v131: explicit back-to-home link. Navbar logo is also a Link to /
// but the affordance isn't obvious on a child page.
import { money, useMarket } from "../lib/market";
import { Link } from "react-router-dom";

export default function HowItWorks() {
  const { terms } = useMarket();
  return (
    <main className="min-h-screen bg-bf-bg px-6 py-12 text-white">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-bf-textMuted hover:text-white mb-6"
        >
          <span aria-hidden="true">←</span>
          <span>Back to home</span>
        </Link>
      </div>
      <div className="mx-auto max-w-4xl rounded-xl border border-white/10 bg-bf-surface p-8">
        <h1 className="mb-6 text-3xl font-bold">How PGI works</h1>

        <ol className="list-decimal space-y-4 pl-5 text-bf-textMuted">
          <li>
            <span className="font-semibold text-white">Loan and guarantee are set.</span> Your lender issues financing and
            requires a personal guarantee from owners or directors.
          </li>
          <li>
            <span className="font-semibold text-white">Coverage is selected.</span> A PGI policy is placed against the guarantee
            amount with coverage {terms.shareText} and a policy limit up to {money(terms, terms.limit)}.
          </li>
          <li>
            <span className="font-semibold text-white">Policy responds after enforcement.</span> If the business defaults and a valid
            claim is triggered, the policy can reimburse the covered portion of the enforceable guarantee.
          </li>
        </ol>
        <PageNextSteps />
      </div>
    </main>
  );
}
