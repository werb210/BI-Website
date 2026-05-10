// BI_WEBSITE_BLOCK_v96_LAUNCH_UX_v2 — Lender Portal: phone+OTP login,
// applications pipeline, and entry point to the lender application form.
// API key auth still works on the server (back-compat for third-party
// integrations) but the public portal flow is now OTP-only.
// BI_WEBSITE_BLOCK_v98_OTP_AUTOFORWARD_ALL_v1 — auto-forward OTP UX
import { useEffect, useRef, useState } from "react";
import { Link, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { isPhoneReady, isCodeReady, OTP_CODE_LENGTH } from "../lib/otpAutoForward";

// BI_WEBSITE_BLOCK_v103_OTP_BASE_FIX_AND_WARMUP_v1 — mirror lib/api.ts BASE.
const BASE = ((import.meta.env.VITE_API_URL as string | undefined)
  || (import.meta.env.VITE_BI_API_URL as string | undefined)
  || window.location.origin).replace(/\/$/, "") + "/api/v1";
const TOKEN_KEY = "bi.lender_token";
const PHONE_KEY = "bi.lender_phone";

type LenderInfo = {
  id: string;
  company_name?: string | null;
  rep_full_name?: string | null;
  rep_email?: string | null;
  contact_phone_e164?: string | null;
};

type AppRow = {
  id: string;
  public_id: string;
  status: string;
  business_name: string | null;
  guarantor_name: string | null;
  loan_amount: number | null;
  pgi_limit: number | null;
  annual_premium: number | null;
  created_at: string;
  updated_at: string;
};

async function jsonFetch<T = any>(path: string, init: RequestInit, token?: string): Promise<T> {
  const r = await fetch(BASE + path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(data?.error ?? `HTTP ${r.status}`), { status: r.status, data });
  return data as T;
}

function fmtCurrency(n: number | null | undefined) {
  if (n == null) return "—";
  return n.toLocaleString("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "approved" || status === "policy_issued"
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
      : status === "declined"
      ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
      : "bg-blue-500/15 text-blue-300 border-blue-500/30";
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${tone}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

function Login() {
  // BI_WEBSITE_BLOCK_v98_OTP_AUTOFORWARD_ALL_v1
  const nav = useNavigate();
  const [stage, setStage] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState(localStorage.getItem(PHONE_KEY) ?? "");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const codeRef = useRef<HTMLInputElement | null>(null);
  const startedRef = useRef(false);
  const verifiedRef = useRef(false);

  async function startOtp(p: string) {
    if (startedRef.current || busy) return;
    startedRef.current = true;
    setErr(null);
    setBusy(true);
    try {
      await jsonFetch("/lender/otp/start", { method: "POST", body: JSON.stringify({ phone: p }) });
      localStorage.setItem(PHONE_KEY, p);
      setStage("code");
      setTimeout(() => codeRef.current?.focus(), 0);
    } catch (e: any) {
      startedRef.current = false;
      setErr(e?.message ?? "Failed to send code");
    } finally {
      setBusy(false);
    }
  }

  async function verifyOtp(p: string, c: string) {
    if (verifiedRef.current || busy) return;
    verifiedRef.current = true;
    setErr(null);
    setBusy(true);
    try {
      const { token } = await jsonFetch<{ token: string; lender: LenderInfo }>(
        "/lender/otp/verify",
        { method: "POST", body: JSON.stringify({ phone: p, code: c }) },
      );
      localStorage.setItem(TOKEN_KEY, token);
      nav("/lender/portal");
    } catch (e: any) {
      verifiedRef.current = false;
      setCode("");
      setErr(
        e?.status === 401
          ? "Invalid code or phone not registered. Contact us if you don't have access yet."
          : e?.message ?? "Verification failed",
      );
    } finally {
      setBusy(false);
    }
  }

  // Auto-forward on valid phone digit count
  useEffect(() => {
    if (stage === "phone" && isPhoneReady(phone)) void startOtp(phone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone, stage]);

  // Auto-submit on 6th digit
  useEffect(() => {
    if (stage === "code" && isCodeReady(code)) void verifyOtp(phone, code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, stage]);

  return (
    <main className="min-h-screen bg-bf-bg text-slate-200">
      <section className="mx-auto w-full max-w-md px-5 py-12 md:px-8 md:py-16">
        <div className="rounded-2xl border border-white/10 bg-bf-surface p-6 md:p-8">
          <h1 className="text-center text-2xl font-bold text-white md:text-3xl">Lender Portal</h1>
          <p className="mt-2 text-center text-sm text-slate-400">
            Sign in via SMS to your registered phone number.
          </p>

          {stage === "phone" ? (
            <div className="mt-8 space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-300">
                  Mobile phone
                </span>
                <input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  autoFocus
                  placeholder="(587) 555-1234"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={busy}
                  className="w-full rounded-lg border border-white/15 bg-bf-bg px-4 py-3 text-white outline-none focus:border-blue-500 disabled:opacity-60"
                />
              </label>
              <p className="text-xs text-slate-500">
                {busy ? "Sending code…" : "We'll text a code as soon as you finish typing."}
              </p>
              {err ? <p className="text-sm text-rose-400">{err}</p> : null}
              <p className="text-center text-xs text-slate-500">
                Don't have access? Email{" "}
                <a className="text-blue-400 hover:text-blue-300" href="mailto:lenders@boreal.financial">
                  lenders@boreal.financial
                </a>
                .
              </p>
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-300">
                  Verification code
                </span>
                <input
                  ref={codeRef}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                  placeholder="123456"
                  maxLength={OTP_CODE_LENGTH}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, OTP_CODE_LENGTH))}
                  disabled={busy}
                  className="w-full rounded-lg border border-white/15 bg-bf-bg px-4 py-3 text-center text-xl tracking-[0.3em] text-white outline-none focus:border-blue-500 disabled:opacity-60"
                />
              </label>
              <p className="text-xs text-slate-500">{busy ? "Verifying…" : `Enter the ${OTP_CODE_LENGTH}-digit code sent to ${phone}.`}</p>
              {err ? <p className="text-sm text-rose-400">{err}</p> : null}
              <button
                type="button"
                onClick={() => { setStage("phone"); setCode(""); setErr(null); startedRef.current = false; verifiedRef.current = false; }}
                disabled={busy}
                className="w-full text-center text-sm text-slate-400 hover:text-slate-200 disabled:opacity-60"
              >
                ← Use a different phone
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function Portal() {
  const nav = useNavigate();
  const [token] = useState(localStorage.getItem(TOKEN_KEY) ?? "");
  const [me, setMe] = useState<LenderInfo | null>(null);
  const [apps, setApps] = useState<AppRow[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      nav("/lender/login");
      return;
    }
    (async () => {
      try {
        const meRes = await jsonFetch<{ lender: LenderInfo }>("/lender/me", { method: "GET" }, token);
        setMe(meRes.lender);
        const appsRes = await jsonFetch<{ applications: AppRow[] }>(
          "/lender/applications/mine",
          { method: "GET" },
          token,
        );
        setApps(appsRes.applications);
      } catch (e: any) {
        if (e?.status === 401) {
          localStorage.removeItem(TOKEN_KEY);
          nav("/lender/login");
          return;
        }
        setErr(e?.message ?? "Failed to load");
      }
    })();
  }, [token, nav]);

  function signOut() {
    localStorage.removeItem(TOKEN_KEY);
    nav("/lender/login");
  }

  return (
    <main className="min-h-screen bg-bf-bg text-slate-200">
      <section className="mx-auto w-full max-w-6xl px-5 py-10 md:px-8 md:py-14">
        <header className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">Lender</p>
            <h1 className="mt-1 text-2xl font-bold text-white md:text-3xl">
              {me?.company_name ?? "My Pipeline"}
            </h1>
            {me?.rep_full_name ? (
              <p className="mt-1 text-sm text-slate-400">Welcome back, {me.rep_full_name}.</p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/lender/applications/new"
              className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              + New Application
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="rounded-full border border-white/30 px-5 py-2 text-sm font-medium text-white transition hover:bg-white/5"
            >
              Sign out
            </button>
          </div>
        </header>

        {err ? <p className="mb-4 text-sm text-rose-400">{err}</p> : null}

        {apps == null ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : apps.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-bf-surface p-10 text-center">
            <p className="text-slate-300">No applications yet.</p>
            <Link
              to="/lender/applications/new"
              className="mt-4 inline-flex rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Submit your first application
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-bf-surface">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Business</th>
                  <th className="px-4 py-3">Guarantor</th>
                  <th className="px-4 py-3">Loan</th>
                  <th className="px-4 py-3">PGI Limit</th>
                  <th className="px-4 py-3">Premium</th>
                  <th className="px-4 py-3">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {apps.map((a) => (
                  <tr key={a.id} className="hover:bg-white/5">
                    <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                    <td className="px-4 py-3 text-white">{a.business_name ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-300">{a.guarantor_name ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-300">{fmtCurrency(a.loan_amount)}</td>
                    <td className="px-4 py-3 text-slate-300">{fmtCurrency(a.pgi_limit)}</td>
                    <td className="px-4 py-3 text-slate-300">{fmtCurrency(a.annual_premium)}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {new Date(a.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default function LenderPortal() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/lender/portal" replace />} />
      <Route path="login" element={<Login />} />
      <Route path="portal" element={<Portal />} />
      <Route path="*" element={<Navigate to="/lender/login" replace />} />
    </Routes>
  );
}
