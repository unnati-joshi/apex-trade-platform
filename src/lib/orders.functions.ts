// Server-side order placement. Fetches a fresh live price from Finnhub
// right before invoking the atomic paper-trading RPC, eliminating client-side
// race conditions where the mark price is stale or zero.
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
});

interface FhQuote { c: number; d: number; dp: number; h: number; l: number; o: number; pc: number; t: number }

async function fetchLivePrice(symbol: string): Promise<number> {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) throw new Error("Market data provider is not configured on the server.");
  const url = new URL("https://finnhub.io/api/v1/quote");
  url.searchParams.set("symbol", symbol);
  url.searchParams.set("token", key);
  const res = await fetch(url.toString());
  if (res.status === 429) throw new Error("Market data rate limit — retry in a few seconds.");
  if (!res.ok) throw new Error(`Live quote failed (${res.status}). Check the symbol and try again.`);
  const q = (await res.json()) as FhQuote;
  const price = Number(q?.c);
  if (!price || price <= 0) throw new Error(`No live price available for ${symbol}. It may be unsupported or the market is closed.`);
  return price;
}

export const placeOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => PlaceOrderInput.parse(d))
  .handler(async ({ data, context }) => {
    const symbol = data.symbol.toUpperCase().trim();

    // For market orders, always fetch a fresh server-side quote.
    // For working orders, still fetch (used as a sanity mark), but tolerate failures for pure limit/stop tickets.
    let mark = 0;
    try {
      mark = await fetchLivePrice(symbol);
    } catch (e) {
      if (data.type === "market") throw e;
      mark = data.limit_price ?? data.stop_price ?? 0;
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
    if (error) throw new Error(error.message);
    return result as { order_id: string; status: string; fill_price?: number; realized_pnl?: number };
  });
