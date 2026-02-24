import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container nav-inner">
          <h2 className="logo">Boreal Insurance</h2>

          <nav>
            <Link to="/">Home</Link>
            <Link to="/apply">Apply</Link>
            <Link to="/lender">Lenders</Link>
            <Link to="/referrer">Referrers</Link>
            <Link to="/contact">Contact</Link>
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <footer className="site-footer">
        <div className="container">© {new Date().getFullYear()} Boreal Insurance</div>
      </footer>
    </div>
  );
}
