import { ReactNode } from "react";
import Navbar from "./Navbar";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-bg text-white flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 py-14 md:py-20">{children}</div>
      </main>

      <footer className="bg-brand-bgAlt border-t border-subtle py-8 text-center text-sm text-white/60">
        © {new Date().getFullYear()} Boreal Insurance
      </footer>
    </div>
  );
}
