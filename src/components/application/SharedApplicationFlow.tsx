import { FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../../lib/api";

type ApplicationFlowStep = "application" | "documents" | "signature";

type ApplicationData = {
  companyName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  loanAmount: number;
  loanType: "secured" | "unsecured";
  coveragePercent: number;
  registrationNumber: string;
  industry: string;
  lender: string;
  referrerId: string;
  operatingName: string;
  incorporationDate: string;
  addressLine1: string;
  city: string;
  province: string;
  postalCode: string;
};

type ApplicationState = {
  data: ApplicationData;
  documentsDeferred: boolean;
  documents: {
    financialStatements?: File | null;
    bankStatements?: File | null;
    governmentId?: File | null;
  };
  signature: string;
  consentAccepted: boolean;
};

const initialData: ApplicationData = {
  companyName: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  loanAmount: 0,
  loanType: "secured",
  coveragePercent: 80,
  registrationNumber: "",
  industry: "",
  lender: "",
  referrerId: "",
  operatingName: "",
  incorporationDate: "",
  addressLine1: "",
  city: "",
  province: "",
  postalCode: "",
};

const STORAGE_KEY = "bi_application_flow";

const safeParse = (raw: string | null): ApplicationState | null => {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as ApplicationState;
    return {
      ...parsed,
      documents: parsed.documents || {},
      data: {
        ...initialData,
        ...(parsed.data || {}),
        coveragePercent: Math.min(80, Number(parsed?.data?.coveragePercent || 0) || 0),
      },
    };
  } catch {
    return null;
  }
};

