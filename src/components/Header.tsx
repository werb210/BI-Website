// BI_WEBSITE_CHROME_v99 - Boreal Risk Management header, built to the
// BF-Website Header template. Structurally identical: same 80px row, same
// 1120px container, same type scale, same md: breakpoint, same hover states.
// The brand name and the links are BI's own.
//
// If BF-Website's Header geometry changes, change it here too. The two are
// compared by src/__tests__/chromeParity.v99.test.tsx.
import { useState } from "react";
import { Link } from "react-router-dom";
import logoUrl from "../assets/logo-boreal-mountains-white.svg";

const navItems = [
  { to: "/quote", label: "Quote" },
  { to: "/lender/login", label: "Lender Login" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="w-full border-b border-white/10 bg-[#0B1320]/95 backdrop-blur">
      {/* Mirrors .container in BF-Website global.css: 1120px, 24px padding.
          env() padding is kept so the iPhone notch does not overlap the
          wordmark on iOS Safari. */}
      <div
        className="mx-auto flex min-h-20 max-w-[1120px] items-center justify-between gap-4 px-6 py-3"
        style={{
          paddingTop: "calc(0.75rem + env(safe-area-inset-top))",
          paddingLeft: "calc(1.5rem + env(safe-area-inset-left))",
          paddingRight: "calc(1.5rem + env(safe-area-inset-right))",
        }}
      >
        <Link to="/" className="flex min-w-0 items-center gap-3 no-underline sm:gap-4" onClick={() => setOpen(false)}>
          <img src={logoUrl} alt="Boreal Risk Management" className="h-10 w-auto shrink-0 object-contain" />
          <span className="truncate text-base font-semibold tracking-wide text-white sm:text-xl">
            Boreal Risk Management
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-white md:flex">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to} className="text-white/80 no-underline hover:text-white">
              {item.label}
            </Link>
          ))}
          <a
            href="https://staff.boreal.financial/referrer"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/80 no-underline hover:text-white"
          >
            Referrer Login
          </a>
          <a
            href="https://www.boreal.financial"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-4 text-sm font-semibold text-white no-underline"
          >
            Visit Boreal Financial
          </a>
          <Link
            to="/applications/new"
            className="rounded-full bg-blue-600 px-5 py-2 font-medium text-white no-underline hover:bg-blue-500"
          >
            Get Started
          </Link>
        </nav>

        <button
          type="button"
          className="rounded-md p-2 text-white md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open ? (
        <div className="flex flex-col gap-3.5 border-t border-white/10 bg-[#0B1320] px-6 pb-5 pt-4 md:hidden">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to} className="py-1.5 text-base text-white/90 no-underline" onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
          <a
            href="https://staff.boreal.financial/referrer"
            target="_blank"
            rel="noopener noreferrer"
            className="py-1.5 text-base text-white/90 no-underline"
            onClick={() => setOpen(false)}
          >
            Referrer Login
          </a>
          <a
            href="https://www.boreal.financial"
            target="_blank"
            rel="noopener noreferrer"
            className="py-1.5 text-base text-white/90 no-underline"
            onClick={() => setOpen(false)}
          >
            Visit Boreal Financial
          </a>
          <Link
            to="/applications/new"
            className="rounded-full bg-blue-600 px-5 py-2 text-center font-medium text-white no-underline hover:bg-blue-500"
            onClick={() => setOpen(false)}
          >
            Get Started
          </Link>
        </div>
      ) : null}
    </header>
  );
}
