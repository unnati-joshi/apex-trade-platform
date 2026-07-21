// Server-side order placement. Fetches a fresh live price from Finnhub
// right before invoking the atomic paper-trading RPC. Uses a short in-memory
// cache to survive Finnhub rate limits and accepts a client-provided
// fallback mark so orders don't get rejected during a transient 429.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const PlaceOrderInput = z.object({
  portfolioId: z.string().uuid(),
  symbol: z.string().min(1).max(20),
  side: z.enum(["buy", "sell"]),
  type: z.enum(["market", "limit", "stop", "stop_limit", "trailing_stop"]),
  tif: z.enum(["day", "gtc", "ioc", "fok"]),
  quantity: z.number().positive().max(1_000_000),
  limit_price: z.number().positive().optional(),
  stop_price: z.number().positive().optional(),
  // Client-supplied cached price used only if the server-side live fetch fails.
  fallback_mark: z.number().positive().optional(),
});

interface FhQuote { c: number; d: number; dp: number; h: number; l: number; o: number; pc: number; t: number }

// Small in-memory quote cache keyed by symbol. Worker instances are short-lived
// but this still coalesces bursts of order attempts on the same ticker.
const QUOTE_TTL_MS = 10_000;
const QUOTE_STALE_MS = 60_000;
const quoteCache = new Map<string, { price: number; at: number }>();

async function fetchLivePrice(symbol: string): Promise<{ price: number; source: "live" | "cache" | "stale" }> {
  const cached = quoteCache.get(symbol);
  const now = Date.now();
  if (cached && now - cached.at < QUOTE_TTL_MS) {
    return { price: cached.price, source: "cache" };
  }
  const key = process.env.FINNHUB_API_KEY;
  if (!key) {
    if (cached) return { price: cached.price, source: "stale" };
    throw new Error("Market data provider is not configured on the server.");
  }
  const url = new URL("https://finnhub.io/api/v1/quote");
  url.searchParams.set("symbol", symbol);
  url.searchParams.set("token", key);
  let res: Response;
  try {
    res = await fetch(url.toString());
  } catch (e) {
    if (cached && now - cached.at < QUOTE_STALE_MS) return { price: cached.price, source: "stale" };
    throw new Error(`Network error reaching market data provider: ${(e as Error).message}`);
  }
  if (res.status === 429) {
    if (cached && now - cached.at < QUOTE_STALE_MS) return { price: cached.price, source: "stale" };
    throw new Error("RATE_LIMIT");
  }
  if (!res.ok) {
    if (cached && now - cached.at < QUOTE_STALE_MS) return { price: cached.price, source: "stale" };
    throw new Error(`Live quote failed (${res.status}). Check the symbol and try again.`);
  }
  const q = (await res.json()) as FhQuote;
  const price = Number(q?.c);
  if (!price || price <= 0) {
    if (cached && now - cached.at < QUOTE_STALE_MS) return { price: cached.price, source: "stale" };
    throw new Error(`No live price available for ${symbol}. It may be unsupported or the market is closed.`);
  }
  quoteCache.set(symbol, { price, at: now });
  return { price, source: "live" };
}

export const placeOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => PlaceOrderInput.parse(d))
  .handler(async ({ data, context }) => {
    const symbol = data.symbol.toUpperCase().trim();

    let mark = 0;
    try {
      const r = await fetchLivePrice(symbol);
      mark = r.price;
    } catch (e) {
      const msg = (e as Error).message;
      // For market orders we prefer a live price but will accept the client's
      // cached quote if the provider is rate-limiting us. Working orders
      // don't need a mark at all.
      if (data.type === "market") {
        if (data.fallback_mark && data.fallback_mark > 0) {
          mark = data.fallback_mark;
        } else if (msg === "RATE_LIMIT") {
          throw new Error("Market data is rate-limited right now. Please retry in a few seconds.");
        } else {
          throw e;
        }
      } else {
        mark = data.limit_price ?? data.stop_price ?? data.fallback_mark ?? 0;
      }
    }

    const { data: result, error } = await context.supabase.rpc("place_paper_order", {
      _portfolio_id: data.portfolioId,
      _symbol: symbol,
      _side: data.side,
      _type: data.type,
      _tif: data.tif,
      _quantity: data.quantity,
      _limit_price: (data.limit_price ?? null) as unknown as number,
      _stop_price: (data.stop_price ?? null) as unknown as number,
      _mark_price: mark,
    });
    if (error) {
      console.error("[placeOrder] rpc error", error);
      throw new Error(error.message);
    }
    return result as { order_id: string; status: string; fill_price?: number; realized_pnl?: number };
  });
