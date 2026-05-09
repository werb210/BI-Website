// BI_WEBSITE_BLOCK_v97_OTP_GATE_AND_FLOW_v1
// Replaces the old "Start Application / Get Your CORE Score" splash page.
// Now: phone-first OTP verify. On success, we save the applicant JWT to
// localStorage and forward to the CORE score form. Phone is auto-captured
// to bi_contacts on the server for marketing follow-up.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setApplicantToken } from "../lib/api";

export default function NewApplication() {
  const nav = useNavigate();
  const [stage, setStage] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function startOtp() {
    setErr(null);
    if (!phone || phone.replace(/[^0-9]/g, "").length < 10) {
      setErr("Enter a valid mobile phone, including country code (e.g. +15875551234).");
      return;
    }
    setBusy(true);
    try {
      await api.applicantOtpStart(phone);
      setStage("code");
    } catch (e: any) {
      setErr(e?.message ?? "Failed to send code. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyOtp() {
    setErr(null);
    setBusy(true);
    try {
      const { token } = await api.applicantOtpVerify(phone, code);
      setApplicantToken(token);
      // Skip the old country picker page — country lives on the score form now.
      nav("/applications/new/score");
    } catch (e: any) {
      setErr(
        e?.status === 401
          ? "That code didn't match. Please try again or request a new code."
          : e?.message ?? "Verification failed.",
      );
    } finally {
      setBusy(false);
    }
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
              placeholder="+15875551234"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <small className="bi-field-hint">
              Include the country code. We use this to follow up about your application.
            </small>
          </label>
          {err ? <div className="form-error">{err}</div> : null}
          <button
            type="button"
            className="primary big"
            disabled={busy || !phone}
            onClick={startOtp}
            style={{ width: "100%" }}
          >
            {busy ? "Sending code…" : "Send code"}
          </button>
          <small style={{ display: "block", textAlign: "center", marginTop: 12, opacity: 0.7 }}>
            By continuing, you agree to our{" "}
            <a href="/terms" target="_blank" rel="noreferrer">Terms of Service</a> and{" "}
            <a href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>.
          </small>
        </>
      ) : (
        <>
          <label className="bi-field">
            <span className="bi-field-label">Verification code</span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 8))}
              style={{ textAlign: "center", fontSize: "1.5rem", letterSpacing: "0.3em" }}
            />
            <small className="bi-field-hint">Enter the 6-digit code we just texted to {phone}.</small>
          </label>
          {err ? <div className="form-error">{err}</div> : null}
          <button
            type="button"
            className="primary big"
            disabled={busy || code.length < 4}
            onClick={verifyOtp}
            style={{ width: "100%" }}
          >
            {busy ? "Verifying…" : "Verify & continue"}
          </button>
          <button
            type="button"
            className="ghost"
            onClick={() => { setStage("phone"); setCode(""); setErr(null); }}
            style={{ width: "100%", marginTop: 8 }}
          >
            ← Use a different phone
          </button>
        </>
      )}
    </div>
  );
}
