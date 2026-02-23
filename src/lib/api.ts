const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export async function submitApplication(data: any) {
  const res = await fetch(`${API_BASE}/api/applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    throw new Error("Submission failed");
  }

  return res.json();
}
