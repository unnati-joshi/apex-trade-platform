import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const Input = z.object({
  conversationId: z.string().uuid().optional(),
  message: z.string().min(1).max(4000),
});

const SYSTEM = `You are Apex, an institutional trading co-pilot and market educator.

## Behaviour
- Be concise, precise, and professional — write like a senior quant strategist.
- ALWAYS answer the user's question. Never refuse just because live data is missing.
- If a "Live market snapshot" section is present, use those exact numbers — never invent prices, PE, EPS, 52w, or market cap figures.
- If live data for a symbol is NOT present, still answer using: general market knowledge, historical context, fundamentals you know, sector dynamics, macro drivers, and recent widely-known events. Add ONE short line noting which real-time metrics were unavailable.
- For general finance questions (RSI, MACD, options, PE, ETFs, inflation, bear market, volatility, etc.) answer fully from your knowledge — no live data needed.

## Formatting
- Use rich markdown: short paragraphs, bullet lists, and GitHub-flavoured tables for metrics and side-by-side comparisons.
- For "explain volatility / why did X move" style questions, structure as: **Snapshot** → **Key drivers** (bulleted) → **Technical read** (trend, momentum via RSI/MACD framing, support/resistance) → **Fundamental read** → **Bull vs Bear** → **Risk caveat**.
- For "compare A vs B", produce a markdown comparison table (Price, Change %, Market Cap, PE, EPS, Beta, Div Yield, 52w range) followed by a short verdict.
- For "should I buy X", give: valuation snapshot, trend read, catalysts, risks, opportunities, and a one-line balanced conclusion — never a personalised recommendation.

## Guardrails
- Do not provide personalised financial advice or guarantee outcomes.
- End positioning/strategy answers with a one-line risk caveat.
`;


interface ChatMessage { role: "user" | "assistant" | "system"; content: string }

export const chatAi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data, context }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI Gateway not configured");

    const { supabase, userId } = context;

    // Get or create conversation
    let convId = data.conversationId;
    if (!convId) {
      const { data: c, error } = await supabase.from("ai_conversations")
        .insert({ user_id: userId, title: data.message.slice(0, 60), model: "google/gemini-3-flash-preview" })
        .select("id").single();
      if (error) throw error;
      convId = c.id;
    }

    // Save user message
    await supabase.from("ai_messages").insert({
      conversation_id: convId, role: "user", content: data.message,
    });

    // Fetch history
    const { data: history } = await supabase.from("ai_messages")
      .select("role,content").eq("conversation_id", convId)
      .order("created_at", { ascending: true }).limit(30);

    // Portfolio context
    const [{ data: pf }, { data: holdings }] = await Promise.all([
      supabase.from("portfolios").select("cash_balance,base_currency,name").eq("user_id", userId).limit(1).maybeSingle(),
      supabase.from("holdings").select("symbol,quantity,avg_cost"),
    ]);

    const ctxLine = pf
      ? `Portfolio: ${pf.name} · Cash ${pf.cash_balance} ${pf.base_currency}. Positions: ${(holdings ?? []).map(h => `${h.symbol}×${h.quantity}@${h.avg_cost}`).join(", ") || "none"}.`
      : "No portfolio.";

    // Extract ticker mentions from the last user message and enrich with a live snapshot
    const mentioned = extractTickers(data.message, (holdings ?? []).map((h) => h.symbol));
    const snapshot = await buildSnapshot(mentioned);

    const messages: ChatMessage[] = [
      { role: "system", content: `${SYSTEM}\n\nUser context: ${ctxLine}${snapshot ? `\n\nLive market snapshot (real-time via Finnhub):\n${snapshot}` : ""}` },
      ...((history as ChatMessage[]) ?? []),
    ];

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
      body: JSON.stringify({ model: "google/gemini-2.5-flash", messages }),
    });
    if (res.status === 429) throw new Error("Rate limited — try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted for this workspace.");
    if (!res.ok) throw new Error(`AI error: ${res.status}`);
    const json = await res.json();
    const reply = json?.choices?.[0]?.message?.content ?? "(no response)";

    await supabase.from("ai_messages").insert({
      conversation_id: convId, role: "assistant", content: reply,
    });
    await supabase.from("ai_conversations").update({ updated_at: new Date().toISOString() }).eq("id", convId);

    return { conversationId: convId, reply };
  });

export const listConversations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("ai_conversations")
      .select("id,title,updated_at").order("updated_at", { ascending: false }).limit(50);
    return data ?? [];
  });

