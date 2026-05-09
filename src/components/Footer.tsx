// BI_WEBSITE_BLOCK_v82_BF_PARITY_FOOTER_v1
// Mirror of BF-Website client/src/components/layout/Footer.tsx — three
// columns (brand / Explore / Contact), dark navy #071a2f bg, gray text.
// Cross-links back to boreal.financial. No external icons; pure links.
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[#071a2f] py-16 text-gray-300">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-8 md:grid-cols-3">
        <div>
          <h3 className="mb-4 font-semibold text-white">Boreal Insurance</h3>
          <p>Personal guarantee insurance for Canadian businesses.</p>
        </div>

        <div>
          <h4 className="mb-4 text-white">Explore</h4>
          <ul className="space-y-2">
            <li><Link to="/quote" className="block hover:text-white">Get a Quote</Link></li>
            <li><Link to="/applications/new" className="block hover:text-white">Apply Now</Link></li>
            <li>
              <a
                href="https://boreal.financial"
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:text-white"
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

        <div className="md:col-span-3 mt-8 border-t border-white/10 pt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-400">
          {/* BI_WEBSITE_BLOCK_v94_LAUNCH_HARDENING_v1 */}
          <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-white">Terms of Service</Link>
          <span className="opacity-60">© 2026 Boreal Insurance</span>
        </div>
      </div>
    </footer>
  );
}
