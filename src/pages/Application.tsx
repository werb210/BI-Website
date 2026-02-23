import { useApplicationStore } from "../store/useApplicationStore";
import axios from "axios";
import { API_BASE } from "../config";
import { useNavigate, useSearchParams } from "react-router-dom";
import { safeRequest } from "../api/request";

export default function Application() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const mode = params.get("mode");

  const store = useApplicationStore();
  const leadId = localStorage.getItem("biLeadId");

  async function submit() {
    await safeRequest(
      axios.post(`${API_BASE}/application`, {
        leadId,
        mode,
        personalData: store.personal,
        companyData: store.company,
        guaranteeData: store.guarantee,
        declarations: store.declarations,
        consentData: store.consent,
        quoteResult: store.quote
      })
    );

    nav("/thank-you");
  }

  return (
    <div className="container">
      <h1>Personal Guarantee Insurance</h1>

      {store.step === 1 && (
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
          <button onClick={submit}>Submit Application</button>
        </>
      )}
    </div>
  );
}
