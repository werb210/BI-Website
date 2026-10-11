// BI_WEBSITE_BLOCK_v789_AUDIT_ROUND2 [147]
// Labelled, named fields on the site's form classes, the CASL consent and
// sender identification, and inline status messages instead of alert().
import { useState } from "react";
import { apiRequest } from "../api/request";
import { track } from "../lib/analytics";
import { emailValid, phoneValid, required } from "../lib/validation";
import {
  CASL_CONSENT_TEXT,
  OPERATOR_ENTITY_LINE,
  OPERATOR_PHONE_DISPLAY,
  OPERATOR_PHONE_HREF,
} from "../lib/operator";

type FormState = { company: string; name: string; email: string; phone: string; consent: boolean };
type Status = { kind: "idle" } | { kind: "success" } | { kind: "error"; message: string };

const EMPTY: FormState = { company: "", name: "", email: "", phone: "", consent: false };

function contactErrors(form: FormState): string[] {
  const errors: string[] = [];
  if (!required(form.name)) errors.push("Enter your full name.");
  if (!emailValid(form.email.trim())) errors.push("Enter a valid email address.");
  if (!phoneValid(form.phone.replace(/[^\d+]/g, ""))) errors.push("Enter a valid phone number.");
  if (!form.consent) errors.push("Tick the consent box so we can contact you about your inquiry.");
  return errors;
}

export default function Contact() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const update = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = field === "consent" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = contactErrors(form);
    if (errors.length) {
      setStatus({ kind: "error", message: errors.join(" ") });
      return;
    }

    setLoading(true);
    setStatus({ kind: "idle" });
    try {
      await apiRequest("/api/v1/crm/lead", {
        method: "POST",
        body: JSON.stringify({
          company: form.company.trim(),
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          casl_consent: true,
          casl_consent_text: CASL_CONSENT_TEXT,
        }),
      });
      track("contact_submitted");
      setForm(EMPTY);
      setStatus({ kind: "success" });
    } catch {
      setStatus({
        kind: "error",
        message: `We could not send your message. Please try again, or call us at ${OPERATOR_PHONE_DISPLAY}.`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-xl px-5 py-12 md:px-8 md:py-16">
      <h1 className="mb-2 text-3xl font-bold text-white sm:text-4xl">Contact Us</h1>
      <p className="mb-8 text-slate-300">
        Send us your details and we will get back to you, or call{" "}
        <a href={OPERATOR_PHONE_HREF} className="text-white underline">{OPERATOR_PHONE_DISPLAY}</a>.
      </p>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <label htmlFor="contact-company" className="mb-2 block text-sm font-medium text-slate-200">
            Company name (optional)
          </label>
          <input id="contact-company" name="company" type="text" autoComplete="organization"
            className="bf-field" value={form.company} onChange={update("company")} />
        </div>

        <div>
          <label htmlFor="contact-name" className="mb-2 block text-sm font-medium text-slate-200">Full name</label>
          <input id="contact-name" name="name" type="text" autoComplete="name" required
            className="bf-field" value={form.name} onChange={update("name")} />
        </div>

        <div>
          <label htmlFor="contact-email" className="mb-2 block text-sm font-medium text-slate-200">Email</label>
          <input id="contact-email" name="email" type="email" autoComplete="email" required
            className="bf-field" value={form.email} onChange={update("email")} />
        </div>

        <div>
          <label htmlFor="contact-phone" className="mb-2 block text-sm font-medium text-slate-200">Phone number</label>
          <input id="contact-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" required
            className="bf-field" value={form.phone} onChange={update("phone")} />
        </div>

        <div className="flex items-start gap-3">
          <input id="contact-consent" name="casl_consent" type="checkbox" required
            className="mt-1 h-5 w-5 shrink-0" checked={form.consent} onChange={update("consent")} />
          <label htmlFor="contact-consent" className="text-sm leading-relaxed text-slate-200">
            {CASL_CONSENT_TEXT}
          </label>
        </div>
        <p className="text-xs leading-relaxed text-slate-300">{OPERATOR_ENTITY_LINE}</p>

        {status.kind === "error" ? (
          <p role="alert" className="rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {status.message}
          </p>
        ) : null}
        {status.kind === "success" ? (
          <p role="status" className="rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            Thank you. Your message was sent and we will be in touch shortly.
          </p>
        ) : null}

        <button type="submit" className="bf-btn bf-btn--primary w-full" disabled={loading}>
          {loading ? "Sending..." : "Send message"}
        </button>
      </form>
    </section>
  );
}
