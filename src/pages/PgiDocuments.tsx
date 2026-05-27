// BI_WEBSITE_BLOCK_v91_API_BASE_AND_DOCS_STAGE_v1
// BI_WEBSITE_BLOCK_v178_FULL_WAVE_v1
// BI_WEBSITE_BLOCK_v179_INTAKE_AND_DOC_POLISH_v1
// BI_WEBSITE_BLOCK_v180_DEMO_TOKEN_AND_AUTO_UPLOAD_v1
// Public document-upload step for the PGI carrier flow. Per operator
// spec: reduced to 4 doc types (3-year FS, Interim, AR, AP). founder_cv
// and financial_forecast were dropped from the required UI — PGI's API
// still accepts them but they're no longer collected at intake. Submit
// is no longer gated on document presence: an applicant can submit
// with zero docs and the BI-Server pipeline parks the row at
// stage=new_application ("Submitted (no docs)") + SMS-reminders the
// applicant Mon-Fri until they finish. The "Don't have your documents
// yet?" CTA appears ABOVE the upload list so applicants who arrive
// without their books see the defer path before scrolling through the
// upload fields.
//
// v180 changes:
//   1. Auto-upload on file pick. The previous flow required a second
//      "Upload selected" click — gone now; pick() fires uploadFiles()
//      immediately. Operator's read on the user's intent: if they
//      picked a file, they want it uploaded.
//   2. "Upload selected" button removed (no longer a thing).
//   3. Reminder copy trimmed: "We'll text you a reminder." (was
//      "...each weekday for two weeks until you finish.").
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";

// Slots flagged `multi: true` accept >1 file via <input multiple>. The
// state for those slots is a File[]; single-file slots remain a File.
// BI_WEBSITE_BLOCK_v348_DOCS_LIST_AND_POSTAL_FORMAT_v1
// Canonical 5-doc list, verified against PGI's own intake UI at
// app.pgicover.com/applications/new/upload?from=score (Screenshot
// "2026-05-26 at 6.58.58 PM.png"). Server allow-list at
// bi-server/src/routes/biPublicApplicationRoutes.ts:594-597 contains
// exactly these five plus founder_cv + financial_forecast (added
// dynamically by RequiredDocumentsList.tsx when business <3 years).
//
// Pre-v348 the list contained "annual_financials_3yr" which is NOT in
// the server allow-list, so every upload 400'd with invalid_doc_type
// (red banner visible in IMG_1030/IMG_1032). It was also missing
// loan_agreement (Lender Agreement / Term Sheet), which PGI lists
// FIRST on their own intake page.
const REQUIRED_DOCS: Array<{ key: string; label: string; pgiType: string; multi?: boolean }> = [
  { key: "loan_agreement", label: "Lender Agreement / Term Sheet",                            pgiType: "loan_agreement" },
  { key: "profit_loss",    label: "Profit & Loss Statement (last 12 months, monthly breakdown)", pgiType: "profit_loss" },
  { key: "balance_sheet",  label: "Balance Sheet (most recent month-end)",                    pgiType: "balance_sheet" },
  { key: "ar_aging",       label: "Accounts Receivable Aging Summary (most recent)",          pgiType: "ar_aging" },
  { key: "ap_aging",       label: "Accounts Payable Aging Summary (most recent)",             pgiType: "ap_aging" },
];

type DocState = {
  status: "pending" | "uploaded" | "accepted" | "rejected";
  rejection_reason?: string;
  last_uploaded_at?: string;
};

