export function captureCampaign() {

  const params = new URLSearchParams(window.location.search)

  const campaign = {
    source: params.get("utm_source"),
    medium: params.get("utm_medium"),
    campaign: params.get("utm_campaign"),
    term: params.get("utm_term"),
    content: params.get("utm_content"),
    referrer: document.referrer
  }

  localStorage.setItem("bi_campaign", JSON.stringify(campaign))

}
