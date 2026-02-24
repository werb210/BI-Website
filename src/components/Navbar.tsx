import { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-brand-bg border-b border-subtle">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          to="/"
          className="text-xl font-semibold tracking-tight hover:opacity-90"
        >
          Boreal Insurance
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm text-white/80">
          <Link to="/coverage" className="hover:text-white">
            Coverage
          </Link>
          <Link to="/how-it-works" className="hover:text-white">
            How It Works
          </Link>
          <Link to="/faq" className="hover:text-white">
            FAQ
          </Link>
          <Link
            to="/apply"
            className="bg-brand-accent hover:bg-brand-accentHover text-white rounded-full px-6 h-10 flex items-center font-medium transition-colors"
          >
            Apply
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white text-2xl"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-brand-bgAlt border-t border-subtle px-6 py-4 space-y-4">
          <Link to="/coverage" className="block text-white/80 hover:text-white">
            Coverage
          </Link>
          <Link to="/how-it-works" className="block text-white/80 hover:text-white">
            How It Works
          </Link>
          <Link to="/faq" className="block text-white/80 hover:text-white">
            FAQ
          </Link>
          <Link
            to="/apply"
            className="block bg-brand-accent hover:bg-brand-accentHover text-white rounded-full px-6 h-10 flex items-center justify-center font-medium transition-colors"
          >
            Apply
          </Link>
        </div>
      )}
    </header>
  );
}
