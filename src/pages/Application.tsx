import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Application() {
  const nav = useNavigate();
  const leadId = localStorage.getItem("biLeadId");

  const [personalData, setPersonalData] = useState({});
  const [companyData, setCompanyData] = useState({});
  const [guaranteeData, setGuaranteeData] = useState({});
  const [declarations, setDeclarations] = useState({});
  const [consentData, setConsentData] = useState({});

  async function submit() {
    const quoteResult = JSON.parse(localStorage.getItem("biQuote") || "{}");

    await axios.post("https://api.boreal.financial/bi/application", {
      leadId,
      personalData,
      companyData,
      guaranteeData,
      declarations,
      consentData,
      quoteResult
    });

    nav("/thank-you");
  }

  return (
    <div className="container">
      <h1>Insurance Application</h1>

      <h3>Personal Details</h3>
      <input placeholder="Full Name" onChange={(e) => setPersonalData({ fullName: e.target.value })} />

      <h3>Company Details</h3>
      <input placeholder="Company Name" onChange={(e) => setCompanyData({ companyName: e.target.value })} />

      <h3>Guarantee Details</h3>
      <input
        placeholder="Guarantee Amount"
        onChange={(e) => setGuaranteeData({ guaranteeAmount: e.target.value })}
      />

      <h3>Declarations</h3>
      <input
        placeholder="Any bankruptcies?"
        onChange={(e) => setDeclarations({ bankruptcies: e.target.value })}
      />

      <input
        placeholder="Consent"
        onChange={(e) => setConsentData({ consent: e.target.value })}
      />

      <button onClick={submit}>Submit Application</button>
    </div>
  );
}
