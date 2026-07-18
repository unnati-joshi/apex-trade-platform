import { createFileRoute } from "@tanstack/react-router";
import { MarketingLayout, PageHero } from "@/components/marketing/marketing-layout";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/api")({
  head: () => ({
    meta: [
      { title: "API Reference — Apex Trade" },
      { name: "description", content: "Every server function the Apex Trade platform exposes, with request and response shapes." },
      { property: "og:title", content: "API Reference — Apex Trade" },
      { property: "og:description", content: "Every server function the Apex Trade platform exposes, with request and response shapes." },
      { property: "og:url", content: "https://apex-trading-app.lovable.app/api" },
    ],
    links: [{ rel: "canonical", href: "https://apex-trading-app.lovable.app/api" }],
  }),
  component: ApiPage,
});

interface EP { method: "GET" | "POST"; name: string; desc: string; input?: string; output: string }

const ENDPOINTS: EP[] = [
  { method: "GET", name: "getQuote", desc: "Real-time quote for a single symbol.", input: `{ symbol: string }`, output: `{ symbol, price, change, changePct, high, low, open, prevClose, timestamp }` },
  { method: "POST", name: "getQuotes", desc: "Batch fetch quotes for up to 30 symbols.", input: `{ symbols: string[] }`, output: `Array<Quote>` },
  { method: "GET", name: "getCandles", desc: "Historical OHLC candles.", input: `{ symbol: string, resolution?: "D"|"60"|..., days?: number }`, output: `{ source, candles: [{ t, o, h, l, c, v }] }` },
  { method: "GET", name: "searchSymbols", desc: "Search stocks and ETFs by name or ticker.", input: `{ query: string }`, output: `Array<{ symbol, name }>` },
  { method: "GET", name: "getMarketNews", desc: "Latest market news headlines.", input: `{ category?: "general"|"crypto"|"forex"|"merger" }`, output: `Array<{ headline, summary, source, url, datetime, image }>` },
  { method: "GET", name: "getCompanyProfile", desc: "Company profile for an equity ticker.", input: `{ symbol: string }`, output: `{ name, exchange, industry, logo, marketCap, website, country, currency }` },
  { method: "POST", name: "chatAi", desc: "Send a message to the AI co-pilot; portfolio context is injected server-side.", input: `{ conversationId?: string, message: string }`, output: `{ conversationId, reply }` },
  { method: "POST", name: "place_paper_order (RPC)", desc: "Submit a paper order with server-side validation.", input: `{ portfolio_id, symbol, side, type, tif, quantity, limit_price?, stop_price?, mark_price }`, output: `{ order_id, status, fill_price?, realized_pnl? }` },
];

function ApiPage() {
  return (
    <MarketingLayout>
      <PageHero eyebrow="API" title="Server function reference" subtitle="Type-safe RPC calls exposed by the Apex Trade backend. All inputs are Zod-validated and RLS-scoped." />
      <section className="mx-auto max-w-4xl px-6 py-16 space-y-4">
        {ENDPOINTS.map((e) => (
          <div key={e.name} className="rounded-xl border border-border bg-surface-1/70 p-5">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className={e.method === "POST" ? "border-primary/40 text-primary" : "border-info/40 text-info"}>{e.method}</Badge>
              <code className="font-mono text-sm font-semibold">{e.name}</code>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{e.desc}</p>
            {e.input && (
              <div className="mt-3">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Input</div>
                <pre className="mt-1 overflow-x-auto rounded-md border border-border bg-surface-2 p-3 text-[12px]"><code className="font-mono">{e.input}</code></pre>
              </div>
            )}
            <div className="mt-3">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Output</div>
              <pre className="mt-1 overflow-x-auto rounded-md border border-border bg-surface-2 p-3 text-[12px]"><code className="font-mono">{e.output}</code></pre>
            </div>
          </div>
        ))}
      </section>
    </MarketingLayout>
  );
}
