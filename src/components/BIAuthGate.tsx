import { useState } from "react";

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

  async function requestOtp() {
    await fetch("/api/bi/otp/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, userType }),
    });
    setStep("verify");
  }

  async function verifyOtp() {
    const res = await fetch("/api/bi/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code, userType }),
    });

    if (res.ok) {
      onVerified(phone);
    } else {
      alert("Invalid code");
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
          <button onClick={requestOtp}>Send Code</button>
        </>
      )}

      {step === "verify" && (
        <>
          <h2>Enter Verification Code</h2>
          <input value={code} onChange={(e) => setCode(e.target.value)} />
          <button onClick={verifyOtp}>Verify</button>
        </>
      )}
    </div>
  );
}
