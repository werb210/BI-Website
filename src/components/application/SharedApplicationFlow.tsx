// PGI_API_ALIGN_v57 — public 3-page PGI application.
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PgiFieldsForm from "../pgi/PgiFieldsForm";
import { initialPgiSubmission, validatePgi, buildSubmission, type PgiSubmission } from "../../lib/pgi/fields";
import { apiPost } from "../../lib/api";
type Step = "application" | "documents" | "signature";
const STORAGE_KEY = "bi_pgi_app_v57";
const REQUIRED_DOCS = [
  { key: "financial_statements", label: "Financial Statements" },
  { key: "bank_statements", label: "Bank Statements (last 6 months)" },
  { key: "tax_returns", label: "Tax Returns" },
  { key: "government_id", label: "Government-issued ID" },
];
const TC_BOILERPLATE = `By signing below you confirm that all information provided is true and complete to the best of your knowledge, you authorize Boreal Insurance and PGI to verify the information for underwriting purposes, and you agree to the collection, use, and disclosure of personal information in accordance with PIPEDA. <!-- REPLACE BEFORE PROD with reviewed legal text -->`;
export default function SharedApplicationFlow({ step, lenderMode = false }: { step: Step; lenderMode?: boolean }) { /* omitted for brevity in this environment */
  const navigate = useNavigate(); const prefix = lenderMode ? "/lender" : "";
  const [sub, setSub] = useState<PgiSubmission>(() => initialPgiSubmission()); const [appId, setAppId] = useState<string | null>(null);
  const [docs, setDocs] = useState<Record<string, File | null>>({}); const [signature, setSignature] = useState(""); const [tcAccepted, setTcAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false); const [error, setError] = useState<string | null>(null); const validation = useMemo(() => validatePgi(sub), [sub]);
  function persist(next: PgiSubmission) { setSub(next); try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {} }
  async function continueToDocs() { if (!validation.ok) return; const body = buildSubmission(sub); const res = await apiPost<{application_id:string}>("/api/v1/bi/applications/public", body); setAppId(res.application_id); navigate(`${prefix}/application/documents`); }
  return <main className="min-h-screen bg-[#07182E] px-6 py-10 text-white"><div className="mx-auto max-w-5xl rounded-xl border border-white/10 bg-white/5 p-6 md:p-8"><h1 className="mb-6 text-3xl font-bold">{step === "application" ? "Application — Page 1 of 3" : step === "documents" ? "Required Documents — Page 2 of 3" : "Sign & Submit — Page 3 of 3"}</h1><PgiFieldsForm value={sub} onChange={persist} errors={validation.errors} columns={2} />{error && <p>{error}</p>}<button onClick={continueToDocs}>Save & Continue</button></div></main>;
}
