import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface AnalyticsData {
  total: number;
  today: number;
  referralBreakdown: { referral_code: string; count: string }[];
  sourceBreakdown: { utm_source: string; count: string }[];
  crmStatus: { sent: string; failed: string };
}

export default function MayaAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("BI_ADMIN_TOKEN");

  useEffect(() => {
    if (!token) {
      navigate("/admin-login");
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL}/api/maya-analytics`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => {
        if (!res.ok) {
          localStorage.removeItem("BI_ADMIN_TOKEN");
          navigate("/admin-login");
          return null;
        }
        return res.json();
      })
      .then((json) => {
        if (json) setData(json);
      });
  }, []);

  function handleLogout() {
    localStorage.removeItem("BI_ADMIN_TOKEN");
    navigate("/admin-login");
  }

  if (!data) return <div style={{ padding: 40 }}>Loading...</div>;

  return (
    <div style={{ padding: 40 }}>
      <h1>Maya Chat Analytics</h1>

      <button
        onClick={handleLogout}
        className="mb-5 bg-brand-bg text-white border-none py-2 px-[14px] cursor-pointer"
      >
        Logout
      </button>

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

      <h2>By Referral</h2>
      <ul>
        {data.referralBreakdown?.map((r, i) => (
          <li key={i}>
            {r.referral_code || "None"} — {r.count}
          </li>
        ))}
      </ul>

      <h2>By Source</h2>
      <ul>
        {data.sourceBreakdown?.map((s, i) => (
          <li key={i}>
            {s.utm_source || "Direct"} — {s.count}
          </li>
        ))}
      </ul>
    </div>
  );
}
