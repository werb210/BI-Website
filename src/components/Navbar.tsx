import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="bg-brand-bg border-b border-subtle">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        <Link
          to="/"
          className="text-xl font-semibold tracking-tight hover:opacity-90"
        >
          Boreal Financial
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-white/80">
          <Link to="/products" className="hover:text-white">
            Products
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
            Apply Now
          </Link>
        </nav>
      </div>
    </header>
  );
}
