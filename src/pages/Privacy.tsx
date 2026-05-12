// BI_WEBSITE_BLOCK_v128_MOBILE_FIRST_AND_LOGO_AND_LEGAL_v1
// Privacy policy with real content. Replaces the old placeholder
// stubs. Drafted for the operator's review — not legal advice; replace
// before launch if your counsel wants different wording.
export default function Privacy() {
  return (
    <div className="bg-bf-bg text-white">
      <section className="mx-auto max-w-3xl px-5 py-12 md:px-8 md:py-16">
        <h1 className="mb-2 text-3xl font-bold text-white sm:text-4xl">Privacy Policy</h1>
        <p className="mb-8 text-sm text-slate-400">Last updated: May 2026</p>
        <div className="space-y-8 leading-relaxed">
          <p className="text-slate-300">
            Boreal Risk ("we", "us", "our") respects your privacy. This Privacy Policy
            describes how we collect, use, disclose, and safeguard personal information
            when you use boreal.financial and related services. It is written to align
            with Canada's Personal Information Protection and Electronic Documents Act
            (PIPEDA) and applicable provincial privacy laws.
          </p>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">Information We Collect</h2>
            <p className="text-slate-300">
              We collect information you provide directly when you request a quote, start
              an application, or contact us. This typically includes your name, business
              name, mobile phone number, email address, business address, NAICS code,
              date of birth, loan amount and purpose, financial figures (annual revenue,
              EBITDA, total debt, monthly debt service, collateral and enterprise value),
              consent attestations, and any documents you upload (financial statements,
              AR/AP aging, profit &amp; loss, balance sheet). We also collect technical
              information automatically — IP address, device and browser type, pages
              viewed, and approximate location derived from IP — to operate, secure, and
              improve the service. Cookies and similar storage are used for sign-in
              persistence and session integrity; we do not place advertising trackers.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">How We Use Information</h2>
            <p className="text-slate-300">
              We use your information to: (a) provide the requested service — generating
              indicative quotes, processing applications, and arranging carrier submission
              with our licensed underwriting partner Markel Canada Limited; (b) verify
              identity via SMS one-time passcodes through Twilio; (c) comply with legal,
              regulatory, anti-money-laundering, and audit obligations; (d) communicate
              with you about your application, your policy if bound, and material service
              changes; (e) secure the platform against fraud and abuse; and (f) improve
              the product through aggregate, de-identified analytics. We do not sell your
              personal information.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">Information Sharing</h2>
            <p className="text-slate-300">
              We share information only as needed to deliver the service or as required by
              law. Recipients include: the carrier (Markel Canada Limited and its program
              manager PGI) for underwriting and policy administration; service providers
              under written agreements (cloud hosting on Microsoft Azure, SMS delivery via
              Twilio, document storage, and analytics) bound to use the data only for
              service purposes; and regulators, courts, or law enforcement where compelled
              by valid legal process. If you submit through a lender or referral partner,
              we identify that partner to the carrier so the deal is attributed correctly.
              No information is shared with advertisers.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">Data Retention &amp; Security</h2>
            <p className="text-slate-300">
              Application records, supporting documents, and policy artifacts are retained
              for the longer of (a) seven years after the policy ends or the application
              is declined / withdrawn, or (b) the period required by applicable insurance
              and tax law. We use encryption in transit (TLS 1.2+) and at rest, role-based
              access controls, audit logging, and least-privilege access for staff. No
              system is perfectly secure, but we treat your information with the care a
              prudent financial-services platform would.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">Your Rights Under PIPEDA</h2>
            <p className="text-slate-300">
              You can ask us what personal information we hold about you, request a copy,
              ask for corrections, withdraw consent (subject to legal and contractual
              constraints — for example, withdrawing consent on a bound policy may end
              coverage), or ask that we delete information we are not required to keep.
              We respond within 30 days. If you believe we have not handled your request
              properly, you may complain to the Office of the Privacy Commissioner of
              Canada at priv.gc.ca.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">Children</h2>
            <p className="text-slate-300">
              The service is for adult Canadian business owners and guarantors. We do not
              knowingly collect personal information from anyone under the age of majority.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">Changes to This Policy</h2>
            <p className="text-slate-300">
              We may update this Policy as our service and the law evolve. The "Last
              updated" date above reflects the most recent revision. Material changes
              will be highlighted on this page.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">Contact</h2>
            <p className="text-slate-300">
              For privacy questions, requests, or complaints, contact our Privacy Officer
              at <a className="text-bf-cta hover:underline" href="mailto:privacy@boreal.financial">privacy@boreal.financial</a>.
              Mail can be addressed to Boreal Risk, c/o Boreal Financial, Cochrane, Alberta, Canada.
            </p>
          </section>
        </div>
      </section>
    </div>
  );
}
