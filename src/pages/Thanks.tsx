import { useNavigate, useSearchParams } from "react-router-dom";

// BI_WEBSITE_THANKS_WORDING_v1 - the page used to say "our team will review your documents" even when none had
// been uploaded. It now says what happens next in either case.
export function thanksLines(missing: number): string[] {
  if (missing > 0) {
    return [
      `We still need ${missing === 1 ? "one document" : `${missing} documents`} before your application can go to the carrier.`,
      "We will text you a reminder with a link to upload them. As soon as they are in, our team reviews them and submits your application.",
    ];
  }
  return ["Our team will review your documents and submit your application to the carrier."];
}

export default function Thanks() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const missing = Math.max(0, Math.trunc(Number(params.get("missing")) || 0));
  return (
    <div className="bi-card">
      <h1>Application submitted</h1>
      {thanksLines(missing).map((line) => <p key={line}>{line}</p>)}
      <p>You'll get an email when there's an update.</p>
      <button className="primary" onClick={() => nav("/")}>Return Home</button>
    </div>
  );
}
