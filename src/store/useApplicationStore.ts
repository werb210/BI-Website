import { useEffect, useState } from "react";

type PersonalData = Record<string, unknown>;
type CompanyData = Record<string, unknown>;
type GuaranteeData = Record<string, unknown>;
type DeclarationData = Record<string, unknown>;
type ConsentData = Record<string, unknown>;

type PersistedApplicationState = {
  step: number;
  personal: PersonalData;
  company: CompanyData;
  guarantee: GuaranteeData;
  declarations: DeclarationData;
  consent: ConsentData;
  quote: unknown;
  quoteCreatedAt?: number;
  referralCode?: string;
  lenderId?: string;
};

const STORAGE_KEY = "bi_app";

const defaultState: PersistedApplicationState = {
  step: 1,
  personal: {},
  company: {},
  guarantee: {},
  declarations: {},
  consent: {},
  quote: null,
  quoteCreatedAt: undefined,
  referralCode: undefined,
  lenderId: undefined
};

export function useApplicationStore() {
  const [step, setStep] = useState(defaultState.step);
  const [personal, setPersonal] = useState<PersonalData>(defaultState.personal);
  const [company, setCompany] = useState<CompanyData>(defaultState.company);
  const [guarantee, setGuarantee] = useState<GuaranteeData>(defaultState.guarantee);
  const [declarations, setDeclarations] = useState<DeclarationData>(defaultState.declarations);
  const [consent, setConsent] = useState<ConsentData>(defaultState.consent);
  const [quote, setQuote] = useState<unknown>(defaultState.quote);
  const [quoteCreatedAt, setQuoteCreatedAt] = useState<number | undefined>(defaultState.quoteCreatedAt);
  const [referralCode, setReferral] = useState<string | undefined>(defaultState.referralCode);
  const [lenderId, setLender] = useState<string | undefined>(defaultState.lenderId);
  const [submitting, setSubmitting] = useState(false);

  function restore(saved: PersistedApplicationState) {
    setStep(saved.step ?? defaultState.step);
    setPersonal(saved.personal ?? defaultState.personal);
    setCompany(saved.company ?? defaultState.company);
    setGuarantee(saved.guarantee ?? defaultState.guarantee);
    setDeclarations(saved.declarations ?? defaultState.declarations);
    setConsent(saved.consent ?? defaultState.consent);
    setQuote(saved.quote ?? defaultState.quote);
    setQuoteCreatedAt(saved.quoteCreatedAt ?? defaultState.quoteCreatedAt);
    setReferral(saved.referralCode ?? defaultState.referralCode);
    setLender(saved.lenderId ?? defaultState.lenderId);
  }

  function reset() {
    restore(defaultState);
    setSubmitting(false);
  }

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      const savedQuote = localStorage.getItem("biQuote");
      const savedQuoteCreatedAt = localStorage.getItem("biQuoteCreatedAt");

      if (savedQuote) {
        try {
          setQuote(JSON.parse(savedQuote));
        } catch {
          setQuote(null);
        }
      }

      if (savedQuoteCreatedAt) {
        setQuoteCreatedAt(Number(savedQuoteCreatedAt));
      }

      return;
    }

    try {
      restore(JSON.parse(saved) as PersistedApplicationState);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const payload: PersistedApplicationState = {
      step,
      personal,
      company,
      guarantee,
      declarations,
      consent,
      quote,
      quoteCreatedAt,
      referralCode,
      lenderId
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [step, personal, company, guarantee, declarations, consent, quote, quoteCreatedAt, referralCode, lenderId]);

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
    setQuote,
    quoteCreatedAt,
    setQuoteCreatedAt,
    referralCode,
    setReferral,
    lenderId,
    setLender,
    submitting,
    setSubmitting,
    reset
  };
}
