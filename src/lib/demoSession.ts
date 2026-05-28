import type { NavigateFunction } from "react-router-dom";

const KEY_TOKEN = "bi.lender_token";
const KEY_BACKUP = "bi.real_token_backup";
const KEY_DEMO_FLAG = "bi.is_demo_session";
const KEY_DEMO_STARTED = "bi.demo_session_started_at";

export function isInDemoSession(): boolean {
  try { return localStorage.getItem(KEY_DEMO_FLAG) === "1"; } catch { return false; }
}

export function enterDemoSession(realToken: string): void {
  try {
    const existingBackup = localStorage.getItem(KEY_BACKUP);
    if (!existingBackup && realToken) {
      localStorage.setItem(KEY_BACKUP, realToken);
    }
    if (localStorage.getItem(KEY_DEMO_FLAG) !== "1") {
      localStorage.setItem(KEY_DEMO_FLAG, "1");
      localStorage.setItem(KEY_DEMO_STARTED, new Date().toISOString());
    }
  } catch { }
}

export async function exitDemoSession(opts: { apiBase: string; navigate?: NavigateFunction; reload?: () => void } = { apiBase: "" }): Promise<"restored" | "no_session" | "fallback_logout"> {
  const inDemo = isInDemoSession();
  const startedAt = (() => { try { return localStorage.getItem(KEY_DEMO_STARTED) || ""; } catch { return ""; } })();
  const demoToken = (() => { try { return localStorage.getItem(KEY_TOKEN) || ""; } catch { return ""; } })();
  const backup = (() => { try { return localStorage.getItem(KEY_BACKUP) || ""; } catch { return ""; } })();

  if (!inDemo && !backup) return "no_session";

  if (inDemo && startedAt && demoToken && opts.apiBase) {
    try {
      await fetch(`${opts.apiBase}/api/v1/bi/lender/demo/cleanup`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${demoToken}` },
        body: JSON.stringify({ session_started_at: startedAt }),
      });
    } catch (err) {
      console.warn("[demo] cleanup endpoint unavailable; proceeding", err);
    }
  }

  try {
    if (backup) {
      localStorage.setItem(KEY_TOKEN, backup);
      localStorage.removeItem(KEY_BACKUP);
      localStorage.removeItem(KEY_DEMO_FLAG);
      localStorage.removeItem(KEY_DEMO_STARTED);
      if (opts.reload) opts.reload();
      else if (opts.navigate) opts.navigate("/lender/portal", { replace: true });
      return "restored";
    }
    localStorage.removeItem(KEY_TOKEN);
    localStorage.removeItem(KEY_BACKUP);
    localStorage.removeItem(KEY_DEMO_FLAG);
    localStorage.removeItem(KEY_DEMO_STARTED);
    if (opts.navigate) opts.navigate("/lender/login", { replace: true });
    else if (opts.reload) opts.reload();
    return "fallback_logout";
  } catch {
    return "fallback_logout";
  }
}
