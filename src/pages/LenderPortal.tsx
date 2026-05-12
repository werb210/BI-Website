// BI_WEBSITE_BLOCK_v126_DEMO_SANDBOX_AND_CARRIER_FEEDBACK_v1
// BI_WEBSITE_BLOCK_v127_BRAND_TRIM_AND_API_LABEL_v1
// BI_WEBSITE_BLOCK_v115_LENDER_DASHBOARD_v1
// BI_WEBSITE_BLOCK_v125_LENDER_FIXES_AND_PUBLIC_POLISH_v1
//   - Carrier API button (opens /lender/api docs in new tab).
//   - Demo App button (loads /lender/demo).
//   - Kanban remains always-rendered.
//   - Uses useNavigate (no reload loop).
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type App = {
  id: string;
  application_code?: string;
  company_name?: string | null;
  business_name?: string | null;
  guarantor_name?: string | null;
  status?: string | null;
  loan_amount?: number | string | null;
  pgi_application_id?: string | null;
  carrier_received_at?: string | null;
  carrier_last_event?: string | null;
  carrier_last_event_at?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
  core_inputs?: any;
};

type Stage = { key: string; label: string; statuses: string[] };
const STAGES: Stage[] = [
  { key: "submitted",    label: "Submitted",    statuses: ["new_application", "submitted", "ready_for_submission"] },
  { key: "underwriting", label: "Underwriting", statuses: ["underwriting", "in_review"] },
  { key: "conditional",  label: "Conditional",  statuses: ["conditional_approval", "conditional"] },
  { key: "bound",        label: "Bound",        statuses: ["bound", "approved", "issued"] },
  { key: "declined",     label: "Declined",     statuses: ["declined", "withdrawn", "cancelled"] },
];

function stageOf(status?: string | null): string {
  if (!status) return "submitted";
  const s = status.toLowerCase();
  for (const stage of STAGES) {
    if (stage.statuses.includes(s)) return stage.key;
  }
  return "submitted";
}

function fmtAmount(v: any): string {
  const n = Number(typeof v === "string" ? v.replace(/[,$\s]/g, "") : v);
  if (!Number.isFinite(n) || n === 0) return "—";
  return "$" + Math.round(n).toLocaleString();
}

function daysSince(iso?: string | null): string {
  if (!iso) return "—";
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "—";
  const d = Math.floor((Date.now() - t) / (1000 * 60 * 60 * 24));
  if (d <= 0) return "today";
  if (d === 1) return "1 day";
  return `${d} days`;
}

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL
  || (import.meta as any).env?.VITE_API_URL
  || "https://bi-server-cse0apamgkheb9d5.canadacentral-01.azurewebsites.net";

