// BI_WEBSITE_BLOCK_v82_BF_PARITY_HEADER_v1
// Visual reskin to BF-Website's Header pattern (dark navy /95 with
// backdrop-blur, container layout, big logo + wordmark, slim ghost
// nav, rounded blue CTA, mobile hamburger drawer). All BI-specific
// auth branching (sign-in state, sign-out, lender/referrer/apply
// destinations) is preserved exactly. Per Todd: "1 for 1 clone as far
// as colours, look feel, header and footer but with the BI info."
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
// BI_WEBSITE_BLOCK_v92 — translucent logo in the header (Todd Q1).
import logoUrl from "../../assets/logos/website logo.png";
import { getAuthUser, clearAuth, type AuthUser } from "../lib/auth";

function MenuIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    );
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

export default function Header() {
  const location = useLocation();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [open, setOpen] = useState(false);

  // Re-read auth on every route change (covers post-OTP redirect and
  // any in-app navigation after sign-in/sign-out).
  useEffect(() => {
    setUser(getAuthUser());
    setOpen(false);
  }, [location.pathname]);

  function signOut() {
    clearAuth();
    setUser(null);
    window.location.href = "/";
  }

  const displayName =
    (user && (user.name || user.email || user.phone)) || "Account";

  const signedInPortalHref =
    user?.userType === "lender"
      ? "/lender/portal"
      : user?.userType === "referrer"
      ? "/referrer/dashboard"
      : "/applications/new";
  const signedInPortalLabel =
    user?.userType === "lender"
      ? "Lender Portal"
      : user?.userType === "referrer"
      ? "Referrer Portal"
      : "My Application";

  return (
    <header className="site-header w-full border-b border-white/10 bg-[#0B1320]/95 backdrop-blur">
      <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-4 px-6 py-3">
        <Link to="/" className="flex items-center gap-3 sm:gap-4" onClick={() => setOpen(false)}>
          <img
            src={logoUrl}
            alt="Boreal Insurance"
            className="h-12 w-auto object-contain md:h-16"
            loading="lazy"
            decoding="async"
          />
          <span className="text-base font-semibold tracking-wide text-white sm:text-xl">
            Boreal Insurance
          </span>
        </Link>

        <nav className="hidden items-center gap-4 text-sm text-white md:flex">
          {user ? (
            <>
              <span className="hidden text-sm text-white/70 lg:inline">
                Signed in as <span className="font-medium text-white">{displayName}</span>
              </span>
              <Link
                to={signedInPortalHref}
                className="rounded-full bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-500"
              >
                {signedInPortalLabel}
              </Link>
              <button
                onClick={signOut}
                className="rounded-full border border-white/40 px-5 py-2 text-sm font-medium text-white hover:bg-white/10"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="?quote=1" className="text-white/80 hover:text-white">
                Quote
              </Link>
              <Link to="/applications/new" className="text-white/80 hover:text-white">
                Apply
              </Link>
              {/* BI_WEBSITE_BLOCK_v96_LAUNCH_UX_v2 — Referral Login restored (deferred ≠ removed). */}
              <Link to="/referrer/login" className="text-white/80 hover:text-white">
                Referral Login
              </Link>
              <Link to="/lender/login" className="text-white/80 hover:text-white">
                Lender Login
              </Link>
              <a
                href="https://boreal.financial"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-sm font-semibold text-white"
              >
                Visit Boreal Financial
              </a>
              <Link
                to="/applications/new"
                className="rounded-full bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-500"
              >
                Apply Now
              </Link>
            </>
          )}
        </nav>

        <button
          type="button"
          className="rounded-md p-2 text-white md:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
        >
          <MenuIcon open={open} />
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="Close mobile navigation"
            className="absolute inset-0 bg-black/55"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-[min(88vw,360px)] overflow-auto border-l border-white/10 bg-[#081325] p-6">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-lg font-semibold text-white">Menu</span>
              <button
                type="button"
                className="rounded-md p-2 text-white"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <MenuIcon open={true} />
              </button>
            </div>
            <nav className="flex flex-col gap-4">
              {user ? (
                <>
                  <span className="text-sm text-white/70">
                    Signed in as <span className="font-medium text-white">{displayName}</span>
                  </span>
                  <Link
                    to={signedInPortalHref}
                    className="inline-flex justify-center rounded-full bg-blue-600 px-5 py-3 font-medium text-white"
                    onClick={() => setOpen(false)}
                  >
                    {signedInPortalLabel}
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      signOut();
                    }}
                    className="inline-flex justify-center rounded-full border border-white/40 px-5 py-3 font-medium text-white"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link to="?quote=1" className="text-white/80" onClick={() => setOpen(false)}>
                    Quote
                  </Link>
                  <Link to="/applications/new" className="text-white/80" onClick={() => setOpen(false)}>
                    Apply
                  </Link>
                  {/* BI_WEBSITE_BLOCK_v96_LAUNCH_UX_v2 — Referral Login restored. */}
                  <Link to="/referrer/login" className="text-white/80" onClick={() => setOpen(false)}>
                    Referral Login
                  </Link>
                  <Link to="/lender/login" className="text-white/80" onClick={() => setOpen(false)}>
                    Lender Login
                  </Link>
                  <Link
                    to="/applications/new"
                    className="mt-2 inline-flex justify-center rounded-full bg-blue-600 px-5 py-3 font-medium text-white"
                    onClick={() => setOpen(false)}
                  >
                    Apply Now
                  </Link>
                  <a
                    href="https://boreal.financial"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex justify-center rounded-full border border-white px-5 py-3 font-medium text-white"
                    onClick={() => setOpen(false)}
                  >
                    Visit Boreal Financial
                  </a>
                </>
              )}
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}
