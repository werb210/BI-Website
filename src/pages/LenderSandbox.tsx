// BI_WEBSITE_BLOCK_v131_LENDER_SANDBOX_PANEL_v1
//
// Self-service API key console for lenders. Lender-OTP authenticates,
// then can:
//   - Generate a test (sandbox) or live API key
//   - Copy the secret once at creation time
//   - See all their existing keys (prefix only, never the secret again)
//   - Revoke any key
//   - Click "Send test application" — fires a real POST to
//     /api/v1/lender/applications using the most recent active TEST key,
//     so the operator can verify the integration end-to-end and the
//     lender can confirm their own setup before going live.
//
// Test keys force is_demo=true server-side (per v231): the carrier path
// is auto-stubbed regardless of USE_PGI_STUB / PGI_API_KEY, and the
// resulting application is filterable in the pipeline as a sandbox row.
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL
  || (import.meta as any).env?.VITE_API_URL
  || "https://bi-server-cse0apamgkheb9d5.canadacentral-01.azurewebsites.net";

type ApiKey = {
  id: string;
  key_prefix: string;
  label: string | null;
  is_sandbox: boolean;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
};

type CreatedKey = ApiKey & { secret: string };

// Plausible body for a test submission. Mirrors the 14 PGI form fields
// + lender-side identification. Numbers are obviously synthetic.
const TEST_BODY = {
  // Identification
  company_name: "Sandbox Test Co. Ltd.",
  guarantor_name: "Test Guarantor",
  guarantor_phone: "+15875550100",
  guarantor_email: "sandbox@example.com",
  // PGI form_data — required by carrier
  country: "CA",
  naics_code: "541511",
  formation_date: "2022-01-15",
  loan_amount: 500000,
  pgi_limit: 400000,
  annual_revenue: 3000000,
  ebitda: 400000,
  total_debt: 600000,
  monthly_debt_service: 7800,
  collateral_value: 1200000,
  enterprise_value: 20000000,
  bankruptcy_history: false,
  insolvency_history: false,
  judgment_history: false,
};

function shortPrefix(p: string) {
  return p.length > 18 ? `${p.slice(0, 15)}…` : p;
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return iso;
  return d.toLocaleString();
}

