// BI_WEBSITE_US_FIRST_SITE_v1 - the site has two markets and the United States is the default.
//
// A visitor sees the United States site unless they have chosen Canada. Someone who looks like they are in Canada
// (their device's time zone or language says so; nothing is sent anywhere to work it out) is asked once:
// "It looks like you're in Canada. Would you like to visit the Canadian site?" The answer is remembered, and the
// footer always offers the other site. boreal.insure/ca opens the Canadian site directly.
//
// Every figure the site states comes from MARKETS below, so the two sites cannot drift apart page by page.
// United States figures are from PGicover's "US Lenders and Partners" one-pager (November 2026); the premium rate is
// the figure Todd confirmed with the carrier. Canadian figures are the ones the site has always shown, except the
// rate: 2.7% is the current Canadian figure (the calculators had still been on 2.6% from August).
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Market = "US" | "CA";
export type MarketTerms = {
  market: Market;
  countryName: string;
  currency: "USD" | "CAD";
  locale: "en-US" | "en-CA";
  /** Largest personal guarantee cover. */
  limit: number;
  /** Largest covered share of the loan the forms accept. */
  share: number;
  shareText: string;
  shareShort: string;
  deductibleText: string | null;
  /** Annual premium as a share of the insured amount, for estimates. */
  rate: number;
  insurerText: string;
  /** Who pays a claim, as the site names them. */
  payer: string;
  loansText: string;
  availability: string;
  timeline: string[] | null;
  /** Largest loan the calculators and forms accept. */
  loanMax: number;
  quoteDefaultLoan: number;
  taxReturn: string;
};

export const MARKETS: Record<Market, MarketTerms> = {
  US: {
    market: "US", countryName: "United States", currency: "USD", locale: "en-US",
    limit: 5_000_000, share: 0.9,
    shareText: "up to 90% on secured loans and up to 70% on unsecured loans", shareShort: "Up to 90%",
    deductibleText: "from 10%, shown in the policy schedule",
    rate: 0.02,
    insurerText: "an insurer rated A (Excellent) by AM Best", payer: "The insurer",
    loansText: "SBA and conventional business loans",
    availability: "The United States",
    timeline: ["Live in Canada today.", "US quotes open January 1, 2027.", "US policies can start from March 1, 2027."],
    loanMax: 50_000_000, quoteDefaultLoan: 1_000_000,
    taxReturn: "Your most recent business tax return",
  },
  CA: {
    market: "CA", countryName: "Canada", currency: "CAD", locale: "en-CA",
    limit: 1_000_000, share: 0.8,
    shareText: "up to 80%", shareShort: "Up to 80%",
    deductibleText: null,
    rate: 0.027,
    insurerText: "Markel Canada Limited (A-rated by AM Best, S&P, and Fitch)", payer: "Markel",
    loansText: "bank, credit union and alternative-lender business loans, including CSBFP loans",
    availability: "9 Canadian provinces and 3 territories (not available in Quebec)",
    timeline: null,
    loanMax: 1_000_000, quoteDefaultLoan: 500_000,
    taxReturn: "Your most recent business tax return (the T2 with its CRA Notice of Assessment)",
  },
};

export const money = (t: MarketTerms, n: number, cents = false): string =>
  n.toLocaleString(t.locale, { style: "currency", currency: t.currency, minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0 });
/** "$5 million" / "$1 million" for headings. */
export const limitWords = (t: MarketTerms): string => (t.limit % 1_000_000 === 0 ? `$${t.limit / 1_000_000} million` : money(t, t.limit));
export const percent = (n: number): string => `${Math.round(n * 100)}%`;