export default function PgiDocuments() {
  const { publicId } = useParams<{ publicId: string }>();
  const nav = useNavigate();
  const [docState, setDocState] = useState<Record<string, DocState>>({});
  const [statusLoadFailed, setStatusLoadFailed] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function deriveDocState(documents: any[]): Record<string, DocState> {
    const byType = new Map<string, any[]>();
    for (const d of documents ?? []) {
      const key = d.doc_type ?? d.pgiType;
      if (!key) continue;
      const group = byType.get(key) ?? [];
      group.push(d);
      byType.set(key, group);
    }

    const next: Record<string, DocState> = {};
    for (const required of REQUIRED_DOCS) {
      const rows = byType.get(required.pgiType) ?? byType.get(required.key) ?? [];
      if (rows.length === 0) {
        next[required.pgiType] = { status: "pending" };
        continue;
      }
      rows.sort((a, b) => new Date(b.uploaded_at ?? b.last_uploaded_at ?? 0).getTime() - new Date(a.uploaded_at ?? a.last_uploaded_at ?? 0).getTime());
      const latest = rows[0];
      if (latest.review_status === "accepted") {
        next[required.pgiType] = { status: "accepted", last_uploaded_at: latest.uploaded_at ?? latest.last_uploaded_at };
      } else if (latest.review_status === "rejected") {
        next[required.pgiType] = {
          status: "rejected",
          rejection_reason: latest.rejection_reason ?? undefined,
          last_uploaded_at: latest.uploaded_at ?? latest.last_uploaded_at,
        };
      } else {
        next[required.pgiType] = { status: "uploaded", last_uploaded_at: latest.uploaded_at ?? latest.last_uploaded_at };
      }
    }
    return next;
  }

  async function refreshDocState() {
    if (!publicId) return;
    try {
      const r = await api.listDocs(publicId);
      setDocState(deriveDocState(r.documents ?? []));
      setStatusLoadFailed(false);
    } catch {
      const fallback: Record<string, DocState> = {};
      for (const required of REQUIRED_DOCS) fallback[required.pgiType] = { status: "pending" };
      setDocState(fallback);
      setStatusLoadFailed(true);
    }
  }

  useEffect(() => {
    void refreshDocState();
  }, [publicId]);

  useEffect(() => {
    function onFocusOrVisible() {
      if (document.visibilityState !== "visible") return;
      void refreshDocState();
    }
    window.addEventListener("focus", onFocusOrVisible);
    document.addEventListener("visibilitychange", onFocusOrVisible);
    return () => {
      window.removeEventListener("focus", onFocusOrVisible);
      document.removeEventListener("visibilitychange", onFocusOrVisible);
    };
  }, [publicId]);

  function pick(key: string, multi: boolean, e: React.ChangeEvent<HTMLInputElement>) {
    const all = Array.from(e.target.files ?? []);
    if (all.length === 0) return;
    // BI_WEBSITE_BLOCK_v327_DOC_CONSTRAINTS_v1
    const ALLOWED_MIME = new Set([
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
      "text/markdown",
    ]);
    const MAX_BYTES = 5 * 1024 * 1024;
    const firstInvalidType = all.find((file) => !ALLOWED_MIME.has(file.type));
    if (firstInvalidType) {
      alert(`File type '${firstInvalidType.type}' is not allowed. Accepted: PDF, DOCX, XLS, XLSX, CSV, Markdown. No images.`);
      return;
    }
    const firstTooLarge = all.find((file) => file.size > MAX_BYTES);
    if (firstTooLarge) {
      alert(`File exceeds the 5 MB limit (${(firstTooLarge.size / 1024 / 1024).toFixed(1)} MB).`);
      return;
    }
    // BI_WEBSITE_BLOCK_v180_DEMO_TOKEN_AND_AUTO_UPLOAD_v1 — auto-upload
    // the just-picked file(s). The previous flow required a second
    // explicit "Upload selected" click; operator's call is that the
    // user's intent is obvious — they picked the file, they want it
    // uploaded. We use a one-shot upload limited to this slot's files
    // so unrelated slots aren't accidentally re-uploaded.
    const justPicked = (multi ? all : [all[0]]).filter(Boolean) as File[];
    if (justPicked.length === 0) return;
    void uploadFiles(REQUIRED_DOCS.find((d) => d.key === key)!.pgiType, justPicked);
  }

  // Per-slot uploader. Extracted from the previous uploadAll() so we
  // can fire it from pick() without bulk-processing every slot.
  async function uploadFiles(pgiType: string, list: File[]) {
    setErr(null);
    try {
      await api.uploadDocs(publicId!, list.map((file) => ({ docType: pgiType, file })));
      await refreshDocState();
    } catch (ex: any) {
      setErr(ex.message ?? "Upload failed");
    } finally {
    }
  }

  const summary = REQUIRED_DOCS.reduce((acc, d) => {
    const status = docState[d.pgiType]?.status ?? "pending";
    acc.total += 1;
    if (status === "accepted") acc.accepted += 1;
    if (status === "rejected") acc.rejected += 1;
    if (status === "pending") acc.pending += 1;
    if (status === "uploaded") acc.uploaded += 1;
    return acc;
  }, { total: 0, accepted: 0, rejected: 0, pending: 0, uploaded: 0 });

  function finish() {
    // BI_WEBSITE_BLOCK_v178_FULL_WAVE_v1 — submit no longer requires
    // any docs. The server places zero-doc apps in the
    // submitted_no_docs stage and starts SMS reminders. Staff can also
    // review the app even before docs land.
    nav(`/applications/${publicId}/thanks`);
  }

  return (
    <main className="min-h-screen bg-bf-bg px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6">
          <div className="text-xs uppercase tracking-widest text-bf-textMuted">Page 2 of 3</div>
          <h1 className="mt-1 text-3xl font-bold">Required Documents</h1>
          <p className="mt-2 text-bf-textMuted">Upload the documents the carrier needs to issue your quote.</p>
        </header>

        {/* BI_WEBSITE_BLOCK_v178_FULL_WAVE_v1 — defer CTA moved ABOVE the upload list */}
        {/* BI_WEBSITE_BLOCK_v179_INTAKE_AND_DOC_POLISH_v1 — "Save & finish later" removed */}
        {/* BI_WEBSITE_BLOCK_v180_DEMO_TOKEN_AND_AUTO_UPLOAD_v1 — reminder copy trimmed */}
        <div className="mb-6 rounded-2xl border border-white/10 bg-bf-surface p-4 text-sm">
          <div className="font-semibold text-white">Don't have your documents yet?</div>
          <p className="mt-1 text-bf-textMuted">
            That's fine — submit your application now and upload later. We'll
            text you a reminder.
          </p>
          <div className="mt-3">
            <button type="button" onClick={finish}
                    className="rounded-md border border-white/20 px-5 py-2 font-medium hover:bg-white/5">
              Submit without documents
            </button>
          </div>
        </div>

        {err && <div className="mb-4 rounded border border-red-500/40 bg-red-500/10 p-3 text-sm">{err}</div>}
        {statusLoadFailed && (
          <div className="mb-4 rounded border border-gray-500/40 bg-gray-500/10 p-3 text-sm text-gray-300">
            Couldn't load document status — showing required list.
          </div>
        )}

        {summary.rejected > 0 ? (
          <div className="mb-4 rounded border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-100">
            ⚠ {summary.rejected} document(s) need your attention — please re-upload below.
          </div>
        ) : summary.accepted < summary.total ? (
          <div className="mb-4 rounded border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-100">
            {summary.accepted}/{summary.total} documents accepted. {summary.pending + summary.uploaded} outstanding.
          </div>
        ) : (
          <div className="mb-4 rounded border border-green-500/40 bg-green-500/10 p-3 text-sm text-green-100">
            ✓ All documents received and accepted.
          </div>
        )}

        <ul className="space-y-3">
          {REQUIRED_DOCS.map((d) => (
            <li key={d.key} className="flex flex-col gap-2 rounded-lg border border-card bg-bf-surface p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-semibold">{d.label}</div>
                <div className="mt-1">
                  {(() => {
                    const current = docState[d.pgiType] ?? { status: "pending" as const };
                    const statusConfig = {
                      pending: { text: "Required", cls: "bg-gray-100 text-gray-700 ring-1 ring-gray-300" },
                      uploaded: { text: "Uploaded — under review", cls: "bg-blue-50 text-blue-700 ring-1 ring-blue-200" },
                      accepted: { text: "✓ Accepted", cls: "bg-green-50 text-green-700 ring-1 ring-green-200" },
                      rejected: { text: "✗ Rejected — please re-upload", cls: "bg-red-50 text-red-700 ring-1 ring-red-200" },
                    }[current.status];
                    return (
                      <>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusConfig.cls}`}>
                          {statusConfig.text}
                        </span>
                        {current.status === "rejected" && current.rejection_reason && (
                          <div className="mt-1 text-xs italic text-bf-textMuted">{current.rejection_reason}</div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
              <div>
                <input
                  type="file"
                  multiple={d.multi === true}
                  accept="application/pdf,.pdf,.docx,.xlsx,.xls,.csv,.md,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,text/markdown"
                  onChange={(e) => pick(d.key, d.multi === true, e)}
                />
              </div>
            </li>
          ))}
        </ul>

        {/* BI_WEBSITE_BLOCK_v180_DEMO_TOKEN_AND_AUTO_UPLOAD_v1 — "Upload
            selected" button removed; pick() auto-uploads on file
            selection. Only the Submit-without-docs path remains as an
            explicit action. */}
        <div className="mt-6">
          <button type="button" onClick={finish}
                  className="rounded-md border border-white/20 px-6 py-3 font-semibold hover:bg-white/5">
            Submit application
          </button>
        </div>
      </div>
    </main>
  );
}
