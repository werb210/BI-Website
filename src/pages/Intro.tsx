import { useNavigate } from "react-router-dom";

export default function Intro() {
  const nav = useNavigate();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#0b1220] text-white px-6">
      <h1 className="text-4xl font-bold mb-4 text-center">
        Protect Your Personal Assets
      </h1>

      <p className="text-lg text-gray-300 mb-8 text-center max-w-xl">
        Insurance for Canadian and United States business owners with personal guarantees.
        Protect your home, savings, and investments.
      </p>

      <button
        onClick={() => nav("/quote")}
        className="bg-blue-600 px-6 py-3 rounded-lg text-lg hover:bg-blue-700"
      >
        Get a Quote
      </button>
    </div>
  );
}
