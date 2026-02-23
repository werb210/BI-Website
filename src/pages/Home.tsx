import { useNavigate } from "react-router-dom";

export default function Home() {
  const nav = useNavigate();

  return (
    <div className="container">
      <h1>Boreal Insurance</h1>
      <h2>Personal Guarantee Insurance</h2>
      <p>
        Protect your personal assets when providing guarantees for business borrowing.
      </p>

      <button onClick={() => nav("/quote")}>Get a Quote</button>

      <br />
      <br />

      <button onClick={() => nav("/apply?mode=lender")}>Lender Application</button>

      <br />
      <br />

      <button onClick={() => nav("/apply?ref=manual")}>
        Refer a Client
      </button>
    </div>
  );
}
