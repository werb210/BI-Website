// BI_WEBSITE_BLOCK_v95_LAUNCH_UX_v1 — PGI marketing landing page.
import { Link } from "react-router-dom";

function Section({ id, eyebrow, title, children }: { id?: string; eyebrow?: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mx-auto max-w-5xl px-5 py-14 md:px-8 md:py-20">
      {eyebrow ? (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">{eyebrow}</p>
      ) : null}
      <h2 className="text-2xl font-bold text-white md:text-3xl">{title}</h2>
      <div className="mt-6 space-y-4 text-base leading-relaxed text-slate-300 md:text-lg">{children}</div>
    </section>
  );
}

function FeatureCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-bf-surface p-6 transition hover:bg-bf-surfaceAlt">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-300 md:text-base">{body}</p>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-bf-bg text-slate-200">
      <section className="mx-auto max-w-5xl px-5 py-16 text-center md:px-8 md:py-24">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
          Personal Guarantee Insurance
        </p>
        <h1 className="text-3xl font-bold leading-tight text-white md:text-5xl">
          Protect your personal assets when you sign for your business loan
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-slate-300 md:text-lg">
          Personal Guarantee Insurance (PGI) covers up to 80% of your personal liability if your
          business defaults — letting you grow your business without putting your home, savings, or
          family at risk.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/quote"
            className="w-full rounded-full bg-blue-600 px-7 py-3 text-base font-semibold text-white transition hover:bg-blue-500 sm:w-auto"
          >
            Get a Free Quote
          </Link>
          <Link
            to="/applications/new"
            className="w-full rounded-full border border-white/30 px-7 py-3 text-base font-semibold text-white transition hover:bg-white/5 sm:w-auto"
          >
            Apply Now
          </Link>
        </div>
      </section>
      <Section id="what-is-pgi" eyebrow="What is PGI" title="A safety net for the entrepreneur">
        <p>
          When you take out a business loan, lenders almost always require a personal guarantee —
          you, the owner, become personally responsible if the business cannot repay. That puts
          your home, your investments, and your family's financial security on the line.
        </p>
        <p>
          Personal Guarantee Insurance transfers most of that risk away from you. If your business
          defaults and the lender enforces the guarantee, your PGI policy pays out a defined
          percentage of the loss, protecting your personal assets.
        </p>
      </Section>
      <Section id="how-it-works" eyebrow="How it works" title="Three simple steps">
        <div className="grid gap-5 sm:grid-cols-3">
          <FeatureCard title="1 · Get a quote" body="Tell us your loan amount, coverage percentage, and whether the debt is secured. You get an indicative premium in seconds." />
          <FeatureCard title="2 · Apply online" body="Submit a short business profile and a few financial documents. Our underwriting platform scores eligibility automatically." />
          <FeatureCard title="3 · Get covered" body="Once approved, your policy is bound. If the worst happens and the guarantee is enforced, PGI covers up to 80% of the personal liability." />
        </div>
      </Section>
      <Section id="who-needs-pgi" eyebrow="Who it's for" title="Built for Canadian business owners">
        <div className="grid gap-5 sm:grid-cols-2">
          <FeatureCard title="Owners signing personal guarantees" body="Every business loan, line of credit, equipment lease, or commercial mortgage that requires your personal signature on the guarantee." />
          <FeatureCard title="Founders raising growth capital" body="When new debt is the difference between expanding and stalling, PGI lets you say yes without risking everything you've built." />
          <FeatureCard title="Buyers acquiring a business" body="M&A acquisition financing typically demands personal guarantees that can dwarf your net worth. PGI right-sizes the personal exposure." />
          <FeatureCard title="Family-owned operators" body="Protect generational wealth and the family home from a single bad year, supplier failure, or industry downturn." />
        </div>
      </Section>
      <Section id="why-it-matters" eyebrow="Why it matters" title="What's at stake without coverage">
        <p>
          A personal guarantee is unlimited by default. A $500,000 loan can become a $500,000 claim
          against your personal estate — your home, your investments, your retirement savings, and
          in some cases your spouse's assets too.
        </p>
        <p>
          PGI is the same idea as any other form of insurance: a small predictable cost today
          replaces a catastrophic, unpredictable loss tomorrow. For most business owners, an
          annual PGI premium is a fraction of one percent of the personal exposure they're taking
          on every time they sign a guarantee.
        </p>
      </Section>
      <section className="mx-auto max-w-5xl px-5 pb-20 md:px-8">
        <div className="rounded-2xl border border-blue-500/30 bg-blue-600/10 p-8 text-center md:p-12">
          <h2 className="text-2xl font-bold text-white md:text-3xl">
            See your premium in under a minute
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-slate-300 md:text-lg">
            Three questions. No personal information required for the indicative quote.
          </p>
          <Link
            to="/quote"
            className="mt-6 inline-flex rounded-full bg-blue-600 px-7 py-3 text-base font-semibold text-white transition hover:bg-blue-500"
          >
            Get My Quote
          </Link>
        </div>
      </section>
    </main>
  );
}
