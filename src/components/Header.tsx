import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="w-full bg-[#0B1E3B] px-6 py-4 text-white shadow-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/icon.svg"
            alt="Boreal Insurance"
            className="h-10 w-auto"
          />
          <span className="text-xl font-semibold">Boreal Insurance</span>
        </Link>

        <nav className="flex flex-wrap items-center gap-3">
          <Link
            to="/referral"
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium transition hover:bg-blue-700"
          >
            Referral Login
          </Link>

          <Link
            to="/lender"
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium transition hover:bg-blue-700"
          >
            Lender Login
          </Link>

          <a
            href="https://www.borealfinancial.com"
            target="_blank"
            rel="noreferrer"
            className="rounded border border-white px-4 py-2 text-sm font-medium transition hover:bg-white hover:text-black"
          >
            Visit Boreal Financial
          </a>
        </nav>
      </div>
    </header>
  );
}
