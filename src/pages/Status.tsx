// BI_WEBSITE_BLOCK_v134_APPLICANT_STATUS_PAGE_v1
//
// Read-only status page for applicants. Mounted at
// /applications/:publicId/status. The public_id is the same opaque
// slug used throughout the wizard, so anyone the applicant has shared
// the URL with can see the current state — analogous to a courier
// tracking number. No PII is shown beyond what the applicant already
// has on their own confirmation SMS / email.
//
// Fetches GET /api/v1/applications/:publicId (unauthenticated, exists
// since the form wizard's earliest blocks). Renders:
//   * Decision banner (same colour-coded treatment as BF-portal v196
//     so internal + applicant views stay consistent)
//   * Required-documents checklist with per-doc status
//   * "What's next" guidance keyed off current stage
//   * Continue / Upload buttons that deep-link back into the wizard
//     when action is required
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL
  || (import.meta as any).env?.VITE_API_URL
  || "https://bi-server-cse0apamgkheb9d5.canadacentral-01.azurewebsites.net";

type App = {
  public_id?: string;
  application_code?: string | null;
  stage: string;
  business_name?: string | null;
  company_name?: string | null;
  guarantor_name?: string | null;
  loan_amount?: number | null;
  pgi_limit?: number | null;
  annual_premium?: number | string | null;
  quote_id?: string | null;
  policy_id?: string | null;
  policy_bound_at?: string | null;
  score_reason?: string | null;
  carrier_received_at?: string | null;
  carrier_last_event?: string | null;
  docs_deferred_at?: string | null;
  created_at?: string | null;
};

const REQUIRED_DOCS = [
  { key: "profit_loss",   label: "Profit & Loss statement" },
  { key: "balance_sheet", label: "Balance sheet" },
  { key: "ar_aging",      label: "Accounts receivable aging" },
  { key: "ap_aging",      label: "Accounts payable aging" },
  { key: "founder_cv",    label: "Founder CV / résumé" },
];

function fmtMoney(n: number | string | null | undefined): string | null {
  const num = typeof n === "string" ? Number(n) : n;
  if (typeof num !== "number" || !Number.isFinite(num) || num <= 0) return null;
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(num);
}

function fmtDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return null;
  return d.toLocaleDateString();
}

