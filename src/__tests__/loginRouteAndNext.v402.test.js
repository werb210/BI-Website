// BI_WEBSITE_BLOCK_v402_LOGIN_ROUTE_AND_NEXT_PARAM_v1
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const appSrc = readFileSync(resolve(__dirname, "../App.tsx"), "utf8");
const newAppSrc = readFileSync(resolve(__dirname, "../pages/NewApplication.tsx"), "utf8");

describe("v402 — BF→BI handoff link works end-to-end", () => {
  it("App.tsx mounts /login → <NewApplication />", () => {
    expect(appSrc).toMatch(/<Route path="\/login" element=\{<NewApplication \/>\} \/>/);
  });

  it("the /login route is declared BEFORE the catch-all (route order matters)", () => {
    const loginIdx = appSrc.indexOf('path="/login"');
    const catchIdx = appSrc.indexOf('path="*"');
    expect(loginIdx).toBeGreaterThan(-1);
    expect(catchIdx).toBeGreaterThan(-1);
    expect(loginIdx).toBeLessThan(catchIdx);
  });

  it("NewApplication honors ?next= on verify success", () => {
    expect(newAppSrc).toMatch(/URLSearchParams\(window\.location\.search\)\.get\("next"\)/);
    expect(newAppSrc).toMatch(/nextParam\.startsWith\("\/"\)/);
    expect(newAppSrc).toMatch(/!nextParam\.startsWith\("\/\/"\)/);
  });

  it("?next= check runs BEFORE the pending-app fallback (so handoff wins)", () => {
    const nextIdx = newAppSrc.indexOf("nextParam");
    const pendingIdx = newAppSrc.indexOf("getMyPendingApplication");
    expect(nextIdx).toBeGreaterThan(-1);
    expect(pendingIdx).toBeGreaterThan(-1);
    expect(nextIdx).toBeLessThan(pendingIdx);
  });
});
