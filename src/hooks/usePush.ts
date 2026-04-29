import { apiPost } from "../api/request";

export async function subscribeToPush() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  const registration = await navigator.serviceWorker.ready;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return;
  }

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY
  });

  // BI_WEBSITE_API_PATHS_v53 — server-side push subscription endpoint
  // (/api/v1/push/subscribe) does not exist on BI-Server yet. Browser-side
  // registration above still succeeds; swallow the upstream 404 so the
  // "Enable notifications" button doesn't throw to the user. When BI-Server
  // adds the endpoint, this catch can be removed.
  try {
    await apiPost("/api/v1/push/subscribe", subscription);
  } catch {
    // intentionally swallowed
  }
}
