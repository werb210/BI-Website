// BI_WEBSITE_BLOCK_PGI_ALIGNMENT_v1
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

const KEY = "bi.application";

export default function Application() {
  const nav = useNavigate();
  const [form, setForm] = useState(() => {
    const saved = sessionStorage.getItem(KEY);
    return saved ? JSON.parse(saved) : { guarantor_name: "", email: "", naics_code: "", ebitda: 0, enterprise_value: 0, loan_amount: 0 };
  });

  function setField(name: string, value: string | number) {
    const next = { ...form, [name]: value };
    setForm(next);
    sessionStorage.setItem(KEY, JSON.stringify(next));
  }

  function estimateEnterprise() {
    if (Number(form.ebitda) > 0) setField("enterprise_value", Number(form.ebitda) * 4);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    nav("/application/documents");
  }

  return <form onSubmit={submit}><h1>Application Step 1</h1>
    <input placeholder="Guarantor Name" value={form.guarantor_name} onChange={(e)=>setField("guarantor_name", e.target.value)} required />
    <input placeholder="Email" value={form.email} onChange={(e)=>setField("email", e.target.value)} required />
    <input placeholder="NAICS" value={form.naics_code} onChange={(e)=>setField("naics_code", e.target.value)} required />
    <input type="number" placeholder="EBITDA" value={form.ebitda} onChange={(e)=>setField("ebitda", Number(e.target.value))} />
    <input type="number" placeholder="Enterprise Value" value={form.enterprise_value} onChange={(e)=>setField("enterprise_value", Number(e.target.value))} />
    <button type="button" onClick={estimateEnterprise}>Estimate from my financials</button>
    <button type="submit">Next</button>
  </form>;
}
