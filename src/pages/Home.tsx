import { Link } from "react-router-dom";
import PremiumCalculator from "../components/PremiumCalculator";

export default function Home(){
  return(
    <>
      <section className="hero">
        <div className="container">
          <h1>Protect Your Personal Assets</h1>
          <p>
            Insurance for Canadian business owners with personal guarantees.
            Protect your home, savings, and investments.
          </p>

          <Link to="/apply" className="bg-brand-accent hover:bg-brand-accentHover text-white rounded-full h-11 px-6 inline-flex items-center justify-center font-medium">
            Start Application
          </Link>

          <PremiumCalculator />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>Coverage Overview</h2>
          <ul>
            <li>Up to 80% coverage of enforced guarantee</li>
            <li>Maximum insured: $1,400,000 CAD</li>
            <li>Secured & unsecured facilities</li>
            <li>Annual renewable policy</li>
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>Why Choose Boreal</h2>
          <div className="badges">
            <div className="badge">Canadian Business Focused</div>
            <div className="badge">Specialist Guarantee Coverage</div>
            <div className="badge">Trusted UK Underwriter</div>
            <div className="badge">Secure Application Process</div>
          </div>
        </div>
      </section>

      <div className="mobile-cta">
        <Link to="/apply">Apply Now</Link>
      </div>
    </>
  )
}
