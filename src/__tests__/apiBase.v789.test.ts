// BI_WEBSITE_BLOCK_v789_AUDIT_ROUND2 [148][149][151]
import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { FALLBACK_BI_SERVER_URL, resolveApiBase } from "../config";

describe("[151] one API base", () => {
  it("falls back to the BI-Server App Service host", () => {
    expect(FALLBACK_BI_SERVER_URL).toBe("https://bi-server-cse0apamgkheb9d5.canadacentral-01.azurewebsites.net");
    expect(resolveApiBase(undefined)).toBe(FALLBACK_BI_SERVER_URL);
    expect(resolveApiBase({ VITE_API_URL: "  " })).toBe(FALLBACK_BI_SERVER_URL);
  });

  it("honours the env and strips trailing slashes", () => {
    expect(resolveApiBase({ VITE_API_URL: "https://api.example.test/" })).toBe("https://api.example.test");
    expect(resolveApiBase({ VITE_BI_API_URL: "https://bi.example.test" })).toBe("https://bi.example.test");
  });

  it("lib/api.ts, api/request.ts and main.tsx all import it", () => {
    for (const f of ["src/lib/api.ts", "src/api/request.ts", "src/main.tsx"]) {
      const s = readFileSync(f, "utf8");
      expect(s, f).toMatch(/import \{ API_BASE \} from "\.\.?\/config";/);
      expect(s, f).not.toContain("import.meta.env.VITE_API_URL");
      expect(s, f).not.toContain("window.location.origin");
    }
  });
});

describe("[148][149] unused modules and packages", () => {
  it("deleted modules stay deleted", () => {
    for (const f of [
      "src/components/SEO.tsx",
      "src/components/Canonical.tsx",
      "src/components/UploadAndScrape.tsx",
      "src/hooks/usePush.ts",
      "src/config/envGuard.ts",
      "src/utils/errorReporter.ts",
      "src/utils/lenderAuth.ts",
      "src/utils/redirectValidation.ts",
      "src/store/useApplicationStore.ts",
    ]) expect(existsSync(f), f).toBe(false);
  });

  it("FloatingChat and MayaChat are kept", () => {
    expect(existsSync("src/components/FloatingChat.tsx")).toBe(true);
    expect(existsSync("src/components/MayaChat.tsx")).toBe(true);
  });

  it("dropped packages are gone from package.json", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8"));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    for (const name of ["axios", "zod", "react-helmet-async", "react-helmet", "@types/react-helmet", "jwt-decode"]) {
      expect(deps[name], name).toBeUndefined();
    }
  });
});
