// BI_WEBSITE_BLOCK_v99_MARKETING_HOME_v1
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import MarkelBadge from "../components/MarkelBadge";
type Row={public_id:string};
export default function Home(){const nav=useNavigate(); const [rows,setRows]=useState<Row[]>([]); useEffect(()=>{const ids:string[]=JSON.parse(localStorage.getItem("bi.my_apps")||"[]"); if(!ids.length)return; Promise.all(ids.map((id)=>api.getApp(id).then(r=>r.application).catch(()=>null))).then(a=>setRows(a.filter(Boolean) as Row[]));},[]);
return <main className="min-h-screen bg-bf-bg text-slate-200"><section className="mx-auto max-w-5xl px-5 py-16 text-center"><h1 className="text-4xl font-bold text-white">Insurance for the personal guarantee on your business loan.</h1><p className="mt-4">Sign with confidence.</p><div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center"><Link to="/quote" className="rounded-full bg-blue-600 px-7 py-3">Get a Free Quote</Link><a href="#how-it-works" className="rounded-full border border-white/30 px-7 py-3">How It Works</a></div><div className="mt-6 flex justify-center"><MarkelBadge /></div></section>{rows.length>0 && <section className="mx-auto max-w-5xl px-5 pb-12"><button type="button" onClick={()=>nav(`/applications/${rows[0].public_id}/form`)}>Continue Application</button></section>}<section id="how-it-works" className="mx-auto max-w-5xl px-5 py-12"><h2 className="text-2xl font-bold">How it works</h2></section></main>}
