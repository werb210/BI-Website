import { Link, useNavigate } from "react-router-dom";

const cards = [
  {
    title: "What is PGI?",
    body: "Personal Guarantee Insurance (PGI) covers a portion of a signed personal guarantee if a business cannot repay a loan. It helps owners de-risk growth financing.",
    onClickPath: "/what-is-pgi",
  },
  {
    title: "How does it work",
    body: "PGI is structured around the lender's personal guarantee requirement, then responds if the guarantee is called after default and recoveries.",
    onClickPath: "/how-it-works",
  },
  {
    title: "Coverage",
    body: "Coverage can protect up to 80% of an enforceable personal guarantee, with limits up to $1M depending on lender requirements.",
    onClickPath: "/coverage",
  },
  {
    title: "Why it matters",
    body: "PGI helps separate business borrowing risk from personal wealth, reducing pressure on household assets while improving access to capital.",
    onClickPath: "/why-it-matters",
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-[#07182E] px-6 py-12 text-white md:px-10">
      <section className="mx-auto max-w-5xl text-center">
        <h1 className="mb-6 text-4xl font-bold">Protect Your Personal Assets</h1>
        <p className="mb-8 text-lg text-white/90">
          Personal Guarantee Insurance (PGI) protects Canadian business owners from
          personal financial loss when providing guarantees for business loans.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/quote"
            className="inline-flex rounded bg-blue-600 px-6 py-3 text-lg font-semibold text-white transition hover:bg-blue-700"
          >
            Get a Quote
          </Link>
          <Link
            to="/application"
            className="inline-flex rounded bg-emerald-600 px-6 py-3 text-lg font-semibold text-white transition hover:bg-emerald-700"
          >
            Apply Now
          </Link>
        </div>
      </section>

      <section className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-2">
        {cards.map((card) => (
          <article
            key={card.title}
            onClick={() => navigate(card.onClickPath)}
            className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-6 transition hover:opacity-80"
          >
            <h2 className="mb-3 text-2xl font-semibold">{card.title}</h2>
            <p className="text-white/85">{card.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
