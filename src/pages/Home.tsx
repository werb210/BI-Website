export default function Home() {
  return (
    <div>
      <section className="hero">
        <div className="hero-content">
          <h1>Protect Your Personal Assets</h1>
          <p>
            Personal Guarantee Insurance protects Canadian business owners when
            lenders enforce personal guarantees. Preserve your savings, home
            equity, and investments.
          </p>
          <a href="/apply" className="btn-primary">Apply Now</a>
        </div>
      </section>

      <section className="section">
        <h2>Coverage Overview</h2>
        <ul>
          <li>Coverage up to 80% of the enforced guarantee</li>
          <li>Maximum insured amount: $1,400,000 CAD</li>
          <li>We insure both secured and unsecured liabilities</li>
          <li>Annual renewable policy</li>
        </ul>
      </section>

      <section className="content-section">
        <h2>Real Protection. Real Scenarios.</h2>

        <div className="case-grid">
          <div>
            <h3>Construction Firm</h3>
            <p>
              $1.2M secured loan. Lender enforced personal guarantee following
              downturn. Policy covered 80% of exposure.
            </p>
          </div>

          <div>
            <h3>Franchise Operator</h3>
            <p>
              $750k unsecured facility. Guarantee enforced after closure.
              Claim submitted prior to insolvency filing and paid.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
