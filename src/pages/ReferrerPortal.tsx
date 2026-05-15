// BI_WEBSITE_BLOCK_v3_FULL_FIELD_RENDER_v1
import { useEffect, useState } from "react";

const STAGES = ["new","in_progress","ready_for_submission","submitted","under_review","information_required","approved","declined","policy_issued"] as const;
const STAGE_LABELS: Record<string, string> = {
  new: "New", in_progress: "In Progress", ready_for_submission: "Ready",
  submitted: "Submitted", under_review: "Under Review",
  information_required: "Info Needed", approved: "Approved",
  declined: "Declined", policy_issued: "Issued",
};

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
      const created = await jsonFetch("/referrer/referrals", { method: "POST", body: JSON.stringify(draft) }, token);
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
          placeholder="(555) 000-0000"
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
      {err && <div className="form-error">{err}</div>}
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
            <option value="QC">Quebec</option>
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
          {[
            ["name","Contact name"],["company","Company"],["email","Email"],["mobile","Mobile"],["notes","Notes (optional)"],
          ].map(([k,label])=>(
            <label key={k} className="bi-field"><span>{label}</span>
              <input value={(draft as any)[k] ?? ""} onChange={(e)=>setDraft(p=>({...p, [k]: e.target.value}))} />
            </label>
          ))}
          {err && <div className="form-error">{err}</div>}
          <div className="flex gap-2 mt-3">
            <button className="primary" onClick={()=>saveReferral(false)} disabled={busy}>{busy ? "Saving…" : "Save"}</button>
            <button className="secondary" onClick={()=>saveReferral(true)} disabled={busy}>{busy ? "Saving…" : "Save & Next"}</button>
            <button onClick={()=>setPopup(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
        {STAGES.map((st)=>(
          <div key={st} className="bi-section">
            <h3>{STAGE_LABELS[st]}</h3>
            <ul>
              {items.filter((m)=>m.stage===st).map((m)=>(
                <li key={m.id}>{m.name} · {m.company ?? "—"}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
