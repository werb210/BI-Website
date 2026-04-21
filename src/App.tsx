import React from "react";

export default function App() {
  const api = import.meta.env.VITE_API_URL;
  const hasSubmit = Boolean(import.meta.env.VITE_SUBMIT_SECRET);

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>Boreal Insurance</h1>

      <p><strong>API:</strong> {api || "NOT SET"}</p>

      {!hasSubmit && (
        <div style={{ marginTop: 20, color: "orange" }}>
          Submission disabled (missing VITE_SUBMIT_SECRET)
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        App is running.
      </div>
    </div>
  );
}
