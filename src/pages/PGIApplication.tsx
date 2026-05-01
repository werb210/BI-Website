import { useEffect, useState } from "react";
import BIAuthGate from "../components/BIAuthGate";
import LoadingButton from "../components/LoadingButton";
import { useDraft } from "../hooks/useDraft";
import { subscribeToPush } from "../hooks/usePush";
import { apiPost } from "../lib/api";
import { ApiError, apiRequest } from "../api/request";
import { track } from "../lib/analytics";
import { required } from "../lib/validation";
import { fetchRequiredDocs, type BiRequiredDoc } from "../api/biRequiredDocs";

type PgiApplicationStatus = "pending" | "under_review" | "quoted" | "bound" | "policy_issued" | "declined";

type PgiFormState = {
  legal_name: string;
  operating_name: string;
  business_number: string;
  incorporation_date: string;
  address_line1: string;
  city: string;
  province: string;
  postal_code: string;
  industry: string;
  director_name: string;
  director_dob: string;
  director_address: string;
  facilityType: "secured" | "unsecured";
  lender_name: string;
  loanAmount: number;
  annual_turnover: number;
  net_profit: number;
  total_assets: number;
  total_liabilities: number;
  country: string;
  naics_code: string;
  formation_date: string;
  pgi_limit: number;
  annual_revenue: number;
  ebitda: number;
  total_debt: number;
  monthly_debt_service: number;
  collateral_value: number;
  enterprise_value: number;
  bankruptcy_history: boolean;
  insolvency_history: boolean;
  judgment_history: boolean;
  bankruptcy: boolean;
  consent: boolean;
  terms: boolean;
  privacy: boolean;
};

type UploadableDocument = {
  file: File;
  docType: string;
};
type UploadedDocument = {
  filename?: string;
  doc_type?: string;
  ocr_status?: string | null;
};

const pgiStatusDisplayMap: Record<string, string> = {
  pending: "Pending",
  under_review: "Under Review",
  quoted: "Quote Available",
  bound: "Policy Issued",
  policy_issued: "Policy Issued",
  declined: "Declined",
};

const documentTypeOptions = [
  { value: "financial_statement", label: "Financial Statement" },
  { value: "bank_statement", label: "Bank Statement" },
  { value: "government_id", label: "Government ID" },
  { value: "tax_return", label: "Tax Return" },
  { value: "other", label: "Other" },
];

const initialFormState: PgiFormState = {
  /* Business Info */
  legal_name: "",
  operating_name: "",
  business_number: "",
  incorporation_date: "",
  address_line1: "",
  city: "",
  province: "",
  postal_code: "",
  industry: "",

  /* Directors */
  director_name: "",
  director_dob: "",
  director_address: "",

  /* Loan Details */
  facilityType: "secured",
  lender_name: "",
  loanAmount: 0,

  /* Financial */
  annual_turnover: 0,
  net_profit: 0,
  total_assets: 0,
  total_liabilities: 0,
  country: "",
  naics_code: "",
  formation_date: "",
  pgi_limit: 0,
  annual_revenue: 0,
  ebitda: 0,
  total_debt: 0,
  monthly_debt_service: 0,
  collateral_value: 0,
  enterprise_value: 0,
  bankruptcy_history: false,
  insolvency_history: false,
  judgment_history: false,

  /* Compliance */
  bankruptcy: false,
  consent: false,
  terms: false,
  privacy: false
};

