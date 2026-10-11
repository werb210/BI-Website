// BI_WEBSITE_BLOCK_v789_AUDIT_ROUND2 [140][146][152]
import { describe, it, expect, afterEach } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { MemoryRouter, Link, Routes, Route } from "react-router-dom";
import RouteMeta from "../seo/RouteMeta";
import NotFound from "../pages/NotFound";
import {
  DYNAMIC_PREFIXES,
  OG_IMAGE,
  ROUTES,
  SITE_ORIGIN,
  applyMetaToHtml,
  buildSitemapXml,
  metaForPath,
  prerenderPaths,
  sitemapPaths,
} from "../seo/routeMeta";

const APP = readFileSync("src/App.tsx", "utf8");
const APP_PATHS = [...APP.matchAll(/<Route path="([^"]+)"/g)].map((m) => m[1]).filter((p) => p !== "*");

afterEach(cleanup);

describe("route list", () => {
  it("reads the App.tsx routes", () => {
    expect(APP_PATHS.length).toBeGreaterThan(30);
  });

  it("covers every App.tsx route: static ones by entry, the rest by a dynamic prefix", () => {
    for (const p of APP_PATHS) {
      if (/[:*]/.test(p)) {
        expect(DYNAMIC_PREFIXES.some((prefix) => p.startsWith(prefix)), p).toBe(true);
      } else {
        expect(ROUTES.map((r) => r.path), p).toContain(p);
      }
    }
  });

  it("lists only routes that exist in App.tsx", () => {
    for (const r of ROUTES) expect(APP_PATHS, r.path).toContain(r.path);
  });

  it("is ASCII", () => {
    expect([...readFileSync("src/seo/routeMeta.ts", "utf8")].every((c) => c.charCodeAt(0) < 128)).toBe(true);
  });
});

describe("[140] sitemap and robots", () => {
  it("sitemap uses https://boreal.insure and only existing, indexable routes", () => {
    const xml = buildSitemapXml();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs.length).toBe(sitemapPaths().length);
    for (const loc of locs) {
      expect(loc.startsWith("https://boreal.insure/")).toBe(true);
      const path = loc.slice(SITE_ORIGIN.length);
      expect(APP_PATHS).toContain(path);
      expect(metaForPath(path).robots).toBe("index, follow");
    }
    expect(locs).toContain("https://boreal.insure/");
    expect(locs).toContain("https://boreal.insure/contact");
  });

  it("is generated at build time, not committed", () => {
    expect(existsSync("public/sitemap.xml")).toBe(false);
    expect(readFileSync("vite.config.ts", "utf8")).toContain("buildSitemapXml()");
  });

  it("robots.txt points at the boreal.insure sitemap", () => {
    const robots = readFileSync("public/robots.txt", "utf8");
    expect(robots).toContain("Sitemap: https://boreal.insure/sitemap.xml");
    expect(robots).not.toMatch(/borealinsurance\.com|www\./);
  });
});

describe("[146] per-route meta", () => {
  it("gives each sitemap route a canonical and absolute og:image", () => {
    for (const p of sitemapPaths()) {
      const m = metaForPath(p);
      expect(m.canonical).toBe(p === "/" ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${p}`);
      expect(m.ogImage).toBe("https://boreal.insure/og.png");
      expect(m.title.length).toBeGreaterThan(0);
      expect(m.description.length).toBeGreaterThan(0);
    }
  });

  it("ignores query strings and trailing slashes", () => {
    expect(metaForPath("/faq/?x=1").canonical).toBe(`${SITE_ORIGIN}/faq`);
  });

  it("marks application and lender pages noindex", () => {
    expect(metaForPath("/applications/abc/form").robots).toBe("noindex, nofollow");
    expect(metaForPath("/lender/login").canonical).toBeNull();
  });

  it("unknown paths resolve to not-found meta", () => {
    const m = metaForPath("/no-such-page");
    expect(m.notFound).toBe(true);
    expect(m.robots).toBe("noindex, nofollow");
  });

  it("rewrites the shell head for a route, replacing every default tag", () => {
    const shell = readFileSync("index.html", "utf8");
    const html = applyMetaToHtml(shell, metaForPath("/faq"));
    expect(html.match(/<title>/g)).toHaveLength(1);
    expect(html.match(/<link rel="canonical"/g)).toHaveLength(1);
    expect(html.match(/<meta property="og:image"/g)).toHaveLength(1);
    expect(html).toContain('<link rel="canonical" href="https://boreal.insure/faq" />');
    expect(html).toContain(`<meta property="og:image" content="${OG_IMAGE}" />`);
    expect(html).toContain("<title>Frequently Asked Questions | Boreal Risk Management</title>");
    expect(html.indexOf("og:url")).toBeLessThan(html.indexOf("</head>"));
  });

  it("index.html defaults are absolute boreal.insure URLs", () => {
    const shell = readFileSync("index.html", "utf8");
    expect(shell).toContain('<meta property="og:image" content="https://boreal.insure/og.png" />');
    expect(shell).toContain('<link rel="canonical" href="https://boreal.insure/" />');
  });

  it("prerenders every static route", () => {
    expect(prerenderPaths()).toEqual(expect.arrayContaining(sitemapPaths().filter((p) => p !== "/")));
  });

  it("applies the tags on navigation", () => {
    render(
      <MemoryRouter initialEntries={["/faq"]}>
        <RouteMeta />
        <Link to="/contact">go</Link>
      </MemoryRouter>,
    );
    expect(document.title).toBe("Frequently Asked Questions | Boreal Risk Management");
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe("https://boreal.insure/faq");
    fireEvent.click(screen.getByText("go"));
    expect(document.title).toBe("Contact Us | Boreal Risk Management");
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe("https://boreal.insure/contact");
    expect(document.head.querySelector('meta[property="og:url"]')?.getAttribute("content")).toBe("https://boreal.insure/contact");
    expect(document.head.querySelector('meta[property="og:image"]')?.getAttribute("content")).toBe("https://boreal.insure/og.png");
  });
});

describe("[152] unknown routes", () => {
  it("App.tsx renders NotFound for the catch-all instead of redirecting home", () => {
    expect(APP).toContain('<Route path="*" element={<NotFound />} />');
    expect(APP).not.toContain('<Route path="*" element={<Navigate to="/" replace />} />');
  });

  it("NotFound says so and links home", () => {
    render(
      <MemoryRouter initialEntries={["/nope"]}>
        <Routes><Route path="*" element={<NotFound />} /></Routes>
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { name: "Page not found" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go to the home page" })).toHaveAttribute("href", "/");
  });
});
