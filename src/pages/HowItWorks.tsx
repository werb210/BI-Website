// BI_WEBSITE_BLOCK_v84_ROUTES_RESKIN_AND_SCORE_TC_v1 — palette parity
export default function HowItWorks() {
  return (
    <main className="min-h-screen bg-bf-bg px-6 py-12 text-white">
      <div className="mx-auto max-w-4xl rounded-xl border border-white/10 bg-bf-surface p-8">
        <h1 className="mb-6 text-3xl font-bold">How PGI Works in Canada</h1>

        <ol className="list-decimal space-y-4 pl-5 text-bf-textMuted">
          <li>
            <span className="font-semibold text-white">Loan and guarantee are set.</span> Your lender issues financing and
            requires a personal guarantee from owners or directors.
          </li>
          <li>
            <span className="font-semibold text-white">Coverage is selected.</span> A PGI policy is placed against the guarantee
            amount with coverage up to 80% and a policy limit up to $1,000,000.
          </li>
          <li>
            <span className="font-semibold text-white">Policy responds after enforcement.</span> If the business defaults and a valid
            claim is triggered, the policy can reimburse the covered portion of the enforceable guarantee.
          </li>
        </ol>
      </div>
    </main>
  );
}
