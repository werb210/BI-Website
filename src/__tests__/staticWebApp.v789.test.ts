// BI_WEBSITE_BLOCK_v789_AUDIT_ROUND2 [142][150][152]
import { describe, it, expect } from "vitest";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { DYNAMIC_PREFIXES, ROUTES } from "../seo/routeMeta";
import { FALLBACK_BI_SERVER_URL } from "../config";

type Route = { route: string; rewrite?: string; headers?: Record<string, string> };
const CFG = JSON.parse(readFileSync("public/staticwebapp.config.json", "utf8")) as {
  routes: Route[];
  navigationFallback?: unknown;
  globalHeaders: Record<string, string>;
  responseOverrides: Record<string, { rewrite: string; statusCode: number }>;
};
const CSP = CFG.globalHeaders["Content-Security-Policy"];
const directive = (name: string) =>
  (CSP.split(";").map((d) => d.trim()).find((d) => d.startsWith(`${name} `)) ?? "").split(/\s+/).slice(1);
const APP_PATHS = [...readFileSync("src/App.tsx", "utf8").matchAll(/<Route path="([^"]+)"/g)]
  .map((m) => m[1]).filter((p) => p !== "*");

describe("[142] Content-Security-Policy", () => {
  it("never allows eval", () => {
    expect(CSP).not.toContain("unsafe-eval");
  });

  it("hashes exactly the inline scripts in index.html", () => {
    const html = readFileSync("index.html", "utf8");
    const hashes = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
      .map((m) => `'sha256-${createHash("sha256").update(m[1]).digest("base64")}'`);
    expect(hashes).toHaveLength(2);
    const scriptSrc = directive("script-src");
    for (const h of hashes) expect(scriptSrc).toContain(h);
    expect(scriptSrc.filter((s) => s.startsWith("'sha256-"))).toHaveLength(hashes.length);
    expect(scriptSrc).not.toContain("'unsafe-inline'");
  });

  it("has no inline event handlers in index.html for the CSP to block", () => {
    expect(readFileSync("index.html", "utf8")).not.toMatch(/\son[a-z]+=/i);
  });

  it("allows Google Tag Manager, Google Ads and Google Fonts", () => {
    expect(directive("script-src")).toEqual(expect.arrayContaining(["https://www.googletagmanager.com", "https://www.googleadservices.com"]));
    expect(directive("style-src")).toContain("https://fonts.googleapis.com");
    expect(directive("font-src")).toContain("https://fonts.gstatic.com");
    expect(directive("frame-src")).toContain("https://www.googletagmanager.com");
  });

  it("lets the app reach BI-Server at the fallback and the production URL", () => {
    const connect = directive("connect-src");
    expect(connect).toContain(FALLBACK_BI_SERVER_URL);
    const prod = readFileSync(".env.production", "utf8").match(/^VITE_API_URL=(.+)$/m)?.[1].trim();
    expect(prod).toBeTruthy();
    expect(connect).toContain(prod);
  });

  it("locks down framing, plugins and base", () => {
    expect(directive("frame-ancestors")).toEqual(["'none'"]);
    expect(directive("object-src")).toEqual(["'none'"]);
    expect(directive("base-uri")).toEqual(["'self'"]);
  });
});

describe("[142] other security headers", () => {
  it("sends HSTS and Permissions-Policy", () => {
    expect(CFG.globalHeaders["Strict-Transport-Security"]).toMatch(/^max-age=31536000/);
    expect(CFG.globalHeaders["Permissions-Policy"]).toContain("camera=()");
  });
});

describe("[142] caching", () => {
  it("does not send no-cache globally", () => {
    expect(CFG.globalHeaders["Cache-Control"]).toBeUndefined();
  });

  it("caches hashed /assets/* for a year, immutable", () => {
    const assets = CFG.routes.find((r) => r.route === "/assets/*");
    expect(assets?.headers?.["Cache-Control"]).toBe("public, max-age=31536000, immutable");
    expect(CFG.routes.indexOf(assets as Route)).toBe(0);
  });

  it("sends no-cache only on HTML routes", () => {
    for (const r of CFG.routes) {
      if (r.headers?.["Cache-Control"] !== "no-cache") continue;
      const html = r.route === "/" || r.route.endsWith(".html") || (r.rewrite ?? "").endsWith(".html");
      expect(html, r.route).toBe(true);
    }
  });
});

describe("[152] routing and 404", () => {
  it("serves /404.html with a real 404 status", () => {
    expect(CFG.responseOverrides["404"]).toEqual({ rewrite: "/404.html", statusCode: 404 });
    expect(CFG.navigationFallback).toBeUndefined();
  });

  it("rewrites every static route to its prerendered index.html", () => {
    for (const { path } of ROUTES) {
      if (path === "/") continue;
      const r = CFG.routes.find((x) => x.route === path);
      expect(r?.rewrite, path).toBe(`${path}/index.html`);
    }
  });

  it("rewrites every dynamic prefix to the app shell, after the static routes", () => {
    const lastStatic = Math.max(...ROUTES.map(({ path }) => CFG.routes.findIndex((x) => x.route === path)));
    for (const prefix of DYNAMIC_PREFIXES) {
      const i = CFG.routes.findIndex((x) => x.route === `${prefix}*`);
      expect(CFG.routes[i]?.rewrite, prefix).toBe("/index.html");
      expect(i).toBeGreaterThan(lastStatic);
    }
  });

  it("every App.tsx route is served by some rule", () => {
    const rules = CFG.routes.map((r) => r.route);
    for (const p of APP_PATHS) {
      const ok = p === "/" || rules.includes(p) || rules.some((r) => r.endsWith("*") && p.startsWith(r.slice(0, -1)));
      expect(ok, p).toBe(true);
    }
  });
});

describe("[150] retired files", () => {
  for (const f of [
    "public/routes.json",
    "public/web.config",
    "Dockerfile",
    "secret-trigger.txt",
    ".github/workflows/cleanup-swa.yml",
    "sql/bi_server_tracking_migration.sql",
  ]) {
    it(`${f} is gone`, () => expect(existsSync(f)).toBe(false));
  }
});
