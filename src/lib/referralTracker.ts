export function captureReferral() {

  const params = new URLSearchParams(window.location.search)

  const code = params.get("ref")

  if (code) {
    localStorage.setItem("bi_referrer_code", code)
  }

}