export default function SharedApplicationFlow({
  step,
  lenderMode,
}: {
  step: ApplicationFlowStep;
  lenderMode: boolean;
}) {
  const navigate = useNavigate();
  const lenderPathPrefix = lenderMode ? "/lender" : "";

  const [state, setState] = useState<ApplicationState>(() => {
    const saved = safeParse(localStorage.getItem(STORAGE_KEY));

    if (saved) {
      if (lenderMode && !saved.data.lender) {
        saved.data.lender = "Lender Portal";
      }

      return saved;
    }

    return {
      data: {
        ...initialData,
        lender: lenderMode ? "Lender Portal" : "",
      },
      documentsDeferred: false,
      documents: {},
      signature: "",
      consentAccepted: false,
    };
  });

  const [submitting, setSubmitting] = useState(false);

  const saveState = (next: ApplicationState) => {
    setState(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const updateData = (key: keyof ApplicationData, value: string | number) => {
    const next = {
      ...state,
      data: {
        ...state.data,
        [key]: value,
      },
    };

    saveState(next);
  };

  const requiredFieldsComplete = useMemo(() => {
    const d = state.data;

    return Boolean(
      d.companyName &&
        d.firstName &&
        d.lastName &&
        d.email &&
        d.phone &&
        d.loanAmount > 0 &&
        d.registrationNumber &&
        d.industry,
    );
  }, [state.data]);

  const goDocuments = (event: FormEvent) => {
    event.preventDefault();

    if (!requiredFieldsComplete) {
      alert("Please complete all required fields before continuing.");
      return;
    }

    navigate(`${lenderPathPrefix}/application/documents`);
  };

  const continueToSignature = () => {
    navigate(`${lenderPathPrefix}/application/signature`);
  };

  const markDeferredAndContinue = () => {
    const next = { ...state, documentsDeferred: true };
    saveState(next);
    continueToSignature();
  };

  const submit = async () => {
    if (!state.signature.trim() || !state.consentAccepted) {
      alert("Please provide your typed signature and consent.");
      return;
    }

    const payload = {
      ...state.data,
      documentsDeferred: state.documentsDeferred,
      uploadedDocuments: Object.fromEntries(
        Object.entries(state.documents).map(([key, value]) => [key, value?.name || null]),
      ),
      signature: state.signature,
      consentAccepted: state.consentAccepted,
      channel: lenderMode ? "lender" : "public",
    };

    try {
      setSubmitting(true);
      await apiPost("/api/v1/application/submit", payload);
      alert("Application submitted.");
    } catch (error) {
      console.error(error);
      alert("Unable to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (step === "application") {
    return (
      <main className="min-h-screen bg-[#07182E] px-6 py-10 text-white">
        <div className="mx-auto max-w-3xl rounded-xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h1 className="mb-6 text-3xl font-bold">Application</h1>

          <form className="grid gap-4 md:grid-cols-2" onSubmit={goDocuments}>
            <input className="input" placeholder="Company Name*" value={state.data.companyName} onChange={(e) => updateData("companyName", e.target.value)} />
            <input className="input" placeholder="Operating Name" value={state.data.operatingName} onChange={(e) => updateData("operatingName", e.target.value)} />
            <input className="input" placeholder="First Name*" value={state.data.firstName} onChange={(e) => updateData("firstName", e.target.value)} />
            <input className="input" placeholder="Last Name*" value={state.data.lastName} onChange={(e) => updateData("lastName", e.target.value)} />
            <input className="input" type="email" placeholder="Email*" value={state.data.email} onChange={(e) => updateData("email", e.target.value)} />
            <input className="input" placeholder="Phone*" value={state.data.phone} onChange={(e) => updateData("phone", e.target.value)} />
            <input className="input" type="number" placeholder="Loan Amount*" value={state.data.loanAmount || ""} onChange={(e) => updateData("loanAmount", Number(e.target.value) || 0)} />
            <select className="input" value={state.data.loanType} onChange={(e) => updateData("loanType", e.target.value)}>
              <option value="secured">Secured</option>
              <option value="unsecured">Unsecured</option>
            </select>
            <div>
              <label className="mb-2 block text-sm">Coverage Percent: {state.data.coveragePercent}%</label>
              <input
                type="range"
                min={0}
                max={80}
                step={1}
                value={state.data.coveragePercent}
                onChange={(e) => updateData("coveragePercent", Math.min(80, Number(e.target.value)))}
                className="w-full"
              />
            </div>
            <input className="input" placeholder="Registration Number*" value={state.data.registrationNumber} onChange={(e) => updateData("registrationNumber", e.target.value)} />
            <input className="input" placeholder="Industry*" value={state.data.industry} onChange={(e) => updateData("industry", e.target.value)} />
            <input className="input" type="date" placeholder="Incorporation Date" value={state.data.incorporationDate} onChange={(e) => updateData("incorporationDate", e.target.value)} />
            <input className="input" placeholder="Address Line 1" value={state.data.addressLine1} onChange={(e) => updateData("addressLine1", e.target.value)} />
            <input className="input" placeholder="City" value={state.data.city} onChange={(e) => updateData("city", e.target.value)} />
            <input className="input" placeholder="Province" value={state.data.province} onChange={(e) => updateData("province", e.target.value)} />
            <input className="input" placeholder="Postal Code" value={state.data.postalCode} onChange={(e) => updateData("postalCode", e.target.value)} />
            {!lenderMode && (
              <input className="input" placeholder="Lender (Optional)" value={state.data.lender} onChange={(e) => updateData("lender", e.target.value)} />
            )}
            {lenderMode && <input type="hidden" value={state.data.lender} readOnly />}
            <input className="input" placeholder="Referrer ID (Optional)" value={state.data.referrerId} onChange={(e) => updateData("referrerId", e.target.value)} />

            <button type="submit" className="rounded bg-blue-600 px-4 py-3 font-semibold hover:bg-blue-700 md:col-span-2">
              Continue to Documents
            </button>
          </form>
        </div>
      </main>
    );
  }

  if (step === "documents") {
    return (
      <main className="min-h-screen bg-[#07182E] px-6 py-10 text-white">
        <div className="mx-auto max-w-3xl rounded-xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h1 className="mb-6 text-3xl font-bold">Required Documents</h1>
          <p className="mb-4 text-white/80">Upload these documents now or continue and provide them later.</p>

          <div className="grid gap-4">
            <label className="text-sm">Financial Statements*</label>
            <input type="file" onChange={(e) => saveState({ ...state, documentsDeferred: false, documents: { ...state.documents, financialStatements: e.target.files?.[0] || null } })} />

            <label className="text-sm">Bank Statements*</label>
            <input type="file" onChange={(e) => saveState({ ...state, documentsDeferred: false, documents: { ...state.documents, bankStatements: e.target.files?.[0] || null } })} />

            <label className="text-sm">Government ID*</label>
            <input type="file" onChange={(e) => saveState({ ...state, documentsDeferred: false, documents: { ...state.documents, governmentId: e.target.files?.[0] || null } })} />
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-2">
            <button className="rounded bg-blue-600 py-3 font-semibold hover:bg-blue-700" onClick={continueToSignature}>
              Continue to Signature
            </button>
            <button className="rounded bg-slate-700 py-3 font-semibold hover:bg-slate-600" onClick={markDeferredAndContinue}>
              Supply Required Documents Later
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07182E] px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl rounded-xl border border-white/10 bg-white/5 p-6 md:p-8">
        <h1 className="mb-4 text-3xl font-bold">Terms & Conditions + Signature</h1>
        <div className="mb-6 rounded border border-white/20 bg-[#0B1E3B] p-4 text-sm text-white/85">
          <p>
            Placeholder Terms and Conditions: by submitting, you confirm the information provided is
            accurate and authorize Boreal Insurance to process your application.
          </p>
        </div>

        <input
          className="input mb-4"
          placeholder="Type your full name"
          value={state.signature}
          onChange={(e) => saveState({ ...state, signature: e.target.value })}
        />

        <label className="mb-6 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={state.consentAccepted}
            onChange={(e) => saveState({ ...state, consentAccepted: e.target.checked })}
          />
          I consent to electronic signature and agree to the Terms & Conditions.
        </label>

        <button
          className="w-full rounded bg-emerald-600 py-3 font-semibold hover:bg-emerald-700 disabled:opacity-60"
          onClick={submit}
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit Application"}
        </button>
      </div>
    </main>
  );
}
