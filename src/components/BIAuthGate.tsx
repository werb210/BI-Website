import { useState } from "react";
import LoadingButton from "./LoadingButton";
import { apiPost } from "../lib/api";
import { saveAuth, AuthUser } from "../lib/auth";
import { emailValid, phoneValid, required } from "../lib/validation";

type Props = {
  onVerified: (user: AuthUser) => void;
  userType?: "applicant" | "referrer" | "lender";
};

export default function BIAuthGate({ onVerified, userType = "applicant" }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"enter" | "verify">("enter");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enterValid = required(name) && emailValid(email) && phoneValid(phone);
  const codeValid = code.length === 6;

  async function requestOtp() {
    if (!enterValid) return;
    setLoading(true);
    setError(null);
    try {
      await apiPost("/api/v1/otp/request", { name, email, phone, userType });
      setStep("verify");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to send code";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function verify() {
    if (!codeValid) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiPost<{
        token: string;
        user: AuthUser;
      }>("/api/v1/otp/verify", { phone, code });
      saveAuth(res.token, res.user);
      onVerified(res.user);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Invalid code";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-box mx-auto max-w-md rounded-xl border border-white/10 bg-white/5 p-6 text-white">
      {step === "enter" && (
        <>
          <h2 className="mb-4 text-2xl font-semibold">Verify to continue</h2>
          <input
            className="input mb-3 w-full"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="input mb-3 w-full"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="input mb-4 w-full"
            type="tel"
            placeholder="+1XXXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          {error && <p className="mb-3 text-sm text-red-300">{error}</p>}
          <LoadingButton loading={loading} onClick={requestOtp} disabled={!enterValid}>
            Send code
          </LoadingButton>
        </>
      )}
      {step === "verify" && (
        <>
          <h2 className="mb-2 text-2xl font-semibold">Enter verification code</h2>
          <p className="mb-4 text-sm text-white/70">We sent a 6-digit code to {phone}.</p>
          <input
            className="input mb-4 w-full tracking-widest text-center"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          />
          {error && <p className="mb-3 text-sm text-red-300">{error}</p>}
          <LoadingButton loading={loading} onClick={verify} disabled={!codeValid}>
            Verify
          </LoadingButton>
          <button
            type="button"
            className="mt-3 text-sm text-white/60 underline"
            onClick={() => setStep("enter")}
          >
            Change details
          </button>
        </>
      )}
    </div>
  );
}
