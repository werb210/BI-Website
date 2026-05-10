// BI_WEBSITE_BLOCK_v99_MARKETING_HOME_v1
import { Link } from "react-router-dom";
const CARDS=[{to:"/what-is-pgi",title:"What Personal Guarantee Insurance is"},{to:"/how-it-works",title:"From quote to coverage"},{to:"/coverage",title:"Loan types we can insure"},{to:"/csbfp",title:"PGI on a CSBFP loan"}];
export default function Resources(){return <main className="min-h-screen bg-bf-bg text-slate-200"><section className="mx-auto max-w-7xl px-5 py-12"><h1 className="text-3xl font-bold text-white">Knowledge Centre</h1><div className="mt-8 grid gap-4 sm:grid-cols-2">{CARDS.map(c=><Link key={c.to} to={c.to} className="rounded-2xl border border-white/10 p-6">{c.title}</Link>)}</div></section></main>}
