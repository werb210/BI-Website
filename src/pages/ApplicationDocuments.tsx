// BI_WEBSITE_BLOCK_PGI_ALIGNMENT_v1
import { useNavigate } from "react-router-dom";

const KEY = "bi.application";
const DOCS = ["profit_loss", "balance_sheet", "ar_aging", "ap_aging", "founder_cv", "financial_forecast"];

export default function ApplicationDocuments() {
  const nav = useNavigate();
  function persist(files: Record<string, string>) {
    const saved = sessionStorage.getItem(KEY);
    const parsed = saved ? JSON.parse(saved) : {};
    sessionStorage.setItem(KEY, JSON.stringify({ ...parsed, documents: files }));
  }
  return <div><h1>Application Step 2</h1>
    {DOCS.map((k) => <label key={k}>{k}<input type="file" onChange={(e)=>persist({ [k]: e.target.files?.[0]?.name || "" })} /></label>)}
    <button onClick={()=>{ const s=sessionStorage.getItem(KEY); const p=s?JSON.parse(s):{}; sessionStorage.setItem(KEY, JSON.stringify({...p, documentsDeferred:true})); nav('/application/signature');}}>Continue Without Uploading</button>
    <button onClick={()=>nav('/application/signature')}>Next</button>
  </div>;
}
