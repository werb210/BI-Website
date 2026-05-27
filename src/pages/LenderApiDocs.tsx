// BI_WEBSITE_BLOCK_v340_LENDER_API_DOCS_V2_v1
// Lender Direct API docs page — v2 carrier-aligned.
// Source of truth: bi-server biLenderOpenApi.ts (v355 spec).
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// BI_WEBSITE_BLOCK_v347_TEST1_RUN5_v1
import { API_BASE } from "@/config";

type Lang = "curl" | "node" | "python";

const V2_BODY_JSON = `{
  "company_name": "Maple Leaf Technologies Inc.",
  "lender_name": "Acme Bank",
  "guarantor": {
    "name": "Sarah Chen",
    "phone": "+14165551234",
    "email": "sarah.chen@example.com",
    "dob": "1985-06-15",
    "address": "456 Oak Avenue, Toronto, ON M4V 2P7",
    "q_ca_id_type": "Driving Licence",
    "q_ca_id_number": "DL123456789"
  },
  "business": {
    "country": "CA",
    "naics": "541511",
    "start_date": "2019-03-15",
    "address": "789 King Street West, Toronto, ON M5H 2A9",
    "province": "ON",
    "entity_type": "Corporation",
    "website": "https://example.com"
  },
  "loan": {
    "amount": 500000,
    "pgi_limit": 400000,
    "q_ca_loan_type": "Commercial Mortgage",
    "use_of_proceeds": "expansion",
    "loan_funding_date": "2026-06-15",
    "policy_start_date": "2026-06-15",
    "csbfp_backed": false,
    "loan_has_guaranteed_cap": false,
    "personally_guaranteeing": true
  },
  "financials": {
    "revenue_last_year": 4000000,
    "ebitda_last_year": 670000,
    "total_debt": 800000,
    "monthly_debt_service": 5600,
    "collateral_value": 400000,
    "enterprise_value": 6000000
  },
  "declarations": {
    "section_1_a": "yes",
    "section_1_2": "no",
    "section_2_a": "no",
    "section_2_b": "no",
    "section_2_c": "no",
    "section_2_d": "no",
    "section_3_a": "no",
    "section_3_c": "Agree",
    "section_4_a": "no",
    "section_5_a": "no",
    "section_6_a": "yes"
  },
  "co_guarantors": []
}`;

