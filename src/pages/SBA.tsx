// BI_WEBSITE_SBA_PAGE_v1 - the United States counterpart of the CSBFP page: the personal guarantee on an SBA loan.
import { Link } from "react-router-dom";
import MarkelBadge from "../components/MarkelBadge";

export default function SBA() {
  return (
    <main className="min-h-screen bg-bf-bg text-slate-200">
      <section className="mx-auto max-w-3xl px-5 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-bf-textMuted hover:text-white mb-6"><span aria-hidden="true">←</span><span>Back to home</span></Link>
        <h1 className="text-3xl font-bold text-white">The Personal Guarantee on an SBA Loan</h1>
        <p className="mt-4 text-lg">An SBA loan does not remove your personal guarantee. It usually requires one.</p>
        <div className="mt-8 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Who has to sign</h2>
            <p className="mt-2">SBA 7(a) and 504 loans generally require an unlimited personal guarantee from every owner of 20% or more of the business. Lenders may ask other owners and key people to sign as well.</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Who the SBA guarantee protects</h2>
            <p className="mt-2">The SBA&apos;s guarantee is a promise to the lender, not to you. If the business cannot repay, the lender can still call your personal guarantee, and your home, savings and other personal assets can be reached.</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Where Personal Guarantee Insurance fits</h2>
            <p className="mt-2">PGI is placed on your personal guarantee. If the guarantee is called and a covered claim is made, the policy can pay up to 80% of the enforceable guarantee, to a limit of $1,000,000. Each guarantor is underwritten and insured separately.</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">What you need to start</h2>
            <p className="mt-2">Your loan amount and lender, last year&apos;s revenue and EBITDA, and a few minutes. You get a preliminary indication before any full application.</p>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to="/applications/new" className="bf-btn bf-btn--primary">Start Your Application</Link>
          <Link to="/quote" className="bf-btn bf-btn--secondary">Get a Quote</Link>
        </div>
        <MarkelBadge className="mt-8" />
        <p className="mt-6 text-xs text-bf-textMuted">Boreal Risk Management is a referral and risk advisory partner, not a licensed insurance broker, agent, or adviser, and is not affiliated with the U.S. Small Business Administration. Coverage is subject to underwriting, eligibility, policy terms, conditions and exclusions.</p>
      </section>
    </main>
  );
}
