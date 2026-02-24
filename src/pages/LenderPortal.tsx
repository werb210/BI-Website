import { useState } from "react";

export default function LenderPortal() {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await fetch("/api/lender-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    alert("Submitted");
  };

  return (
    <form className="content-section" onSubmit={handleSubmit}>
      <h1>Lender Application Portal</h1>
      <input
        required
        type="email"
        placeholder="Lender Email"
        onChange={e => setEmail(e.target.value)}
      />
      <button type="submit">Continue</button>
    </form>
  );
}
