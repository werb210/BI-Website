import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

type Row = { public_id: string; status: string; score_value: number | null; pgi_limit: number; updated_at: string };

export default function Home() {
  const nav = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    const ids: string[] = JSON.parse(localStorage.getItem("bi.my_apps") || "[]");
    Promise.all(ids.map((id) => api.getApp(id).then((r) => r.application).catch(() => null)))
      .then((all) => setRows(all.filter(Boolean)));
  }, []);

  return (
    <div className="bi-home">
      <h1>Welcome back</h1>
      <p>The place to manage personal guarantee insurance.</p>
      <div className="bi-home-head">
        <h2>Your Applications</h2>
        <span>{rows.length} total</span>
      </div>
      {rows.length === 0 && (
        <div className="bi-empty">
          <p>No applications yet.</p>
          <button className="primary" onClick={() => nav("/applications/new")}>Start Application</button>
        </div>
      )}
      {rows.map((r) => (
        <div key={r.public_id} className="bi-app-card">
          <div className="badge">{r.status === "in_progress" ? "Draft" : r.status}</div>
          <div className="cap">PERSONAL GUARANTEE INSURANCE</div>
          <h3>Draft Application</h3>
          <div className="meta">App# {r.public_id}</div>
          <div className="core">CORE Score: {r.score_value ?? "—"}</div>
          <div className="updated">Updated {new Date(r.updated_at).toLocaleString()}</div>
          <button className="primary" onClick={() => nav(`/applications/${r.public_id}/form`)}>Continue ▸</button>
        </div>
      ))}
      <button className="bi-fab" onClick={() => nav("/applications/new")}>+ New Application</button>
    </div>
  );
}
