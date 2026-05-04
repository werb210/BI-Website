// BI_WEBSITE_BLOCK_v91_API_BASE_AND_DOCS_STAGE_v1
// Public document-upload step for the PGI carrier flow. 6 doc types per
// carrier requirement. Submit goes after this stage, not before.
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";

const REQUIRED_DOCS: Array<{ key: string; label: string; required: boolean }> = [
  { key: "profit_loss",        label: "Profit & Loss (last 12 months)",       required: true },
  { key: "balance_sheet",      label: "Balance Sheet (most recent)",          required: true },
  { key: "ar_aging",           label: "Accounts Receivable Aging",            required: true },
  { key: "ap_aging",           label: "Accounts Payable Aging",               required: true },
  { key: "founder_cv",         label: "Founder CV / Resume",                  required: true },
  { key: "financial_forecast", label: "Financial Forecast (12-24 months)",    required: false },
];

export default function PgiDocuments() {
  const { publicId } = useParams<{ publicId: string }>();
  const nav = useNavigate();
  const [files, setFiles] = useState<Record<string, File | undefined>>({});
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

  function pick(key: string, e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    setFiles((prev) => ({ ...prev, [key]: f }));
  }

  async function uploadAll() {
    setErr(null); setBusy(true);
    try {
      const toSend = REQUIRED_DOCS
        .map((d) => ({ docType: d.key, file: files[d.key] }))
        .filter((x): x is { docType: string; file: File } => Boolean(x.file));
      if (toSend.length === 0) { setErr("Pick at least one file to upload."); setBusy(false); return; }
      await api.uploadDocs(publicId!, toSend);
      const r = await api.listDocs(publicId!);
      const m: Record<string, boolean> = {};
      for (const d of r.documents ?? []) m[d.doc_type] = true;
      setUploaded(m);
      setFiles({});
    } catch (ex: any) {
      setErr(ex.message ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  function finish() {
    const missing = REQUIRED_DOCS.filter((d) => d.required && !uploaded[d.key]);
    if (missing.length) {
      setErr(`Missing required documents: ${missing.map((m) => m.label).join(", ")}`);
      return;
    }
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

        {err && <div className="mb-4 rounded border border-red-500/40 bg-red-500/10 p-3 text-sm">{err}</div>}

        <ul className="space-y-3">
          {REQUIRED_DOCS.map((d) => (
            <li key={d.key} className="flex flex-col gap-2 rounded-lg border border-card bg-bf-surface p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-semibold">
                  {d.label}{d.required && <span className="ml-1 text-red-400">*</span>}
                </div>
                <div className="text-xs text-bf-textMuted">
                  {uploaded[d.key] ? "✓ Uploaded" : files[d.key] ? `Selected: ${files[d.key]?.name}` : "Not yet uploaded"}
                </div>
              </div>
              <div>
                <input type="file" accept=".pdf,.png,.jpg,.jpeg,.csv,.xlsx,.xls,.doc,.docx" onChange={(e) => pick(d.key, e)} />
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button type="button" disabled={busy} onClick={uploadAll}
                  className="rounded-md bg-bf-cta px-6 py-3 font-semibold text-white hover:bg-bf-ctaHover disabled:opacity-50">
            {busy ? "Uploading…" : "Upload selected"}
          </button>
          <button type="button" onClick={finish}
                  className="rounded-md border border-white/20 px-6 py-3 font-semibold hover:bg-white/5">
            Continue to Thanks
          </button>
        </div>
      </div>
    </main>
  );
}