export default function LenderSandbox() {
  const nav = useNavigate();
  const [keys, setKeys] = useState<ApiKey[] | null>(null);
  const [created, setCreated] = useState<CreatedKey | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [tryResult, setTryResult] = useState<{ status: number; body: any } | null>(null);
  // BI_WEBSITE_BLOCK_v132_LIVE_KEY_REQUEST_v1 — gates the live-key mint button.
  const [liveKeysEnabled, setLiveKeysEnabled] = useState<boolean | null>(null);
  const [requestSent, setRequestSent] = useState(false);

  const token = useMemo(() => {
    try { return localStorage.getItem("bi.lender_token") || ""; } catch { return ""; }
  }, []);

  useEffect(() => {
    if (!token) { nav("/lender/login", { replace: true }); return; }
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function reload() {
    setErr(null);
    try {
      const r = await fetch(`${API_BASE}/api/v1/lender/api-keys`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) { setErr(`Could not list keys (${r.status})`); setKeys([]); return; }
      const data = await r.json();
      setKeys(data.keys || []);
    } catch (e: any) {
      setErr(e?.message || "Network error");
    }
    // BI_WEBSITE_BLOCK_v132_LIVE_KEY_REQUEST_v1 — pull live_keys_enabled flag from /lender/me.
    try {
      const r = await fetch(`${API_BASE}/api/v1/lender/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.ok) {
        const me = await r.json();
        setLiveKeysEnabled(me?.live_keys_enabled === true || me?.lender?.live_keys_enabled === true);
      }
    } catch { /* non-fatal */ }
  }

  // BI_WEBSITE_BLOCK_v132_LIVE_KEY_REQUEST_v1 — request live-key access; staff is SMSed.
  async function requestLive() {
    setBusy(true); setErr(null);
    try {
      const r = await fetch(`${API_BASE}/api/v1/lender/api-keys/request-live`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) { setErr(`Request failed (${r.status})`); return; }
      const data = await r.json();
      if (data?.already_enabled) { setLiveKeysEnabled(true); }
      else { setRequestSent(true); }
    } catch (e: any) {
      setErr(e?.message || "Network error");
    } finally {
      setBusy(false);
    }
  }

  async function generate(mode: "test" | "live") {
    setBusy(true); setErr(null); setCreated(null);
    try {
      const r = await fetch(`${API_BASE}/api/v1/lender/api-keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mode, label: `${mode} key — ${new Date().toLocaleDateString()}` }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) { setErr(data?.message || data?.error || `Create failed (${r.status})`); return; }
      setCreated(data);
      await reload();
    } catch (e: any) {
      setErr(e?.message || "Network error");
    } finally {
      setBusy(false);
    }
  }

  async function revoke(id: string) {
    if (!confirm("Revoke this key? Applications already submitted are unaffected, but the key will stop working immediately.")) return;
    setErr(null);
    try {
      const r = await fetch(`${API_BASE}/api/v1/lender/api-keys/${id}/revoke`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) { setErr(`Revoke failed (${r.status})`); return; }
      await reload();
    } catch (e: any) {
      setErr(e?.message || "Network error");
    }
  }

  async function sendTest() {
    // Pick the most recently created ACTIVE sandbox key. If we just
    // generated one this turn it's in `created`, otherwise pull from
    // the list. If neither, hint the user.
    const candidate = created && created.is_sandbox && created.is_active
      ? created.secret
      : null;
    if (!candidate) {
      setErr("Generate a test key first so we have a sandbox secret to send. (Existing keys' secrets are hashed — they can't be retrieved after creation.)");
      return;
    }
    setBusy(true); setErr(null); setTryResult(null);
    try {
      const r = await fetch(`${API_BASE}/api/v1/lender/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${candidate}` },
        body: JSON.stringify(TEST_BODY),
      });
      const body = await r.json().catch(() => ({}));
      setTryResult({ status: r.status, body });
    } catch (e: any) {
      setErr(e?.message || "Network error");
    } finally {
      setBusy(false);
    }
  }

  function copy(s: string) {
    try { navigator.clipboard?.writeText(s); } catch {}
  }

  const sandboxKeys = (keys || []).filter((k) => k.is_sandbox && k.is_active);
  const liveKeys    = (keys || []).filter((k) => !k.is_sandbox && k.is_active);

  return (
    <main className="min-h-screen bg-bf-bg px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-widest text-bf-textMuted">Lender</div>
            <h1 className="mt-1 text-3xl font-bold">API Keys & Sandbox</h1>
            <p className="mt-2 text-bf-textMuted text-sm">
              Generate test keys to integrate against. Promote to live keys when you're ready.
            </p>
          </div>
          <Link to="/lender/portal" className="rounded-md border border-white/20 px-4 py-2 text-sm hover:bg-white/5">
            ← Back to pipeline
          </Link>
        </div>

        {err && <div className="mb-4 rounded border border-red-500/40 bg-red-500/10 p-3 text-sm">{err}</div>}

        {created && (
          <div className="mb-6 rounded-2xl border border-emerald-500/40 bg-emerald-500/5 p-5">
            <div className="text-xs uppercase tracking-widest text-emerald-300">
              {created.is_sandbox ? "Test key created" : "Live key created"}
            </div>
            <p className="mt-1 text-sm text-bf-textMuted">
              Copy this secret now. We store only a hash — once you leave this screen, it's unrecoverable.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <code className="block flex-1 overflow-x-auto rounded-md bg-bf-bg/70 px-3 py-2 font-mono text-sm">
                {created.secret}
              </code>
              <button onClick={() => copy(created.secret)} className="rounded-md bg-bf-cta px-3 py-2 text-sm font-medium hover:bg-bf-ctaHover">
                Copy
              </button>
            </div>
          </div>
        )}

        <section className="mb-6 rounded-2xl border border-card bg-bf-surface p-5">
          <h2 className="text-lg font-semibold">Sandbox (test mode)</h2>
          <p className="mt-1 text-sm text-bf-textMuted">
            Test keys begin with <code className="rounded bg-bf-bg/70 px-1">bk_test_</code>. Applications you create with them are tagged as demo, appear in your pipeline as test rows, and never reach the carrier.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button disabled={busy} onClick={() => generate("test")} className="rounded-md bg-bf-cta px-5 py-2 font-medium text-white hover:bg-bf-ctaHover disabled:opacity-50">
              {busy ? "Generating…" : "Generate test key"}
            </button>
            <button disabled={busy || !created || !created.is_sandbox} onClick={sendTest} className="rounded-md border border-emerald-500/40 px-5 py-2 font-medium text-emerald-300 hover:bg-emerald-500/10 disabled:opacity-30">
              Send test application now
            </button>
          </div>
          {sandboxKeys.length > 0 && (
            <ul className="mt-4 space-y-2">
              {sandboxKeys.map((k) => (
                <li key={k.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-white/10 bg-bf-bg/40 p-3 text-sm">
                  <div className="min-w-0">
                    <code className="font-mono">{shortPrefix(k.key_prefix)}</code>
                    {k.label && <span className="ml-2 text-bf-textMuted">{k.label}</span>}
                    <div className="mt-1 text-xs text-bf-textMuted">
                      Created {fmtDate(k.created_at)} · Last used {fmtDate(k.last_used_at)}
                    </div>
                  </div>
                  <button onClick={() => revoke(k.id)} className="rounded-md border border-red-500/40 px-3 py-1 text-xs text-red-300 hover:bg-red-500/10">
                    Revoke
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mb-6 rounded-2xl border border-card bg-bf-surface p-5">
          <h2 className="text-lg font-semibold">Live (production)</h2>
          <p className="mt-1 text-sm text-bf-textMuted">
            Live keys begin with <code className="rounded bg-bf-bg/70 px-1">bk_live_</code>. Applications created with them go straight to the carrier. Treat them like a password.
          </p>
          <div className="mt-4">
            {liveKeysEnabled === true ? (
              <button disabled={busy} onClick={() => generate("live")} className="rounded-md border border-amber-500/40 px-5 py-2 font-medium text-amber-200 hover:bg-amber-500/10 disabled:opacity-50">
                {busy ? "Generating…" : "Generate live key"}
              </button>
            ) : requestSent ? (
              <div className="rounded border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
                ✓ Request sent — Boreal staff have been notified. You'll receive an SMS when live keys are enabled for your account.
              </div>
            ) : (
              <div className="space-y-2">
                <div className="rounded border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-100">
                  Live keys are off by default. Test your integration with a sandbox key first; once you're ready, request approval here and our team will SMS you when it's enabled (usually same business day).
                </div>
                <button disabled={busy || liveKeysEnabled === null} onClick={requestLive} className="rounded-md border border-amber-500/40 px-5 py-2 font-medium text-amber-200 hover:bg-amber-500/10 disabled:opacity-50">
                  {busy ? "Requesting…" : "Request live keys"}
                </button>
              </div>
            )}
          </div> {/* BI_WEBSITE_BLOCK_v132_LIVE_KEY_REQUEST_v1 */}
          {liveKeys.length > 0 && (
            <ul className="mt-4 space-y-2">
              {liveKeys.map((k) => (
                <li key={k.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-white/10 bg-bf-bg/40 p-3 text-sm">
                  <div className="min-w-0">
                    <code className="font-mono">{shortPrefix(k.key_prefix)}</code>
                    {k.label && <span className="ml-2 text-bf-textMuted">{k.label}</span>}
                    <div className="mt-1 text-xs text-bf-textMuted">
                      Created {fmtDate(k.created_at)} · Last used {fmtDate(k.last_used_at)}
                    </div>
                  </div>
                  <button onClick={() => revoke(k.id)} className="rounded-md border border-red-500/40 px-3 py-1 text-xs text-red-300 hover:bg-red-500/10">
                    Revoke
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {tryResult && (
          <section className="mb-6 rounded-2xl border border-card bg-bf-surface p-5">
            <h2 className="text-lg font-semibold">Last test response</h2>
            <div className="mt-2 text-sm">
              <span className={tryResult.status < 300 ? "text-emerald-300" : "text-red-300"}>
                HTTP {tryResult.status}
              </span>
              {tryResult.status < 300 && (
                <Link to="/lender/portal" className="ml-3 text-bf-cta hover:underline">View in pipeline →</Link>
              )}
            </div>
            <pre className="mt-3 max-h-80 overflow-auto rounded-md bg-bf-bg/70 p-3 text-xs">
              {JSON.stringify(tryResult.body, null, 2)}
            </pre>
          </section>
        )}

        <section className="rounded-2xl border border-card bg-bf-surface p-5">
          <h2 className="text-lg font-semibold">Quick start</h2>
          <p className="mt-1 text-sm text-bf-textMuted">
            Use the same endpoint for sandbox and production. Only the key prefix differs.
          </p>
          <pre className="mt-3 overflow-x-auto rounded-md bg-bf-bg/70 p-3 text-xs">
{`curl -X POST ${API_BASE}/api/v1/lender/applications \\
  -H "Authorization: Bearer bk_test_xxx.yyyy" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(TEST_BODY, null, 2).replace(/\n/g, "\n      ")}'`}
          </pre>
          <p className="mt-3 text-sm text-bf-textMuted">
            See <Link to="/lender/api" className="text-bf-cta hover:underline">/lender/api</Link> for the full schema and language samples (Node, Python, Ruby).
          </p>
        </section>
      </div>
    </main>
  );
}
