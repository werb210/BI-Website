import { Link } from "react-router-dom";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-bg text-white">
      <header className="bg-brand-bg border-b border-subtle">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h2 className="font-semibold text-xl tracking-tight">
            Boreal Insurance
          </h2>

          <nav className="space-x-6 text-sm text-white/80">
            <Link to="/" className="hover:text-white">Home</Link>
            <Link to="/apply" className="hover:text-white">Apply</Link>
            <Link to="/lender" className="hover:text-white">Lenders</Link>
            <Link to="/referrer" className="hover:text-white">Referrers</Link>
            <Link to="/contact" className="hover:text-white">Contact</Link>
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <footer className="bg-brand-bgAlt border-t border-subtle py-8 text-center text-sm text-gray-300">
        © {new Date().getFullYear()} Boreal Insurance
      </footer>
    </div>
  );
}
