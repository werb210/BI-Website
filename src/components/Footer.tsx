// BI_WEBSITE_CHROME_v100 - Boreal Risk Management footer, built to the
// BF-Website footer.tsx template. Structurally identical: same background,
// divider, 1200px container, grid, gap, type scale and padding. BI's own
// links, brand and compliance copy.
//
// The compliance paragraphs below are regulatory text. Do not reword them to
// fit a layout. If BF-Website's footer geometry changes, change it here too -
// the two are compared by src/__tests__/chromeParity.v100.test.tsx.
import { Link } from "react-router-dom";
import { PGI_APPLY_URL, PGI_BROKER, PGI_DOCS_URL } from "../lib/pgiPartner";
import logoUrl from "../assets/logo-boreal-mountains-white.svg";
import { OPERATOR_NAME, OPERATOR_PHONE_DISPLAY, OPERATOR_PHONE_HREF } from "../lib/operator";

const SUPPORT_EMAIL = "info@boreal.financial";
// BI_WEBSITE_MAIN_LINE_866_v1 - Boreal Risk Management has its own toll-free line.
// BI_WEBSITE_BLOCK_v789_AUDIT_ROUND2 [141] - shown as (844) 797-6700, from src/lib/operator.ts.
const PHONE_DISPLAY = OPERATOR_PHONE_DISPLAY;
const PHONE_HREF = OPERATOR_PHONE_HREF;

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
            <p className="text-sm leading-relaxed text-white/75">
              A referral partner of {PGI_BROKER}, the licensed broker for Personal Guarantee Insurance in Canada.
            </p>
          </div>
          <div>
            <div className="font-semibold text-white mb-3">Explore</div>
            <ul className="list-none p-0 m-0 text-sm leading-loose">
              <li><a href={PGI_APPLY_URL} target="_blank" rel="noopener noreferrer" className="text-white/75 no-underline">Apply with {PGI_BROKER}</a></li>
              <li><a href={PGI_DOCS_URL} target="_blank" rel="noopener noreferrer" className="text-white/75 no-underline">Program and claims information</a></li>
              <li><Link to="/contact" className="text-white/75 no-underline">Contact us</Link></li>
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
            <a href={PHONE_HREF} className="block text-white/75 no-underline text-sm">
              {PHONE_DISPLAY}
            </a>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-white/75 no-underline text-sm">
              {SUPPORT_EMAIL}
            </a>
            <div className="mt-1 text-sm text-white/75">
              Mon-Fri 10am-8pm ET (8am-6pm MT)
            </div>
          </div>
        </div>

        {/* BI_WEBSITE_PGI_COMPLIANCE_v1 (2026-11-19) - disclosures rewritten after PGI Canada Ltd.'s written notice: name the
            licensed broker, no insurer brand, no rates or estimates, no US offer, Canada only. Regulatory text; do not
            reword to fit a layout. */}
        <p className="text-xs leading-relaxed text-white/75 mt-6 mb-2">
          Boreal Risk Management, a trade name of 2630108 Alberta Ltd., is a referral partner of {PGI_BROKER}. Boreal
          Risk Management is not a licensed insurance broker, agent or insurer and does not quote, underwrite, sell or
          bind insurance. Personal Guarantee Insurance is arranged and administered by {PGI_BROKER}, a licensed
          insurance broker. The offer, program details, conditions and claims information come from {PGI_BROKER};
          see <a href={PGI_DOCS_URL} target="_blank" rel="noopener noreferrer" className="text-white/75 underline">docs.pgicover.com</a>.
        </p>
        <p className="text-xs leading-relaxed text-white/75 mb-2">
          Personal Guarantee Insurance does not prevent business failure, default, insolvency or lender enforcement.
          Coverage is subject to underwriting and the policy wording.
        </p>
        <p className="text-xs leading-relaxed text-white/75 mb-2">
          <strong className="text-white/70">Where available:</strong> Canada, except Quebec residents. In the United
          States, Personal Guarantee Insurance will be arranged by PGI America Ltd. and is not yet available.
        </p>
        <p className="text-xs leading-relaxed text-white/75 mb-4">
          <strong className="text-white/70">Policy questions:</strong> questions about a policy, coverage or a claim go
          to {PGI_BROKER}. Questions about this referral service: <a href={`mailto:${SUPPORT_EMAIL}`} className="text-white/75">{SUPPORT_EMAIL}</a>.
        </p>
        <div className="border-t border-[#1c2538] pt-4 flex justify-between text-xs text-white/75">
          <div className="flex gap-4">
            <Link to="/privacy" className="text-inherit no-underline">Privacy Policy</Link>
            <Link to="/terms" className="text-inherit no-underline">Terms of Service</Link>
          </div>
          <div>(c) {new Date().getFullYear()} {OPERATOR_NAME}</div>
        </div>
      </div>
    </footer>
  );
}
