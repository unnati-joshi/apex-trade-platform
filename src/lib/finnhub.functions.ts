// Server-side Finnhub proxy. Never expose FINNHUB_API_KEY to the browser.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const BASE = "https://finnhub.io/api/v1";

function getKey(): string {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) throw new Error("Market data unavailable: FINNHUB_API_KEY not set.");
  return key;
}

async function fh<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  const key = getKey();
  const url = new URL(BASE + path);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  url.searchParams.set("token", key);
  const res = await fetch(url.toString());
  if (res.status === 429) throw new Error("Rate limited by market data provider. Please retry shortly.");
  if (!res.ok) throw new Error(`Market data error ${res.status}`);
  return (await res.json()) as T;
}

// ---------------- Quote ----------------
interface FhQuote { c: number; d: number; dp: number; h: number; l: number; o: number; pc: number; t: number }

export const getQuote = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ symbol: z.string().min(1).max(20) }).parse(d))
  .handler(async ({ data }) => {
    const q = await fh<FhQuote>("/quote", { symbol: data.symbol.toUpperCase() });
    return {
      symbol: data.symbol.toUpperCase(),
      price: q.c ?? 0,
      change: q.d ?? 0,
      changePct: q.dp ?? 0,
      high: q.h ?? 0,
      low: q.l ?? 0,
      open: q.o ?? 0,
      prevClose: q.pc ?? 0,
      timestamp: (q.t ?? 0) * 1000,
    };
  });

export const getQuotes = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ symbols: z.array(z.string().min(1).max(20)).min(1).max(30) }).parse(d))
  .handler(async ({ data }) => {
    const symbols = Array.from(new Set(data.symbols.map((s) => s.toUpperCase())));
    const results = await Promise.allSettled(
      symbols.map((s) => fh<FhQuote>("/quote", { symbol: s })),
    );
    return results.map((r, i) => {
      if (r.status === "rejected" || !r.value?.c) {
        return { symbol: symbols[i], price: 0, change: 0, changePct: 0, high: 0, low: 0, open: 0, prevClose: 0, timestamp: 0, error: true };
      }
      const q = r.value;
      return {
        symbol: symbols[i], price: q.c, change: q.d, changePct: q.dp,
        high: q.h, low: q.l, open: q.o, prevClose: q.pc, timestamp: q.t * 1000, error: false,
      };
    });
  });

// ---------------- Candles (via /stock/candle if available; falls back to synthesized daily from quote) ----------------
interface FhCandles { c: number[]; h: number[]; l: number[]; o: number[]; t: number[]; v: number[]; s: string }

export const getCandles = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) =>
    z.object({
      symbol: z.string().min(1).max(20),
      resolution: z.enum(["1", "5", "15", "30", "60", "D", "W", "M"]).default("D"),
      days: z.number().int().min(1).max(365).default(90),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const to = Math.floor(Date.now() / 1000);
    const from = to - data.days * 86400;
    try {
      const r = await fh<FhCandles>("/stock/candle", {
        symbol: data.symbol.toUpperCase(), resolution: data.resolution, from, to,
      });
      if (r.s !== "ok" || !r.t?.length) return { candles: [], source: "unavailable" as const };
      return {
        source: "finnhub" as const,
        candles: r.t.map((t, i) => ({ t: t * 1000, o: r.o[i], h: r.h[i], l: r.l[i], c: r.c[i], v: r.v[i] })),
      };
    } catch {
      return { candles: [], source: "unavailable" as const };
    }
  });

// ---------------- Symbol search ----------------
interface FhSearch { count: number; result: Array<{ description: string; displaySymbol: string; symbol: string; type: string }> }

export const searchSymbols = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ query: z.string().min(1).max(50) }).parse(d))
  .handler(async ({ data }) => {
    const r = await fh<FhSearch>("/search", { q: data.query });
    return (r.result ?? [])
      .filter((x) => x.type === "Common Stock" || x.type === "ETP" || x.type === "ETF")
      .slice(0, 15)
      .map((x) => ({ symbol: x.displaySymbol || x.symbol, name: x.description }));
  });

// ---------------- Market news ----------------
interface FhNews { id: number; headline: string; summary: string; image: string; source: string; url: string; datetime: number; category: string }

export const getMarketNews = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ category: z.enum(["general", "forex", "crypto", "merger"]).default("general") }).parse(d))
  .handler(async ({ data }) => {
    const r = await fh<FhNews[]>("/news", { category: data.category });
    return (r ?? []).slice(0, 20).map((n) => ({
      id: n.id, headline: n.headline, summary: n.summary, image: n.image,
      source: n.source, url: n.url, datetime: n.datetime * 1000, category: n.category,
    }));
  });

// ---------------- Company profile ----------------
interface FhProfile { name: string; ticker: string; exchange: string; finnhubIndustry: string; logo: string; marketCapitalization: number; weburl: string; country: string; currency: string }

export const getCompanyProfile = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ symbol: z.string().min(1).max(20) }).parse(d))
  .handler(async ({ data }) => {
    const p = await fh<FhProfile>("/stock/profile2", { symbol: data.symbol.toUpperCase() });
    return {
      symbol: p.ticker || data.symbol.toUpperCase(),
      name: p.name || data.symbol.toUpperCase(),
      exchange: p.exchange || "",
      industry: p.finnhubIndustry || "",
      logo: p.logo || "",
      marketCap: (p.marketCapitalization ?? 0) * 1_000_000,
      website: p.weburl || "",
      country: p.country || "",
      currency: p.currency || "USD",
    };
  });
