// BI_WEBSITE_CHROME_v100 - Boreal Risk Management footer, built to the
// BF-Website footer.tsx template. Structurally identical: same background,
// divider, 1200px container, grid, gap, type scale and padding. BI's own
// links, brand and compliance copy.
//
// The compliance paragraphs below are regulatory text. Do not reword them to
// fit a layout. If BF-Website's footer geometry changes, change it here too -
// the two are compared by src/__tests__/chromeParity.v100.test.tsx.
import { Link } from "react-router-dom";
import markelUrl from "../assets/logo-markel.svg";
import logoUrl from "../assets/logo-boreal-mountains-white.svg";

const SUPPORT_EMAIL = "info@boreal.financial";

export default function Footer() {
  return (
    <footer className="bg-[#0a1120] border-t border-[#1c2538] text-white/80 px-6 py-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid gap-8 mb-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <div>
            <div className="flex items-center gap-3 mb-3">
              <img src={logoUrl} alt="" className="h-8 w-auto" />
              <span className="font-semibold text-white">Boreal Risk Management</span>
            </div>
            <p className="text-sm leading-relaxed text-white/65">
              Personal Guarantee Insurance for Canadian and United States Business Owners.
            </p>
          </div>
          <div>
            <div className="font-semibold text-white mb-3">Explore</div>
            <ul className="list-none p-0 m-0 text-sm leading-loose">
              <li><Link to="/quote" className="text-white/75 no-underline">Get a Quote</Link></li>
              <li><Link to="/applications/new" className="text-white/75 no-underline">Get Started</Link></li>
              <li><Link to="/faq" className="text-white/75 no-underline">FAQ</Link></li>
              <li><a href="https://www.boreal.financial" target="_blank" rel="noopener noreferrer" className="text-white/75 no-underline">Visit Boreal Financial</a></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-white mb-3">Sign In</div>
            <ul className="list-none p-0 m-0 text-sm leading-loose">
              <li><Link to="/lender/login" className="text-white/75 no-underline">Lender Login</Link></li>
              <li><a href="https://staff.boreal.financial/referrer" target="_blank" rel="noopener noreferrer" className="text-white/75 no-underline">Referral Login</a></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-white mb-3">Contact</div>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-white/75 no-underline text-sm">
              {SUPPORT_EMAIL}
            </a>
            <div className="mt-1 text-sm text-white/55">
              Mon–Fri 8am–6pm MT
            </div>
            <div className="mt-4">
              <div className="text-[11px] text-white/45 mb-1.5 tracking-[1px]">UNDERWRITTEN BY</div>
              <img src={markelUrl} alt="Markel Canada" className="h-7 w-auto" />
            </div>
          </div>
        </div>

        {/* v130 compliance: tightened partner-role disclaimer (audit item 10) and added scope-of-PGI line (audit item 11). */}
        <p className="text-xs leading-relaxed text-white/50 mt-6 mb-2">
          Boreal Risk Management is a referral and risk advisory partner. Insurance is arranged only
          through appropriately licensed insurance entities. We are not a licensed insurance broker,
          agent, or adviser. We introduce Canadian and United States business owners to licensed brokers
          who arrange
          Personal Guarantee Insurance underwritten by Markel Canada Limited (A-rated by AM Best,
          S&amp;P, and Fitch). Coverage is subject to underwriting, eligibility, policy terms,
          conditions, exclusions, and applicable insurance regulation. Premium estimates
          shown here are illustrative and non-binding; final terms are set when a licensed broker
          binds a policy. Questions about this referral service: {SUPPORT_EMAIL}.
        </p>
        <p className="text-xs leading-relaxed text-white/50 mb-4">
          Personal Guarantee Insurance does not prevent business failure, default, insolvency,
          bankruptcy, or lender enforcement. It is designed to respond only to covered claims under
          the policy.
        </p>
        {/* v131 compliance: Quebec exclusion, compensation disclosure, no-cost disclosure, complaints routing. */}
        <p className="text-xs leading-relaxed text-white/50 mb-2">
          <strong className="text-white/70">Geographic availability:</strong> This
          referral service is available in 9 Canadian provinces and 3 territories, and in the United
          States. <strong>Not available to Quebec residents.</strong>
        </p>
        <p className="text-xs leading-relaxed text-white/50 mb-2">
          <strong className="text-white/70">Cost and compensation:</strong> There
          is no cost to the policyholder to use Boreal Risk Management&rsquo;s referral services.
          Boreal Risk Management may receive referral compensation from the licensed broker or
          carrier upon successful policy placement.
        </p>
        <p className="text-xs leading-relaxed text-white/50 mb-4">
          <strong className="text-white/70">Policy questions:</strong> Questions
          about an existing policy, coverage, or a claim should be directed to the licensed broker
          named on your policy documents or to Markel Canada Limited. Questions about this referral
          service: <a href={`mailto:${SUPPORT_EMAIL}`} className="text-white/65">{SUPPORT_EMAIL}</a>.
        </p>

        <div className="border-t border-[#1c2538] pt-4 flex justify-between text-xs text-white/55">
          <div className="flex gap-4">
            <Link to="/privacy" className="text-inherit no-underline">Privacy Policy</Link>
            <Link to="/terms" className="text-inherit no-underline">Terms of Service</Link>
          </div>
          <div>© {new Date().getFullYear()} Boreal Risk Management</div>
        </div>
      </div>
    </footer>
  );
}
