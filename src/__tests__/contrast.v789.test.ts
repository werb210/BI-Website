// BI_WEBSITE_BLOCK_v789_AUDIT_ROUND2 [143][144]
// WCAG 2.x contrast for the colour pairs the audit flagged, read from
// src/index.css so a later edit cannot quietly regress them.
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

type RGB = [number, number, number];
type RGBA = { rgb: RGB; a: number };

const CSS = readFileSync("src/index.css", "utf8");

function rule(selector: string): string {
  const i = CSS.indexOf(`${selector} {`);
  if (i < 0) throw new Error(`no rule for ${selector}`);
  return CSS.slice(i, CSS.indexOf("}", i));
}

function prop(selector: string, name: string): string {
  const m = rule(selector).match(new RegExp(`(?:^|[\\s;{])${name}:\\s*([^;]+);`));
  if (!m) throw new Error(`${selector} has no ${name}`);
  return m[1].trim();
}

function parseColor(v: string): RGBA {
  const hex = v.match(/^#([0-9a-f]{6})$/i);
  if (hex) {
    const n = hex[1];
    return { rgb: [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16)) as RGB, a: 1 };
  }
  const rgba = v.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/i);
  if (rgba) return { rgb: [+rgba[1], +rgba[2], +rgba[3]], a: rgba[4] === undefined ? 1 : +rgba[4] };
  throw new Error(`cannot parse colour ${v}`);
}

function over(fg: RGBA, bg: RGB): RGB {
  return fg.rgb.map((c, i) => c * fg.a + bg[i] * (1 - fg.a)) as RGB;
}

function luminance(rgb: RGB): number {
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: RGB, b: RGB): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// Every background a .bf-field sits on: the --bf-* surfaces, the carrier
// shell gradient stops, and the lightest card tint in use.
const PAGE_BACKGROUNDS: RGB[] = ["#081729", "#0B1F3A", "#0d233f", "#0a1120", "#0a1428", "#050b1a", "#1a3050"]
  .map((h) => parseColor(h).rgb);

describe("contrast helper", () => {
  it("matches known WCAG values", () => {
    expect(contrast([0, 0, 0], [255, 255, 255])).toBeCloseTo(21, 5);
    expect(contrast([255, 255, 255], [255, 255, 255])).toBeCloseTo(1, 5);
    expect(contrast(parseColor("#767676").rgb, [255, 255, 255])).toBeGreaterThan(4.5);
  });
});

describe("[143] .bf-field placeholder", () => {
  const placeholder = parseColor(prop(".bf-field::placeholder", "color"));
  const fieldBg = parseColor(prop(".bf-field", "background"));
  for (const page of PAGE_BACKGROUNDS) {
    it(`reaches 4.5:1 on the field over rgb(${page.join(",")})`, () => {
      const bg = over(fieldBg, page);
      expect(contrast(over(placeholder, bg), bg)).toBeGreaterThanOrEqual(4.5);
    });
  }
});

describe("[143] .bf-field disabled text", () => {
  const text = parseColor(prop(".bf-field:disabled", "color"));
  const fieldBg = parseColor(prop(".bf-field:disabled", "background"));
  for (const page of PAGE_BACKGROUNDS) {
    it(`reaches 4.5:1 over rgb(${page.join(",")})`, () => {
      const bg = over(fieldBg, page);
      expect(contrast(over(text, bg), bg)).toBeGreaterThanOrEqual(4.5);
    });
  }
});

describe("[144] disabled .bf-btn", () => {
  it("reaches 4.5:1", () => {
    const bg = parseColor(prop(".bf-btn:disabled", "background")).rgb;
    const fg = parseColor(prop(".bf-btn:disabled", "color"));
    expect(contrast(over(fg, bg), bg)).toBeGreaterThanOrEqual(4.5);
  });
});
