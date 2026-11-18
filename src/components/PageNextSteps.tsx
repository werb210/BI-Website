// BI_WEBSITE_US_READY_v1 - the short explainer pages ended with no way forward. Every one now closes with the
// same next steps: a quote for owners, and the lender and broker pages for partners.
import { Link } from "react-router-dom";

const BTN = "inline-flex items-center rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white no-underline hover:bg-white/10";

export default function PageNextSteps() {
  return (
    <div className="mt-8 border-t border-white/10 pt-6" data-testid="page-next-steps">
      <p className="mb-3 text-sm text-bf-textMuted">Next steps</p>
      <div className="flex flex-wrap gap-3">
        <Link to="/quote" className={`${BTN} bg-bf-cta border-transparent text-[#0B1F3A] hover:opacity-90`}>Get a quote</Link>
        <Link to="/how-it-works" className={BTN}>How it works</Link>
        <Link to="/us-lenders" className={BTN}>For banks and lenders</Link>
        <Link to="/us-brokers" className={BTN}>For loan brokers</Link>
        <Link to="/faq" className={BTN}>FAQ</Link>
      </div>
    </div>
  );
}
