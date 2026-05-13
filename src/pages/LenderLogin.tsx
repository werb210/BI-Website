// BI_WEBSITE_BLOCK_v123_LENDER_FORM_AND_PORTAL_v1
// 2-stage OTP login (phone -> code). Both stages auto-forward without a button click.
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isPhoneReady, isCodeReady } from "../lib/otpAutoForward";

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
  const codeInputRef = useRef<HTMLInputElement | null>(null);
  const startedRef = useRef(false);
  const verifiedRef = useRef(false);

  async function start() {
    if (startedRef.current || busy) return;
    startedRef.current = true;
    setErr(null); setBusy(true);
    try {
      const r = await fetch(`${API_BASE}/api/v1/lender/otp/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      if (r.status === 404) {
        setErr("This phone number is not registered as a lender. Contact your Boreal Risk Management rep.");
        startedRef.current = false;
        return;
      }
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        setErr(j?.error || `Could not send code (${r.status}).`);
        startedRef.current = false;
        return;
      }
      setStage("code");
      setTimeout(() => codeInputRef.current?.focus(), 0);
    } catch (e: any) {
      startedRef.current = false;
      setErr(e?.message || "Network error");
    } finally { setBusy(false); }
  }

  async function verify() {
    if (verifiedRef.current || busy) return;
    verifiedRef.current = true;
    setErr(null); setBusy(true);
    try {
      const r = await fetch(`${API_BASE}/api/v1/lender/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), code: code.trim() }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || !data?.token) {
        verifiedRef.current = false;
        setCode("");
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
      verifiedRef.current = false;
      setErr(e?.message || "Network error");
    } finally { setBusy(false); }
  }

  // Auto-forward phone -> start OTP
  useEffect(() => {
    if (stage === "phone" && isPhoneReady(phone)) {
      void start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone, stage]);

  // Auto-forward code -> verify
  useEffect(() => {
    if (stage === "code" && isCodeReady(code)) {
      void verify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, stage]);

  // WebOTP API — programmatic SMS read on Android Chrome
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

  return (
    <div style={{ maxWidth: 420, margin: "48px auto", padding: "24px" }}>
      <div style={{ fontSize: 12, letterSpacing: 1, opacity: 0.7 }}>LENDER PORTAL</div>
      <h1 style={{ fontSize: 28, margin: "4px 0 8px" }}>Sign in</h1>
      <p style={{ opacity: 0.7, marginBottom: 24 }}>
        We send a 6-digit code by SMS. Only pre-provisioned lender accounts can sign in.
      </p>
      {err && <div style={{ background: "#3a1010", color: "#fecaca", padding: 12, borderRadius: 8, marginBottom: 16 }}>{err}</div>}

      {stage === "phone" && (
        // BI_WEBSITE_BLOCK_v171_OTP_CONSISTENCY_v1 — white OTP card, BF-Client parity
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
          <button
            type="button"
            disabled={busy || !isPhoneReady(phone)}
            onClick={start}
            style={{
              width: "100%", padding: "14px 20px", fontSize: 17, fontWeight: 700,
              background: "#f59e0b", color: "#fff", border: 0, borderRadius: 8,
              cursor: busy || !isPhoneReady(phone) ? "not-allowed" : "pointer",
              opacity: busy || !isPhoneReady(phone) ? 0.6 : 1,
            }}
          >
            {busy ? "Sending…" : "Send code →"}
          </button>
          <p style={{ fontSize: 12, color: "#64748b", marginTop: 10, marginBottom: 0, textAlign: "center" }}>
            We{"'"}ll text you a one-time code to verify.
          </p>
        </div>
      )}

      {stage === "code" && (
        <div>
          <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 12 }}>
            Code sent to <strong>{phone}</strong>.{" "}
            <button
              type="button"
              onClick={() => { setStage("phone"); setCode(""); startedRef.current = false; verifiedRef.current = false; }}
              style={{ background: "none", border: "none", color: "#60a5fa", padding: 0, cursor: "pointer", textDecoration: "underline" }}
            >Change number</button>
          </div>
          <label style={{ display: "block" }}>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>6-digit code</div>
            <input
              ref={codeInputRef}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              style={{ background: "#0a1120", border: "1px solid #2c3a52", color: "#e5e7eb", padding: "10px 12px", borderRadius: 8, width: "100%", fontSize: 18, letterSpacing: 6, textAlign: "center" }}
            />
          </label>
          <button
            type="button"
            disabled={busy || !isCodeReady(code)}
            onClick={verify}
            style={{
              marginTop: 16, width: "100%", padding: "12px 24px", borderRadius: 8,
              background: busy || !isCodeReady(code) ? "#1f2937" : "#3b82f6",
              color: busy || !isCodeReady(code) ? "#6b7280" : "white",
              border: "none", fontWeight: 600,
              cursor: busy || !isCodeReady(code) ? "not-allowed" : "pointer",
            }}
          >
            {busy ? "Verifying\u2026" : "Verify"}
          </button>
        </div>
      )}
    </div>
  );
}
