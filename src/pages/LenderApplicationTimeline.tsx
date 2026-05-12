// BI_WEBSITE_BLOCK_v126_DEMO_SANDBOX_AND_CARRIER_FEEDBACK_v1
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || "https://bi-server-cse0apamgkheb9d5.canadacentral-01.azurewebsites.net";

export default function LenderApplicationTimeline() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const token = useMemo(() => { try { return localStorage.getItem("bi.lender_token") || ""; } catch { return ""; } }, []);
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) { navigate("/lender/login"); return; }
    if (!code) return;
    (async () => {
      try {
        const r = await fetch(`${API_BASE}/api/v1/lender/applications/${encodeURIComponent(code)}/timeline`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await r.json().catch(() => []);
        if (!r.ok) { setError(`Failed to load (${r.status})`); return; }
        setItems(Array.isArray(data) ? data : (data?.events || []));
      } catch (e: any) { setError(e?.message || "Network error"); }
    })();
  }, [token, code, navigate]);

  return <div style={{ maxWidth: 980, margin: "0 auto", padding: 24 }}>
    <button onClick={() => navigate(`/lender/applications/${code}`)} style={{ background: "transparent", border: "none", color: "#cbd5e1", marginBottom: 12, cursor: "pointer" }}>← Back to application</button>
    <h1 style={{ marginBottom: 16 }}>Carrier timeline</h1>
    {error && <div style={{ background: "#3a1010", color: "#fecaca", padding: 12, borderRadius: 8 }}>{error}</div>}
    {!error && items.length === 0 && <div style={{ opacity: 0.7 }}>No events yet.</div>}
    <div style={{ display: "grid", gap: 10 }}>
      {items.map((ev, i) => <div key={i} style={{ background: "#0f1729", border: "1px solid #1c2538", borderRadius: 10, padding: 12 }}>
        <div style={{ fontSize: 12, opacity: 0.7 }}>{ev.created_at || ev.at || ""}</div>
        <div style={{ fontWeight: 600 }}>{ev.event || ev.type || ev.status || "Event"}</div>
        <div style={{ fontSize: 13, opacity: 0.8 }}>{ev.message || ev.detail || JSON.stringify(ev.payload || {})}</div>
      </div>)}
    </div>
  </div>
}
