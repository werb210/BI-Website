// BI_WEBSITE_BLOCK_v122_LENDER_LOGIN_HOTFIX_AND_HOME_CLEANUP_v1
// 2-stage OTP login: phone -> 6-digit code -> /lender/portal.
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = ((import.meta as any).env?.VITE_API_URL
  || (import.meta as any).env?.VITE_BI_API_URL
  || "https://bi-server-cse0apamgkheb9d5.canadacentral-01.azurewebsites.net").replace(/\/$/, "");

type Stage = "phone" | "code";

export default function LenderLogin() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // WebOTP on Android Chrome — auto-fills the SMS code.
  useEffect(() => {
    if (stage !== "code") return;
    if (typeof window === "undefined" || !("OTPCredential" in window)) return;
    const ctrl = new AbortController();
    // @ts-expect-error WebOTP not in standard lib.dom
    navigator.credentials.get({ otp: { transport: ["sms"] }, signal: ctrl.signal })
      .then((cred: any) => { if (cred?.code && /^\d{6}$/.test(cred.code)) setCode(cred.code); })
      .catch(() => { /* dismissed */ });
    return () => ctrl.abort();
  }, [stage]);

  useEffect(() => {
    if (stage === "code" && code.length === 6 && !busy) void verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, stage]);

  async function start() {
    setErr(null); setBusy(true);
    try {
      const r = await fetch(`${API_BASE}/api/v1/lender/otp/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      if (r.status === 404) {
        setErr("This phone number is not registered as a lender. Contact your Boreal Risk Management rep.");
        return;
      }
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        setErr(j?.error || `Could not send code (${r.status}).`);
        return;
      }
      setStage("code");
    } catch (e: any) {
      setErr(e?.message || "Network error");
    } finally { setBusy(false); }
  }

  async function verify() {
    setErr(null); setBusy(true);
    try {
      const r = await fetch(`${API_BASE}/api/v1/lender/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), code: code.trim() }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || !data?.token) {
        setErr(data?.error || "Invalid code.");
        return;
      }
      try {
        localStorage.setItem("bi.lender_token", data.token);
        localStorage.setItem("bi.lender_phone", phone.trim());
        if (data.lender?.id) localStorage.setItem("bi.lender_id", String(data.lender.id));
      } catch {}
      navigate("/lender/portal", { replace: true });
    } catch (e: any) {
      setErr(e?.message || "Network error");
    } finally { setBusy(false); }
  }

  return (
    <div style={{ maxWidth: 420, margin: "48px auto", padding: "24px" }}>
      <div style={{ fontSize: 12, letterSpacing: 1, opacity: 0.7 }}>LENDER PORTAL</div>
      <h1 style={{ fontSize: 28, margin: "4px 0 8px" }}>Sign in</h1>
      <p style={{ opacity: 0.7, marginBottom: 24 }}>
        We send a 6-digit code by SMS. Only pre-provisioned lender accounts can sign in.
      </p>
      {err && <div style={{ background: "#3a1010", color: "#fecaca", padding: 12, borderRadius: 8, marginBottom: 16 }}>{err}</div>}

      {stage === "phone" && (
        <div>
          <label style={{ display: "block" }}>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Mobile phone</div>
            <input
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+15551234567"
              style={{ background: "#0a1120", border: "1px solid #2c3a52", color: "#e5e7eb", padding: "10px 12px", borderRadius: 8, width: "100%", fontSize: 14 }}
            />
          </label>
          <button
            type="button"
            disabled={busy || !phone.trim()}
            onClick={start}
            style={{
              marginTop: 16, width: "100%", padding: "12px 24px", borderRadius: 8,
              background: busy || !phone.trim() ? "#1f2937" : "#3b82f6",
              color: busy || !phone.trim() ? "#6b7280" : "white",
              border: "none", fontWeight: 600,
              cursor: busy || !phone.trim() ? "not-allowed" : "pointer",
            }}
          >
            {busy ? "Sending\u2026" : "Send code"}
          </button>
        </div>
      )}

      {stage === "code" && (
        <div>
          <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 12 }}>
            Code sent to <strong>{phone}</strong>.{" "}
            <button
              type="button"
              onClick={() => { setStage("phone"); setCode(""); }}
              style={{ background: "none", border: "none", color: "#60a5fa", padding: 0, cursor: "pointer", textDecoration: "underline" }}
            >Change number</button>
          </div>
          <label style={{ display: "block" }}>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>6-digit code</div>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              style={{ background: "#0a1120", border: "1px solid #2c3a52", color: "#e5e7eb", padding: "10px 12px", borderRadius: 8, width: "100%", fontSize: 18, letterSpacing: 6, textAlign: "center" }}
            />
          </label>
          <button
            type="button"
            disabled={busy || code.length !== 6}
            onClick={verify}
            style={{
              marginTop: 16, width: "100%", padding: "12px 24px", borderRadius: 8,
              background: busy || code.length !== 6 ? "#1f2937" : "#3b82f6",
              color: busy || code.length !== 6 ? "#6b7280" : "white",
              border: "none", fontWeight: 600,
              cursor: busy || code.length !== 6 ? "not-allowed" : "pointer",
            }}
          >
            {busy ? "Verifying\u2026" : "Verify"}
          </button>
        </div>
      )}
    </div>
  );
}
