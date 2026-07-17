// Compatibility shim. The synthetic-market module has been replaced with
// real Finnhub-backed data in `@/lib/market.ts`. This file re-exports the
// metadata-only helpers and provides typed placeholders so any lingering
// synchronous getQuote(symbol) call renders empty state instead of crashing.

export { UNIVERSE, INDICES, symbolMeta, type UniverseEntry, type Quote } from "./market";
import { symbolMeta } from "./market";

// Legacy sync helpers — kept only for backwards compatibility.
// New code should use useQuote/useQuotes from `@/lib/market` instead.
export interface LegacyQuote {
  symbol: string; name: string; sector: string;
  price: number; change: number; changePct: number;
  volume: number; marketCap: number;
}

export function getQuote(symbol: string): LegacyQuote {
  const meta = symbolMeta(symbol);
  return { ...meta, price: 0, change: 0, changePct: 0, volume: 0, marketCap: 0 };
}

export interface Candle { t: number; o: number; h: number; l: number; c: number; v: number }
export function candles(_symbol: string, _count = 90): Candle[] { return []; }

export function listUniverse(): LegacyQuote[] {
  return [] as LegacyQuote[]; // legacy — components should read from useQuotes now.
}

export function searchSymbols(_q: string): LegacyQuote[] { return []; }

export function topMovers() {
  return { gainers: [] as LegacyQuote[], losers: [] as LegacyQuote[], volume: [] as LegacyQuote[] };
}
