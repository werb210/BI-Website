// BI_WEBSITE_BLOCK_v83_BODY_PALETTE_PARITY_v1 — reskin to BF-Website pattern
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

type Row = { public_id: string; status: string; score_value: number | null; pgi_limit: number; updated_at: string };

export default function Home() {
  const nav = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    const ids: string[] = JSON.parse(localStorage.getItem("bi.my_apps") || "[]");
    Promise.all(ids.map((id) => api.getApp(id).then((r) => r.application).catch(() => null))).then((all) =>
      setRows(all.filter(Boolean)),
    );
  }, []);

  return (
    <main className="min-h-screen bg-bf-bg text-white">
      <section className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-16">
        <h1 className="text-3xl font-bold md:text-5xl">Welcome back</h1>
        <p className="mt-3 text-slate-300 md:text-lg">The place to manage personal guarantee insurance.</p>

        <div className="mt-10 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Your Applications</h2>
          <span className="text-sm text-slate-400">{rows.length} total</span>
        </div>

        {rows.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-bf-surface p-8 text-center">
            <p className="text-slate-300">No applications yet.</p>
            <button
              type="button"
              onClick={() => nav("/applications/new")}
              className="mt-4 inline-flex items-center justify-center rounded-full bg-bf-cta px-6 py-3 text-sm font-semibold text-white transition hover:bg-bf-ctaHover"
            >
              Start Application
            </button>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((r) => (
              <article
                key={r.public_id}
                className="rounded-2xl border border-white/10 bg-bf-surface p-5 transition hover:bg-bf-surfaceAlt"
              >
                <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                  {r.status === "in_progress" ? "Draft" : r.status}
                </span>
                <p className="mt-3 text-xs uppercase tracking-wider text-slate-400">Personal Guarantee Insurance</p>
                <h3 className="mt-1 text-lg font-semibold">Draft Application</h3>
                <p className="mt-2 text-sm text-slate-400">App# {r.public_id}</p>
                <p className="mt-1 text-sm text-slate-300">CORE Score: {r.score_value ?? "—"}</p>
                <p className="mt-1 text-xs text-slate-500">Updated {new Date(r.updated_at).toLocaleString()}</p>
                <button
                  type="button"
                  onClick={() => nav(`/applications/${r.public_id}/form`)}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-bf-cta px-4 py-2 text-sm font-semibold text-white transition hover:bg-bf-ctaHover"
                >
                  Continue →
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <button
        type="button"
        onClick={() => nav("/applications/new")}
        className="fixed bottom-6 right-6 z-40 inline-flex items-center justify-center rounded-full bg-bf-cta px-6 py-3 text-sm font-semibold text-white shadow-2xl transition hover:bg-bf-ctaHover"
        aria-label="Start new application"
      >
        + New Application
      </button>
    </main>
  );
}