const KEY = "bi.market";
const ASKED = "bi.market.asked";
const CANADIAN_ZONES = new Set([
  "America/Toronto", "America/Vancouver", "America/Edmonton", "America/Winnipeg", "America/Halifax", "America/St_Johns", "America/Regina",
  "America/Montreal", "America/Moncton", "America/Glace_Bay", "America/Goose_Bay", "America/Iqaluit", "America/Rankin_Inlet", "America/Resolute",
  "America/Cambridge_Bay", "America/Yellowknife", "America/Inuvik", "America/Whitehorse", "America/Dawson", "America/Dawson_Creek", "America/Fort_Nelson",
  "America/Creston", "America/Swift_Current", "America/Thunder_Bay", "America/Nipigon", "America/Rainy_River", "America/Atikokan", "America/Pangnirtung",
  "America/Blanc-Sablon", "Canada/Atlantic", "Canada/Central", "Canada/Eastern", "Canada/Mountain", "Canada/Newfoundland", "Canada/Pacific", "Canada/Saskatchewan", "Canada/Yukon",
]);
/** True when the device says Canada: a Canadian time zone, or Canadian English/French as the first language. */
export function looksCanadian(timeZone: string | undefined, languages: readonly string[] | undefined): boolean {
  if (timeZone && CANADIAN_ZONES.has(timeZone)) return true;
  return /-CA$/i.test(String(languages?.[0] ?? ""));
}
const read = (k: string): string => { try { return localStorage.getItem(k) ?? ""; } catch { return ""; } };
const write = (k: string, v: string): void => { try { localStorage.setItem(k, v); } catch { /* private window */ } };
export const storedMarket = (): Market => (read(KEY) === "CA" ? "CA" : "US");

type Ctx = { market: Market; terms: MarketTerms; setMarket: (m: Market) => void; askCanada: boolean; answerCanada: (go: boolean) => void };
const MarketContext = createContext<Ctx>({ market: "US", terms: MARKETS.US, setMarket: () => undefined, askCanada: false, answerCanada: () => undefined });

export function MarketProvider({ children, initial }: { children: ReactNode; initial?: Market }) {
  const [market, setM] = useState<Market>(() => initial ?? storedMarket());
  const [askCanada, setAsk] = useState(false);
  useEffect(() => {
    if (initial || read(KEY) || read(ASKED)) return;
    let zone: string | undefined;
    try { zone = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { zone = undefined; }
    if (looksCanadian(zone, typeof navigator !== "undefined" ? navigator.languages : undefined)) setAsk(true);
  }, [initial]);
  const setMarket = useCallback((m: Market) => { write(KEY, m); write(ASKED, "1"); setM(m); setAsk(false); }, []);
  const answerCanada = useCallback((go: boolean) => { setMarket(go ? "CA" : "US"); }, [setMarket]);
  const value = useMemo(() => ({ market, terms: MARKETS[market], setMarket, askCanada, answerCanada }), [market, setMarket, askCanada, answerCanada]);
  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>;
}
export const useMarket = (): Ctx => useContext(MarketContext);

/** "It looks like you're in Canada" - asked once, at the top of every page, until answered. */
export function MarketPrompt() {
  const { askCanada, answerCanada } = useMarket();
  if (!askCanada) return null;
  return (
    <div role="region" aria-label="Choose your country" data-testid="market-prompt" className="border-b border-white/10 bg-[#13284d] px-4 py-3 text-white">
      <div className="mx-auto flex max-w-[1120px] flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
        <p className="text-sm">It looks like you&apos;re in Canada. Would you like to visit the Canadian site?</p>
        <div className="flex gap-2">
          <button type="button" className="bf-btn bf-btn--primary !py-2" onClick={() => answerCanada(true)}>Visit the Canadian site</button>
          <button type="button" className="bf-btn bf-btn--secondary !py-2" onClick={() => answerCanada(false)}>Stay on the US site</button>
        </div>
      </div>
    </div>
  );
}

/** Footer line: which site this is, and the way to the other one. */
export function MarketSwitch() {
  const { market, setMarket } = useMarket();
  const other: Market = market === "US" ? "CA" : "US";
  return (
    <p className="text-xs text-white/75" data-testid="market-switch">
      You are on the {MARKETS[market].countryName} site.{" "}
      <button type="button" className="underline" onClick={() => { setMarket(other); window.scrollTo(0, 0); }}>Switch to the {MARKETS[other].countryName} site</button>
    </p>
  );
}

/** /ca and /usa: open that country's site, then show the home page. */
export function MarketEntry({ to, children }: { to: Market; children: ReactNode }) {
  const { setMarket } = useMarket();
  // On arrival only: the footer's switch must still work on these addresses.
  useEffect(() => { setMarket(to); }, [to, setMarket]);
  return <>{children}</>;
}