export default function LenderPortal() {
  const navigate = useNavigate();
  const [apps, setApps] = useState<App[] | null>(null);
  const [me, setMe] = useState<{ name?: string; company_name?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const token = useMemo(() => {
    try { return localStorage.getItem("bi.lender_token") || ""; } catch { return ""; }
  }, []);

  useEffect(() => {
    if (!token) { navigate("/lender/login", { replace: true }); return; }
    let alive = true;
    (async () => {
      try {
        const [meR, mineR] = await Promise.all([
          fetch(`${API_BASE}/api/v1/lender/me`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/api/v1/lender/applications/mine`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (!alive) return;
        if (meR.ok) setMe(await meR.json());
        if (!mineR.ok) {
          setError(`Failed to load applications (${mineR.status})`);
          setApps([]);
        } else {
          const data = await mineR.json().catch(() => []);
          setApps(Array.isArray(data) ? data : (data?.applications || []));
        }
      } catch (e: any) {
        if (alive) { setError(e?.message || "Network error"); setApps([]); }
      }
    })();
    return () => { alive = false; };
  }, [token, navigate]);

  function signOut() {
    try {
      localStorage.removeItem("bi.lender_token");
      localStorage.removeItem("bi.lender_phone");
      localStorage.removeItem("bi.lender_id");
    } catch {}
    navigate("/lender/login", { replace: true });
  }

  const demoActive = useMemo(() => { try { return localStorage.getItem("bi.is_demo_session") === "1"; } catch { return false; } }, []);

  function exitDemo() {
    try {
      const backup = localStorage.getItem("bi.real_token_backup") || "";
      if (backup) localStorage.setItem("bi.lender_token", backup);
      localStorage.removeItem("bi.real_token_backup");
      localStorage.removeItem("bi.is_demo_session");
    } catch {}
    window.location.reload();
  }

  const grouped = useMemo(() => {
    const out: Record<string, App[]> = {};
    for (const s of STAGES) out[s.key] = [];
    for (const a of apps || []) out[stageOf(a.status)].push(a);
    return out;
  }, [apps]);

  const totalCount = apps?.length || 0;

  const BTN: React.CSSProperties = { padding: "10px 16px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14, whiteSpace: "nowrap" };

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 24px 64px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: 1, opacity: 0.7 }}>LENDER</div>
          <h1 style={{ fontSize: 28, margin: "4px 0 4px" }}>{me?.company_name || me?.name || "Lender portal"}</h1>
          <div style={{ opacity: 0.7 }}>
            {apps === null ? "Loading pipeline…" :
              totalCount === 0 ? "No applications yet — your pipeline appears below as soon as you submit one." :
              `${totalCount} application${totalCount === 1 ? "" : "s"} in pipeline.`}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={() => navigate("/lender/applications/new")}
            style={{ ...BTN, background: "#3b82f6", color: "white", border: "none" }}>
            + New Application
          </button>
          <a href="/lender/demo" onClick={(e) => { e.preventDefault(); navigate("/lender/demo"); }}
            style={{ ...BTN, background: "transparent", border: "1px solid #fbbf24", color: "#fbbf24", textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
            ▶ Live Demo
          </a>
          <a href="/lender/api" target="_blank" rel="noopener"
            style={{ ...BTN, background: "transparent", border: "1px solid #2c3a52", color: "#cbd5e1", textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
            API Docs
          </a>
          {/* BI_WEBSITE_BLOCK_v131_LENDER_SANDBOX_PANEL_v1 — self-service API keys + sandbox */}
          <a href="/lender/sandbox"
            style={{ ...BTN, background: "transparent", border: "1px solid #2c3a52", color: "#cbd5e1", textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
            🔑 API Keys
          </a>
          <button onClick={signOut}
            style={{ ...BTN, background: "transparent", border: "1px solid #2c3a52", color: "#cbd5e1" }}>
            Sign out
          </button>
        </div>
      </div>

      {demoActive && (
        <div style={{ background: "#422006", color: "#fde68a", padding: 12, borderRadius: 8, marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Demo session active</span>
          <button onClick={exitDemo} style={{ background: "transparent", border: "1px solid #fbbf24", color: "#fbbf24", padding: "6px 10px", borderRadius: 6, cursor: "pointer" }}>Exit demo</button>
        </div>
      )}

      {error && (
        <div style={{ background: "#3a1010", color: "#fecaca", padding: 12, borderRadius: 8, marginBottom: 16 }}>{error}</div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(240px, 1fr))", gap: 12, overflowX: "auto" }}
           className="lender-pipeline-grid">
        {STAGES.map((s) => (
          <div key={s.key} style={{ background: "#0f1729", border: "1px solid #1c2538", borderRadius: 12, padding: 12, minWidth: 240 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12, paddingBottom: 8, borderBottom: "1px solid #1c2538" }}>
              <div style={{ fontSize: 12, letterSpacing: 1, opacity: 0.7, textTransform: "uppercase" }}>{s.label}</div>
              <div style={{ fontSize: 12, opacity: 0.5 }}>{grouped[s.key]?.length || 0}</div>
            </div>
            {(grouped[s.key]?.length || 0) === 0 ? (
              <div style={{ opacity: 0.3, fontSize: 13, padding: "16px 8px", textAlign: "center" }}>—</div>
            ) : grouped[s.key].map((a) => {
              const loan = a.core_inputs?.loan_amount ?? a.loan_amount;
              const company = a.company_name || a.business_name || a.application_code || "—";
              return (
                <div
                  key={a.id}
                  onClick={() => navigate(`/lender/applications/${a.application_code || a.id}`)}
                  style={{ background: "#0a1120", border: "1px solid #2c3a52", borderRadius: 8, padding: 12, marginBottom: 8, cursor: "pointer" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}><div style={{ fontWeight: 600, fontSize: 14 }}>{company}</div>{(a as any).is_demo === true && (<span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 4, background: "rgba(251, 191, 36, 0.15)", color: "#fbbf24", border: "1px solid rgba(251, 191, 36, 0.4)", letterSpacing: 0.5 }}>TEST</span>)}</div>
                  {a.guarantor_name && <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>{a.guarantor_name}</div>}
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12 }}>
                    <span style={{ opacity: 0.7 }}>{fmtAmount(loan)}</span>
                    <span style={{ opacity: 0.5 }}>{daysSince(a.updated_at || a.created_at)}</span>
                  </div>
                  {a.carrier_last_event ? (
                    <div style={{ marginTop: 6, fontSize: 11, color: "#93c5fd" }}>
                      Carrier: {String(a.carrier_last_event).replace(/_/g, " ")} {a.carrier_last_event_at ? `· ${hoursSince(a.carrier_last_event_at)}` : ""}
                    </div>
                  ) : a.pgi_application_id ? (
                    <div style={{ marginTop: 6, fontSize: 11, color: "#34d399", display: "flex", alignItems: "center", gap: 4 }}>
                      <span>✓</span><span>Received by carrier</span>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .lender-pipeline-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}


function hoursSince(iso?: string | null): string {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "";
  const h = Math.max(0, Math.floor((Date.now()-t)/(1000*60*60)));
  return h < 1 ? "now" : `${h}h`;
}
