export function trackConversion(event: string, data: any = {}) {

  const payload = {
    event,
    timestamp: Date.now(),
    campaign: JSON.parse(localStorage.getItem("bi_campaign") || "{}"),
    referrer: localStorage.getItem("bi_referrer_code"),
    data
  }

  fetch("/api/bi/marketing-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).catch(()=>{})

}
