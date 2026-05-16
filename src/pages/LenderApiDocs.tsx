// BI_WEBSITE_BLOCK_v127_BRAND_TRIM_AND_API_LABEL_v1
// BI_WEBSITE_BLOCK_v90_LENDER_API_DOCS_v1
import { useState } from "react";

// BI_WEBSITE_BLOCK_v94_LAUNCH_HARDENING_v1
// API URL is environment-driven so we can swap to a custom domain (e.g.
// api.boreal.financial) without a code change.
const BI_SERVER = (import.meta.env.VITE_BI_API_URL as string | undefined) ?? "https://bi-server-cse0apamgkheb9d5.canadacentral-01.azurewebsites.net";

// BI_WEBSITE_BLOCK_BI_ROUND7_API_DOCS_v1 -- per-language code
// samples extended with a `docs` example for the post-Block-27
// documents endpoint. Multipart form upload with `files` (multi)
// + parallel `doc_types`; mirrors the BI-Website lender form's
// own upload path.
const SAMPLES: Record<string, { label: string; submit: string; list: string; docs: string }> = {
  curl: {
    label: "cURL",
    submit: `curl -X POST ${BI_SERVER}/api/v1/lender/applications \\
  -H "Authorization: Bearer bk_xxxxxxxx.yyyyyyyyyyyyyyyy" \\
  -H "Content-Type: application/json" \\
  -d '{
    "country": "CA",
    "naics_code": "541511",
    "formation_date": "2022-05-01",
    "loan_amount": 500000,
    "pgi_limit": 400000,
    "annual_revenue": 3000000,
    "ebitda": 400000,
    "total_debt": 600000,
    "monthly_debt_service": 7800,
    "collateral_value": 1200000,
    "enterprise_value": 20000000,
    "guarantor_name": "Sarah Chen",
    "guarantor_email": "sarah.chen@maple.example",
    "business_name": "Maple Leaf Industries Inc.",
    "lender_name": "Acme Bank",
    "bankruptcy_history": false,
    "insolvency_history": false,
    "judgment_history": false
  }'`,
    list: `curl ${BI_SERVER}/api/v1/lender/applications \\
  -H "Authorization: Bearer bk_xxxxxxxx.yyyyyyyyyyyyyyyy"`,
    docs: `# Upload required documents. Take the application_code from the POST response.
curl -X POST ${BI_SERVER}/api/v1/lender/applications/PGI-A1B2C3D4/documents \\
  -H "Authorization: Bearer bk_xxxxxxxx.yyyyyyyyyyyyyyyy" \\
  -F "files=@./guarantor_id.pdf" \\
  -F "doc_types=guarantor_id" \\
  -F "files=@./financial_statements_2024.pdf" \\
  -F "doc_types=financial_statements"

# Inspect what's been uploaded.
curl ${BI_SERVER}/api/v1/lender/applications/PGI-A1B2C3D4/documents \\
  -H "Authorization: Bearer bk_xxxxxxxx.yyyyyyyyyyyyyyyy"`,
  },
  node: {
    label: "Node.js",
    submit: `const res = await fetch(
  "${BI_SERVER}/api/v1/lender/applications",
  {
    method: "POST",
    headers: {
      Authorization: "Bearer " + process.env.BI_LENDER_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      country: "CA",
      naics_code: "541511",
      formation_date: "2022-05-01",
      loan_amount: 500000,
      pgi_limit: 400000,
      annual_revenue: 3000000,
      ebitda: 400000,
      total_debt: 600000,
      monthly_debt_service: 7800,
      collateral_value: 1200000,
      enterprise_value: 20000000,
      guarantor_name: "Sarah Chen",
      guarantor_email: "sarah.chen@maple.example",
      business_name: "Maple Leaf Industries Inc.",
      lender_name: "Acme Bank",
      bankruptcy_history: false,
      insolvency_history: false,
      judgment_history: false,
    }),
  }
);
const result = await res.json();
// result.application_code is what /documents and /timeline expect.`,
    list: `const res = await fetch(
  "${BI_SERVER}/api/v1/lender/applications",
  { headers: { Authorization: "Bearer " + process.env.BI_LENDER_KEY } }
);
const list = await res.json();`,
    docs: `import fs from "node:fs";
const fd = new FormData();
fd.append("files", new Blob([fs.readFileSync("./guarantor_id.pdf")]), "guarantor_id.pdf");
fd.append("doc_types", "guarantor_id");
fd.append("files", new Blob([fs.readFileSync("./financials.pdf")]), "financials.pdf");
fd.append("doc_types", "financial_statements");

const res = await fetch(
  "${BI_SERVER}/api/v1/lender/applications/" + applicationCode + "/documents",
  {
    method: "POST",
    headers: { Authorization: "Bearer " + process.env.BI_LENDER_KEY },
    body: fd,
  }
);
const uploaded = await res.json();
// uploaded.documents[i] = { id, doc_type, filename }`,
  },
  python: {
    label: "Python",
    submit: `import os, requests
r = requests.post(
    "${BI_SERVER}/api/v1/lender/applications",
    headers={"Authorization": f"Bearer {os.environ['BI_LENDER_KEY']}"},
    json={
        "country": "CA",
        "naics_code": "541511",
        "formation_date": "2022-05-01",
        "loan_amount": 500000,
        "pgi_limit": 400000,
        "annual_revenue": 3000000,
        "ebitda": 400000,
        "total_debt": 600000,
        "monthly_debt_service": 7800,
        "collateral_value": 1200000,
        "enterprise_value": 20000000,
        "guarantor_name": "Sarah Chen",
        "guarantor_email": "sarah.chen@maple.example",
        "business_name": "Maple Leaf Industries Inc.",
        "lender_name": "Acme Bank",
        "bankruptcy_history": False,
        "insolvency_history": False,
        "judgment_history": False,
    },
)
result = r.json()
# result["application_code"] is what /documents and /timeline expect.`,
    list: `import os, requests
r = requests.get(
    "${BI_SERVER}/api/v1/lender/applications",
    headers={"Authorization": f"Bearer {os.environ['BI_LENDER_KEY']}"},
)
applications = r.json()`,
    docs: `import os, requests

with open("guarantor_id.pdf", "rb") as a, open("financials.pdf", "rb") as b:
    files = [
        ("files", ("guarantor_id.pdf", a, "application/pdf")),
        ("doc_types", (None, "guarantor_id")),
        ("files", ("financials.pdf", b, "application/pdf")),
        ("doc_types", (None, "financial_statements")),
    ]
    r = requests.post(
        f"${BI_SERVER}/api/v1/lender/applications/{application_code}/documents",
        headers={"Authorization": f"Bearer {os.environ['BI_LENDER_KEY']}"},
        files=files,
    )
uploaded = r.json()
# uploaded["documents"][i] = {"id", "doc_type", "filename"}`,
  },
};

