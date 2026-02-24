import { useState } from "react";

export default function Contact() {
  const [form, setForm] = useState({
    company: "",
    name: "",
    email: "",
    phone: ""
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    alert("Submitted");
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

      <button type="submit">Submit</button>
    </form>
  );
}
