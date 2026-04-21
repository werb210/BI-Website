import { useState } from "react";

export default function Signature() {
  const [name, setName] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name || !accepted) return;

    const application = JSON.parse(sessionStorage.getItem("application") || "{}");
    const documents = sessionStorage.getItem("documents");

    const payload = {
      ...application,
      documentsStatus: documents,
      signature: name,
      accepted,
    };

    try {
      setSubmitting(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/application`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Submission failed with status ${response.status}`);
      }

      alert("Application submitted");
    } catch (error) {
      console.error(error);
      alert("Unable to submit your application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1220] p-6 text-white">
      <h2 className="mb-6 text-2xl">Terms & Conditions</h2>

      <div className="max-w-md space-y-4">
        <div className="text-sm text-gray-300">
          By signing, you agree to the terms and confirm all information is
          accurate.
        </div>

        <input
          placeholder="Type Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded bg-gray-800 p-3"
        />

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
          />
          I agree to the Terms & Conditions
        </label>

        <button
          onClick={handleSubmit}
          disabled={!name || !accepted || submitting}
          className="w-full rounded bg-green-600 py-3 disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Application"}
        </button>
      </div>
    </div>
  );
}
