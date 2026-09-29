// BI_WEBSITE_READABILITY_v3
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import config from "../../tailwind.config";
const hex = (h: string) => { const s=h.replace("#",""); return [0,2,4].map(i=>parseInt(s.slice(i,i+2),16)); };
const lum = (h: string) => { const [r,g,b]=hex(h).map(v=>{const c=v/255; return c<=.03928?c/12.92:Math.pow((c+.055)/1.055,2.4)}); return .2126*r+.7152*g+.0722*b; };
const ratio=(a:string,b:string)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
function files(dir:string):string[]{return readdirSync(dir).flatMap(n=>{const p=join(dir,n);if(statSync(p).isDirectory())return n==="__tests__"?[]:files(p);return /\.(tsx|ts|css)$/.test(n)?[p]:[]})}
const SRC=files("src").map(p=>({p,s:readFileSync(p,"utf8")}));
const offenders=(re:RegExp)=>SRC.filter(({s})=>re.test(s)).map(({p})=>p);
const bf=(config as any).theme.extend.colors.bf as Record<string,string>; const WHITE="#ffffff";
describe("palette pairs meet WCAG AA",()=>{
 it.each([["body copy on white",bf.body,WHITE],["body copy on mist",bf.body,bf.mist],["muted copy on navy card",bf.textMuted,bf.surface],["muted copy on page",bf.textMuted,bf.bg],["gold text on white",bf.ctaInk,WHITE],["navy on gold button",bf.ink,bf.cta]])("%s",(_n,fg,bg)=>expect(ratio(fg,bg)).toBeGreaterThanOrEqual(4.5));
 it("lender status badges carry white text at >= 4.5:1",()=>{const s=readFileSync("src/pages/LenderApplicationDetail.tsx","utf8");const block=s.match(/STAGE_COLORS[^{]*\{([^}]*)\}/)![1];const colors=block.match(/#[0-9a-fA-F]{6}/g)!;expect(colors.length).toBeGreaterThanOrEqual(5);for(const c of colors)expect(ratio(WHITE,c)).toBeGreaterThanOrEqual(4.5)});
});
describe("low-contrast patterns do not return",()=>{
 it("no faint white text below 70%",()=>expect(offenders(/(?<![\w:-])text-white\/[1-6]\d\b/)).toEqual([]));
 it("disabled controls stay readable",()=>{expect(offenders(/disabled:opacity-[1-7]0\b/)).toEqual([]);expect(offenders(/opacity:\s*busy[^?]*\?\s*0\.[0-7]\b/)).toEqual([])});
 it("no white labels on bright buttons",()=>{expect(offenders(/bg-\[#BF9B49\][^"'`]*text-white/)).toEqual([]);expect(offenders(/bg-(sky|emerald|green|amber|yellow|orange)-[345]00 text-white/)).toEqual([]);expect(offenders(/background:\s*"#(f59e0b|BF9B49|3b82f6|10b981|0ea5e9)",\s*color:\s*"(#fff|#ffffff|white)"/i)).toEqual([])});
 it("no slate-500 small print",()=>expect(offenders(/text-slate-500/)).toEqual([]));
 it("global gold primary uses navy",()=>{const css=readFileSync("src/index.css","utf8");const rule=css.slice(css.indexOf("button.primary,"),css.indexOf("button.primary:hover"));expect(rule).toContain("color: #0B1F3A");expect(css).toMatch(/\.primary:disabled \{ opacity: 0\.8;/)});
});
describe("Home and Markel colours",()=>{const home=readFileSync("src/pages/Home.tsx","utf8");it("dark cards use light copy",()=>expect(home).toContain('<p className="mt-2 text-sm text-bf-textMuted">{l.d}</p>'));it("white page headings are navy",()=>{expect(home).toContain('<h3 className="text-lg font-semibold text-[#0B1F3A]">{w.t}</h3>');expect(home).toContain('<h2 className="text-3xl font-bold text-[#0B1F3A]">Ready to review')});it("hero badge is reversed",()=>{const badge=readFileSync("src/components/MarkelBadge.tsx","utf8");expect(badge).toContain("text-bf-textMuted");expect(badge).toContain("brightness-0 invert")})});
