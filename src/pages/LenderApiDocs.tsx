// BI_WEBSITE_BLOCK_v88_LENDER_API_DOCS_v1
import { useState } from "react";

const SAMPLES: Record<string, { label: string; createApp: string; getApp: string }> = {
  curl: {
    label: "cURL",
    createApp: `curl -X POST https://server.boreal.financial/api/lender-api/v1/applications \\
  -H "Authorization: Bearer lk_xxxx.yyyyyyyy" \\
  -H "Content-Type: application/json" \\
  -d '{
    "business_name": "Acme Hardware Ltd.",
    "contact_email": "owner@acme.example",
    "loan_amount": 250000
  }'`,
    getApp: `curl https://server.boreal.financial/api/lender-api/v1/applications/<id> \\
  -H "Authorization: Bearer lk_xxxx.yyyyyyyy"`,
  },
  node: {
    label: "Node.js",
    createApp: `const res = await fetch(
  "https://server.boreal.financial/api/lender-api/v1/applications",
  {
    method: "POST",
    headers: {
      Authorization: "Bearer " + process.env.BOREAL_LENDER_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      business_name: "Acme Hardware Ltd.",
      contact_email: "owner@acme.example",
      loan_amount: 250000,
    }),
  }
);
const app = await res.json();`,
    getApp: `const res = await fetch(
  \`https://server.boreal.financial/api/lender-api/v1/applications/\${id}\`,
  { headers: { Authorization: "Bearer " + process.env.BOREAL_LENDER_KEY } }
);
const app = await res.json();`,
  },
  python: {
    label: "Python",
    createApp: `import os, requests
r = requests.post(
    "https://server.boreal.financial/api/lender-api/v1/applications",
    headers={"Authorization": f"Bearer {os.environ['BOREAL_LENDER_KEY']}"},
    json={
        "business_name": "Acme Hardware Ltd.",
        "contact_email": "owner@acme.example",
        "loan_amount": 250000,
    },
)
app = r.json()`,
    getApp: `import os, requests
r = requests.get(
    f"https://server.boreal.financial/api/lender-api/v1/applications/{id}",
    headers={"Authorization": f"Bearer {os.environ['BOREAL_LENDER_KEY']}"},
)
app = r.json()`,
  },
};

export default function LenderApiDocs() {
  const [tab, setTab] = useState<keyof typeof SAMPLES>("curl");
  const sample = SAMPLES[tab];
  return (
    <main className="min-h-screen bg-bf-bg px-6 py-12 text-white">
      <div className="mx-auto max-w-4xl">
        <header className="mb-10">
          <div className="text-xs uppercase tracking-widest text-bf-textMuted">Lender API · v1</div>
          <h1 className="mt-2 text-4xl font-bold">Boreal Insurance Lender API</h1>
          <p className="mt-3 text-bf-textMuted">
            Submit applications programmatically and check status. RESTful JSON over HTTPS.
            Bearer-key authentication. 60 requests / minute / key by default.
          </p>
        </header>

        <Section title="Quickstart">
          <ol className="ml-6 list-decimal space-y-2 text-bf-textMuted">
            <li>Ask Boreal staff to mint an API key for your lender.</li>
            <li>Store the secret as <code className="rounded bg-bf-surface px-1">BOREAL_LENDER_KEY</code> — it's shown <strong>once</strong>.</li>
            <li>Call <code className="rounded bg-bf-surface px-1">GET /api/lender-api/me</code> to confirm the key works.</li>
            <li>Submit applications via <code className="rounded bg-bf-surface px-1">POST /api/lender-api/v1/applications</code>.</li>
          </ol>
        </Section>

        <Section title="Authentication">
          <p className="text-bf-textMuted">
            Every request requires a <code className="rounded bg-bf-surface px-1">Authorization: Bearer lk_*</code> header.
            Keys are issued per-lender and look like <code className="rounded bg-bf-surface px-1">lk_a1b2c3d4.{'<32 hex>'}</code>.
            Treat them like passwords.
          </p>
          <div className="mt-3 rounded-lg border border-card bg-bf-surface p-4 text-sm">
            <pre className="overflow-x-auto">{`Authorization: Bearer lk_a1b2c3d4.f0e1d2c3b4a5968778899aabbccddeeff`}</pre>
          </div>
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
            <div className="mb-2 text-xs uppercase tracking-widest text-bf-textMuted">POST /v1/applications</div>
            <pre className="overflow-x-auto text-sm">{sample.createApp}</pre>
          </div>
          <div className="mt-4 rounded-lg border border-card bg-bf-surface p-4">
            <div className="mb-2 text-xs uppercase tracking-widest text-bf-textMuted">GET /v1/applications/:id</div>
            <pre className="overflow-x-auto text-sm">{sample.getApp}</pre>
          </div>
        </Section>

        <Section title="Endpoints">
          <Endpoint
            method="POST"
            path="/api/lender-api/v1/applications"
            desc="Create a new application. Returns 201 with the created application's id and status."
            body={[
              ["business_name",  "string  (required)"],
              ["contact_email",  "string  (required, email)"],
              ["contact_name",   "string  (optional)"],
              ["contact_phone",  "string  (optional, E.164)"],
              ["loan_amount",    "number  (required, positive)"],
              ["product_id",     "uuid    (optional)"],
              ["metadata",       "object  (optional)"],
            ]}
          />
          <Endpoint
            method="GET"
            path="/api/lender-api/v1/applications/:id"
            desc="Fetch an application by id. Scoped to your lender — you'll get 404 if it belongs to someone else."
          />
          <Endpoint
            method="GET"
            path="/api/lender-api/me"
            desc="Verify your key and get your lender record."
          />
        </Section>

        <Section title="Errors">
          <div className="rounded-lg border border-card bg-bf-surface p-4">
            <table className="w-full text-sm">
              <thead className="text-bf-textMuted">
                <tr><th className="py-2 text-left">Status</th><th className="py-2 text-left">Code</th><th className="py-2 text-left">Meaning</th></tr>
              </thead>
              <tbody>
                <tr><td className="py-2">400</td><td className="py-2"><code>validation_error</code></td><td className="py-2">Body missing required fields or wrong types.</td></tr>
                <tr><td className="py-2">401</td><td className="py-2"><code>missing_token</code> / <code>invalid_token</code></td><td className="py-2">Bearer header missing, malformed, or revoked.</td></tr>
                <tr><td className="py-2">404</td><td className="py-2"><code>not_found</code></td><td className="py-2">Application doesn't exist or belongs to another lender.</td></tr>
                <tr><td className="py-2">429</td><td className="py-2"><code>rate_limited</code></td><td className="py-2">Exceeded 60 req/min. Retry after the <code>retry-after</code> header.</td></tr>
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
  return (
    <section className="mb-10">
      <h2 className="mb-3 text-2xl font-semibold">{title}</h2>
      {children}
    </section>
  );
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
