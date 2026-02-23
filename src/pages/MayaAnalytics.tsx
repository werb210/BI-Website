import { useEffect, useState } from "react";

interface AnalyticsData {
  total: number;
  today: number;
  referralBreakdown: { referral_code: string; count: string }[];
  sourceBreakdown: { utm_source: string; count: string }[];
  crmStatus: { sent: string; failed: string };
}

export default function MayaAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/maya-analytics`)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;
  if (!data) return <div style={{ padding: 40 }}>Failed to load data.</div>;

  return (
    <div style={{ padding: 40 }}>
      <h1>Maya Chat Analytics</h1>

      <div style={{ marginBottom: 30 }}>
        <h2>Overview</h2>
        <p>
          <strong>Total Leads:</strong> {data.total}
        </p>
        <p>
          <strong>Leads Today:</strong> {data.today}
        </p>
        <p>
          <strong>CRM Sent:</strong> {data.crmStatus?.sent || 0} |{" "}
          <strong>Failed:</strong> {data.crmStatus?.failed || 0}
        </p>
      </div>

      <div style={{ marginBottom: 30 }}>
        <h2>Leads by Referral Code</h2>
        <ul>
          {data.referralBreakdown?.map((r, i) => (
            <li key={i}>
              {r.referral_code || "None"} — {r.count}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2>Leads by UTM Source</h2>
        <ul>
          {data.sourceBreakdown?.map((s, i) => (
            <li key={i}>
              {s.utm_source || "Direct"} — {s.count}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
