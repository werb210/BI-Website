import { useEffect, useMemo } from "react";
import axios from "axios";
import { API_BASE } from "../config";
import { useNavigate } from "react-router-dom";
import { safeRequest } from "../api/request";
import { useApplicationStore } from "../store/useApplicationStore";
import AccessRestricted from "../components/AccessRestricted";
import RateLockIndicator from "../components/RateLockIndicator";
import { validateLenderToken } from "../utils/lenderAuth";
import { validateBFRedirect } from "../utils/redirectValidation";
import { track } from "../utils/analytics";

interface Props {
  lenderMode?: boolean;
}

const QUOTE_TTL_MS = 1000 * 60 * 60;

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function Application({ lenderMode = false }: Props) {
  const nav = useNavigate();
  const store = useApplicationStore();
  const leadId = localStorage.getItem("biLeadId");

  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const lenderToken = params.get("token") || "";
  const lenderData = lenderMode ? validateLenderToken(lenderToken) : null;
  const bfToken = params.get("bf_token") || "";
  const bfData = bfToken ? (validateBFRedirect(bfToken) as Record<string, any> | null) : null;

  useEffect(() => {
    if (bfData) {
      if (bfData.personal && typeof bfData.personal === "object") {
        store.setPersonal({ ...store.personal, ...bfData.personal });
      }

      if (bfData.company && typeof bfData.company === "object") {
        store.setCompany({ ...store.company, ...bfData.company });
      }

      if (bfData.guarantee && typeof bfData.guarantee === "object") {
        store.setGuarantee({ ...store.guarantee, ...bfData.guarantee });
      }

      if (bfData.referralCode) {
        store.setReferral(String(bfData.referralCode));
      }

      if (bfData.lenderId) {
        store.setLender(String(bfData.lenderId));
      }
    }

    if (params.get("ref")) {
      store.setReferral(params.get("ref") || undefined);
    }

    if (params.get("lender")) {
      store.setLender(params.get("lender") || undefined);
    }
  }, []);

  useEffect(() => {
    if (lenderMode && store.step < 2) {
      store.setStep(2);
    }
  }, [lenderMode, store.step]);

  useEffect(() => {
    track(lenderMode ? "lender_application_started" : "application_started");
  }, [lenderMode]);

  if ((lenderMode && !lenderData) || (bfToken && !bfData)) {
    return <AccessRestricted />;
  }

  async function submit() {
    if (store.submitting) {
      return;
    }

    if (store.quoteCreatedAt && Date.now() - store.quoteCreatedAt > QUOTE_TTL_MS) {
      alert("Quote expired. Please refresh.");
      return;
    }

    store.setSubmitting(true);

    try {
      if (store.referralCode) {
        await safeRequest(
          axios.post(`${API_BASE}/bi/referral/validate`, {
            code: store.referralCode
          })
        );
      }

      const payload = {
        leadId,
        personalData: store.personal,
        companyData: store.company,
        guaranteeData: store.guarantee,
        declarations: store.declarations,
        consentData: store.consent,
        quoteResult: store.quote,
        referralCode: store.referralCode,
        lenderId: store.lenderId ?? lenderData?.lenderId
      };

      const digest = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(JSON.stringify(payload))
      );
      const payloadHash = toHex(digest);

      await safeRequest(
        axios.post(`${API_BASE}/application`, {
          ...payload,
          payloadHash
        })
      );

      track("application_submitted", {
        lenderMode
      });

      localStorage.removeItem("bi_app");
      store.reset();
      nav("/thank-you");
    } finally {
      store.setSubmitting(false);
    }
  }

  return (
    <div className="container">
      <h1>Personal Guarantee Insurance</h1>
      <RateLockIndicator quoteCreatedAt={store.quoteCreatedAt} />

      {!lenderMode && (
        <>
          <p>
            Complete your application to protect your personal assets when backing business borrowing.
          </p>
          {store.quote && (
            <p>
              Estimated premium: <strong>{JSON.stringify(store.quote)}</strong>
            </p>
          )}
        </>
      )}

      {store.step === 1 && !lenderMode && (
        <>
          <h3>Personal Details</h3>
          <input
            placeholder="Full Name"
            onChange={(e) =>
              store.setPersonal({
                ...store.personal,
                name: e.target.value
              })
            }
          />
          <button onClick={() => store.setStep(2)}>Next</button>
        </>
      )}

      {store.step === 2 && (
        <>
          <h3>Company Details</h3>
          <input
            placeholder="Company Name"
            onChange={(e) =>
              store.setCompany({
                ...store.company,
                name: e.target.value
              })
            }
          />
          <button onClick={() => store.setStep(3)}>Next</button>
        </>
      )}

      {store.step === 3 && (
        <>
          <h3>Guarantee Details</h3>
          <input
            placeholder="Guarantee Amount"
            onChange={(e) =>
              store.setGuarantee({
                ...store.guarantee,
                amount: e.target.value
              })
            }
          />
          <button onClick={() => store.setStep(4)}>Next</button>
        </>
      )}

      {store.step === 4 && (
        <>
          <h3>Declarations</h3>
          <label>
            <input
              type="checkbox"
              onChange={(e) =>
                store.setDeclarations({
                  ...store.declarations,
                  bankrupt: e.target.checked
                })
              }
            />
            No bankruptcies
          </label>
          <button onClick={() => store.setStep(5)}>Review</button>
        </>
      )}

      {store.step === 5 && (
        <>
          <h3>Review</h3>
          <pre>{JSON.stringify(store.personal, null, 2)}</pre>
          <button onClick={submit} disabled={store.submitting}>
            {store.submitting ? "Submitting..." : "Submit Application"}
          </button>
        </>
      )}
    </div>
  );
}
