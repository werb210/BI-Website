// BI_WEBSITE_BLOCK_v116_LENDER_APPLICATION_DETAIL_v1
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

type App = {
  id: string;
  application_code?: string;
  company_name?: string | null;
  guarantor_name?: string | null;
  guarantor_phone?: string | null;
  guarantor_email?: string | null;
  status?: string | null;
  stage?: string | null;
  source?: string | null;
  core_inputs?: any;
  consents?: any;
  lender_notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  documents?: any[];
};

const STAGE_COLORS: Record<string, string> = {
  submitted:    "#3b82f6",
  underwriting: "#f59e0b",
  conditional:  "#8b5cf6",
  bound:        "#10b981",
  declined:     "#6b7280",
};

const STAGE_LABELS: Record<string, string> = {
  submitted:    "Submitted",
  underwriting: "Underwriting",
  conditional:  "Conditional",
  bound:        "Bound",
  declined:     "Declined",
};

function fmtAmount(v: any): string {
  if (v === null || v === undefined || v === "") return "—";
  const n = Number(typeof v === "string" ? v.replace(/[,$\s]/g, "") : v);
  if (!Number.isFinite(n)) return "—";
  return "$" + Math.round(n).toLocaleString();
}

function fmtDate(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "—";
  return d.toLocaleString();
}

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL
  || "https://bi-server-cse0apamgkheb9d5.canadacentral-01.azurewebsites.net";

const SECTION_STYLE: React.CSSProperties = {
  background: "#0f1729", border: "1px solid #1c2538", borderRadius: 12,
  padding: 20, marginBottom: 16,
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={SECTION_STYLE}>
      <h2 style={{ fontSize: 12, letterSpacing: 1, opacity: 0.7, margin: "0 0 16px", textTransform: "uppercase" }}>{title}</h2>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 16, padding: "8px 0", borderBottom: "1px solid #1c2538", fontSize: 14 }}>
      <div style={{ opacity: 0.6 }}>{label}</div>
      <div>{value ?? "—"}</div>
    </div>
  );
}

export default function LenderApplicationDetail() {
  const navigate = useNavigate();
  const { code } = useParams<{ code: string }>();
  const [app, setApp] = useState<App | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const token = useMemo(() => {
    try { return localStorage.getItem("bi.lender_token") || ""; } catch { return ""; }
  }, []);

  useEffect(() => {
    if (!token) { navigate("/lender/login"); return; }
    if (!code) return;
    let alive = true;
    (async () => {
      try {
        const r = await fetch(`${API_BASE}/api/v1/lender/applications/${encodeURIComponent(code)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!alive) return;
        if (r.status === 404) { setError("Application not found."); setLoading(false); return; }
        if (!r.ok) { setError(`Failed to load (${r.status})`); setLoading(false); return; }
        const data = await r.json();
        setApp(data);
        setLoading(false);
      } catch (e: any) {
        if (alive) { setError(e?.message || "Network error"); setLoading(false); }
      }
    })();
    return () => { alive = false; };
  }, [code, token, navigate]);

  const stage = app?.stage || "submitted";
  const stageColor = STAGE_COLORS[stage] || "#6b7280";
  const stageLabel = STAGE_LABELS[stage] || stage;
  const ci = app?.core_inputs || {};

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 24px 64px" }}>
      <button onClick={() => navigate("/lender/portal")}
        style={{ background: "transparent", border: "none", color: "#cbd5e1", padding: "8px 0", cursor: "pointer", marginBottom: 16, fontSize: 14 }}>
        ← Back to portal
      </button>
      {/* BI_WEBSITE_BLOCK_v126_DEMO_SANDBOX_AND_CARRIER_FEEDBACK_v1 */}
      <button onClick={() => navigate(`/lender/applications/${code}/timeline`)}
        style={{ background: "transparent", border: "1px solid #2c3a52", color: "#cbd5e1", padding: "6px 12px", borderRadius: 6, cursor: "pointer", marginLeft: 12, marginBottom: 16, fontSize: 13 }}>
        Carrier timeline →
      </button>

      {loading ? (
        <div style={{ opacity: 0.6, padding: 48, textAlign: "center" }}>Loading…</div>
      ) : error ? (
        <div style={{ background: "#3a1010", color: "#fecaca", padding: 16, borderRadius: 8 }}>{error}</div>
      ) : !app ? null : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, letterSpacing: 1, opacity: 0.7 }}>APPLICATION {app.application_code || ""}</div>
              <h1 style={{ fontSize: 28, margin: "4px 0" }}>{app.company_name || "—"}</h1>
              <div style={{ opacity: 0.7 }}>{app.guarantor_name || "—"}</div>
            </div>
            <div style={{ background: stageColor, color: "white", padding: "8px 16px", borderRadius: 999, fontSize: 13, fontWeight: 600 }}>
              {stageLabel}
            </div>
          </div>

          <Section title="Applicant">
            <Row label="Company" value={app.company_name} />
            <Row label="Guarantor" value={app.guarantor_name} />
            <Row label="Phone" value={app.guarantor_phone} />
            <Row label="Email" value={app.guarantor_email} />
          </Section>

          <Section title="Business">
            <Row label="Country" value={ci.country} />
            <Row label="NAICS" value={ci.naics} />
            <Row label="Start date" value={ci.business_start_date} />
          </Section>

          <Section title="Loan">
            <Row label="Loan amount" value={fmtAmount(ci.loan_amount)} />
            <Row label="Requested PGI limit" value={fmtAmount(ci.pgi_limit)} />
            <Row label="Use of proceeds" value={ci.use_of_proceeds} />
            <Row label="Estimated close date" value={ci.estimated_close_date} />
          </Section>

          <Section title="Financials">
            <Row label="Revenue last year" value={fmtAmount(ci.revenue)} />
            <Row label="EBITDA last year" value={fmtAmount(ci.ebitda)} />
            <Row label="Total business debt" value={fmtAmount(ci.total_debt)} />
            <Row label="Monthly loan payments" value={fmtAmount(ci.monthly_payments)} />
            <Row label="Owner salary" value={fmtAmount(ci.owner_salary)} />
            <Row label="Cash on hand" value={fmtAmount(ci.cash_on_hand)} />
            <Row label="Revenue projection next year" value={fmtAmount(ci.revenue_projection_next_year)} />
          </Section>

          {app.lender_notes && (
            <Section title="Lender notes">
              <div style={{ whiteSpace: "pre-wrap", fontSize: 14 }}>{app.lender_notes}</div>
            </Section>
          )}

          <Section title="Documents">
            {(!app.documents || app.documents.length === 0) ? (
              <div style={{ opacity: 0.5, fontSize: 14 }}>No documents uploaded. Document upload arrives in a later release.</div>
            ) : (
              <div>{app.documents.length} document(s)</div>
            )}
          </Section>

          <Section title="Audit">
            <Row label="Source" value={app.source} />
            <Row label="Status (raw)" value={app.status} />
            <Row label="Created" value={fmtDate(app.created_at)} />
            <Row label="Updated" value={fmtDate(app.updated_at)} />
          </Section>
        </>
      )}
    </div>
  );
}
