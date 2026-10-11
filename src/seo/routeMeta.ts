// BI_WEBSITE_BLOCK_v789_AUDIT_ROUND2 [140][146]
// One list of the site's routes and their head tags. It drives:
//   - the tags applied on every client-side navigation (src/seo/RouteMeta.tsx)
//   - dist/sitemap.xml and the dist/<route>/index.html files written after
//     the build (seoBuildPlugin in vite.config.ts)
// It is imported by vite.config.ts, so it must stay free of React and of
// anything browser-only.
export const SITE_ORIGIN = "https://boreal.insure";
export const SITE_NAME = "Boreal Risk Management";
export const OG_IMAGE = `${SITE_ORIGIN}/og.png`;

export type RouteEntry = {
  path: string;
  title: string;
  description: string;
  // Listed in sitemap.xml. Every sitemap route is indexable.
  sitemap: boolean;
  noindex?: boolean;
};

const DEFAULT_DESCRIPTION =
  "Personal Guarantee Insurance for Canadian and United States business owners. Protect your personal assets when securing business financing. Get a quote in minutes.";

// Every App.tsx route without a URL parameter. src/__tests__/seo.v789.test.ts
// fails if App.tsx gains a route this list does not cover.
export const ROUTES: RouteEntry[] = [
  { path: "/", title: `${SITE_NAME} - Personal Guarantee Insurance for Business Owners`, description: DEFAULT_DESCRIPTION, sitemap: true },
  { path: "/quote", title: `Get a PGI Quote | ${SITE_NAME}`, description: "Estimate the monthly premium for Personal Guarantee Insurance on your business loan in under a minute.", sitemap: true },
  { path: "/what-is-pgi", title: `What is Personal Guarantee Insurance? | ${SITE_NAME}`, description: "How Personal Guarantee Insurance protects your home and savings when you personally guarantee a business loan.", sitemap: true },
  { path: "/how-it-works", title: `How PGI Works | ${SITE_NAME}`, description: "From quote to policy: how Personal Guarantee Insurance is arranged and how a claim is paid.", sitemap: true },
  { path: "/coverage", title: `Coverage | ${SITE_NAME}`, description: "What Personal Guarantee Insurance covers, coverage limits and the loans it can protect.", sitemap: true },
  { path: "/why-it-matters", title: `Why PGI Matters | ${SITE_NAME}`, description: "Why business owners insure their personal guarantee before signing for business financing.", sitemap: true },
  { path: "/csbfp", title: `The Personal Guarantee on a CSBFP Loan | ${SITE_NAME}`, description: "How the personal guarantee on a Canada Small Business Financing Program loan works and how to insure it.", sitemap: true },
  { path: "/resources", title: `Knowledge Centre | ${SITE_NAME}`, description: "Guides and answers about personal guarantees, business loans and Personal Guarantee Insurance.", sitemap: true },
  { path: "/faq", title: `Frequently Asked Questions | ${SITE_NAME}`, description: "Answers to common questions about Personal Guarantee Insurance, eligibility, pricing and claims.", sitemap: true },
  { path: "/contact", title: `Contact Us | ${SITE_NAME}`, description: "Talk to Boreal Insurance about Personal Guarantee Insurance. Call (866) 631-8939 or send us a message.", sitemap: true },
  { path: "/privacy", title: `Privacy Policy | ${SITE_NAME}`, description: "How 2630108 Alberta Ltd. (Boreal Insurance) collects, uses and protects personal information, including cookies.", sitemap: true },
  { path: "/terms", title: `Terms of Service | ${SITE_NAME}`, description: "The terms that govern your use of boreal.insure.", sitemap: true },
  { path: "/delete-account", title: `Delete Your Account | ${SITE_NAME}`, description: "How to delete your Boreal Risk account and the personal information attached to it.", sitemap: true },
  { path: "/intro", title: `Protect Your Personal Assets | ${SITE_NAME}`, description: DEFAULT_DESCRIPTION, sitemap: false, noindex: true },
  { path: "/applications/new", title: `Get Started | ${SITE_NAME}`, description: "Start your Personal Guarantee Insurance application.", sitemap: false, noindex: true },
  { path: "/applications/new/country", title: `Get Started | ${SITE_NAME}`, description: "Start your Personal Guarantee Insurance application.", sitemap: false, noindex: true },
  { path: "/applications/new/score", title: `Your Application | ${SITE_NAME}`, description: "Start your Personal Guarantee Insurance application.", sitemap: false, noindex: true },
  { path: "/application", title: `Get Started | ${SITE_NAME}`, description: "Start your Personal Guarantee Insurance application.", sitemap: false, noindex: true },
  { path: "/login", title: `Sign In | ${SITE_NAME}`, description: "Sign in to continue your application.", sitemap: false, noindex: true },
  { path: "/referral", title: SITE_NAME, description: DEFAULT_DESCRIPTION, sitemap: false, noindex: true },
  { path: "/lender/api", title: `Lender API | ${SITE_NAME}`, description: "Submit Personal Guarantee Insurance applications from your lending platform.", sitemap: false, noindex: true },
  { path: "/lender/sandbox", title: `Lender Sandbox | ${SITE_NAME}`, description: "Test the Boreal lender API.", sitemap: false, noindex: true },
  { path: "/lender/demo", title: `Lender Demo | ${SITE_NAME}`, description: "Lender portal demo.", sitemap: false, noindex: true },
  { path: "/lender/login", title: `Lender Login | ${SITE_NAME}`, description: "Sign in to the Boreal lender portal.", sitemap: false, noindex: true },
  { path: "/lender/portal", title: `Lender Portal | ${SITE_NAME}`, description: "Boreal lender portal.", sitemap: false, noindex: true },
  { path: "/lender/applications/new", title: `New Application | ${SITE_NAME}`, description: "Submit a Personal Guarantee Insurance application.", sitemap: false, noindex: true },
];

