// Client-side market data hooks that call Finnhub via server functions.
// Also exports curated universe metadata (names, sectors) used across the UI.
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  getQuote as getQuoteFn,
  getQuotes as getQuotesFn,
  getCandles as getCandlesFn,
  searchSymbols as searchSymbolsFn,
  getMarketNews as getMarketNewsFn,
  getCompanyNews as getCompanyNewsFn,
  getCompanyProfile as getCompanyProfileFn,
  getBasicFinancials as getBasicFinancialsFn,
  getRecommendations as getRecommendationsFn,
} from "./finnhub.functions";

export interface Quote {
  symbol: string;
  price: number;
  change: number;
  changePct: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
  timestamp: number;
  error?: boolean;
}

export interface UniverseEntry {
  symbol: string;
  name: string;
  sector: string;
}

// Curated symbol universe (metadata only; live prices come from Finnhub).
export const UNIVERSE: UniverseEntry[] = [
  { symbol: "AAPL", name: "Apple Inc.", sector: "Technology" },
  { symbol: "MSFT", name: "Microsoft Corp.", sector: "Technology" },
  { symbol: "NVDA", name: "NVIDIA Corp.", sector: "Semiconductors" },
  { symbol: "GOOGL", name: "Alphabet Inc.", sector: "Communication Services" },
  { symbol: "META", name: "Meta Platforms", sector: "Communication Services" },
  { symbol: "AMZN", name: "Amazon.com Inc.", sector: "Consumer Discretionary" },
  { symbol: "TSLA", name: "Tesla Inc.", sector: "Automotive" },
  { symbol: "AMD", name: "Advanced Micro Devices", sector: "Semiconductors" },
  { symbol: "AVGO", name: "Broadcom Inc.", sector: "Semiconductors" },
  { symbol: "NFLX", name: "Netflix Inc.", sector: "Communication Services" },
  { symbol: "JPM", name: "JPMorgan Chase", sector: "Financials" },
  { symbol: "V", name: "Visa Inc.", sector: "Financials" },
  { symbol: "MA", name: "Mastercard Inc.", sector: "Financials" },
  { symbol: "BRK.B", name: "Berkshire Hathaway", sector: "Financials" },
  { symbol: "XOM", name: "Exxon Mobil", sector: "Energy" },
  { symbol: "CVX", name: "Chevron Corp.", sector: "Energy" },
  { symbol: "JNJ", name: "Johnson & Johnson", sector: "Healthcare" },
  { symbol: "UNH", name: "UnitedHealth Group", sector: "Healthcare" },
  { symbol: "PG", name: "Procter & Gamble", sector: "Consumer Staples" },
  { symbol: "KO", name: "Coca-Cola Co.", sector: "Consumer Staples" },
  { symbol: "DIS", name: "Walt Disney Co.", sector: "Communication Services" },
  { symbol: "BA", name: "Boeing Co.", sector: "Industrials" },
  { symbol: "SPY", name: "SPDR S&P 500 ETF", sector: "ETF" },
  { symbol: "QQQ", name: "Invesco QQQ ETF", sector: "ETF" },
];

export const INDICES = ["SPY", "QQQ", "DIA", "IWM"] as const;

export function symbolMeta(symbol: string): UniverseEntry {
  return UNIVERSE.find((u) => u.symbol === symbol) ?? { symbol, name: symbol, sector: "—" };
}

// ---------------- Hooks ----------------
export function useQuote(symbol: string | undefined | null) {
  const getQuote = useServerFn(getQuoteFn);
  return useQuery({
    queryKey: ["fh:quote", symbol],
    enabled: !!symbol,
    queryFn: () => getQuote({ data: { symbol: symbol! } }),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

export function useQuotes(symbols: string[]) {
  const getQuotes = useServerFn(getQuotesFn);
  const key = [...symbols].sort().join(",");
  return useQuery({
    queryKey: ["fh:quotes", key],
    enabled: symbols.length > 0,
    queryFn: () => getQuotes({ data: { symbols } }),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

export function useCandles(symbol: string | undefined | null, days = 90, resolution: "D" | "60" | "30" = "D") {
  const getCandles = useServerFn(getCandlesFn);
  return useQuery({
    queryKey: ["fh:candles", symbol, resolution, days],
    enabled: !!symbol,
    queryFn: () => getCandles({ data: { symbol: symbol!, days, resolution } }),
    staleTime: 60_000,
  });
}

export function useSymbolSearch(query: string) {
  const searchSymbols = useServerFn(searchSymbolsFn);
  return useQuery({
    queryKey: ["fh:search", query],
    enabled: query.trim().length >= 1,
    queryFn: () => searchSymbols({ data: { query: query.trim() } }),
    staleTime: 60_000,
  });
}

export function useMarketNews(category: "general" | "crypto" | "forex" | "merger" = "general") {
  const getMarketNews = useServerFn(getMarketNewsFn);
  return useQuery({
    queryKey: ["fh:news", category],
    queryFn: () => getMarketNews({ data: { category } }),
    staleTime: 5 * 60_000,
    refetchInterval: 5 * 60_000,
  });
}

export function useCompanyProfile(symbol: string | undefined | null) {
  const getCompanyProfile = useServerFn(getCompanyProfileFn);
  return useQuery({
    queryKey: ["fh:profile", symbol],
    enabled: !!symbol,
    queryFn: () => getCompanyProfile({ data: { symbol: symbol! } }),
    staleTime: 24 * 60 * 60_000,
  });
}

export function useCompanyNews(symbol: string | undefined | null) {
  const getCompanyNews = useServerFn(getCompanyNewsFn);
  return useQuery({
    queryKey: ["fh:cnews", symbol],
    enabled: !!symbol,
    queryFn: () => getCompanyNews({ data: { symbol: symbol! } }),
    staleTime: 5 * 60_000,
  });
}

export function useBasicFinancials(symbol: string | undefined | null) {
  const fn = useServerFn(getBasicFinancialsFn);
  return useQuery({
    queryKey: ["fh:metric", symbol],
    enabled: !!symbol,
    queryFn: () => fn({ data: { symbol: symbol! } }),
    staleTime: 60 * 60_000,
  });
}

export function useRecommendations(symbol: string | undefined | null) {
  const fn = useServerFn(getRecommendationsFn);
  return useQuery({
    queryKey: ["fh:reco", symbol],
    enabled: !!symbol,
    queryFn: () => fn({ data: { symbol: symbol! } }),
    staleTime: 60 * 60_000,
  });
}

// Derived helpers
export function useTopMovers() {
  const { data: quotes = [], isLoading } = useQuotes(UNIVERSE.map((u) => u.symbol));
  const enriched = quotes
    .filter((q) => !q.error && q.price > 0)
    .map((q) => ({ ...q, ...symbolMeta(q.symbol) }));
  return {
    isLoading,
    gainers: [...enriched].sort((a, b) => b.changePct - a.changePct).slice(0, 6),
    losers: [...enriched].sort((a, b) => a.changePct - b.changePct).slice(0, 6),
    active: [...enriched].sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct)).slice(0, 6),
  };
}
