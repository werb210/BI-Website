import { describe, expect, it } from "vitest";
// BI_WEBSITE_API_PATHS_v53 — guard against regressing back to wrong path.
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = readFileSync(resolve(__dirname, "..", "MayaChat.tsx"), "utf8");

describe("BI_WEBSITE_API_PATHS_v53", () => {
  it("posts to /api/v1/maya-chat (NOT /api/v1/maya/message)", () => {
    expect(SRC).toContain('"/api/v1/maya-chat"');
    expect(SRC).not.toContain('"/api/v1/maya/message"');
  });
});
