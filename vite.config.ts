/// <reference types="vitest" />
import { defineConfig, type Plugin } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { applyMetaToHtml, buildSitemapXml, metaForPath, prerenderPaths } from "./src/seo/routeMeta";

// BI_WEBSITE_BLOCK_v789_AUDIT_ROUND2 [140][146][152]
// Post-build step: from the route list in src/seo/routeMeta.ts, write
//   dist/sitemap.xml
//   dist/<route>/index.html  - the app shell with that route's head tags
//   dist/404.html            - served with status 404 (staticwebapp.config.json)
// and give dist/index.html the "/" tags.
function seoBuildPlugin(): Plugin {
  return {
    name: "bi-seo-build",
    apply: "build",
    writeBundle(options) {
      const outDir = options.dir ?? "dist";
      const shellPath = join(outDir, "index.html");
      const shell = readFileSync(shellPath, "utf8");
      const write = (file: string, html: string) => {
        mkdirSync(dirname(file), { recursive: true });
        writeFileSync(file, html);
      };
      write(shellPath, applyMetaToHtml(shell, metaForPath("/")));
      for (const path of prerenderPaths()) {
        write(join(outDir, path, "index.html"), applyMetaToHtml(shell, metaForPath(path)));
      }
      write(join(outDir, "404.html"), applyMetaToHtml(shell, metaForPath("/404")));
      write(join(outDir, "sitemap.xml"), buildSitemapXml());
    },
  };
}

export default defineConfig({
  plugins: [react(), seoBuildPlugin()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  },
  build: {
    outDir: "dist"
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"]
  }
});
