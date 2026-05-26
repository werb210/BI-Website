import { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative border-b border-card bg-bf-bg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-xl font-semibold tracking-tight text-white hover:opacity-90">
          Boreal Risk Management
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-white/80 md:flex">
          <Link to="/quote" className="hover:text-white">Coverage</Link>
          <Link to="/how-it-works" className="hover:text-white">How It Works</Link>
          <Link to="/faq" className="hover:text-white">FAQ</Link>
          <Link to="/applications/new" className="flex h-10 items-center rounded-full bg-bf-cta px-6 font-medium text-white transition-colors hover:bg-bf-ctaHover">Get Started</Link>
        </nav>

        <button
          type="button"
          className="rounded-md p-2 text-white md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="text-2xl leading-none">☰</span>
        </button>
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full z-[70] border-t border-card bg-bf-bg md:hidden">
          <nav className="flex flex-col gap-2 px-6 py-4 text-white/90">
            <Link to="/quote" className="rounded px-1 py-2 hover:bg-white/5" onClick={() => setOpen(false)}>Coverage</Link>
            <Link to="/how-it-works" className="rounded px-1 py-2 hover:bg-white/5" onClick={() => setOpen(false)}>How It Works</Link>
            <Link to="/faq" className="rounded px-1 py-2 hover:bg-white/5" onClick={() => setOpen(false)}>FAQ</Link>
            <Link to="/applications/new" className="mt-2 rounded-full bg-bf-cta px-4 py-2 text-center font-medium text-white hover:bg-bf-ctaHover" onClick={() => setOpen(false)}>Get Started</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
