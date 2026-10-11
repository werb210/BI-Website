// BI_WEBSITE_BLOCK_v789_AUDIT_ROUND2 [152]
// Unknown routes used to <Navigate to="/">, so a mistyped or retired link
// silently landed on the home page and crawlers saw a soft 404. The static
// host serves this same app as /404.html with a 404 status.
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-xl px-5 py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-300">Error 404</p>
      <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Page not found</h1>
      <p className="mt-4 text-slate-300">
        The page you are looking for does not exist or has moved.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/" className="bf-btn bf-btn--primary">Go to the home page</Link>
        <Link to="/contact" className="bf-btn bf-btn--secondary">Contact us</Link>
      </div>
    </section>
  );
}
