import { Link } from "react-router-dom";

function Pipeline() {
  const stages = [
    "Quote Created",
    "Application Started",
    "Application Submitted",
    "Under Review",
    "Approved",
    "Policy Issued",
    "Declined",
  ];

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-xl">Sales Pipeline</h2>
      <div className="grid gap-3 text-sm md:grid-cols-4 xl:grid-cols-7">
        {stages.map((stage) => (
          <div key={stage} className="rounded bg-[#112A4D] p-3 text-center">
            {stage}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Lender() {
  return (
    <main className="min-h-screen bg-[#07182E] p-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center gap-4">
          <Link to="/lender/quote" className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">
            Quote
          </Link>
          <Link to="/lender/application" className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">
            Application
          </Link>
          <h1 className="text-2xl font-semibold">Lender Dashboard</h1>
        </div>

        <Pipeline />
      </div>
    </main>
  );
}