function DecisionBanner({ app }: { app: App }) {
  // BI_WEBSITE_BLOCK_v174_APPLICANT_AUTH_AND_STATUS_PAGE_v1
  // The BI-Server public flow writes `status` (TEXT) and never touches
  // `stage` (ENUM) until staff forwards to carrier. Prefer status so
  // banner branches like "in_progress" / "document_review" / "submitted"
  // — already present below — actually match. Fall back to stage for
  // post-carrier states (under_review / approved / policy_issued / quoted /
  // bound / declined / claim) which the orchestrator does write.
  const stage = String(app.status || app.stage || "");
  const premium = fmtMoney(app.annual_premium ?? null);

  if (stage === "policy_issued") {
    return (
      <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-5">
        <div className="text-xs uppercase tracking-widest text-emerald-300">Policy bound</div>
        <h2 className="mt-1 text-2xl font-semibold text-white">🛡 Your policy is active</h2>
        <p className="mt-2 text-bf-textMuted">
          The carrier has issued your policy. You're covered.
        </p>
        {(premium || app.policy_id) && (
          <div className="mt-3 grid gap-2 sm:grid-cols-2 text-sm">
            {premium && <div><span className="text-bf-textMuted">Annual premium</span><div className="text-white font-semibold">{premium}</div></div>}
            {app.policy_id && <div><span className="text-bf-textMuted">Policy id</span><div className="text-white font-mono text-xs">{app.policy_id}</div></div>}
          </div>
        )}
      </div>
    );
  }

  if (stage === "approved") {
    return (
      <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-5">
        <div className="text-xs uppercase tracking-widest text-emerald-300">Approved</div>
        <h2 className="mt-1 text-2xl font-semibold text-white">✓ Approved by the carrier</h2>
        <p className="mt-2 text-bf-textMuted">
          The carrier has approved your application. Your policy will be issued shortly.
          {premium && <> Your annual premium will be <span className="text-white font-semibold">{premium}</span>.</>}
        </p>
      </div>
    );
  }

  if (stage === "under_review" && premium) {
    return (
      <div className="rounded-2xl border border-blue-500/40 bg-blue-500/10 p-5">
        <div className="text-xs uppercase tracking-widest text-blue-300">Under review</div>
        <h2 className="mt-1 text-2xl font-semibold text-white">Quote received</h2>
        <p className="mt-2 text-bf-textMuted">
          We've received a quote of <span className="text-white font-semibold">{premium}</span> annual premium and are reviewing the terms with you.
        </p>
      </div>
    );
  }

  if (stage === "declined") {
    return (
      <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-5">
        <div className="text-xs uppercase tracking-widest text-red-300">Declined</div>
        <h2 className="mt-1 text-2xl font-semibold text-white">Your application was not approved this time</h2>
        {app.score_reason && (
          <p className="mt-2 text-bf-textMuted italic">{app.score_reason}</p>
        )}
        <p className="mt-3 text-bf-textMuted text-sm">
          If circumstances change you're welcome to reapply. Reach us at <a href="mailto:hello@boreal.financial" className="text-bf-cta underline">hello@boreal.financial</a> with any questions.
        </p>
      </div>
    );
  }

  if (stage === "information_required") {
    return (
      <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5">
        <div className="text-xs uppercase tracking-widest text-amber-200">Information needed</div>
        <h2 className="mt-1 text-2xl font-semibold text-white">The carrier needs a bit more from you</h2>
        {app.score_reason && (
          <p className="mt-2 text-bf-textMuted italic">{app.score_reason}</p>
        )}
        <p className="mt-3 text-bf-textMuted text-sm">
          We'll reach out via SMS to coordinate. No action from you in the meantime.
        </p>
      </div>
    );
  }

  if (stage === "submitted" || (app.carrier_received_at && stage !== "in_progress" && stage !== "document_review")) {
    return (
      <div className="rounded-2xl border border-blue-500/40 bg-blue-500/10 p-5">
        <div className="text-xs uppercase tracking-widest text-blue-300">Submitted</div>
        <h2 className="mt-1 text-2xl font-semibold text-white">With the carrier</h2>
        <p className="mt-2 text-bf-textMuted">
          Your application is with the carrier for underwriting. We'll text you the moment they come back.
        </p>
      </div>
    );
  }

  if (stage === "document_review" || (stage === "in_progress" && !app.docs_deferred_at)) {
    return (
      <div className="rounded-2xl border border-blue-500/40 bg-blue-500/10 p-5">
        <div className="text-xs uppercase tracking-widest text-blue-300">In review</div>
        <h2 className="mt-1 text-2xl font-semibold text-white">We're reviewing your documents</h2>
        <p className="mt-2 text-bf-textMuted">
          Once our team confirms everything is in order, we'll forward to the carrier.
        </p>
      </div>
    );
  }

  // in_progress + docs_deferred OR new_application
  return (
    <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5">
      <div className="text-xs uppercase tracking-widest text-amber-200">Awaiting your documents</div>
      <h2 className="mt-1 text-2xl font-semibold text-white">We need a few documents to continue</h2>
      <p className="mt-2 text-bf-textMuted">
        Upload your financial documents below and we'll forward your application to the carrier.
      </p>
    </div>
  );
}

