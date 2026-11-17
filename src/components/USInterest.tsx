// BI_WEBSITE_US_FIRST_SITE_v1 - United States quotes open on January 1, 2027. A visitor who is not ready to apply
// leaves an email address or a mobile number and is told when quotes open. It goes to the CRM as a lead.
import { useState } from "react";
import { apiRequest } from "../api/request";
import { track } from "../lib/analytics";
import { emailValid, phoneValid } from "../lib/validation";
import { OPERATOR_PHONE_DISPLAY } from "../lib/operator";

export const US_INTEREST_CONSENT = "By sending this you agree that Boreal Risk Management may contact you about Personal Guarantee Insurance.";

export default function USInterest({ className = "" }: { className?: string }) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  async function send(ev: React.FormEvent) {
    ev.preventDefault();
    const v = value.trim();
    const digits = v.replace(/[^\d+]/g, "");
    const contact = emailValid(v) ? { email: v } : !v.includes("@") && phoneValid(digits) ? { phone: v } : null;
    if (!contact) { setStatus({ ok: false, text: "Enter an email address or a mobile number." }); return; }
    setBusy(true); setStatus(null);
    try {
      await apiRequest("/api/v1/crm/lead", { method: "POST", body: JSON.stringify({ source: "us_interest_list", company: "US interest list (website)", ...contact, casl_consent: true, casl_consent_text: US_INTEREST_CONSENT }) });
      track("us_interest_list");
      setValue("");
      setStatus({ ok: true, text: "You are on the list. We will be in touch as soon as US quotes open." });
    } catch {
      setStatus({ ok: false, text: `We could not save that. Please try again, or call us at ${OPERATOR_PHONE_DISPLAY}.` });
    } finally { setBusy(false); }
  }
  return (
    <form onSubmit={send} noValidate aria-label="Tell me when US quotes open" data-testid="us-interest" className={`rounded-2xl bg-white p-4 text-left text-[#0B1F3A] ${className}`}>
      <label className="block text-sm font-semibold" htmlFor="us-interest-input">Not ready to apply? We will tell you when US quotes open.</label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input id="us-interest-input" className="w-full flex-1 rounded-lg border border-slate-300 bg-white px-3 py-3 text-base" inputMode="email" autoComplete="email" placeholder="you@company.com or (512) 555-0142" value={value} onChange={(e) => setValue(e.target.value)} />
        <button type="submit" disabled={busy} className="bf-btn bf-btn--primary flex-none">{busy ? "Sending..." : "Keep me posted"}</button>
      </div>
      {status ? <p role={status.ok ? "status" : "alert"} className={`mt-2 text-sm font-semibold ${status.ok ? "text-green-700" : "text-red-700"}`}>{status.text}</p> : null}
      <p className="mt-2 text-xs text-slate-600">{US_INTEREST_CONSENT}</p>
    </form>
  );
}
