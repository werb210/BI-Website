import { useState } from "react";
import LoadingButton from "../components/LoadingButton";
import { apiRequest } from "../api/request";
import { track } from "../lib/analytics";
import { emailValid, phoneValid, required } from "../lib/validation";

export default function Contact() {
  const [form, setForm] = useState({
    company: "",
    name: "",
    email: "",
    phone: ""
  });
  const [loading, setLoading] = useState(false);

  const formValid =
    required(form.name) && emailValid(form.email) && phoneValid(form.phone);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formValid) {
      alert("Please enter valid contact details.");
      return;
    }

    setLoading(true);
    try {
      const data = {
        company: form.company,
        name: form.name,
        email: form.email,
        phone: form.phone,
      };

      await apiRequest("/api/v1/crm/lead", {
        method: "POST",
        body: JSON.stringify(data)
      });
      track("contact_submitted");
      alert("Submitted");
    } catch (err) {
      console.error("❌ Lead submission failed:", err);
      alert("Unable to submit right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="content-section" onSubmit={handleSubmit}>
      <h1>Contact Us</h1>

      <input
        placeholder="Company Name (optional)"
        onChange={e => setForm({ ...form, company: e.target.value })}
      />

      <input
        required
        placeholder="Full Name"
        onChange={e => setForm({ ...form, name: e.target.value })}
      />

      <input
        required
        type="email"
        placeholder="Email"
        onChange={e => setForm({ ...form, email: e.target.value })}
      />

      <input
        required
        placeholder="Phone Number"
        onChange={e => setForm({ ...form, phone: e.target.value })}
      />

      <LoadingButton type="submit" loading={loading} disabled={!formValid}>
        Submit
      </LoadingButton>
    </form>
  );
}
