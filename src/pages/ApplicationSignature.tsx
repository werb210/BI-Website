// BI_WEBSITE_BLOCK_PGI_ALIGNMENT_v1
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../lib/api";

const KEY = "bi.application";

export default function ApplicationSignature() {
  const nav = useNavigate();
  const [signature, setSignature] = useState("");
  const [agree, setAgree] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const saved = sessionStorage.getItem(KEY);
    const payload = { ...(saved ? JSON.parse(saved) : {}), signature, agree };
    const res = await fetch(`${API}/applications`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json().catch(() => ({}));
    nav(`/application/thanks?id=${encodeURIComponent(data.id || "submitted")}`);
  }

  return <form onSubmit={submit}><h1>Application Step 3</h1>
    <label><input type="checkbox" checked={agree} onChange={(e)=>setAgree(e.target.checked)} required/>I accept terms</label>
    <input placeholder="Signature" value={signature} onChange={(e)=>setSignature(e.target.value)} required />
    <button type="submit">Submit</button>
  </form>;
}
