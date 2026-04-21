import { Link, Route, Routes } from "react-router-dom";
import Quote from "./Quote";

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

function Dashboard() {
  return (
    <div>
      <h1 className="mb-4 text-2xl">Lender Dashboard</h1>

      <div className="mb-6 flex gap-4">
        <Link to="quote" className="rounded bg-blue-600 px-6 py-2 hover:bg-blue-700">
          Quote
        </Link>

        <Link to="application" className="rounded bg-blue-600 px-6 py-2 hover:bg-blue-700">
          Application
        </Link>
      </div>

      <Pipeline />
    </div>
  );
}

function Application() {
  return <div className="mt-6">Application Form (to be implemented)</div>;
}

export default function Lender() {
  return (
    <main className="min-h-screen bg-[#07182E] p-10 text-white">
      <div className="mx-auto max-w-6xl">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="quote" element={<Quote />} />
          <Route path="application" element={<Application />} />
        </Routes>
      </div>
    </main>
  );
}
