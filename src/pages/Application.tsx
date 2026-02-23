import { useState } from "react";

type Step =
  | "personal"
  | "address"
  | "business"
  | "loan"
  | "financial"
  | "declaration"
  | "review";

export default function Application() {
  const [step, setStep] = useState<Step>("personal");

  const next = (s: Step) => setStep(s);
  const back = (s: Step) => setStep(s);

  return (
    <div className="container app-container">
      <h1>Personal Guarantee Insurance Application</h1>

      <div className="step-indicator">
        <div className={step === "personal" ? "active" : ""}>Personal</div>
        <div className={step === "address" ? "active" : ""}>Address</div>
        <div className={step === "business" ? "active" : ""}>Business</div>
        <div className={step === "loan" ? "active" : ""}>Loan</div>
        <div className={step === "financial" ? "active" : ""}>Financial</div>
        <div className={step === "declaration" ? "active" : ""}>Declaration</div>
        <div className={step === "review" ? "active" : ""}>Review</div>
      </div>

      {step === "personal" && (
        <section>
          <h2>Personal Details</h2>
          <input placeholder="Title" />
          <input placeholder="First Name" />
          <input placeholder="Middle Name" />
          <input placeholder="Last Name" />
          <input placeholder="Date of Birth" />
          <input placeholder="Email Address" />
          <input placeholder="Mobile Number" />
          <button className="btn" onClick={() => next("address")}>Next</button>
        </section>
      )}

      {step === "address" && (
        <section>
          <h2>Home Address</h2>
          <input placeholder="Address Line 1" />
          <input placeholder="Address Line 2" />
          <input placeholder="City" />
          <input placeholder="Province" />
          <input placeholder="Postal Code" />
          <input placeholder="Country (Canada)" />
          <input placeholder="Years at Address" />
          <div className="btn-row">
            <button onClick={() => back("personal")}>Back</button>
            <button className="btn" onClick={() => next("business")}>Next</button>
          </div>
        </section>
      )}

      {step === "business" && (
        <section>
          <h2>Business Details</h2>
          <input placeholder="Company Name" />
          <input placeholder="Company Registration Number" />
          <input placeholder="Registered Address" />
          <input placeholder="Trading Address" />
          <input placeholder="Nature of Business" />
          <input placeholder="Industry Sector" />
          <input placeholder="Years Trading" />
          <input placeholder="Number of Employees" />
          <input placeholder="Website" />
          <div className="btn-row">
            <button onClick={() => back("address")}>Back</button>
            <button className="btn" onClick={() => next("loan")}>Next</button>
          </div>
        </section>
      )}

      {step === "loan" && (
        <section>
          <h2>Loan Details</h2>
          <input placeholder="Lender Name" />
          <input placeholder="Facility Type (Term Loan / LOC / etc.)" />
          <input placeholder="Secured or Unsecured" />
          <input placeholder="Total Loan Amount (CAD)" />
          <input placeholder="Personal Guarantee Amount (CAD)" />
          <input placeholder="Loan Term (Years)" />
          <input placeholder="Security Provided (if secured)" />
          <input placeholder="Purpose of Loan" />
          <div className="btn-row">
            <button onClick={() => back("business")}>Back</button>
            <button className="btn" onClick={() => next("financial")}>Next</button>
          </div>
        </section>
      )}

      {step === "financial" && (
        <section>
          <h2>Financial Information</h2>
          <input placeholder="Latest Annual Turnover" />
          <input placeholder="Net Profit / Loss" />
          <input placeholder="Total Assets" />
          <input placeholder="Total Liabilities" />
          <input placeholder="Existing Personal Guarantees Outstanding" />
          <div className="btn-row">
            <button onClick={() => back("loan")}>Back</button>
            <button className="btn" onClick={() => next("declaration")}>Next</button>
          </div>
        </section>
      )}

      {step === "declaration" && (
        <section>
          <h2>Declaration</h2>
          <label>
            <input type="checkbox" /> I confirm the information provided is true and accurate.
          </label>
          <label>
            <input type="checkbox" /> I have not been declared bankrupt in the past 5 years.
          </label>
          <label>
            <input type="checkbox" /> I understand this policy covers up to 80% of the enforced guarantee.
          </label>
          <textarea placeholder="Additional disclosures (insolvency, claims, etc.)" />
          <div className="btn-row">
            <button onClick={() => back("financial")}>Back</button>
            <button className="btn" onClick={() => next("review")}>Review</button>
          </div>
        </section>
      )}

      {step === "review" && (
        <section>
          <h2>Review & Submit</h2>
          <p>Please review your information before submission.</p>
          <button className="btn large">Submit Application</button>
        </section>
      )}

      <footer>© Boreal Insurance — Canada</footer>
    </div>
  );
}