const SAMPLES: Record<Lang, { label: string; submit: string; list: string; docs: string }> = {
  curl: {
    label: "cURL",
    submit: `curl -X POST ${API_BASE}/api/v1/lender/applications \\
  -H "Authorization: Bearer bk_xxxxxxxx.yyyyyyyyyyyyyyyy" \\
  -H "Content-Type: application/json" \\
  -d '${V2_BODY_JSON.replace(/\n/g, "\n  ")}'`,
    list: `curl ${API_BASE}/api/v1/lender/applications \\
  -H "Authorization: Bearer bk_xxxxxxxx.yyyyyyyyyyyyyyyy"`,
    docs: `# Upload required documents. Take application_code from the POST response.
# Required documents (5 always):
#   loan_agreement, profit_loss, balance_sheet, ar_aging, ap_aging
# Conditional (2 — if business < 3 years old):
#   founder_cv, financial_forecast
# Constraints: 5 MB max per file. PDF/DOCX/XLS/XLSX/CSV/MD only (no images).

curl -X POST ${API_BASE}/api/v1/lender/applications/PGI-A1B2C3D4/documents \\
  -H "Authorization: Bearer bk_xxxxxxxx.yyyyyyyyyyyyyyyy" \\
  -F "files=@./term_sheet.pdf"           -F "doc_types=loan_agreement" \\
  -F "files=@./profit_loss_12mo.pdf"     -F "doc_types=profit_loss" \\
  -F "files=@./balance_sheet.pdf"        -F "doc_types=balance_sheet" \\
  -F "files=@./ar_aging.xlsx"            -F "doc_types=ar_aging" \\
  -F "files=@./ap_aging.xlsx"            -F "doc_types=ap_aging"`,
  },
  node: {
    label: "Node.js (fetch)",
    submit: `const res = await fetch("${API_BASE}/api/v1/lender/applications", {
  method: "POST",
  headers: {
    "Authorization": "Bearer bk_xxxxxxxx.yyyyyyyyyyyyyyyy",
    "Content-Type": "application/json",
  },
  body: JSON.stringify(${V2_BODY_JSON}),
});
const data = await res.json();
if (!res.ok) throw new Error(\`\${res.status}: \${JSON.stringify(data)}\`);
console.log("application_code:", data.application_code);`,
    list: `const res = await fetch("${API_BASE}/api/v1/lender/applications", {
  headers: { "Authorization": "Bearer bk_xxxxxxxx.yyyyyyyyyyyyyyyy" },
});
const data = await res.json();`,
    docs: `// Multipart upload with the 5 required (or 5+2 startup) docs.
import { createReadStream } from "node:fs";
import FormData from "form-data";

const fd = new FormData();
const docs = [
  ["./term_sheet.pdf",       "loan_agreement"],
  ["./profit_loss_12mo.pdf", "profit_loss"],
  ["./balance_sheet.pdf",    "balance_sheet"],
  ["./ar_aging.xlsx",        "ar_aging"],
  ["./ap_aging.xlsx",        "ap_aging"],
];
for (const [filepath, doc_type] of docs) {
  fd.append("files",     createReadStream(filepath));
  fd.append("doc_types", doc_type);
}
const res = await fetch(\`${API_BASE}/api/v1/lender/applications/\${code}/documents\`, {
  method: "POST",
  headers: { "Authorization": "Bearer bk_xxxxxxxx.yyyyyyyyyyyyyyyy" },
  body: fd,
});`,
  },
  python: {
    label: "Python (requests)",
    submit: `import requests, json

BODY = ${V2_BODY_JSON}

r = requests.post(
    "${API_BASE}/api/v1/lender/applications",
    headers={
        "Authorization": "Bearer bk_xxxxxxxx.yyyyyyyyyyyyyyyy",
        "Content-Type": "application/json",
    },
    data=json.dumps(BODY),
)
r.raise_for_status()
data = r.json()
print("application_code:", data["application_code"])`,
    list: `import requests
r = requests.get(
    "${API_BASE}/api/v1/lender/applications",
    headers={"Authorization": "Bearer bk_xxxxxxxx.yyyyyyyyyyyyyyyy"},
)
print(r.json())`,
    docs: `import requests

DOCS = [
    ("./term_sheet.pdf",       "loan_agreement"),
    ("./profit_loss_12mo.pdf", "profit_loss"),
    ("./balance_sheet.pdf",    "balance_sheet"),
    ("./ar_aging.xlsx",        "ar_aging"),
    ("./ap_aging.xlsx",        "ap_aging"),
]
files = [("files", open(p, "rb")) for p, _ in DOCS]
data = [("doc_types", t) for _, t in DOCS]
r = requests.post(
    f"${API_BASE}/api/v1/lender/applications/{code}/documents",
    headers={"Authorization": "Bearer bk_xxxxxxxx.yyyyyyyyyyyyyyyy"},
    files=files, data=data,
)
r.raise_for_status()`,
  },
};

type ApiKey = { id: string; prefix: string; environment: "test" | "live"; created_at: string };

