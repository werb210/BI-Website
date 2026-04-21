import { useNavigate } from "react-router-dom";

export default function Documents() {
  const nav = useNavigate();

  const handleUpload = () => {
    // placeholder for upload logic
    sessionStorage.setItem("documents", "uploaded");
    nav("/apply/signature");
  };

  const handleSkip = () => {
    sessionStorage.setItem("documents", "deferred");
    nav("/apply/signature");
  };

  return (
    <div className="min-h-screen bg-[#0b1220] p-6 text-white">
      <h2 className="mb-6 text-2xl">Required Documents</h2>

      <div className="max-w-md space-y-4">
        <p className="text-gray-300">
          Upload required documents to proceed or supply them later.
        </p>

        <button onClick={handleUpload} className="w-full rounded bg-blue-600 py-3">
          Upload Documents
        </button>

        <button onClick={handleSkip} className="w-full rounded bg-gray-700 py-3">
          Supply Required Documents Later
        </button>
      </div>
    </div>
  );
}
