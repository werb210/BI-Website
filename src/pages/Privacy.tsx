// BI_WEBSITE_BLOCK_v95_LAUNCH_UX_v1 — readable text on dark navy background
export default function Privacy() {
  return (
    <main className="min-h-screen bg-bf-bg text-slate-200">
      <section className="mx-auto max-w-3xl px-5 py-12 md:px-8 md:py-16">
        <h1 className="mb-3 text-3xl font-bold text-white md:text-4xl">Privacy Policy</h1>
        <p className="mb-10 text-sm text-slate-400">Last updated: May 2026</p>

        <div className="space-y-8 text-base leading-relaxed text-slate-300">
          <p>
            Boreal Insurance ("we", "us") respects your privacy. This Privacy Policy describes
            how we collect, use, and protect personal information when you use boreal.financial
            and related services.
          </p>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">Information We Collect</h2>
            <p className="text-slate-300">[CONTENT TO BE INSERTED]</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">How We Use Information</h2>
            <p className="text-slate-300">[CONTENT TO BE INSERTED]</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">Information Sharing</h2>
            <p className="text-slate-300">[CONTENT TO BE INSERTED]</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">Your Rights Under PIPEDA</h2>
            <p className="text-slate-300">[CONTENT TO BE INSERTED]</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">Contact</h2>
            <p>
              For privacy questions, contact us at{" "}
              <a className="text-blue-400 hover:text-blue-300" href="mailto:privacy@boreal.financial">
                privacy@boreal.financial
              </a>
              .
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
