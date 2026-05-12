// BI_WEBSITE_BLOCK_v98_OTP_AUTOFORWARD_ALL_v1
// Phone-first OTP gate with auto-forward UX:
//   - Phone field auto-submits the moment 10 digits (or 11 w/ leading 1, or
//     valid +E.164) is detected — no Send button click needed.
//   - Code field auto-submits the moment the 6th digit is typed.
// Buttons remain visible as a fallback / for assistive tech, but the happy
// path is purely typing.
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setApplicantToken } from "../lib/api";
import { isPhoneReady, isCodeReady, OTP_CODE_LENGTH } from "../lib/otpAutoForward";

export default function NewApplication() {
  const nav = useNavigate();
  const [stage, setStage] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const codeInputRef = useRef<HTMLInputElement | null>(null);
  const startedRef = useRef(false); // guard double-submit
  const verifiedRef = useRef(false);

  async function startOtp(p: string) {
    if (startedRef.current || busy) return;
    startedRef.current = true;
    setErr(null);
    setBusy(true);
    try {
      await api.applicantOtpStart(p);
      setStage("code");
      // focus the code input on next paint
      setTimeout(() => codeInputRef.current?.focus(), 0);
    } catch (e: any) {
      startedRef.current = false; // allow retry
      setErr(e?.message ?? "Failed to send code. Please try again.");
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
      const { token } = await api.applicantOtpVerify(p, c);
      setApplicantToken(token);
      // BI_WEBSITE_BLOCK_v130_DEFER_DOCS_FLOW_v1 — if a previously-started application is
      // still waiting on documents, jump straight to its upload page
      // instead of restarting the score flow.
      try {
        const r = await api.getMyPendingApplication();
        if (r?.pending?.public_id) {
          nav(`/applications/${r.pending.public_id}/documents`);
          return;
        }
      } catch {
        // Non-fatal — fall through to the normal new-score path.
      }
      nav("/applications/new/score");
    } catch (e: any) {
      verifiedRef.current = false;
      setCode("");
      setErr(
        e?.status === 401
          ? "That code didn't match. Please try again or request a new code."
          : e?.message ?? "Verification failed.",
      );
    } finally {
      setBusy(false);
    }
  }

  // Auto-forward phone when ready
  useEffect(() => {
    if (stage === "phone" && isPhoneReady(phone)) {
      void startOtp(phone);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone, stage]);

  // Auto-forward code when 6 digits entered
  useEffect(() => {
    if (stage === "code" && isCodeReady(code)) {
      void verifyOtp(phone, code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, stage]);

  // BI_WEBSITE_BLOCK_v108_WEBOTP_AND_OTP_NAME_v1 — programmatic SMS read on Android Chrome.
  useEffect(() => {
    if (stage !== "code") return;
    if (typeof window === "undefined" || !("OTPCredential" in window)) return;
    const ctrl = new AbortController();
    // @ts-expect-error WebOTP API not in standard lib.dom
    navigator.credentials.get({ otp: { transport: ["sms"] }, signal: ctrl.signal })
      .then((cred: any) => { if (cred?.code && /^\d{6}$/.test(cred.code)) setCode(cred.code); })
      .catch(() => { /* dismissed or no SMS arrived */ });
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  function backToPhone() {
    setStage("phone");
    setCode("");
    setErr(null);
    startedRef.current = false;
    verifiedRef.current = false;
  }

  return (
    <div className="bi-card" style={{ maxWidth: 480, margin: "0 auto" }}>
      <h1 style={{ textAlign: "center" }}>Start Your Application</h1>
      <p style={{ textAlign: "center", opacity: 0.85 }}>
        Verify your phone to begin. We&apos;ll send a one-time code by SMS.
      </p>

      {stage === "phone" ? (
        <>
          <label className="bi-field">
            <span className="bi-field-label">Mobile phone</span>
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              autoFocus
              placeholder="(587) 555-1234"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={busy}
            />
            <small className="bi-field-hint">
              {busy ? "Sending code…" : "We&apos;ll text you a code as soon as you finish typing."}
            </small>
          </label>
          {err ? <div className="form-error">{err}</div> : null}
          <small style={{ display: "block", textAlign: "center", marginTop: 12, opacity: 0.7 }}>
            By continuing, you agree to our{" "}
            <a href="/terms" target="_blank" rel="noreferrer">Terms of Service</a> and{" "}
            <a href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>.
          </small>
        </>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); void verifyOtp(phone, code); }}>
          <label className="bi-field">
            <span className="bi-field-label">Verification code</span>
            <input
              ref={codeInputRef}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              name="code"
              placeholder="123456"
              maxLength={OTP_CODE_LENGTH}
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, OTP_CODE_LENGTH))
              }
              disabled={busy}
              style={{ textAlign: "center", fontSize: "1.5rem", letterSpacing: "0.3em" }}
            />
            <small className="bi-field-hint">
              {busy ? "Verifying…" : `Enter the ${OTP_CODE_LENGTH}-digit code we just texted to ${phone}.`}
            </small>
          </label>
          {err ? <div className="form-error">{err}</div> : null}
          <button
            type="button"
            className="ghost"
            onClick={backToPhone}
            disabled={busy}
            style={{ width: "100%", marginTop: 8 }}
          >
            ← Use a different phone
          </button>
        </form>
      )}
    </div>
  );
}
