import { useState } from "react";

export default function ReferrerLogin() {
  const [code, setCode] = useState("");

  const login = () => {
    localStorage.setItem("bi_source", "referrer");
    localStorage.setItem("bi_referrer_code", code);
    window.location.href = "/apply";
  };

  return (
    <div className="container">
      <h1>Referrer Portal</h1>
      <p>Enter your referral code to submit a client.</p>

      <input
        placeholder="Referral Code"
        value={code}
        onChange={e => setCode(e.target.value)}
      />

      <button className="btn" onClick={login}>
        Continue
      </button>
    </div>
  );
}
