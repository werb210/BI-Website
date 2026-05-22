#!/usr/bin/env node
// v132: replace __BI_BUILD_VERSION__ placeholder in dist/sw.js with the
// real build SHA / timestamp so each deploy invalidates client caches.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";

const sw = "dist/sw.js";
if (!existsSync(sw)) {
  console.warn("[postbuild-sw] dist/sw.js not found; Vite probably copied it elsewhere — skipping");
  process.exit(0);
}

function safe(cmd) { try { return execSync(cmd, { stdio: ["ignore","pipe","ignore"] }).toString().trim(); } catch { return null; } }
const sha = process.env.GITHUB_SHA || safe("git rev-parse HEAD") || "";
const short = sha.slice(0, 7) || "dev";
const ts = new Date().toISOString().replace(/[-:T.]/g, "").slice(0, 14);
const version = `v${ts}-${short}`;

const out = readFileSync(sw, "utf8").replaceAll("__BI_BUILD_VERSION__", version);
writeFileSync(sw, out);
console.log(`[postbuild-sw] wrote VERSION=${version}`);
