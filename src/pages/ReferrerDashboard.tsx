// BI_WEBSITE_BLOCK_v336_REFERRER_PORTAL_v1
// Referrer dashboard — 5-stage carrier pipeline + full referrals list.
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
// BI_WEBSITE_BLOCK_v347_TEST1_RUN5_v1
import { API_BASE } from "@/config";

// Carrier stages — same 5 columns as lender portal. Order matters (display LtoR).
const CARRIER_STAGES = [
  { key: "submitted",            label: "SUBMITTED"    },
  { key: "under_review",         label: "UNDERWRITING" },
  { key: "information_required", label: "CONDITIONAL"  },
  { key: "policy_issued",        label: "BOUND"        },
  { key: "declined",             label: "DECLINED"     },
] as const;

// Display label resolver for the list-below view (includes pre-submission states).
function statusLabel(s: string): string {
  switch (s) {
    case "created": return "Draft";
    case "in_progress": return "In progress";
    case "ready_for_submission": return "Ready";
    case "submitted": return "Submitted";
    case "under_review": return "Underwriting";
    case "information_required": return "Conditional";
    case "approved": return "Approved";
    case "policy_issued": return "Bound";
    case "declined": return "Declined";
    case "cancelled": return "Cancelled";
    default: return s || "—";
  }
}

type Referral = {
  id: string;
  public_id: string;
  status: string;
  company_name: string | null;
  guarantor_name: string | null;
  loan_amount: number | string | null;
  pgi_limit: number | string | null;
  created_at: string;
};

function getReferrerToken(): string {
  try { return localStorage.getItem("bi.referrer_token") || ""; } catch { return ""; }
}

export default function ReferrerDashboard() {
  const nav = useNavigate();
  const token = useMemo(() => getReferrerToken(), []);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) { nav("/referrer/login"); return; }
    (async () => {
      try {
        const r = await fetch(`${API_BASE}/api/v1/referrer/referrals`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        const list: Referral[] = Array.isArray(data?.referrals) ? data.referrals : Array.isArray(data) ? data : [];
        setReferrals(list);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [token, nav]);

  function signOut() {
    try { localStorage.removeItem("bi.referrer_token"); } catch {}
    nav("/referrer/login");
  }

  // Tally counts per carrier stage. Pre-submission stages don't tally into any column.
  const counts = useMemo(() => {
    const map = new Map<string, number>(CARRIER_STAGES.map((s) => [s.key, 0]));
    for (const r of referrals) {
      if (map.has(r.status)) map.set(r.status, (map.get(r.status) || 0) + 1);
    }
    return map;
  }, [referrals]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl text-white">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="text-xs uppercase tracking-wider text-sky-300/60">Referrer</div>
          <h1 className="text-2xl font-semibold">Referrer Dashboard</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => nav("/referrer/referrals/new")} className="px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-400 text-sm">+ Add Referral</button>
          <button onClick={signOut} className="px-4 py-2 border border-sky-300/40 text-sky-100 rounded hover:bg-sky-500/10 text-sm">Sign out</button>
        </div>
      </div>

      {/* Pipeline — 5 carrier stages in one horizontal row */}
      <div className="grid grid-cols-5 gap-2 md:gap-3 mb-8">
        {CARRIER_STAGES.map((s) => (
          <div key={s.key} className="p-3 rounded border border-sky-300/30 bg-sky-500/5">
            <div className="flex justify-between items-baseline">
              <span className="text-[10px] md:text-xs font-semibold tracking-wider text-sky-100">{s.label}</span>
              <span className="text-base font-semibold text-sky-100">{counts.get(s.key) || 0}</span>
            </div>
            <div className="text-center mt-3 text-sky-300/40 text-xs">—</div>
          </div>
        ))}
      </div>

      {/* Your referrals — full list, all statuses */}
      <h2 className="text-lg font-semibold text-sky-100 mb-2 border-b border-sky-300/30 pb-1">Your referrals</h2>
      {loading && <div className="text-sm text-sky-200/70">Loading…</div>}
      {error && <div className="text-sm text-rose-300">Couldn't load referrals: {error}</div>}
      {!loading && !error && referrals.length === 0 && (
        <div className="text-sm text-sky-200/70 p-4 border border-sky-300/20 rounded bg-sky-500/5">
          You haven't added any referrals yet. Click "+ Add Referral" to get started.
        </div>
      )}
      {!loading && !error && referrals.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-sky-300/70 border-b border-sky-300/20">
                <th className="py-2 pr-4">Company</th>
                <th className="py-2 pr-4">Guarantor</th>
                <th className="py-2 pr-4">Loan amount</th>
                <th className="py-2 pr-4">PGI limit</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Added</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((r) => (
                <tr key={r.id} className="border-b border-sky-300/10 hover:bg-sky-500/5">
                  <td className="py-2 pr-4">{r.company_name || "—"}</td>
                  <td className="py-2 pr-4">{r.guarantor_name || "—"}</td>
                  <td className="py-2 pr-4">{r.loan_amount ? `$${Number(r.loan_amount).toLocaleString()}` : "—"}</td>
                  <td className="py-2 pr-4">{r.pgi_limit ? `$${Number(r.pgi_limit).toLocaleString()}` : "—"}</td>
                  <td className="py-2 pr-4">
                    <span className="inline-block px-2 py-0.5 rounded text-xs bg-sky-500/15 border border-sky-300/30">{statusLabel(r.status)}</span>
                  </td>
                  <td className="py-2 pr-4 text-sky-200/70">{new Date(r.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
