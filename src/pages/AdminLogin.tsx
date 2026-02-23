import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleLogin() {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("BI_ADMIN_TOKEN", data.token);
      navigate("/admin/maya-analytics");
    } else {
      alert("Invalid password");
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Admin Login</h1>
      <input
        type="password"
        placeholder="Enter password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ padding: 10, marginRight: 10 }}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
