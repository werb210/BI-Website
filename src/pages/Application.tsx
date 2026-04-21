import { useState } from "react";
import { useNavigate } from "react-router-dom";

type ApplicationForm = {
  businessName: string;
  applicantName: string;
  email: string;
  phone: string;
  loanAmount: string;
};

const initialForm: ApplicationForm = {
  businessName: "",
  applicantName: "",
  email: "",
  phone: "",
  loanAmount: "",
};

export default function Application() {
  const nav = useNavigate();

  const [form, setForm] = useState<ApplicationForm>(() => {
    const saved = sessionStorage.getItem("application");

    if (!saved) return initialForm;

    try {
      return { ...initialForm, ...JSON.parse(saved) };
    } catch {
      return initialForm;
    }
  });

  const update = (k: keyof ApplicationForm, v: string) =>
    setForm({ ...form, [k]: v });

  const handleNext = () => {
    const requiredFilled =
      form.businessName &&
      form.applicantName &&
      form.email &&
      form.phone &&
      form.loanAmount;

    if (!requiredFilled) {
      alert("Please complete all application fields before continuing.");
      return;
    }

    sessionStorage.setItem("application", JSON.stringify(form));
    nav("/apply/documents");
  };

  return (
    <div className="min-h-screen bg-[#0b1220] p-6 text-white">
      <h2 className="mb-6 text-2xl">Application</h2>

      <div className="max-w-md space-y-4">
        <input
          placeholder="Business Name"
          className="input"
          value={form.businessName}
          onChange={(e) => update("businessName", e.target.value)}
        />
        <input
          placeholder="Applicant Name"
          className="input"
          value={form.applicantName}
          onChange={(e) => update("applicantName", e.target.value)}
        />
        <input
          placeholder="Email"
          className="input"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
        />
        <input
          placeholder="Phone"
          className="input"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
        />
        <input
          placeholder="Loan Amount"
          className="input"
          value={form.loanAmount}
          onChange={(e) => update("loanAmount", e.target.value)}
        />

        <button onClick={handleNext} className="w-full rounded bg-blue-600 py-3">
          Continue to Documents
        </button>
      </div>
    </div>
  );
}
