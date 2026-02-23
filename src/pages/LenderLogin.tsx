import { useState } from "react";

export default function LenderLogin() {
  const [email, setEmail] = useState("");

  const login = () => {
    localStorage.setItem("bi_source", "lender");
    localStorage.setItem("bi_lender_email", email);
    window.location.href = "/apply";
  };

  return (
    <div className="container">
      <h1>Lender Application Portal</h1>
      <p>Submit applications on behalf of your client.</p>

      <input
        placeholder="Lender Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <button className="btn" onClick={login}>
        Continue
      </button>
    </div>
  );
}
