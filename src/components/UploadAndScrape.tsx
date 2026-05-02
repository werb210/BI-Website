import { useState } from "react";
import { api } from "../lib/api";

export function UploadAndScrape({
  publicId, onApply,
}: {
  publicId: string;
  onApply: (fields: Record<string, number>) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<Record<string, number> | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true); setErr(null);
    try {
      const r = await api.scrape(publicId, f);
      setPending(r.extracted);
    } catch (ex: any) {
      setErr("Could not extract financials from that file. Enter manually.");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  function applyAll() {
    if (pending) onApply(pending);
    setPending(null);
  }

  return (
    <div className="bi-scrape">
      <label className="bi-scrape-button">
        {busy ? "Scanning…" : "↑ Upload & Scrape"}
        <input type="file" accept=".pdf,.png,.jpg,.jpeg,.csv,.xlsx" onChange={handleFile} hidden />
      </label>
      {err && <div className="bi-scrape-err">{err}</div>}
      {pending && (
        <div className="bi-scrape-modal">
          <h4>Extracted from your document</h4>
          <ul>
            {Object.entries(pending).filter(([k]) => !k.startsWith("_")).map(([k, v]) => (
              <li key={k}><strong>{k}:</strong> ${Number(v).toLocaleString()}</li>
            ))}
          </ul>
          <div className="bi-scrape-actions">
            <button onClick={() => setPending(null)}>Cancel</button>
            <button className="primary" onClick={applyAll}>Apply to form</button>
          </div>
        </div>
      )}
    </div>
  );
}
