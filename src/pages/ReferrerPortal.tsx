// BI_WEBSITE_BLOCK_v3_FULL_FIELD_RENDER_v1
import { useEffect, useState } from "react";


// BI_WEBSITE_BLOCK_v339_REFERRER_PORTAL_FIX_v1
// 5 carrier stages — match lender portal labels + order exactly.
// Pre-submission rows (created/in_progress/ready_for_submission) are
// NOT in STAGES; they appear only in the list below the pipeline,
// never in a pipeline column.
const STAGES = ["submitted","under_review","information_required","policy_issued","declined"] as const;
const STAGE_LABELS: Record<string, string> = {
  submitted: "SUBMITTED",
  under_review: "UNDERWRITING",
  information_required: "CONDITIONAL",
  policy_issued: "BOUND",
  declined: "DECLINED",
  // Friendly labels for the list-below view (any non-carrier state).
  created: "Draft",
  new: "Draft",
  in_progress: "In progress",
  ready_for_submission: "Ready",
  approved: "Approved",
  cancelled: "Cancelled",
};

// BI_WEBSITE_BLOCK_v347_LAUNCH_BLOCKERS_v1
// Formats a referral phone for display in the dashboard table. Pre-v347
// rows can contain unsanitized input (e.g. "5555555555555555555");
// fall back to truncated raw if the value can't be normalized so we
// never crash the row render.
function formatReferralPhone(v: unknown): string {
  if (!v) return "—";
  const s = String(v);
  const digits = s.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 11)}`;
  }
  if (digits.length === 10) {
    return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }
  // Unsalvageable legacy value — show truncated so the column doesn't
  // explode the layout.
  return s.length > 18 ? `${s.slice(0, 15)}…` : s;
}

// BI_WEBSITE_BLOCK_v103_OTP_BASE_FIX_AND_WARMUP_v1 — mirror lib/api.ts BASE.
const BASE = ((import.meta.env.VITE_API_URL as string | undefined)
  || (import.meta.env.VITE_BI_API_URL as string | undefined)
  || window.location.origin).replace(/\/$/, "") + "/api/v1";

async function jsonFetch(path: string, init: RequestInit, token?: string) {
  const r = await fetch(BASE + path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(init.headers ?? {}) },
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(data?.error ?? `HTTP ${r.status}`), { status: r.status, data });
  return data;
}

type Stage = "otp" | "verify" | "intake" | "dashboard";

export default function ReferrerPortal() {
  const [stage, setStage] = useState<Stage>("otp");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  // v131: token stored in sessionStorage (not localStorage). Forces
  // a fresh OTP on every new browser session — fixes the "no OTP on
  // /referrer/login" complaint. Within-tab navigation still keeps
  // the user signed in.
  const [token, setToken] = useState<string>(localStorage.getItem("bi.ref_token") || "");
  const [profile, setProfile] = useState<Record<string,string>>({});
  const [popup, setPopup] = useState(false);
  const [draft, setDraft] = useState({ name: "", company: "", email: "", mobile: "", notes: "" });
  const [items, setItems] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) return;
    (async () => {
      // BI_WEBSITE_BLOCK_v179_INTAKE_AND_DOC_POLISH_v1 — split the auth-
      // bootstrap into two stages. The previous single try/catch wrapped
      // BOTH the /referrer/me fetch and the /referrer/referrals fetch,
      // so any failure on the referrals call killed the localStorage
      // token (which then 401'd every PUT /referrer/me with
      // missing_token). The /referrer/referrals endpoint was 404 in
      // production until BI-Server v244 added the alias; we still want
      // the auth bootstrap to be resilient to a missing referrals
      // endpoint going forward (or any transient 5xx on it).
      let me: any = null;
      try {
        me = await jsonFetch("/referrer/me", { method: "GET" }, token);
      } catch {
        // Only /referrer/me failures invalidate the session.
        localStorage.removeItem("bi.ref_token");
        setToken("");
        return;
      }
      setProfile(me?.profile ?? {});
      // Referrals are best-effort. A 404 / 5xx here is non-fatal:
      // the dashboard renders with an empty list and the user can
      // still complete the intake form.
      try {
        const list = await jsonFetch("/referrer/referrals", { method: "GET" }, token);
        setItems(Array.isArray(list?.items) ? list.items : Array.isArray(list) ? list : []);
      } catch {
        setItems([]);
      }
      const hasProfile = !!me?.profile?.legal_name || !!me?.profile?.first_name;
      setStage(hasProfile ? "dashboard" : "intake");
    })();
  }, [token]);

  // BI_WEBSITE_BLOCK_v108_WEBOTP_AND_OTP_NAME_v1 — auto-forward on 6th digit.
  useEffect(() => {
    if (stage === "verify" && code.length === 6) void verifyOtp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, stage]);

  // BI_WEBSITE_BLOCK_v179_INTAKE_AND_DOC_POLISH_v1 — auto-fire sendOtp
  // when the phone field reaches 10 digits (NANP) so the user doesn't
  // have to hit the "Send code" button. Strip non-digits before counting
  // so masked/formatted inputs still trigger.
  useEffect(() => {
    if (stage !== "otp") return;
    const digits = String(phone || "").replace(/\D/g, "");
    if (digits.length === 10 || digits.length === 11) void sendOtp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone, stage]);

  // WebOTP API — programmatic SMS read on Android Chrome.
  useEffect(() => {
    if (stage !== "verify") return;
    if (typeof window === "undefined" || !("OTPCredential" in window)) return;
    const ctrl = new AbortController();
    // @ts-expect-error WebOTP API not in standard lib.dom
    navigator.credentials.get({ otp: { transport: ["sms"] }, signal: ctrl.signal })
      .then((cred: any) => { if (cred?.code && /^\d{6}$/.test(cred.code)) setCode(cred.code); })
      .catch(() => { /* dismissed or no SMS arrived */ });
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  async function sendOtp() {
    setErr(null); setBusy(true);
    try {
      /* BI_WEBSITE_BLOCK_v93 */ await jsonFetch("/referrer/otp/start", { method: "POST", body: JSON.stringify({ phone }) });
      setStage("verify");
    } catch (e: any) { setErr(e?.message ?? "OTP send failed"); }
    finally { setBusy(false); }
  }

  async function verifyOtp() {
    setErr(null); setBusy(true);
    try {
      /* BI_WEBSITE_BLOCK_v93 */ const r = await jsonFetch("/referrer/otp/verify", { method: "POST", body: JSON.stringify({ phone, code }) });
      const t = r?.token; if (!t) throw new Error("No token returned");
      localStorage.setItem("bi.ref_token", t); setToken(t);
      const me = await jsonFetch("/referrer/me", { method: "GET" }, t);
      const hasProfile = !!me?.profile?.legal_name;
      setStage(hasProfile ? "dashboard" : "intake");
      if (hasProfile) setProfile(me.profile);
    } catch (e: any) { setErr(e?.message ?? "Verification failed"); }
    finally { setBusy(false); }
  }

  async function saveProfile() {
    setErr(null); setBusy(true);
    try {
      await jsonFetch("/referrer/me", { method: "PUT", body: JSON.stringify({ profile }) }, token);
      setStage("dashboard");
    } catch (e: any) { setErr(e?.message ?? "Save failed"); }
    finally { setBusy(false); }
  }

  async function saveReferral(next: boolean) {
    setErr(null); setBusy(true);
    try {
      // BI_WEBSITE_BLOCK_v180_DEMO_TOKEN_AND_AUTO_UPLOAD_v1 — map form
      // keys (name/mobile) to the server's expected keys (full_name/
      // phone). Previously the POST went up as {name, company, email,
      // mobile, notes} and the server rejected with
      // missing_fields=[full_name, email, phone]. Local validation
      // requires either email OR phone so the referrer can use
      // whichever they actually have. Server still requires email; a
      // companion v245 BI-Server edit relaxes that to "email or
      // phone".
      const fullName = String(draft.name || "").trim();
      const email = String(draft.email || "").trim();
      const phoneRaw = String(draft.mobile || "").trim();
      const phoneDigits = phoneRaw.replace(/\D/g, "");
      let phone = "";
      if (phoneDigits.length === 10) phone = `+1${phoneDigits}`;
      else if (phoneDigits.length === 11 && phoneDigits.startsWith("1")) phone = `+${phoneDigits}`;
      else if (phoneRaw === "") phone = "";
      else { setErr("Mobile must be a 10-digit North American number (e.g. +1 555 555 5555)."); setBusy(false); return; }
      if (!fullName) { setErr("Contact name is required."); setBusy(false); return; }
      if (!email && !phone) { setErr("Provide an email or mobile number."); setBusy(false); return; }
      const payload = {
        full_name: fullName,
        company_name: draft.company || null,
        email,
        phone,
        notes: draft.notes || null,
      };
      const created = await jsonFetch("/referrer/referrals", { method: "POST", body: JSON.stringify(payload) }, token);
      setItems((p) => [created, ...p]);
      if (next) setDraft({ name: "", company: "", email: "", mobile: "", notes: "" });
      else { setPopup(false); setDraft({ name: "", company: "", email: "", mobile: "", notes: "" }); }
    } catch (e: any) { setErr(e?.message ?? "Save failed"); }
    finally { setBusy(false); }
  }

  // BI_WEBSITE_BLOCK_v171_OTP_CONSISTENCY_v1 — white OTP card, BF-Client parity
  if (stage === "otp") return (
    <div style={{ maxWidth: 480, margin: "48px auto", padding: "0 16px" }}>
      <h1 style={{ textAlign: "center", marginBottom: 20 }}>Referrer Login</h1>
      <div
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 12,
          padding: 24,
          boxShadow: "0 4px 12px rgba(15,23,42,0.06)",
        }}
      >
        <label style={{ display: "block", fontSize: 14, color: "#334155", marginBottom: 6 }}>
          Mobile phone number
        </label>
        <input
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          autoFocus
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1 (555) 555-5555"
          style={{
            width: "100%", padding: "12px 14px", fontSize: 16,
            border: "1px solid #cbd5e1", borderRadius: 8, marginBottom: 12,
            boxSizing: "border-box", color: "#0f172a", background: "#fff",
          }}
        />
        {err && (
          <div role="alert" style={{ color: "#b91c1c", fontSize: 13, marginBottom: 8 }}>
            {err}
          </div>
        )}
        <button
          type="button"
          onClick={sendOtp}
          disabled={busy || !phone.trim()}
          style={{
            width: "100%", padding: "14px 20px", fontSize: 17, fontWeight: 700,
            background: "#f59e0b", color: "#fff", border: 0, borderRadius: 8,
            cursor: busy || !phone.trim() ? "not-allowed" : "pointer",
            opacity: busy || !phone.trim() ? 0.6 : 1,
          }}
        >
          {busy ? "Sending…" : "Send code →"}
        </button>
        <p style={{ fontSize: 12, color: "#64748b", marginTop: 10, marginBottom: 0, textAlign: "center" }}>
          We{"'"}ll text you a one-time code to verify.
        </p>
      </div>
    </div>
  );

  if (stage === "verify") return (
    <div className="bi-card">
      <h1>Verify OTP</h1>
      <label className="bi-field"><span>6-digit code</span>
        <input type="text" inputMode="numeric" autoComplete="one-time-code" autoFocus name="code" placeholder="123456" maxLength={6} value={code} onChange={(e)=>setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))} disabled={busy} style={{ textAlign: "center", fontSize: "1.5rem", letterSpacing: "0.3em" }} />
      </label>
      {err && <div className="form-error" role="alert">{err}</div>}
      <button className="primary" onClick={verifyOtp} disabled={busy || code.length !== 6}>{busy ? "Verifying…" : "Verify"}</button>
    </div>
  );

  if (stage === "intake") return (
    <div className="bi-card" style={{ maxWidth: 960 }}>
      <h1>First-time Intake</h1>
      {/* BI_WEBSITE_BLOCK_v178_FULL_WAVE_v1 — copy + remove license + 2-col layout */}
      {/* BI_WEBSITE_BLOCK_v179_INTAKE_AND_DOC_POLISH_v1 — split Legal Name
          into First/Last, Province as a Canadian-provinces dropdown,
          bottom row places Address/City/Province/Postal/Continue on one
          line so the form ends with a single visual action. */}
      <p>Tell us a bit about yourself.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[
          ["first_name","First name"],["last_name","Last name"],
          ["business_name","Business name"],["email","Email"],
          ["phone","Phone"],
          ["etransfer_email","E-Transfer Email (For referral fees)"],
        ].map(([k,label])=>(
          <label key={k} className="bi-field"><span>{label}</span>
            <input value={profile[k] ?? ""} onChange={(e)=>setProfile(p=>({...p,[k]:e.target.value}))} />
          </label>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mt-3 items-end">
        <label className="bi-field md:col-span-4"><span>Address</span>
          <input value={profile.address ?? ""} onChange={(e)=>setProfile(p=>({...p, address: e.target.value}))} />
        </label>
        <label className="bi-field md:col-span-2"><span>City</span>
          <input value={profile.city ?? ""} onChange={(e)=>setProfile(p=>({...p, city: e.target.value}))} />
        </label>
        <label className="bi-field md:col-span-2"><span>Province</span>
          <select value={profile.province ?? ""} onChange={(e)=>setProfile(p=>({...p, province: e.target.value}))}>
            <option value="">Select…</option>
            <option value="AB">Alberta</option>
            <option value="BC">British Columbia</option>
            <option value="MB">Manitoba</option>
            <option value="NB">New Brunswick</option>
            <option value="NL">Newfoundland and Labrador</option>
            <option value="NS">Nova Scotia</option>
            <option value="NT">Northwest Territories</option>
            <option value="NU">Nunavut</option>
            <option value="ON">Ontario</option>
            <option value="PE">Prince Edward Island</option>
            <option value="SK">Saskatchewan</option>
            <option value="YT">Yukon</option>
          </select>
        </label>
        <label className="bi-field md:col-span-2"><span>Postal code</span>
          <input value={profile.postal_code ?? ""} onChange={(e)=>setProfile(p=>({...p, postal_code: e.target.value}))} />
        </label>
        <div className="md:col-span-2">
          <button className="primary" style={{ width: "100%" }} onClick={saveProfile} disabled={busy || (!profile.first_name && !profile.legal_name)}>{busy ? "Saving…" : "Continue"}</button>
        </div>
      </div>
      {err && <div className="form-error mt-3">{err}</div>}
    </div>
  );

  return (
    <div className="bi-card">
      <div className="flex justify-between items-center">
        <h1>Referrer Dashboard</h1>
        <button className="secondary" onClick={()=>{ localStorage.removeItem("bi.ref_token"); setToken(""); setStage("otp"); }}>Sign out</button>
      </div>
      <button className="primary mt-3" onClick={()=>setPopup(true)}>+ Add Referral</button>

      {popup && (
        <div className="bi-scrape-modal">
          <h3>Add Referral</h3>
          {([
            ["name", "Contact name", "Jane Doe"],
            ["company", "Company", "Acme Construction Ltd."],
            ["email", "Email", "jane@example.com"],
            ["mobile", "Mobile", "+1 (555) 555-5555"],
            ["notes", "Notes (optional)", "Any context for the broker call"],
          ] as Array<[string, string, string]>).map(([k, label, ph]) => (
            <label key={k} className="block mb-3">
              <span className="block text-sm text-sky-100 mb-1">{label}</span>
              <input
                className="w-full bg-sky-500/15 border border-sky-300/40 text-white placeholder:text-sky-100/50 rounded px-3 py-2 focus:outline-none focus:border-sky-300 focus:bg-sky-500/25"
                type={k === "mobile" ? "tel" : k === "email" ? "email" : "text"}
                inputMode={k === "mobile" ? "tel" : undefined}
                autoComplete={k === "mobile" ? "tel" : k === "email" ? "email" : undefined}
                maxLength={k === "mobile" ? 20 : k === "notes" ? 500 : 120}
                placeholder={ph}
                value={(draft as any)[k] ?? ""}
                onChange={(e) => setDraft((p) => ({ ...p, [k]: e.target.value }))}
              />
            </label>
          ))}
          {err && <div className="form-error" role="alert">{err}</div>}
          <div className="flex gap-2 mt-3">
            <button className="primary" onClick={()=>saveReferral(false)} disabled={busy}>{busy ? "Saving…" : "Save"}</button>
            <button className="secondary" onClick={()=>saveReferral(true)} disabled={busy}>{busy ? "Saving…" : "Save & Next"}</button>
            <button onClick={()=>setPopup(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* BI_WEBSITE_BLOCK_v339_REFERRER_PORTAL_FIX_v1 — 5-stage carrier pipeline */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3 mb-6 mt-4">
        {STAGES.map((st) => {
          const count = items.filter((m: any) => (m.status || m.stage) === st).length;
          return (
            <div key={st} className="p-3 rounded border border-sky-300/30 bg-sky-500/5">
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] md:text-xs font-semibold tracking-wider text-sky-100">{STAGE_LABELS[st] || st}</span>
                <span className="text-base font-semibold text-sky-100">{count}</span>
              </div>
              <div className="text-center mt-3 text-sky-300/40 text-xs">—</div>
            </div>
          );
        })}
      </div>

      {/* Your referrals — full list, all statuses, never duplicates the pipeline */}
      <h2 className="text-lg font-semibold text-sky-100 mb-2 border-b border-sky-300/30 pb-1">Your referrals</h2>
      {items.length === 0 && (
        <div className="text-sm text-sky-200/70 p-4 border border-sky-300/20 rounded bg-sky-500/5">
          You haven't added any referrals yet. Click "+ Add Referral" above to get started.
        </div>
      )}
      {items.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-sky-300/70 border-b border-sky-300/20">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Company</th>
                <th className="py-2 pr-4">Contact</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Added</th>
              </tr>
            </thead>
            <tbody>
              {items.map((m: any) => (
                <tr key={m.id || m.public_id} className="border-b border-sky-300/10 hover:bg-sky-500/5">
                  <td className="py-2 pr-4">{m.full_name || m.name || m.guarantor_name || "—"}</td>
                  <td className="py-2 pr-4">{m.company || m.company_name || "—"}</td>
                  <td className="py-2 pr-4">
                    <div>{m.email || "—"}</div>
                    <div className="text-xs text-sky-200/70">{formatReferralPhone(m.mobile || m.phone)}</div>
                  </td>
                  <td className="py-2 pr-4">
                    <span className="inline-block px-2 py-0.5 rounded text-xs bg-sky-500/15 border border-sky-300/30">{STAGE_LABELS[m.status || m.stage] || m.status || m.stage || "—"}</span>
                  </td>
                  <td className="py-2 pr-4 text-sky-200/70">{m.created_at ? new Date(m.created_at).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
