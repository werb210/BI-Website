import { Link } from "react-router-dom";

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Protect Your Personal Assets</h1>
          <p>
            Personal Guarantee Insurance protects Canadian business owners when
            lenders enforce personal guarantees.
          </p>
          <Link to="/apply" className="btn-primary">
            Apply Now
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>Coverage Overview</h2>
          <ul>
            <li>Coverage up to 80% of enforced guarantee</li>
            <li>Maximum insured amount $1,400,000 CAD</li>
            <li>Secured & unsecured facilities covered</li>
            <li>Annual renewable policy</li>
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>Real Protection. Real Scenarios.</h2>
          <p>
            Construction firm with $1.2M secured loan — 80% covered after
            enforcement.
          </p>
          <p>
            Franchise operator with $750K unsecured facility — claim paid prior
            to insolvency.
          </p>
        </div>
      </section>
    </>
  );
}