export const getMessages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ conversationId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: msgs } = await context.supabase.from("ai_messages")
      .select("id,role,content,created_at").eq("conversation_id", data.conversationId)
      .order("created_at", { ascending: true });
    return msgs ?? [];
  });

// ---- Snapshot helpers (server-only Finnhub fetch, plain HTTP) ----

const FINNHUB_BASE = "https://finnhub.io/api/v1";

const KNOWN_TICKERS = new Set([
  "AAPL","MSFT","NVDA","GOOGL","GOOG","META","AMZN","TSLA","AMD","AVGO","NFLX","JPM","V","MA","BRK.B",
  "XOM","CVX","JNJ","UNH","PG","KO","DIS","BA","SPY","QQQ","DIA","IWM","BTC","ETH","INTC","ORCL","CRM",
]);

function extractTickers(text: string, holdingSyms: string[]): string[] {
  const found = new Set<string>();
  for (const s of holdingSyms) if (s) found.add(s.toUpperCase());
  const dollar = text.match(/\$([A-Z]{1,5})\b/g) ?? [];
  for (const t of dollar) found.add(t.slice(1));
  const upper = text.match(/\b[A-Z]{2,5}\b/g) ?? [];
  for (const t of upper) if (KNOWN_TICKERS.has(t)) found.add(t);
  return Array.from(found).slice(0, 5);
}

async function fetchJson<T>(path: string, params: Record<string, string | number>): Promise<T | null> {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) return null;
  const url = new URL(FINNHUB_BASE + path);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  url.searchParams.set("token", key);
  try {
    const r = await fetch(url.toString());
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  }
}

async function buildSnapshot(symbols: string[]): Promise<string> {
  if (symbols.length === 0) return "";
  const today = new Date();
  const monthAgo = new Date(today.getTime() - 30 * 86400_000);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  const rows = await Promise.all(symbols.map(async (sym) => {
    const [q, p, m, reco, news] = await Promise.all([
      fetchJson<{ c: number; d: number; dp: number; h: number; l: number; o: number; pc: number }>("/quote", { symbol: sym }),
      fetchJson<{ name?: string; finnhubIndustry?: string; marketCapitalization?: number; country?: string; ipo?: string; weburl?: string }>("/stock/profile2", { symbol: sym }),
      fetchJson<{ metric?: Record<string, number | null | undefined> }>("/stock/metric", { symbol: sym, metric: "all" }),
      fetchJson<Array<{ buy: number; hold: number; sell: number; strongBuy: number; strongSell: number; period: string }>>("/stock/recommendation", { symbol: sym }),
      fetchJson<Array<{ headline: string; datetime: number; source: string }>>("/company-news", { symbol: sym, from: fmt(monthAgo), to: fmt(today) }),
    ]);
    if (!q || !q.c) {
      return `- ${sym}: live quote unavailable (symbol may be unsupported or provider rate-limited). Answer using general knowledge and note this in your reply.`;
    }
    const met = m?.metric ?? {};
    const num = (k: string) => (typeof met[k] === "number" ? (met[k] as number).toFixed(2) : "—");
    const r = reco?.[0];
    const recoLine = r
      ? `  analysts(latest ${r.period}): strongBuy=${r.strongBuy} buy=${r.buy} hold=${r.hold} sell=${r.sell} strongSell=${r.strongSell}`
      : "";
    const headlines = (news ?? []).slice(0, 5).map((n) => `    • [${n.source}] ${n.headline}`).join("\n");
    return [
      `- ${sym} (${p?.name ?? sym}${p?.finnhubIndustry ? ` · ${p.finnhubIndustry}` : ""}${p?.country ? ` · ${p.country}` : ""})`,
      `  price=${q.c.toFixed(2)} chg=${q.d.toFixed(2)} (${q.dp.toFixed(2)}%) open=${q.o.toFixed(2)} high=${q.h.toFixed(2)} low=${q.l.toFixed(2)} prevClose=${q.pc.toFixed(2)}`,
      `  52wH=${num("52WeekHigh")} 52wL=${num("52WeekLow")} PE=${num("peBasicExclExtraTTM")} EPS=${num("epsInclExtraItemsTTM")} beta=${num("beta")} divYield=${num("currentDividendYieldTTM")}% ROE=${num("roeTTM")}% margin=${num("netProfitMarginTTM")}% mcap=${p?.marketCapitalization ? (p.marketCapitalization / 1000).toFixed(1) + "B" : "—"}`,
      recoLine,
      headlines ? `  recent headlines (last 30d):\n${headlines}` : "",
    ].filter(Boolean).join("\n");
  }));
  return rows.filter(Boolean).join("\n");
}


