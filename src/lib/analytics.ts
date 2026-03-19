const GA_ID = import.meta.env.VITE_GA_ID;
const LINKEDIN_ID = import.meta.env.VITE_LINKEDIN_ID;
const UET_ID = import.meta.env.VITE_UET_ID;

export function initAnalytics() {
  if (typeof window === "undefined") {
    return;
  }

  if (GA_ID) {
    const gtagScript = document.createElement("script");
    gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    gtagScript.async = true;
    document.head.appendChild(gtagScript);

    (window as any).dataLayer = (window as any).dataLayer || [];
    const gtag = (...args: any[]) => {
      (window as any).dataLayer.push(args);
    };

    (window as any).gtag = gtag;
    gtag("js", new Date());
    gtag("config", GA_ID);
  }

  if (LINKEDIN_ID) {
    (window as any)._linkedin_partner_id = LINKEDIN_ID;
    (window as any)._linkedin_data_partner_ids =
      (window as any)._linkedin_data_partner_ids || [];
    (window as any)._linkedin_data_partner_ids.push(LINKEDIN_ID);

    const liScript = document.createElement("script");
    liScript.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
    liScript.async = true;
    document.head.appendChild(liScript);
  }

  if (UET_ID) {
    const uetScript = document.createElement("script");
    uetScript.src = "https://bat.bing.com/bat.js";
    uetScript.async = true;
    document.head.appendChild(uetScript);

    (window as any).uetq = (window as any).uetq || [];
    (window as any).uetq.push("pageLoad");
  }
}

export function track(event: string, data?: Record<string, any>) {
  if ((window as any).gtag) {
    (window as any).gtag("event", event, data || {});
  }

  if ((window as any).uetq) {
    (window as any).uetq.push("event", event);
  }

  console.log("Tracked:", event, data);
}
