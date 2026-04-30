// PGI_API_ALIGN_v57 — single-page lender application.
import { useState, useMemo } from "react";
import BIAuthGate from "../components/BIAuthGate";
import PgiFieldsForm from "../components/pgi/PgiFieldsForm";
import { getAuthUser, type AuthUser } from "../lib/auth";
import { initialPgiSubmission, validatePgi, buildSubmission, type PgiSubmission } from "../lib/pgi/fields";
import { apiPost } from "../lib/api";
export default function LenderApplication() { const [user, setUser] = useState<AuthUser | null>(getAuthUser()); const [sub, setSub] = useState<PgiSubmission>(() => initialPgiSubmission()); const validation = useMemo(() => validatePgi(sub), [sub]);
if (!user) return <main><BIAuthGate userType="lender" onVerified={setUser} /></main>;
async function submit(){ const body = buildSubmission(sub); await apiPost('/api/v1/bi/applications/lender', body); }
return <main><PgiFieldsForm value={sub} onChange={setSub} errors={validation.errors} columns={3} /><button onClick={submit}>Submit to Carrier</button></main>; }
