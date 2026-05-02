// BI_WEBSITE_BLOCK_PGI_ALIGNMENT_v1
import { useEffect, useState } from "react";
import Quote from "./Quote";
import { API } from "../lib/api";

const STAGES = ["created","in_progress","ready_for_submission","submitted","under_review","information_required","approved","declined","policy_issued"];

export default function LenderPortal() {
  const [tab, setTab] = useState<"quote"|"application"|"dashboard">("quote");
  const [items, setItems] = useState<any[]>([]);
  const [apiKey, setApiKey] = useState("");
  const [form, setForm] = useState<any>({ business_name: "", lender_name: "", loan_amount: 0, pgi_limit: 0 });

  useEffect(() => { if (tab!=="dashboard") return; const t=setInterval(async()=>{ const r=await fetch(`${API}/lender/dashboard`); setItems(await r.json().catch(()=>[])); },30000); return ()=>clearInterval(t); }, [tab]);
  async function submit(){ await fetch(`${API}/lender/applications`, {method:"POST", headers:{"Content-Type":"application/json","X-API-Key":apiKey}, body:JSON.stringify(form)}); }

  return <div><h1>Lender Portal</h1><button onClick={()=>setTab("quote")}>Quote</button><button onClick={()=>setTab("application")}>Application</button><button onClick={()=>setTab("dashboard")}>Dashboard</button>
    {tab==="quote" && <Quote/>}
    {tab==="application" && <div><input placeholder="API Key" value={apiKey} onChange={(e)=>setApiKey(e.target.value)} /><input placeholder="Business" onChange={(e)=>setForm({...form,business_name:e.target.value})}/><button onClick={submit}>Submit</button></div>}
    {tab==="dashboard" && <div>{STAGES.map((s)=><div key={s}><h3>{s}</h3>{items.filter((i)=>i.stage===s).map((i,idx)=><div key={idx}>{i.business_name}</div>)}</div>)}</div>}
  </div>;
}