export default function LenderApiDocs() {
  const navigate = useNavigate();
  const [lang, setLang] = useState<Lang>("curl");
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [keysLoading, setKeysLoading] = useState(true);

  useEffect(() => {
    const token = (() => { try { return localStorage.getItem("bi.lender_token") || ""; } catch { return ""; } })();
    if (!token) { setKeysLoading(false); return; }
    fetch(`${API_BASE}/api/v1/lender/api-keys`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : { keys: [] })
      .then((d) => setKeys(Array.isArray(d?.keys) ? d.keys : []))
      .catch(() => setKeys([]))
      .finally(() => setKeysLoading(false));
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl text-white">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-sky-300/60">Lender</div>
          <h1 className="text-2xl font-semibold">API Documentation</h1>
          <p className="text-sm text-sky-200/70 mt-1">v2 · carrier-aligned · <a href={`${API_BASE}/api/v1/lender/openapi.json`} download="boreal-lender-openapi.json" className="underline text-sky-200">OpenAPI 3.1 spec</a></p>
        </div>
        <button onClick={() => navigate("/lender/portal")} className="text-sm text-sky-200 underline">Back to portal</button>
      </div>

      {/* Eligibility — carrier rules. Lenders need to know these before integrating. */}
      <div className="mb-6 p-4 rounded border border-amber-300/40 bg-amber-500/10">
        <div className="text-xs uppercase tracking-wider text-amber-100/80 mb-2">Eligibility rules (carrier-enforced)</div>
        <ul className="text-sm text-amber-50 space-y-1 list-disc pl-5">
          <li><strong>Canada only.</strong> <code>business.country</code> must be <code>"CA"</code>.</li>
          <li><strong>Quebec excluded.</strong> <code>business.province</code> may not be <code>QC</code>.</li>
          <li><strong>Loan amount:</strong> <code>$50,000</code> ≤ <code>loan.amount</code> ≤ <code>$1,000,000</code> CAD.</li>
          <li><strong>PGI limit:</strong> <code>loan.pgi_limit</code> ≤ 80% of <code>loan.amount</code>; never above <code>$1,000,000</code>.</li>
          <li><strong>Loan type:</strong> <code>loan.q_ca_loan_type</code> ∈ {`{`}<code>"Commercial Mortgage"</code>, <code>"Other Secured Loan"</code>{`}`} only.</li>
          <li><strong>Government ID:</strong> <code>guarantor.q_ca_id_type</code> ∈ {`{`}<code>"Passport"</code>, <code>"National ID"</code>, <code>"Driving Licence"</code>, <code>"Other"</code>{`}`}.</li>
        </ul>
      </div>

      <div className="mb-6 p-3 rounded border border-sky-300/30 bg-sky-500/5">
        <p className="text-sm">
          JSON over HTTPS. Bearer-key auth. CORE Score returned synchronously on submit. v1 (flat) payloads
          remain accepted with a <code>Deprecation: true</code> header — migrate to the v2 nested shape below
          before 2026-12-31.
        </p>
      </div>

      <h2 className="text-lg font-semibold text-sky-100 mb-2 border-b border-sky-300/30 pb-1">Your API keys</h2>
      <div className="mb-6">
        {keysLoading && <div className="text-sm text-sky-200/70">Loading…</div>}
        {!keysLoading && keys.length === 0 && (
          <div className="text-sm text-sky-200/70">
            No API keys yet. <button onClick={() => navigate("/lender/sandbox")} className="underline text-sky-200">Generate one in the Sandbox</button>.
          </div>
        )}
        {!keysLoading && keys.length > 0 && (
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-sky-300/70 border-b border-sky-300/20">
              <tr><th className="py-2 pr-4">Prefix</th><th className="py-2 pr-4">Environment</th><th className="py-2 pr-4">Created</th></tr>
            </thead>
            <tbody>
              {keys.map((k) => (
                <tr key={k.id} className="border-b border-sky-300/10">
                  <td className="py-2 pr-4"><code>{k.prefix}...</code></td>
                  <td className="py-2 pr-4">{k.environment}</td>
                  <td className="py-2 pr-4 text-sky-200/70">{new Date(k.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Language picker */}
      <div className="flex gap-2 mb-3">
        {(Object.keys(SAMPLES) as Lang[]).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`px-3 py-1.5 rounded text-sm border ${lang === l ? "bg-sky-500 text-white border-sky-400" : "bg-sky-500/10 text-sky-100 border-sky-300/40 hover:bg-sky-500/20"}`}
          >
            {SAMPLES[l].label}
          </button>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-sky-100 mb-2 border-b border-sky-300/30 pb-1">Submit an application</h2>
      <p className="text-sm text-sky-200/70 mb-2"><code>POST /api/v1/lender/applications</code></p>
      <pre className="bg-slate-900/70 border border-sky-300/20 rounded p-3 text-xs text-sky-100 overflow-x-auto mb-6"><code>{SAMPLES[lang].submit}</code></pre>

      <h2 className="text-lg font-semibold text-sky-100 mb-2 border-b border-sky-300/30 pb-1">Upload documents</h2>
      <p className="text-sm text-sky-200/70 mb-1"><code>POST /api/v1/lender/applications/&lt;code&gt;/documents</code></p>
      <p className="text-xs text-sky-200/70 mb-2">
        Required <code>doc_types</code>: <code>loan_agreement</code>, <code>profit_loss</code>, <code>balance_sheet</code>, <code>ar_aging</code>, <code>ap_aging</code>.
        If the business started within the last 3 years, also upload <code>founder_cv</code> and <code>financial_forecast</code>.
        5 MB max per file. PDF/DOCX/XLS/XLSX/CSV/MD only.
      </p>
      <pre className="bg-slate-900/70 border border-sky-300/20 rounded p-3 text-xs text-sky-100 overflow-x-auto mb-6"><code>{SAMPLES[lang].docs}</code></pre>

      <h2 className="text-lg font-semibold text-sky-100 mb-2 border-b border-sky-300/30 pb-1">List applications</h2>
      <p className="text-sm text-sky-200/70 mb-2"><code>GET /api/v1/lender/applications</code></p>
      <pre className="bg-slate-900/70 border border-sky-300/20 rounded p-3 text-xs text-sky-100 overflow-x-auto mb-6"><code>{SAMPLES[lang].list}</code></pre>

      <h2 className="text-lg font-semibold text-sky-100 mb-2 border-b border-sky-300/30 pb-1">Status values</h2>
      <p className="text-sm text-sky-200/70 mb-2">The <code>status</code> field on every application uses these canonical values:</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6 text-sm">
        {[
          ["created", "Application exists, not yet submitted by lender"],
          ["in_progress", "Draft being edited"],
          ["ready_for_submission", "Docs accepted, ready to send to carrier"],
          ["submitted", "Forwarded to PGI"],
          ["under_review", "PGI returned a quote (carrier event: application.quoted)"],
          ["information_required", "PGI requested more info"],
          ["approved", "Reserved — PGI uses quote-then-bound"],
          ["declined", "PGI declined"],
          ["policy_issued", "Policy bound — final approval (carrier event: policy.bound)"],
          ["cancelled", "Application cancelled by staff or carrier"],
        ].map(([k, desc]) => (
          <div key={k} className="p-2 rounded bg-sky-500/5 border border-sky-300/20">
            <code className="text-sky-100">{k}</code>
            <div className="text-xs text-sky-200/70 mt-1">{desc}</div>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-sky-100 mb-2 border-b border-sky-300/30 pb-1">Migration from v1</h2>
      <p className="text-sm text-sky-200/70 mb-2">If your integration still uses the flat shape (single-level JSON with <code>annual_revenue</code>, <code>bankruptcy_history</code>, etc.):</p>
      <ul className="text-sm text-sky-200/70 space-y-1 list-disc pl-5 mb-6">
        <li>Group the personal fields under <code>guarantor</code> (add <code>dob</code>, <code>address</code>, <code>q_ca_id_type</code>, <code>q_ca_id_number</code>).</li>
        <li>Group business fields under <code>business</code> (add <code>address</code>, <code>province</code>).</li>
        <li>Group loan fields under <code>loan</code> (add <code>q_ca_loan_type</code>).</li>
        <li>Replace the 3 boolean risk fields with the full 11-key <code>declarations</code> object.</li>
        <li>Financials are now optional under <code>financials</code> — include them to speed up our CORE Score.</li>
        <li>The v1 endpoint still works until <strong>2026-12-31</strong>; the response sets <code>Deprecation: true</code> when it does.</li>
      </ul>
    </div>
  );
}