// URL prefixes whose routes carry parameters or are splats in App.tsx. They are
// real pages (served index.html) but never indexed.
export const DYNAMIC_PREFIXES = ["/applications/", "/lender/", "/r/", "/referrer/"];

export type ResolvedMeta = {
  title: string;
  description: string;
  canonical: string | null;
  robots: string;
  ogUrl: string;
  ogImage: string;
  notFound: boolean;
};

export const NOT_FOUND_TITLE = `Page not found | ${SITE_NAME}`;

function normalize(pathname: string): string {
  const p = pathname.split(/[?#]/)[0] || "/";
  return p.length > 1 ? p.replace(/\/+$/, "") || "/" : p;
}

function resolved(entry: RouteEntry, path: string): ResolvedMeta {
  const url = `${SITE_ORIGIN}${path === "/" ? "/" : path}`;
  return {
    title: entry.title,
    description: entry.description,
    canonical: entry.noindex ? null : url,
    robots: entry.noindex ? "noindex, nofollow" : "index, follow",
    ogUrl: url,
    ogImage: OG_IMAGE,
    notFound: false,
  };
}

export function metaForPath(pathname: string): ResolvedMeta {
  const path = normalize(pathname);
  const exact = ROUTES.find((r) => r.path === path);
  if (exact) return resolved(exact, path);
  if (DYNAMIC_PREFIXES.some((prefix) => path.startsWith(prefix))) {
    return resolved({ path, title: SITE_NAME, description: DEFAULT_DESCRIPTION, sitemap: false, noindex: true }, path);
  }
  return {
    title: NOT_FOUND_TITLE,
    description: "The page you are looking for does not exist.",
    canonical: null,
    robots: "noindex, nofollow",
    ogUrl: `${SITE_ORIGIN}${path}`,
    ogImage: OG_IMAGE,
    notFound: true,
  };
}

export function sitemapPaths(): string[] {
  return ROUTES.filter((r) => r.sitemap).map((r) => r.path);
}

export function buildSitemapXml(): string {
  const urls = sitemapPaths()
    .map((p) => `  <url>\n    <loc>${SITE_ORIGIN}${p}</loc>\n  </url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

// Escape for an HTML attribute or text node. Non-ASCII is emitted as a
// numeric reference so generated HTML stays ASCII.
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/[^\x20-\x7e]/g, (c) => `&#${c.codePointAt(0)};`);
}

// The tags this module owns, in the order they are written into <head>.
export function headTags(meta: ResolvedMeta): string {
  const t = escapeHtml(meta.title);
  const d = escapeHtml(meta.description);
  const lines = [
    `<title>${t}</title>`,
    `<meta name="description" content="${d}" />`,
    `<meta name="robots" content="${meta.robots}" />`,
    meta.canonical ? `<link rel="canonical" href="${escapeHtml(meta.canonical)}" />` : "",
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />`,
    `<meta property="og:title" content="${t}" />`,
    `<meta property="og:description" content="${d}" />`,
    `<meta property="og:url" content="${escapeHtml(meta.ogUrl)}" />`,
    `<meta property="og:image" content="${escapeHtml(meta.ogImage)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${t}" />`,
    `<meta name="twitter:description" content="${d}" />`,
    `<meta name="twitter:image" content="${escapeHtml(meta.ogImage)}" />`,
  ];
  return lines.filter(Boolean).join("\n    ");
}

// Removes every tag headTags() writes, then writes the route's set before </head>.
export function applyMetaToHtml(html: string, meta: ResolvedMeta): string {
  const stripped = html
    .replace(/[ \t]*<title>[\s\S]*?<\/title>[ \t]*\r?\n?/gi, "")
    .replace(/[ \t]*<meta\s+name="(?:description|robots|twitter:card|twitter:title|twitter:description|twitter:image)"[^>]*>[ \t]*\r?\n?/gi, "")
    .replace(/[ \t]*<meta\s+property="og:[^"]*"[^>]*>[ \t]*\r?\n?/gi, "")
    .replace(/[ \t]*<link\s+rel="canonical"[^>]*>[ \t]*\r?\n?/gi, "");
  return stripped.replace(/[ \t]*<\/head>/i, `    ${headTags(meta)}\n  </head>`);
}

function setMeta(doc: Document, attr: "name" | "property", key: string, content: string) {
  let el = doc.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = doc.createElement("meta");
    el.setAttribute(attr, key);
    doc.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function applyMetaToDocument(doc: Document, meta: ResolvedMeta): void {
  doc.title = meta.title;
  setMeta(doc, "name", "description", meta.description);
  setMeta(doc, "name", "robots", meta.robots);
  setMeta(doc, "property", "og:type", "website");
  setMeta(doc, "property", "og:site_name", SITE_NAME);
  setMeta(doc, "property", "og:title", meta.title);
  setMeta(doc, "property", "og:description", meta.description);
  setMeta(doc, "property", "og:url", meta.ogUrl);
  setMeta(doc, "property", "og:image", meta.ogImage);
  setMeta(doc, "name", "twitter:card", "summary_large_image");
  setMeta(doc, "name", "twitter:title", meta.title);
  setMeta(doc, "name", "twitter:description", meta.description);
  setMeta(doc, "name", "twitter:image", meta.ogImage);
  let link = doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (meta.canonical) {
    if (!link) {
      link = doc.createElement("link");
      link.rel = "canonical";
      doc.head.appendChild(link);
    }
    link.href = meta.canonical;
  } else if (link) {
    link.remove();
  }
}

// Paths written to dist/<path>/index.html after the build: every route above.
export function prerenderPaths(): string[] {
  return ROUTES.map((r) => r.path).filter((p) => p !== "/");
}
