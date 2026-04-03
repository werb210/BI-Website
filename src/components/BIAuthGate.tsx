import { useState } from "react";
import LoadingButton from "./LoadingButton";
import { apiPost } from "../lib/api";
import { phoneValid, required } from "../lib/validation";
import { track } from "../lib/analytics";

export default function BIAuthGate({
  onVerified,
  userType = "applicant",
}: {
  onVerified: (phone: string) => void;
  userType?: string;
}) {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"enter" | "verify">("enter");
  const [loading, setLoading] = useState(false);

  const validPhone = phoneValid(phone);
  const validCode = required(code);

  async function requestOtp() {
    if (!validPhone) {
      alert("Please enter a valid phone number.");
      return;
    }

    setLoading(true);
    try {
      await apiPost("/api/v1/otp/request", { phone, userType });
      setStep("verify");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    if (!validPhone || !validCode) {
      alert("Please enter a valid phone and code.");
      return;
    }

    setLoading(true);
    try {
      await apiPost("/api/v1/otp/verify", { phone, code, userType });
      track("otp_verified");
      onVerified(phone);
    } catch {
      alert("Invalid code");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-box">
      {step === "enter" && (
        <>
          <h2>Enter Your Phone Number</h2>
          <input
            placeholder="+1XXXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <LoadingButton loading={loading} onClick={requestOtp} disabled={!validPhone}>
            Send Code
          </LoadingButton>
        </>
      )}

      {step === "verify" && (
        <>
          <h2>Enter Verification Code</h2>
          <input value={code} onChange={(e) => setCode(e.target.value)} />
          <LoadingButton loading={loading} onClick={verifyOtp} disabled={!validCode}>
            Verify
          </LoadingButton>
        </>
      )}
    </div>
  );
}
