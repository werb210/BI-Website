import { describe, it, expect, beforeEach, vi } from "vitest";
import { enterDemoSession, exitDemoSession, isInDemoSession } from "../demoSession";
const KEY_TOKEN = "bi.lender_token";
const KEY_BACKUP = "bi.real_token_backup";
const KEY_DEMO_FLAG = "bi.is_demo_session";
const KEY_DEMO_STARTED = "bi.demo_session_started_at";
describe("demoSession helpers (v389)", () => {
  beforeEach(() => { localStorage.clear(); vi.restoreAllMocks(); });
  it("enter sets backup/flags",()=>{localStorage.setItem(KEY_TOKEN,"real");enterDemoSession("real");expect(localStorage.getItem(KEY_BACKUP)).toBe("real");expect(localStorage.getItem(KEY_DEMO_FLAG)).toBe("1");expect(isInDemoSession()).toBe(true);});
  it("refresh safe",()=>{localStorage.setItem(KEY_BACKUP,"real");localStorage.setItem(KEY_DEMO_FLAG,"1");enterDemoSession("demo");expect(localStorage.getItem(KEY_BACKUP)).toBe("real");});
  it("started timestamp no stomp",()=>{localStorage.setItem(KEY_BACKUP,"real");localStorage.setItem(KEY_DEMO_FLAG,"1");localStorage.setItem(KEY_DEMO_STARTED,"2026-01-01T00:00:00.000Z");enterDemoSession("x");expect(localStorage.getItem(KEY_DEMO_STARTED)).toBe("2026-01-01T00:00:00.000Z");});
  it("exit restores", async()=>{localStorage.setItem(KEY_TOKEN,"demo");localStorage.setItem(KEY_BACKUP,"real");localStorage.setItem(KEY_DEMO_FLAG,"1");localStorage.setItem(KEY_DEMO_STARTED,"2026-05-27T00:00:00.000Z");vi.spyOn(global,"fetch").mockResolvedValue({ok:true} as any);const reload=vi.fn();expect(await exitDemoSession({apiBase:"https://api",reload})).toBe("restored");expect(localStorage.getItem(KEY_TOKEN)).toBe("real");});
  it("cleanup called", async()=>{localStorage.setItem(KEY_TOKEN,"demo");localStorage.setItem(KEY_BACKUP,"real");localStorage.setItem(KEY_DEMO_FLAG,"1");localStorage.setItem(KEY_DEMO_STARTED,"2026-05-27T00:00:00.000Z");const spy=vi.spyOn(global,"fetch").mockResolvedValue({ok:true} as any);await exitDemoSession({apiBase:"https://api",reload:()=>{}});expect(spy).toHaveBeenCalled();});
  it("no session", async()=>{const spy=vi.spyOn(global,"fetch");expect(await exitDemoSession({apiBase:"https://api"})).toBe("no_session");expect(spy).not.toHaveBeenCalled();});
  it("fallback logout", async()=>{localStorage.setItem(KEY_TOKEN,"demo");localStorage.setItem(KEY_DEMO_FLAG,"1");localStorage.setItem(KEY_DEMO_STARTED,"2026-05-27T00:00:00.000Z");vi.spyOn(global,"fetch").mockResolvedValue({ok:true} as any);const nav=vi.fn();expect(await exitDemoSession({apiBase:"https://api",navigate:nav})).toBe("fallback_logout");expect(nav).toHaveBeenCalledWith("/lender/login",{replace:true});});
  it("cleanup failure tolerated", async()=>{localStorage.setItem(KEY_TOKEN,"demo");localStorage.setItem(KEY_BACKUP,"real");localStorage.setItem(KEY_DEMO_FLAG,"1");localStorage.setItem(KEY_DEMO_STARTED,"2026-05-27T00:00:00.000Z");vi.spyOn(global,"fetch").mockRejectedValue(new Error('network'));vi.spyOn(console,'warn').mockImplementation(()=>{});expect(await exitDemoSession({apiBase:"https://api"})).toBe("restored");});
  it("idempotent", async()=>{localStorage.setItem(KEY_TOKEN,"demo");localStorage.setItem(KEY_BACKUP,"real");localStorage.setItem(KEY_DEMO_FLAG,"1");localStorage.setItem(KEY_DEMO_STARTED,"2026-05-27T00:00:00.000Z");vi.spyOn(global,"fetch").mockResolvedValue({ok:true} as any);await exitDemoSession({apiBase:"https://api"});expect(await exitDemoSession({apiBase:"https://api"})).toBe("no_session");});
});