export default function PGIApplication() {
  const [phone, setPhone] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [appId, setAppId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pgiStatus, setPgiStatus] = useState<PgiApplicationStatus>("pending");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadFiles, setUploadFiles] = useState<UploadableDocument[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [requiredDocs, setRequiredDocs] = useState<BiRequiredDoc[]>([]);
  const [requiredDocsError, setRequiredDocsError] = useState<string | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [hasRestoredDraft] = useState(() => {
    if (typeof window === "undefined") return false;
    return Boolean(localStorage.getItem("bi-application-draft"));
  });

  const { state: form, setState: setForm, clearDraft } = useDraft<PgiFormState>(
    "bi-application-draft",
    initialFormState
  );
  const requiredFieldsValid =
    required(form.legal_name) &&
    required(form.business_number) &&
    required(form.director_name) &&
    required(form.country) &&
    required(form.naics_code) &&
    required(form.formation_date) &&
    Number(form.pgi_limit) > 0 &&
    Number(form.annual_revenue) > 0 &&
    Number(form.ebitda) >= 0 &&
    Number(form.total_debt) >= 0 &&
    Number(form.monthly_debt_service) >= 0 &&
    Number(form.collateral_value) >= 0 &&
    Number(form.enterprise_value) >= 0 &&
    Number(form.loanAmount) > 0;

  useEffect(() => {
    if (phone) {
      track("application_started");
      void resume();
    }
  }, [phone]);

  useEffect(() => {
    if (step !== 99 || !appId) {
      return;
    }

    const poll = async () => {
      const statusResponse = await apiRequest<{ pgiStatus?: PgiApplicationStatus; stage?: PgiApplicationStatus }>(
        `/api/v1/bi/applications/${appId}`,
        {}
      ).catch(() => null);

      const nextStatus = statusResponse?.pgiStatus || statusResponse?.stage;
      if (nextStatus) {
        setPgiStatus(nextStatus);
      }
    };

    void poll();
    const interval = window.setInterval(() => {
      void poll();
    }, 10000);

    return () => window.clearInterval(interval);
  }, [step, appId]);

  useEffect(() => {
    // BI_WEBSITE_BLOCK_1_23_APPLICANT_DOC_UI — load required docs from server.
    let cancelled = false;
    fetchRequiredDocs()
      .then((docs) => {
        if (!cancelled) {
          setRequiredDocs(docs);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setRequiredDocsError(err instanceof Error ? err.message : "Failed to load required documents");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function resume() {
    const data = await apiRequest<{ id: string; data: Partial<typeof initialFormState> } | null>(
      `/api/v1/bi/application/by-phone?phone=${phone}`,
      {}
    ).catch(() => null);
    if (data) {
      setAppId(data.id);
      setForm(prev => ({ ...prev, ...data.data }));
      clearDraft();
    }
  }

  async function saveDraft() {
    setErrorMessage(null);
    const data = await apiPost<{ id: string }>("/api/v1/bi/application/draft", {
      phone,
      data: form
    });
    setAppId(data.id);
  }

  async function uploadDocuments() {
    if (!appId || uploadFiles.length === 0 || uploading) {
      return;
    }

    setErrorMessage(null);
    // BI_WEBSITE_BLOCK_1_23_APPLICANT_DOC_UI — client-side 5 MB cap.
    const MAX_BYTES = 5 * 1024 * 1024;
    const tooBig = uploadFiles.find((f) => f.file.size > MAX_BYTES);
    if (tooBig) {
      setErrorMessage(`File too large: "${tooBig.file.name}" is ${(tooBig.file.size / 1024 / 1024).toFixed(1)} MB. Max 5 MB per file.`);
      return;
    }
    setUploading(true);
    setUploadProgress(10);

    const payload = new FormData();
    uploadFiles.forEach((selected) => {
      payload.append("files", selected.file);
      payload.append("doc_types", selected.docType);
    });

    try {
      const response = await apiPost<{ documents?: UploadedDocument[] }>(`/api/v1/bi/application/${appId}/documents`, payload);
      setUploadedDocuments((response.documents ?? []).map((doc) => ({
        filename: doc.filename,
        doc_type: doc.doc_type,
        ocr_status: doc.ocr_status,
      })));
      setUploadProgress(100);
    } catch (error) {
      setUploadProgress(0);
      setErrorMessage(getValidationMessage(error, "Unable to upload documents. Please retry."));
    } finally {
      setUploading(false);
    }
  }

  async function submit() {
    setErrorMessage(null);
    if (!requiredFieldsValid) {
      setErrorMessage("Please complete all required application fields before submitting.");
      return;
    }

    if (!form.consent || !form.terms || !form.privacy) {
      setErrorMessage("You must accept all compliance confirmations.");
      return;
    }

    setLoading(true);

    const submitPayload: Record<string, unknown> = {
        applicationId: appId,
        facilityType: form.facilityType,
        loanAmount: form.loanAmount,
        bankruptcy: form.bankruptcy,
        country: form.country,
        naics_code: form.naics_code,
        formation_date: form.formation_date,
        pgi_limit: form.pgi_limit,
        annual_revenue: form.annual_revenue,
        ebitda: form.ebitda,
        total_debt: form.total_debt,
        monthly_debt_service: form.monthly_debt_service,
        collateral_value: form.collateral_value,
        enterprise_value: form.enterprise_value,
        bankruptcy_history: form.bankruptcy_history,
        insolvency_history: form.insolvency_history,
        judgment_history: form.judgment_history,
    };

    if (required(form.lender_name)) {
      submitPayload.lender_name = form.lender_name;
    }

    try {
      await apiPost("/api/v1/bi/application/submit", submitPayload);

      track("application_submitted", {
        coverage_type: form.facilityType
      });
      clearDraft();
      setStep(99);
    } catch (error) {
      setErrorMessage(getValidationMessage(error, "Unable to submit application. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  function updateUploadDocType(index: number, docType: string) {
    setUploadFiles((previous) => previous.map((item, currentIndex) => (
      currentIndex === index ? { ...item, docType } : item
    )));
  }

  function getStatusLabel(status: string) {
    return pgiStatusDisplayMap[status] || status;
  }
  function getIsStartup() {
    if (!form.formation_date) return false;
    const formed = new Date(form.formation_date);
    if (Number.isNaN(formed.getTime())) return false;
    const now = new Date();
    let years = now.getUTCFullYear() - formed.getUTCFullYear();
    const monthDiff = now.getUTCMonth() - formed.getUTCMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getUTCDate() < formed.getUTCDate())) {
      years -= 1;
    }
    return years < 3;
  }
  function ocrBadgeClass(status: string | null | undefined) {
    if (!status || status === "pending" || status === "skipped") return "bg-white/15 text-white/80";
    if (status === "processing") return "bg-blue-600/25 text-blue-200";
    if (status === "complete") return "bg-emerald-600/25 text-emerald-200";
    if (status === "failed") return "bg-red-600/25 text-red-200";
    return "bg-white/15 text-white/80";
  }
  function OcrStatusBadge({ status }: { status: string | null | undefined }) {
    if (!status || status === "pending") {
      return <span className={`rounded px-2 py-0.5 text-xs ${ocrBadgeClass(status)}`} title="Document is in the OCR queue.">Queued</span>;
    }
    if (status === "processing") {
      return <span className={`rounded px-2 py-0.5 text-xs ${ocrBadgeClass(status)}`} title="Extracting text via Azure AI Vision.">Processing</span>;
    }
    if (status === "complete") {
      return <span className={`rounded px-2 py-0.5 text-xs ${ocrBadgeClass(status)}`} title="Text extracted. Sent to carrier on submission.">Indexed</span>;
    }
    if (status === "failed") {
      return <span className={`rounded px-2 py-0.5 text-xs ${ocrBadgeClass(status)}`} title="OCR failed; original is stored. Submission will note the failure.">OCR failed</span>;
    }
    if (status === "skipped") {
      return <span className={`rounded px-2 py-0.5 text-xs ${ocrBadgeClass(status)}`} title="Format not OCR-able; original stored as-is.">Stored only</span>;
    }
    return <span className={`rounded px-2 py-0.5 text-xs ${ocrBadgeClass(status)}`}>{status}</span>;
  }

  function getValidationMessage(error: unknown, fallback: string) {
    if (!(error instanceof ApiError)) {
      return fallback;
    }

    const messages = parseValidationMessages(error.detail);
    if (messages.length > 0) {
      return messages.join(", ");
    }

    return error.message || fallback;
  }

  function parseValidationMessages(detail: unknown): string[] {
    if (!detail) {
      return [];
    }

    if (typeof detail === "string") {
      return [detail];
    }

    if (Array.isArray(detail)) {
      return detail
        .flatMap((entry) => {
          if (typeof entry === "string") return [entry];
          if (entry && typeof entry === "object" && "msg" in entry && typeof entry.msg === "string") {
            return [entry.msg];
          }
          return [];
        })
        .filter(Boolean);
    }

    if (typeof detail === "object") {
      return Object.values(detail)
        .flatMap((value) => (typeof value === "string" ? [value] : []))
        .filter(Boolean);
    }

    return [];
  }

  if (!phone) {
    return <BIAuthGate onVerified={(user) => setPhone(user.phone)} />;
  }

  return (
    <div className="application-wrapper">
      {errorMessage && (
        <div className="bg-red-900/40 border border-red-500 rounded-lg p-4 mb-6 text-sm text-red-100">
          {errorMessage}
        </div>
      )}

      {hasRestoredDraft && (
        <div className="bg-brand-bgAlt border border-card rounded-lg p-4 mb-6 text-sm">
          Draft restored from previous session.
        </div>
      )}

      {/* STEP 1 – BUSINESS */}
      {step === 1 && (
        <>
          <h1>Business Information</h1>

          <input
            placeholder="Legal Name"
            value={form.legal_name}
            onChange={e => setForm({ ...form, legal_name: e.target.value })}
          />

          <input
            placeholder="Operating Name"
            value={form.operating_name}
            onChange={e => setForm({ ...form, operating_name: e.target.value })}
          />

          <input
            placeholder="Business Number"
            value={form.business_number}
            onChange={e => setForm({ ...form, business_number: e.target.value })}
          />

          <input
            type="date"
            value={form.incorporation_date}
            onChange={e => setForm({ ...form, incorporation_date: e.target.value })}
          />

          <button onClick={() => setStep(2)}>Next</button>
        </>
      )}

      {/* STEP 2 – DIRECTOR */}
      {step === 2 && (
        <>
          <h1>Director / Guarantor</h1>

          <input
            placeholder="Full Name"
            value={form.director_name}
            onChange={e => setForm({ ...form, director_name: e.target.value })}
          />

          <input
            type="date"
            value={form.director_dob}
            onChange={e => setForm({ ...form, director_dob: e.target.value })}
          />

          <input
            placeholder="Residential Address"
            value={form.director_address}
            onChange={e => setForm({ ...form, director_address: e.target.value })}
          />

          <button onClick={() => setStep(3)}>Next</button>
        </>
      )}

      {/* STEP 3 – LOAN DETAILS */}
      {step === 3 && (
        <>
          <h1>Loan Details</h1>

          <select
            value={form.facilityType}
            onChange={e => setForm({ ...form, facilityType: e.target.value as "secured" | "unsecured" })}
          >
            <option value="secured">Secured</option>
            <option value="unsecured">Unsecured</option>
          </select>

          <input
            placeholder="Lender Name"
            value={form.lender_name}
            onChange={e => setForm({ ...form, lender_name: e.target.value })}
          />
          <p className="text-xs text-gray-400 -mt-2 mb-2">Optional: only required if your lender requested this application.</p>

          <input
            type="number"
            placeholder="Loan Amount"
            value={form.loanAmount}
            onChange={e => setForm({ ...form, loanAmount: Number(e.target.value) })}
          />

          <button onClick={() => setStep(4)}>Next</button>
        </>
      )}

      {/* STEP 4 – FINANCIALS */}
      {step === 4 && (
        <>
          <h1>Financial Information</h1>
          <p className="text-sm text-gray-400 mb-4">
            These fields are required by PGI underwriting unless marked optional.
          </p>

          <input
            type="number"
            placeholder="Annual Turnover"
            value={form.annual_turnover}
            onChange={e => setForm({ ...form, annual_turnover: Number(e.target.value) })}
          />

          <input
            type="number"
            placeholder="Net Profit"
            value={form.net_profit}
            onChange={e => setForm({ ...form, net_profit: Number(e.target.value) })}
          />

          <input
            type="number"
            placeholder="Total Assets"
            value={form.total_assets}
            onChange={e => setForm({ ...form, total_assets: Number(e.target.value) })}
          />

          <input
            type="number"
            placeholder="Total Liabilities"
            value={form.total_liabilities}
            onChange={e => setForm({ ...form, total_liabilities: Number(e.target.value) })}
          />

          <input
            placeholder="Country*"
            value={form.country}
            onChange={e => setForm({ ...form, country: e.target.value })}
          />
          <p className="text-xs text-gray-400 -mt-2 mb-2">Country where the borrowing entity is registered.</p>

          <input
            placeholder="NAICS Code*"
            value={form.naics_code}
            onChange={e => setForm({ ...form, naics_code: e.target.value })}
          />
          <p className="text-xs text-gray-400 -mt-2 mb-2">Industry classification code used by PGI risk models.</p>

          <input
            type="date"
            value={form.formation_date}
            onChange={e => setForm({ ...form, formation_date: e.target.value })}
          />
          <p className="text-xs text-gray-400 -mt-2 mb-2">Legal formation/incorporation date for underwriting.</p>

          <input
            type="number"
            placeholder="Requested PGI Limit*"
            value={form.pgi_limit}
            onChange={e => setForm({ ...form, pgi_limit: Number(e.target.value) })}
          />

          <input
            type="number"
            placeholder="Annual Revenue*"
            value={form.annual_revenue}
            onChange={e => setForm({ ...form, annual_revenue: Number(e.target.value) })}
          />

          <input
            type="number"
            placeholder="EBITDA*"
            value={form.ebitda}
            onChange={e => setForm({ ...form, ebitda: Number(e.target.value) })}
          />

          <input
            type="number"
            placeholder="Total Debt*"
            value={form.total_debt}
            onChange={e => setForm({ ...form, total_debt: Number(e.target.value) })}
          />

          <input
            type="number"
            placeholder="Monthly Debt Service*"
            value={form.monthly_debt_service}
            onChange={e => setForm({ ...form, monthly_debt_service: Number(e.target.value) })}
          />

          <input
            type="number"
            placeholder="Collateral Value*"
            value={form.collateral_value}
            onChange={e => setForm({ ...form, collateral_value: Number(e.target.value) })}
          />

          <input
            type="number"
            placeholder="Enterprise Value*"
            value={form.enterprise_value}
            onChange={e => setForm({ ...form, enterprise_value: Number(e.target.value) })}
          />

          <button onClick={() => setStep(5)}>Next</button>
        </>
      )}

      {/* STEP 5 – COMPLIANCE */}
      {step === 5 && (
        <>
          <h1>Declarations</h1>

          <label>
            <input
              type="checkbox"
              checked={form.bankruptcy}
              onChange={e => setForm({ ...form, bankruptcy: e.target.checked })}
            />
            Bankruptcy filed?
          </label>

          <label>
            <input
              type="checkbox"
              checked={form.bankruptcy_history}
              onChange={e => setForm({ ...form, bankruptcy_history: e.target.checked })}
            />
            Bankruptcy history (PGI)
          </label>

          <label>
            <input
              type="checkbox"
              checked={form.insolvency_history}
              onChange={e => setForm({ ...form, insolvency_history: e.target.checked })}
            />
            Insolvency history (PGI)
          </label>

          <label>
            <input
              type="checkbox"
              checked={form.judgment_history}
              onChange={e => setForm({ ...form, judgment_history: e.target.checked })}
            />
            Judgment history (PGI)
          </label>

          <label>
            <input
              type="checkbox"
              checked={form.consent}
              onChange={e => setForm({ ...form, consent: e.target.checked })}
            />
            I confirm information is accurate
          </label>

          <label>
            <input
              type="checkbox"
              checked={form.terms}
              onChange={e => setForm({ ...form, terms: e.target.checked })}
            />
            I accept Terms
          </label>

          <label>
            <input
              type="checkbox"
              checked={form.privacy}
              onChange={e => setForm({ ...form, privacy: e.target.checked })}
            />
            I accept Privacy Policy
          </label>

          <LoadingButton onClick={saveDraft}>Save Draft</LoadingButton>
          <LoadingButton
            loading={loading}
            disabled={!requiredFieldsValid}
            onClick={submit}
          >
            Submit Application
          </LoadingButton>
        </>
      )}

      {/* STEP 99 – CONFIRM */}
      {step === 99 && (
        <>
          <h1>Application Submitted</h1>
          <p>
            Your application was submitted successfully. We are now processing your quote with PGI.
          </p>
          <p>Current PGI status: <strong>{getStatusLabel(pgiStatus)}</strong></p>
          <div className="mt-6">
            <h2>Upload Supporting Documents</h2>
            {requiredDocsError && <p className="text-xs text-red-300">{requiredDocsError}</p>}
            {requiredDocs.length > 0 && (
              <div className="my-3 space-y-1 text-sm">
                {requiredDocs
                  .filter((doc) => !doc.if_startup || getIsStartup())
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((doc) => (
                    <p key={doc.doc_type} className="text-white/80">
                      • {doc.display_label}
                    </p>
                  ))}
              </div>
            )}
            <input
              type="file"
              accept="image/png,image/jpeg,application/pdf,.pdf,.docx,.doc,.xlsx,.xls,.csv,.txt"
              multiple
              onChange={(e) => setUploadFiles(
                Array.from(e.target.files || []).map((file) => ({
                  file,
                  docType: "other",
                }))
              )}
            />
            {uploadFiles.length > 0 && (
              <div className="mt-4 space-y-3">
                {uploadFiles.map((selected, index) => (
                  <div key={`${selected.file.name}-${index}`} className="border border-white/20 rounded-md p-3">
                    <p className="text-sm mb-2">{selected.file.name}</p>
                    <select
                      value={selected.docType}
                      onChange={(e) => updateUploadDocType(index, e.target.value)}
                    >
                      {documentTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}
            {uploading && <p>Uploading... {uploadProgress}%</p>}
            {!uploading && uploadProgress > 0 && <p>Upload complete ({uploadProgress}%). Re-upload anytime.</p>}
            <button onClick={uploadDocuments} disabled={uploading || uploadFiles.length === 0}>
              {uploading ? "Uploading..." : "Upload Documents"}
            </button>
            {uploadedDocuments.length > 0 && (
              <div className="mt-4 space-y-2">
                {uploadedDocuments.map((doc, idx) => (
                  <div key={`${doc.filename ?? "document"}-${idx}`} className="flex items-center justify-between rounded border border-white/10 bg-white/5 px-3 py-2 text-sm">
                    <span>{doc.filename ?? doc.doc_type ?? "Document"}</span>
                    <OcrStatusBadge status={doc.ocr_status} />
                  </div>
                ))}
              </div>
            )}
          </div>
          <p className="mt-4">
            We will notify you by email/push once a quote is available.
          </p>
          <button
            onClick={subscribeToPush}
            className="bg-brand-accent hover:bg-brand-accentHover text-white rounded-full h-11 px-6 font-medium mt-6"
          >
            Enable Status Notifications
          </button>
        </>
      )}
    </div>
  );
}