export default function LenderApiDocs() {
  const [tab, setTab] = useState<keyof typeof SAMPLES>("curl");
  const sample = SAMPLES[tab];
  return (
    <main className="min-h-screen bg-bf-bg px-6 py-12 text-white">
      <div className="mx-auto max-w-4xl">
        <header className="mb-10">
          <div className="text-xs uppercase tracking-widest text-bf-textMuted">BI Lender API · v1</div>
          <h1 className="mt-2 text-4xl font-bold">Boreal Risk Lender API</h1>
          <p className="mt-3 text-bf-textMuted">
            Submit Personal Guarantee Insurance (PGI) applications programmatically.
            JSON over HTTPS. Bearer-key auth. CORE Score returned synchronously.
          </p>
        </header>

        <Section title="Quickstart">
          <ol className="ml-6 list-decimal space-y-2 text-bf-textMuted">
            {/* BI_WEBSITE_BLOCK_BI_ROUND7_API_DOCS_v1 -- step 4
                rewritten. The previous text confused the lender
                API flow (end-to-end carrier-direct) with the
                BI-Website public applicant flow. Lenders submit
                all required fields in a single POST; supporting
                documents are uploaded directly via the documents
                endpoint -- no borrower handoff. */}
            <li>Boreal staff mint your API key in the Portal (BI silo &gt; Lenders &gt; Manage).</li>
            <li>Store it as <code className="rounded bg-bf-surface px-1">BI_LENDER_KEY</code> — shown <strong>once</strong>.</li>
            <li>Submit applications to <code className="rounded bg-bf-surface px-1">{BI_SERVER}/api/v1/lender/applications</code>. The response includes the CORE Score and an <code className="rounded bg-bf-surface px-1">application_code</code>.</li>
            <li>Upload supporting documents to <code className="rounded bg-bf-surface px-1">{BI_SERVER}/api/v1/lender/applications/:code/documents</code> using the <code className="rounded bg-bf-surface px-1">application_code</code> from step 3. Poll <code className="rounded bg-bf-surface px-1">/timeline</code> for carrier-side events.</li>
          </ol>
        </Section>

        <Section title="Authentication">
          <p className="text-bf-textMuted">
            Every request requires <code className="rounded bg-bf-surface px-1">Authorization: Bearer bk_*</code>.
            Keys look like <code className="rounded bg-bf-surface px-1">bk_a1b2c3d4.e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6</code>.
            Treat them as passwords; never embed in client code.
          </p>
        </Section>

        <Section title="Code samples">
          <div className="mb-3 flex gap-2">
            {(Object.keys(SAMPLES) as Array<keyof typeof SAMPLES>).map((k) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`rounded-full px-4 py-2 text-sm ${tab === k ? "bg-bf-cta text-white" : "bg-bf-surface text-bf-textMuted hover:bg-bf-surfaceAlt"}`}
              >
                {SAMPLES[k].label}
              </button>
            ))}
          </div>
          <div className="rounded-lg border border-card bg-bf-surface p-4">
            <div className="mb-2 text-xs uppercase tracking-widest text-bf-textMuted">POST /api/v1/lender/applications</div>
            <pre className="overflow-x-auto text-sm">{sample.submit}</pre>
          </div>
          <div className="mt-4 rounded-lg border border-card bg-bf-surface p-4">
            <div className="mb-2 text-xs uppercase tracking-widest text-bf-textMuted">GET /api/v1/lender/applications</div>
            <pre className="overflow-x-auto text-sm">{sample.list}</pre>
          </div>
          {/* BI_WEBSITE_BLOCK_BI_ROUND7_API_DOCS_v1 -- documents
              upload + list. Block 27 server-side; this is the
              first integration-partner-facing reference. */}
          <div className="mt-4 rounded-lg border border-card bg-bf-surface p-4">
            <div className="mb-2 text-xs uppercase tracking-widest text-bf-textMuted">POST + GET /api/v1/lender/applications/:code/documents</div>
            <pre className="overflow-x-auto text-sm">{sample.docs}</pre>
          </div>
        </Section>

        <Section title="Endpoints">
          <Endpoint
            method="POST"
            path="/api/v1/lender/applications"
            desc="Submit a new PGI application + run the CORE score in one call. Returns bare JSON with application IDs, status, score, and PGI forwarding state."
            body={[
              ["country",              "string  required. CA only (US coming)"],
              ["naics_code",           "string  required. 6-digit NAICS-2022"],
              ["formation_date",       "string  required. YYYY-MM-DD"],
              ["loan_amount",          "number  required. CAD. Carrier (PGI) currently caps at $1,000,000 -- server forwards but the carrier may reject larger amounts."],
              ["pgi_limit",            "number  required. CAD. Carrier (PGI) currently caps at 80% of loan_amount; over that returns pgi_error in the response."],
              ["annual_revenue",       "number  required. CAD"],
              ["ebitda",               "number  required. CAD, min $50,000"],
              ["total_debt",           "number  required. CAD"],
              ["monthly_debt_service", "number  required. CAD"],
              ["collateral_value",     "number  required. CAD"],
              ["enterprise_value",     "number  required. CAD"],
              ["guarantor_name",       "string  recommended. Full legal name. Carrier rejects empty."],
              ["guarantor_email",      "string  recommended. RFC 5322 email."],
              ["business_name",        "string  recommended. Legal entity name. Carrier rejects empty."],
              ["lender_name",          "string  optional. Defaults to your registered company_name."],
              ["bankruptcy_history",   "boolean optional. Default false."],
              ["insolvency_history",   "boolean optional. Default false."],
              ["judgment_history",     "boolean optional. Default false."],
            ]}
          />
          <Endpoint
            method="GET"
            path="/api/v1/lender/applications"
            desc="List applications submitted under this key. Scoped to your lender."
          />
          {/* BI_WEBSITE_BLOCK_v176_LENDER_API_DOCS_ACCURACY_v1 — missing endpoints */}
          <Endpoint
            method="GET"
            path="/api/v1/lender/applications/mine"
            desc="List your applications with paging and stage info. Same scope as above; richer response shape (status, carrier_received_at, last carrier event)."
          />
          <Endpoint
            method="GET"
            path="/api/v1/lender/applications/:code/timeline"
            desc="Activity events for one application. Use the application_code returned by POST. Owner-scoped — 404 if the code isn't under your key. Returns {application_code, events:[{event_type, summary, meta, created_at}]}."
          />
          {/* BI_WEBSITE_BLOCK_BI_ROUND7_API_DOCS_v1 -- documents
              endpoints (Block 27 server-side). */}
          <Endpoint
            method="POST"
            path="/api/v1/lender/applications/:code/documents"
            desc="Upload one or more supporting documents for an application you own. multipart/form-data with parallel `files` and `doc_types` fields (5 MB per file max, PGI carrier policy). Owner-scoped via your API key. Allowed while the application is in ready_for_submission or submitted; returns 409 wrong_status once staff has moved it to document_review or beyond. Returns {ok:true, documents:[{id, doc_type, filename}]}."
            body={[
              ["files",        "file[]  required. One or more files. Each file <= 5 MB."],
              ["doc_types",    "string[] required. Parallel array to files (same index = same row). Examples: guarantor_id, financial_statements, bank_statement, tax_return, articles_of_incorporation."],
            ]}
          />
          <Endpoint
            method="GET"
            path="/api/v1/lender/applications/:code/documents"
            desc="List documents you have uploaded for an application. Excludes purged rows. Returns {application_code, documents:[{id, doc_type, filename, bytes, mime_type, created_at}]}."
          />
        </Section>

        {/* BI_WEBSITE_BLOCK_v176_LENDER_API_DOCS_ACCURACY_v1 — real shape */}
        <Section title="Response shape (POST)">
          <div className="rounded-lg border border-card bg-bf-surface p-4">
            <p className="mb-3 text-sm text-bf-textMuted">
              Bare JSON, no envelope. HTTP 201 on success. On decline (HTTP 422)
              the body is <code>{"{ error: \"score_declined\", reason, score_id }"}</code>.
            </p>
            <pre className="overflow-x-auto text-sm">{`{
  "public_id": "PGI-A1B2C3D4",
  "application_id": "uuid",
  "application_code": "PGI-A1B2C3D4",
  "status": "submitted",
  "score_id": "score-uuid",
  "score": 87,
  "pgi_application_id": "carrier-app-id-or-null",
  "pgi_status": "received",
  "pgi_error": null
}`}</pre>
            <p className="mt-3 text-sm text-bf-textMuted">
              {/* BI_WEBSITE_BLOCK_BI_ROUND7_API_DOCS_v1 --
                  application_code added to the example + the
                  forward-going identifier callout below. Today
                  application_code equals public_id; that may
                  diverge in a future release, so partners should
                  use application_code for downstream calls. */}
              Use <code>application_code</code> for follow-up calls
              (<code>/documents</code>, <code>/timeline</code>). Today it equals
              <code> public_id</code> but treat it as the lender-facing identifier
              going forward. <code>status</code> is <code>"submitted"</code> when
              the auto-forward to the carrier (PGI) succeeded,
              <code> "ready_for_submission"</code> if the carrier call failed
              (inspect <code>pgi_error</code>). Poll
              <code> GET /api/v1/lender/applications/:code/timeline</code> for
              carrier events thereafter.
            </p>
          </div>
        </Section>

        <Section title="Errors">
          <div className="rounded-lg border border-card bg-bf-surface p-4">
            <table className="w-full text-sm">
              <thead className="text-bf-textMuted">
                <tr><th className="py-2 text-left">Status</th><th className="py-2 text-left">Code</th><th className="py-2 text-left">Meaning</th></tr>
              </thead>
              <tbody>
                {/* BI_WEBSITE_BLOCK_v176_LENDER_API_DOCS_ACCURACY_v1 */}
                <tr><td className="py-2">400</td><td className="py-2"><code>missing_fields</code></td><td className="py-2">Required score fields absent. <code>fields</code> array enumerates which.</td></tr>
                <tr><td className="py-2">400</td><td className="py-2"><code>country_unsupported</code></td><td className="py-2">Currently only Canada is supported.</td></tr>
                <tr><td className="py-2">400</td><td className="py-2"><code>ebitda_below_min</code></td><td className="py-2">EBITDA must be at least $50,000 CAD.</td></tr>
                <tr><td className="py-2">401</td><td className="py-2"><code>missing_api_key</code> / <code>invalid_api_key</code></td><td className="py-2">Bearer header missing, malformed, or revoked.</td></tr>
                {/* BI_WEBSITE_BLOCK_BI_ROUND7_API_DOCS_v1 */}
                <tr><td className="py-2">404</td><td className="py-2"><code>not_found</code></td><td className="py-2">Application code unknown or not under your key. Common on <code>/documents</code> and <code>/timeline</code> calls with a typo or another lender's code.</td></tr>
                <tr><td className="py-2">409</td><td className="py-2"><code>wrong_status</code></td><td className="py-2">Document upload attempted after the application moved past <code>submitted</code>. Body includes <code>current</code> status. Staff have taken over the document set at this point.</td></tr>
                <tr><td className="py-2">422</td><td className="py-2"><code>score_declined</code></td><td className="py-2">CORE Score declined. Body includes <code>reason</code> and <code>score_id</code>; no application row is created.</td></tr>
                <tr><td className="py-2">429</td><td className="py-2"><code>rate_limited</code></td><td className="py-2">More than 60 requests/min per key. Retry after <code>Retry-After</code> header (seconds).</td></tr>
              </tbody>
            </table>
          </div>
        </Section>

        <footer className="mt-16 border-t border-card pt-8 text-sm text-bf-textMuted">
          Need help? Email <a href="mailto:integrations@boreal.financial" className="text-bf-cta underline">integrations@boreal.financial</a>.
        </footer>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="mb-10"><h2 className="mb-3 text-2xl font-semibold">{title}</h2>{children}</section>;
}

function Endpoint({ method, path, desc, body }: { method: string; path: string; desc: string; body?: Array<[string, string]> }) {
  return (
    <div className="mb-4 rounded-lg border border-card bg-bf-surface p-4">
      <div className="mb-1 flex items-center gap-3">
        <span className="rounded bg-bf-cta px-2 py-0.5 text-xs font-bold">{method}</span>
        <code className="text-sm">{path}</code>
      </div>
      <p className="text-sm text-bf-textMuted">{desc}</p>
      {body && (
        <table className="mt-3 w-full text-sm">
          <tbody>
            {body.map(([f, t]) => (
              <tr key={f}><td className="py-1 pr-4 font-mono">{f}</td><td className="py-1 text-bf-textMuted">{t}</td></tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
