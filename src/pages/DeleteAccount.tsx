// BI_WEBSITE_DELETE_ACCOUNT_v273
// Account and data deletion page for the Boreal Risk app (Google Play requires a
// public URL that names the app, gives the steps, and says what is deleted, what
// is kept and for how long). Wording matches the app: Home -> "Delete my account"
// -> "Yes, delete everything" permanently deletes the applicant's application(s)
// and uploaded documents.
export const DELETE_STEPS = [
  "Open the Boreal Risk app and sign in with your mobile number.",
  "On the Home screen, tap Delete my account.",
  "Tap Yes, delete everything to confirm.",
];

export const DELETED_ITEMS = [
  "Your Personal Guarantee Insurance application(s) and the answers you gave",
  "Documents you uploaded",
  "Messages and requirement records linked to the application",
];

export const KEPT_ITEMS = [
  "Commission and accounting records about a policy that was issued. These are kept without the link to your application, only for as long as the law requires, and then deleted.",
  "A basic contact record (name, phone number and email) and your opt-out choices, so we can keep honouring an unsubscribe or STOP request.",
];

export default function DeleteAccount() {
  return (
    <div className="bg-bf-bg text-white">
      <section className="mx-auto max-w-3xl px-5 py-12 md:px-8 md:py-16">
        <h1 className="mb-2 text-3xl font-bold text-white sm:text-4xl">Delete your account</h1>
        <p className="mb-8 text-base text-slate-200">For the Boreal Risk app (Android and iPhone).</p>
        <div className="space-y-8 leading-relaxed">
          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">Delete it yourself in the app</h2>
            <ol className="list-decimal space-y-2 pl-6 text-slate-200">
              {DELETE_STEPS.map((s) => (<li key={s}>{s}</li>))}
            </ol>
            <p className="mt-3 text-slate-200">Deletion happens immediately and cannot be undone.</p>
          </section>
          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">Or ask us to delete it</h2>
            <p className="text-slate-200">
              Email info@boreal.financial from the email address on your application, or call +1 (866) 631-8939, and ask us to delete your account. We confirm it is you, then delete your account within 30 days and email you when it is done. You can also ask us to delete the basic contact record described below.
            </p>
          </section>
          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">What is deleted</h2>
            <ul className="list-disc space-y-2 pl-6 text-slate-200">
              {DELETED_ITEMS.map((t) => (<li key={t}>{t}</li>))}
            </ul>
          </section>
          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">What is kept, and for how long</h2>
            <ul className="list-disc space-y-2 pl-6 text-slate-200">
              {KEPT_ITEMS.map((t) => (<li key={t}>{t}</li>))}
            </ul>
            <p className="mt-3 text-slate-200">
              An insurer or lender that already received your application keeps its own copy under its own privacy policy. Deleting your Boreal Risk account does not delete their records; contact them directly.
            </p>
          </section>
          <p className="text-slate-200">
            See our <a href="/privacy" className="font-semibold text-white underline">Privacy Policy</a> for more.
          </p>
        </div>
      </section>
    </div>
  );
}
