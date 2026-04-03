export function trackConversion(event: string, data: any = {}) {

  const payload = {
    event,
    timestamp: Date.now(),
    campaign: JSON.parse(localStorage.getItem("bi_campaign") || "{}"),
    referrer: localStorage.getItem("bi_referrer_code"),
    data
  }

  fetch("/api/v1/marketing-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include"
  }).catch(()=>{})

}
