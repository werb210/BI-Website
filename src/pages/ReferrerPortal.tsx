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
      try {
        const me = await jsonFetch("/referrer/me", { method: "GET" }, token);
        setProfile(me?.profile ?? {});
        const list = await jsonFetch("/referrer/referrals", { method: "GET" }, token);
        setItems(Array.isArray(list?.items) ? list.items : Array.isArray(list) ? list : []);
        setStage("dashboard");
      } catch { localStorage.removeItem("bi.ref_token"); setToken(""); }
    })();
  }, [token]);

  // BI_WEBSITE_BLOCK_v108_WEBOTP_AND_OTP_NAME_v1 — auto-forward on 6th digit.
  useEffect(() => {
    if (stage === "verify" && code.length === 6) void verifyOtp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, stage]);

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

  if (stage === "otp") return (
    <div className="bi-card">
      <h1>Referrer Login</h1>
      <label className="bi-field"><span>Phone</span>
        <input type="tel" value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="+1 555 555 5555" />
      </label>
      {err && <div className="form-error">{err}</div>}
      <button className="primary" onClick={sendOtp} disabled={busy || !phone.trim()}>{busy ? "Sending…" : "Send OTP"}</button>
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
    <div className="bi-card">
      <h1>First-time Intake</h1>
      <p>Tell us a bit about you so we can route commissions correctly.</p>
      {[
        ["legal_name","Legal name"],["business_name","Business name"],
        ["email","Email"],["phone","Phone"],
        ["etransfer_email","E-transfer email (for commissions)"],
        ["license","License #"],["province","Province"],
        ["city","City"],["postal_code","Postal code"],["address","Address"],
      ].map(([k,label])=>(
        <label key={k} className="bi-field"><span>{label}</span>
          <input value={profile[k] ?? ""} onChange={(e)=>setProfile(p=>({...p,[k]:e.target.value}))} />
        </label>
      ))}
      {err && <div className="form-error">{err}</div>}
      <button className="primary" onClick={saveProfile} disabled={busy || !profile.legal_name}>{busy ? "Saving…" : "Continue"}</button>
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
