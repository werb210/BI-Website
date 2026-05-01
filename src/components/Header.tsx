// BI_AUDIT_FIX_v58 — Lender Login points at /lender/portal (OTP-gated).
// Old link was /lender, which rendered a public Lender.tsx with hardcoded
// fake pipeline stages — the source of the screenshot Todd flagged.
// Also adds a sign-out widget that appears whenever a BI auth session is
// present in sessionStorage.
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getAuthUser, clearAuth, type AuthUser } from "../lib/auth";

export default function Header() {
  const location = useLocation();
  const [user, setUser] = useState<AuthUser | null>(null);

  // Re-read auth on every route change (covers the post-OTP redirect case
  // and any in-app navigation after sign-in/sign-out).
  useEffect(() => {
    setUser(getAuthUser());
  }, [location.pathname]);

  function signOut() {
    clearAuth();
    setUser(null);
    // Hard-reload to "/" so any cached app state is dropped.
    window.location.href = "/";
  }

  const displayName =
    (user && (user.name || user.email || user.phone)) || "Account";

  return (
    <header className="w-full bg-[#0B1E3B] px-6 py-4 text-white shadow-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/assets/logos/website%20logo.png"
            alt="Boreal Insurance"
            className="h-10 w-auto"
          />
          <span className="text-xl font-semibold">Boreal Insurance</span>
        </Link>

        <nav className="flex flex-wrap items-center gap-3">
          {user ? (
            <>
              <span className="hidden text-sm text-white/70 sm:inline">
                Signed in as <span className="font-medium text-white">{displayName}</span>
              </span>
              <Link
                to={user.userType === "lender" ? "/lender/portal" : user.userType === "referrer" ? "/referrer/portal" : "/application"}
                className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                {user.userType === "lender" ? "Lender Portal" : user.userType === "referrer" ? "Referrer Portal" : "My Application"}
              </Link>
              <button
                onClick={signOut}
                className="rounded border border-white/30 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/application"
                className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
              >
                Apply Now
              </Link>

              <Link
                to="/referral"
                className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Referral Login
              </Link>

              {/* BI_AUDIT_FIX_v58 — was "/lender" (public page with fake stages) */}
              <Link
                to="/lender/portal"
                className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Lender Login
              </Link>
            </>
          )}

          <a
            href="https://www.boreal.financial/"
            target="_blank"
            rel="noreferrer"
            className="rounded border border-white px-4 py-2 text-sm font-medium text-white transition hover:bg-white hover:text-black"
          >
            Visit Boreal Financial
          </a>
        </nav>
      </div>
    </header>
  );
}
