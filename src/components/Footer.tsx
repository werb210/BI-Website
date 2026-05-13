// BI_WEBSITE_BLOCK_v82_BF_PARITY_FOOTER_v1
// Mirror of BF-Website client/src/components/layout/Footer.tsx — three
// columns (brand / Explore / Contact), dark navy #071a2f bg, gray text.
// Cross-links back to boreal.financial. No external icons; pure links.
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[#071a2f] py-16 text-gray-300">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-8 md:grid-cols-4">
        <div>
          <h3 className="mb-4 font-semibold text-white">Boreal Risk Management</h3>
          <p>Personal guarantee insurance for Canadian businesses.</p>
        </div>

        <div>
          <h4 className="mb-4 text-white">Explore</h4>
          <ul className="space-y-2">
            <li><Link to="/quote" className="block hover:text-white">Get a Quote</Link></li>
            <li><Link to="/applications/new" className="block hover:text-white">Apply Now</Link></li>
            <li><Link to="?faq=1" className="block hover:text-white">FAQ</Link></li>
            {/* BI_WEBSITE_BLOCK_v173_HEADER_URL_AND_MONTH_INPUT_v1 */}
            <li>
              <a
                href="https://www.boreal.financial"
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:text-white"
                data-testid="bi-footer-link-boreal-financial"
              >
                Visit Boreal Financial
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-white">Sign In</h4>
          <ul className="space-y-2">
            <li><Link to="/lender/login" className="block hover:text-white">Lender Login</Link></li>
            {/* BI_WEBSITE_BLOCK_v96_LAUNCH_UX_v2 — referrer login restored */}
              <li><Link to="/referrer/login" className="block hover:text-white">Referral Login</Link></li>
          </ul>
        </div>

        {/* BI_WEBSITE_BLOCK_v105_MARKETING_TIER_2_v1 — Contact (placeholders) */}
        <div>
          <h4 className="mb-4 text-white">Contact</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="tel:+1-000-000-0000" className="hover:text-white">1-XXX-XXX-XXXX</a></li>
            <li><a href="mailto:hello@boreal.financial" className="hover:text-white">hello@boreal.financial</a></li>
            <li className="opacity-70">Mon–Fri 8am–6pm MT</li>
          </ul>
        </div>

        <div className="md:col-span-4 mt-4 text-xs text-gray-400 leading-relaxed">
          Boreal Risk Management is a referral platform operated by Boreal Financial. We are not a licensed insurance broker, agent, or adviser. We introduce Canadian businesses to licensed brokers who arrange Personal Guarantee Insurance underwritten by Markel Canada Limited (A-rated by AM Best, S&amp;P, and Fitch). Coverage is subject to underwriting approval, policy terms, and exclusions issued by the licensed broker and insurer. Premium estimates shown here are illustrative and non-binding; final terms are set when a licensed broker binds a policy. Questions about this referral service: hello@boreal.financial.
        </div>

        <div className="md:col-span-4 mt-8 border-t border-white/10 pt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-400">
          {/* BI_WEBSITE_BLOCK_v94_LAUNCH_HARDENING_v1 */}
          <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-white">Terms of Service</Link>
          <span className="opacity-60">© 2026 Boreal Risk Management</span>
        </div>
      </div>
    </footer>
  );
}
