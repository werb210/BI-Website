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
const REQUIRED_DOCS: Array<{ key: string; label: string; pgiType: string; multi?: boolean }> = [
  { key: "annual_fs_3yr",  label: "Annual Financial Statements (last 3 years)",        pgiType: "profit_loss",  multi: true },
  { key: "interim_fs",     label: "Interim Financial Statements (current period P&L + Balance Sheet)", pgiType: "profit_loss", multi: true },
  { key: "ar_aging",       label: "Accounts Receivable Aging",                         pgiType: "ar_aging" },
  { key: "ap_aging",       label: "Accounts Payable Aging",                            pgiType: "ap_aging" },
];

type SlotFiles = File | File[] | undefined;

export default function PgiDocuments() {
  const { publicId } = useParams<{ publicId: string }>();
  const nav = useNavigate();
  const [files, setFiles] = useState<Record<string, SlotFiles>>({});
  const [uploaded, setUploaded] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!publicId) return;
    api.listDocs(publicId).then((r: any) => {
      const m: Record<string, boolean> = {};
      for (const d of r.documents ?? []) m[d.doc_type] = true;
      setUploaded(m);
    }).catch(() => {});
  }, [publicId]);

  function pick(key: string, multi: boolean, e: React.ChangeEvent<HTMLInputElement>) {
    const all = Array.from(e.target.files ?? []);
    if (all.length === 0) return;
    setFiles((prev) => ({ ...prev, [key]: multi ? all : all[0] }));
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
    setErr(null); setBusy(true);
    try {
      await api.uploadDocs(publicId!, list.map((file) => ({ docType: pgiType, file })));
      const r = await api.listDocs(publicId!);
      const m: Record<string, boolean> = {};
      for (const d of r.documents ?? []) m[d.doc_type] = true;
      setUploaded(m);
    } catch (ex: any) {
      setErr(ex.message ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  function selectedLabel(slot: SlotFiles): string {
    if (!slot) return "Not yet uploaded";
    if (Array.isArray(slot)) {
      if (slot.length === 1) return `Selected: ${slot[0].name}`;
      return `Selected: ${slot.length} files (${slot.map((f) => f.name).join(", ")})`;
    }
    return `Selected: ${slot.name}`;
  }

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

        <ul className="space-y-3">
          {REQUIRED_DOCS.map((d) => (
            <li key={d.key} className="flex flex-col gap-2 rounded-lg border border-card bg-bf-surface p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-semibold">{d.label}</div>
                <div className="text-xs text-bf-textMuted">
                  {uploaded[d.key] ? "✓ Uploaded" : busy ? "Uploading…" : selectedLabel(files[d.key])}
                </div>
              </div>
              <div>
                <input
                  type="file"
                  multiple={d.multi === true}
                  accept=".pdf,.png,.jpg,.jpeg,.csv,.xlsx,.xls,.doc,.docx"
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
