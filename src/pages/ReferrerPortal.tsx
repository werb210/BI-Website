// BI_WEBSITE_BLOCK_PGI_ALIGNMENT_v1
import { useState } from "react";
import { API } from "../lib/api";

export default function ReferrerPortal() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"start"|"verify"|"intake"|"dashboard">("start");
  const [popup, setPopup] = useState(false);
  const [ref, setRef] = useState({ name: "", company: "", email: "", mobile: "" });

  async function startOtp(){ await fetch(`${API}/referrer/otp/start`, {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ phone })}); setStage("verify"); }
  async function verifyOtp(){ const r=await fetch(`${API}/referrer/otp/verify`, {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ phone, code })}); const d=await r.json().catch(()=>({})); setStage(d.intake_complete?"dashboard":"intake"); }
  async function submitIntake(){ await fetch(`${API}/referrer/intake`, {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ phone })}); setStage("dashboard"); }
  async function addReferral(next=false){ await fetch(`${API}/referrer/referrals`, {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(ref)}); if(next) setRef({name:"",company:"",email:"",mobile:""}); else setPopup(false); }

  return <div><h1>Referrer Portal</h1>
    {stage==="start" && <div><input value={phone} onChange={(e)=>setPhone(e.target.value)} /><button onClick={startOtp}>Start OTP</button></div>}
    {stage==="verify" && <div><input value={code} onChange={(e)=>setCode(e.target.value)} /><button onClick={verifyOtp}>Verify</button></div>}
    {stage==="intake" && <div><button onClick={submitIntake}>Submit Intake</button></div>}
    {stage==="dashboard" && <div><button onClick={()=>setPopup(true)}>+ Add Referral</button>{popup && <div><input placeholder="Name" value={ref.name} onChange={(e)=>setRef({...ref,name:e.target.value})}/><button onClick={()=>addReferral(false)}>Save</button><button onClick={()=>addReferral(true)}>Save & Next</button></div>}</div>}
  </div>;
}