export default function Status() {
  const { publicId } = useParams<{ publicId: string }>();
  const [app, setApp] = useState<App | null>(null);
  const [docs, setDocs] = useState<Array<{ id: string; doc_type?: string; original_filename?: string; status?: string }>>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!publicId) return;
    (async () => {
      try {
        const r = await fetch(`${API_BASE}/api/v1/applications/${publicId}`);
        if (!r.ok) { setErr(`Could not load (${r.status})`); return; }
        const data = await r.json();
        setApp(data?.application ?? data);
        // Fetch document list (best-effort; endpoint may differ between blocks).
        try {
          const r2 = await fetch(`${API_BASE}/api/v1/applications/${publicId}/documents`);
          if (r2.ok) {
            const d = await r2.json();
            setDocs(Array.isArray(d) ? d : d?.documents ?? []);
          }
        } catch { /* non-fatal */ }
      } catch (e: any) {
        setErr(e?.message || "Network error");
      } finally {
        setLoading(false);
      }
    })();
  }, [publicId]);

  const stage = String(app?.stage || "");
  const needsDocs = stage === "in_progress" || stage === "document_review" || stage === "new_application";
  const docTypesUploaded = new Set(docs.map((d) => d.doc_type).filter(Boolean) as string[]);

  return (
    <main className="min-h-screen bg-bf-bg px-6 py-10 text-white">
      <section className="mx-auto max-w-3xl space-y-6">
        <header>
          <div className="text-xs uppercase tracking-widest text-bf-textMuted">Application status</div>
          <div className="mt-2 flex items-baseline gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{app?.business_name || app?.company_name || "Your application"}</h1>
            {app?.application_code && <code className="text-xs text-bf-textMuted font-mono">{app.application_code}</code>}
          </div>
          {app?.created_at && (
            <div className="mt-1 text-xs text-bf-textMuted">Submitted {fmtDate(app.created_at)}</div>
          )}
        </header>

        {loading && <div className="text-bf-textMuted">Loading…</div>}
        {err && <div className="rounded border border-red-500/40 bg-red-500/10 p-3 text-sm">{err}</div>}

        {app && (
          <>
            <DecisionBanner app={app} />

            {needsDocs && (
              <div className="rounded-2xl border border-card bg-bf-surface p-5">
                <h3 className="text-lg font-semibold">Required documents</h3>
                <p className="mt-1 text-sm text-bf-textMuted">
                  All five are required before we can send your application on.
                </p>
                <ul className="mt-3 space-y-2 text-sm">
                  {REQUIRED_DOCS.map((d) => {
                    const done = docTypesUploaded.has(d.key);
                    return (
                      <li key={d.key} className="flex items-center gap-2">
                        <span className={done ? "text-emerald-300" : "text-bf-textMuted"}>
                          {done ? "✓" : "○"}
                        </span>
                        <span className={done ? "text-white" : "text-bf-textMuted"}>{d.label}</span>
                      </li>
                    );
                  })}
                </ul>
                {publicId && (
                  <Link
                    to={`/applications/${publicId}/documents`}
                    className="mt-4 inline-block rounded-md bg-bf-cta px-5 py-2 font-semibold text-white hover:bg-bf-ctaHover"
                  >
                    {docs.length > 0 ? "Continue upload" : "Upload documents"}
                  </Link>
                )}
              </div>
            )}

            <div className="rounded-2xl border border-card bg-bf-surface p-5">
              <h3 className="text-lg font-semibold">What's next</h3>
              <ul className="mt-3 space-y-2 text-sm text-bf-textMuted">
                {needsDocs && (
                  <li>• Upload your financial documents (above).</li>
                )}
                {stage === "submitted" && (
                  <li>• Carrier underwriting typically takes 1–3 business days. We'll text you the moment they decide.</li>
                )}
                {stage === "under_review" && (
                  <li>• We're reviewing the carrier's quote with you. Expect a call or SMS from our team.</li>
                )}
                {stage === "approved" && (
                  <li>• Policy issuance follows automatically. Watch for an SMS when your policy is bound.</li>
                )}
                {stage === "policy_issued" && (
                  <>
                    <li>• Your policy is active. Your loan is now PGI-covered up to your declared limit.</li>
                    <li>• You'll receive renewal reminders annually.</li>
                  </>
                )}
                {stage === "declined" && (
                  <li>• Reach out at hello@boreal.financial if you'd like to discuss alternatives or reapply.</li>
                )}
                <li>• Questions? Reply to any of our texts, or email <a href="mailto:hello@boreal.financial" className="text-bf-cta underline">hello@boreal.financial</a>.</li>
              </ul>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
