// BI_WEBSITE_BLOCK_v130_DEFER_DOCS_FLOW_v1
// Confirmation page shown after the applicant chooses to defer document
// upload. Mirrors the SMS reminder schedule so they know what to expect.
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";

export default function Saved() {
  const { publicId } = useParams<{ publicId: string }>();
  return (
    <main className="min-h-screen bg-bf-bg px-6 py-10 text-white">
      <section className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-card bg-bf-surface p-6 sm:p-8">
          <div className="text-xs uppercase tracking-widest text-bf-textMuted">Application saved</div>
          <h1 className="mt-2 text-3xl font-bold">We'll text you when it's time to upload</h1>
          <p className="mt-3 text-bf-textMuted">
            Your application is saved. We can't send it on to the carrier until your
            financial documents are uploaded, so we'll text a friendly reminder each
            weekday for the next two weeks until you finish.
          </p>

          <ul className="mt-6 space-y-2 text-sm text-bf-textMuted">
            <li>• You'll receive at most one SMS per business day (Mon–Fri).</li>
            <li>• Reply STOP at any time to opt out of reminders.</li>
            <li>• Sign in at <span className="text-white">/applications/new</span> to come back — you'll go straight to the upload page.</li>
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {publicId && (
              <Link
                to={`/applications/${publicId}/documents`}
                className="rounded-md bg-bf-cta px-6 py-3 text-center font-semibold text-white hover:bg-bf-ctaHover"
              >
                Upload now anyway
              </Link>
            )}
            <Link
              to="/"
              className="rounded-md border border-white/20 px-6 py-3 text-center font-semibold hover:bg-white/5"
            >
              Back to home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
