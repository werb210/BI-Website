import { useState } from "react";

export function useApplicationStore() {
  const [step, setStep] = useState(1);

  const [personal, setPersonal] = useState({});
  const [company, setCompany] = useState({});
  const [guarantee, setGuarantee] = useState({});
  const [declarations, setDeclarations] = useState({});
  const [consent, setConsent] = useState({});
  const [quote, setQuote] = useState<any>(null);

  return {
    step,
    setStep,
    personal,
    setPersonal,
    company,
    setCompany,
    guarantee,
    setGuarantee,
    declarations,
    setDeclarations,
    consent,
    setConsent,
    quote,
    setQuote
  };
}
