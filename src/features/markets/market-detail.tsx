import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  AreaChart, Area, LineChart, Line, ComposedChart, Bar, ResponsiveContainer,
  XAxis, YAxis, Tooltip as RTooltip, CartesianGrid, Legend,
} from "recharts";
import {
  useQuote, useCandles, useCompanyProfile, useBasicFinancials,
  useCompanyNews, useRecommendations, symbolMeta,
} from "@/lib/market";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCompact, formatCurrency, formatPercent, pctClass } from "@/lib/format";
import { formatDistanceToNow } from "date-fns";
import { ArrowUp, ArrowDown, ExternalLink, Building2, Globe, TrendingUp } from "lucide-react";

type Range = "1M" | "3M" | "6M" | "1Y" | "5Y";
type ChartKind = "area" | "line" | "candle";

const RANGE_DAYS: Record<Range, number> = { "1M": 30, "3M": 90, "6M": 180, "1Y": 365, "5Y": 1825 };

function sma(values: number[], period: number): (number | null)[] {
  const out: (number | null)[] = [];
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= period) sum -= values[i - period];
    out.push(i >= period - 1 ? sum / period : null);
  }
  return out;
}

function rsi(values: number[], period = 14): (number | null)[] {
  const out: (number | null)[] = [null];
  let avgG = 0, avgL = 0;
  for (let i = 1; i < values.length; i++) {
    const d = values[i] - values[i - 1];
    const g = Math.max(d, 0);
    const l = Math.max(-d, 0);
    if (i <= period) {
      avgG += g; avgL += l;
      if (i === period) { avgG /= period; avgL /= period; }
      out.push(null);
    } else {
      avgG = (avgG * (period - 1) + g) / period;
      avgL = (avgL * (period - 1) + l) / period;
      const rs = avgL === 0 ? 100 : avgG / avgL;
      out.push(100 - 100 / (1 + rs));
    }
  }
  return out;
}

export function MarketDetailPage({ symbol }: { symbol: string }) {
  const sym = symbol.toUpperCase();
  const [range, setRange] = useState<Range>("6M");
  const [kind, setKind] = useState<ChartKind>("area");

  const { data: quote, isLoading: qLoading } = useQuote(sym);
  const { data: profile } = useCompanyProfile(sym);
  const { data: metrics } = useBasicFinancials(sym);
  const { data: candlesRes, isLoading: cLoading } = useCandles(sym, RANGE_DAYS[range], "D");
  const { data: news = [] } = useCompanyNews(sym);
  const { data: recos = [] } = useRecommendations(sym);

  const meta = symbolMeta(sym);
  const name = profile?.name || meta.name;
  const price = quote?.price ?? 0;
  const changePct = quote?.changePct ?? 0;
  const change = quote?.change ?? 0;

  const chartData = useMemo(() => {
    const candles = candlesRes?.candles ?? [];
    const closes = candles.map((c) => c.c);
    const sma20 = sma(closes, 20);
    const sma50 = sma(closes, 50);
    const rsi14 = rsi(closes, 14);
    return candles.map((c, i) => ({
      t: new Date(c.t).toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
      close: c.c, open: c.o, high: c.h, low: c.l, vol: c.v,
      sma20: sma20[i], sma50: sma50[i], rsi: rsi14[i],
      body: [Math.min(c.o, c.c), Math.max(c.o, c.c)] as [number, number],
      wick: [c.l, c.h] as [number, number],
      bull: c.c >= c.o,
    }));
  }, [candlesRes]);

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {profile?.logo ? (
            <img src={profile.logo} alt="" className="h-14 w-14 rounded-md border border-border bg-white object-contain p-1" />
          ) : (
            <div className="grid h-14 w-14 place-items-center rounded-md bg-surface-2 font-mono text-lg font-semibold">
              {sym.slice(0, 2)}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-mono text-2xl font-semibold tracking-tight">{sym}</h1>
              {profile?.exchange && <Badge variant="outline" className="text-[10px]">{profile.exchange}</Badge>}
            </div>
            <div className="text-sm text-muted-foreground">{name}</div>
          </div>
        </div>
        <div className="flex items-end gap-6">
          <div className="text-right">
            {qLoading ? <Skeleton className="h-8 w-32" /> : (
              <>
                <div className="numeric text-3xl font-semibold">{formatCurrency(price)}</div>
                <div className={`flex items-center justify-end gap-1 text-sm ${pctClass(changePct)}`}>
                  {change >= 0 ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
                  {formatCurrency(change)} ({formatPercent(changePct)})
                </div>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Button asChild className="bg-bull text-bull-foreground hover:opacity-90">
              <Link to="/orders" search={{ symbol: sym, side: "buy" } as never}>Buy</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/orders" search={{ symbol: sym, side: "sell" } as never}>Sell</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
            {(["1M", "3M", "6M", "1Y", "5Y"] as Range[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`rounded px-2.5 py-1 text-xs ${range === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >{r}</button>
            ))}
          </div>
          <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
            {(["area", "line", "candle"] as ChartKind[]).map((k) => (
              <button
                key={k}
                onClick={() => setKind(k)}
                className={`rounded px-2.5 py-1 text-xs capitalize ${kind === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >{k}</button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[380px] w-full">
            {cLoading ? (
              <Skeleton className="h-full w-full" />
            ) : chartData.length === 0 ? (
              <div className="grid h-full place-items-center text-sm text-muted-foreground">
                Historical candles are unavailable for this symbol on the current plan.
              </div>
            ) : kind === "area" ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="gArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                  <XAxis dataKey="t" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                  <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} domain={["auto", "auto"]} width={60} />
                  <RTooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="close" name="Close" stroke="var(--color-primary)" strokeWidth={2} fill="url(#gArea)" />
                  <Line type="monotone" dataKey="sma20" name="SMA 20" stroke="hsl(var(--warning, 45 90% 55%))" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="sma50" name="SMA 50" stroke="hsl(280 90% 65%)" strokeWidth={1.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : kind === "line" ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                  <XAxis dataKey="t" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                  <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} domain={["auto", "auto"]} width={60} />
                  <RTooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="close" name="Close" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="sma20" name="SMA 20" stroke="hsl(45 90% 55%)" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="sma50" name="SMA 50" stroke="hsl(280 90% 65%)" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                  <XAxis dataKey="t" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                  <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} domain={["auto", "auto"]} width={60} />
                  <RTooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="wick" barSize={1} fill="var(--muted-foreground)" />
                  <Bar dataKey="body" barSize={6}
                    // color per row via shape function
                    shape={(props: { x?: number; y?: number; width?: number; height?: number; payload?: { bull?: boolean } }) => {
                      const { x = 0, y = 0, width = 0, height = 0, payload } = props;
                      const fill = payload?.bull ? "var(--color-bull, #10b981)" : "var(--color-bear, #ef4444)";
                      return <rect x={x} y={y} width={width} height={Math.max(1, height)} fill={fill} />;
                    }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Key stats + profile + reco */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Key statistics</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm md:grid-cols-3">
              <Stat label="Open" value={quote ? formatCurrency(quote.open) : "—"} />
              <Stat label="Prev close" value={quote ? formatCurrency(quote.prevClose) : "—"} />
              <Stat label="Day high" value={quote ? formatCurrency(quote.high) : "—"} />
              <Stat label="Day low" value={quote ? formatCurrency(quote.low) : "—"} />
              <Stat label="52w high" value={metrics?.week52High != null ? formatCurrency(metrics.week52High) : "—"} />
              <Stat label="52w low" value={metrics?.week52Low != null ? formatCurrency(metrics.week52Low) : "—"} />
              <Stat label="Market cap" value={profile?.marketCap ? formatCompact(profile.marketCap) : "—"} />
              <Stat label="Shares out." value={profile?.sharesOutstanding ? formatCompact(profile.sharesOutstanding) : "—"} />
              <Stat label="P/E (TTM)" value={fmtNum(metrics?.peRatio)} />
              <Stat label="EPS (TTM)" value={fmtNum(metrics?.eps)} />
              <Stat label="Beta" value={fmtNum(metrics?.beta)} />
              <Stat label="Div yield" value={metrics?.dividendYield != null ? `${metrics.dividendYield.toFixed(2)}%` : "—"} />
              <Stat label="P/B" value={fmtNum(metrics?.priceToBook)} />
              <Stat label="ROE (TTM)" value={metrics?.roeTTM != null ? `${metrics.roeTTM.toFixed(2)}%` : "—"} />
              <Stat label="Profit margin" value={metrics?.profitMargin != null ? `${metrics.profitMargin.toFixed(2)}%` : "—"} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Company</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row icon={<Building2 className="h-3.5 w-3.5" />} label="Industry" value={profile?.industry || "—"} />
            <Row icon={<Globe className="h-3.5 w-3.5" />} label="Country" value={profile?.country || "—"} />
            <Row icon={<TrendingUp className="h-3.5 w-3.5" />} label="IPO" value={profile?.ipo || "—"} />
            {profile?.website && (
              <a href={profile.website} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                {profile.website.replace(/^https?:\/\//, "")} <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {recos.length > 0 && (
              <div className="mt-4 border-t border-border pt-3">
                <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Analyst ratings ({recos[0].period})</div>
                <div className="flex items-center gap-1 text-xs">
                  <RecoPill label="Strong buy" n={recos[0].strongBuy} tone="bull" />
                  <RecoPill label="Buy" n={recos[0].buy} tone="bull" />
                  <RecoPill label="Hold" n={recos[0].hold} tone="mute" />
                  <RecoPill label="Sell" n={recos[0].sell} tone="bear" />
                  <RecoPill label="Strong sell" n={recos[0].strongSell} tone="bear" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* News */}
      <Card>
        <CardHeader><CardTitle className="text-base">Latest news</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="company">
            <TabsList className="mx-6 mt-2 w-[260px]">
              <TabsTrigger value="company">Company ({news.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="company">
              {news.length === 0 ? (
                <div className="p-10 text-center text-sm text-muted-foreground">No recent news.</div>
              ) : (
                <div className="divide-y divide-border">
                  {news.slice(0, 12).map((n) => (
                    <a key={n.id} href={n.url} target="_blank" rel="noreferrer" className="flex gap-4 p-4 hover:bg-surface-2">
                      {n.image && <img src={n.image} alt="" className="h-16 w-24 rounded object-cover" />}
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium">{n.headline}</div>
                        <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{n.summary}</div>
                        <div className="mt-1 text-[11px] text-muted-foreground">
                          {n.source} · {formatDistanceToNow(new Date(n.datetime), { addSuffix: true })}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function fmtNum(n: number | null | undefined) {
  if (n == null || !isFinite(n)) return "—";
  return n.toFixed(2);
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="numeric mt-0.5 font-medium">{value}</div>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">{icon}{label}</span>
      <span className="text-right text-sm">{value}</span>
    </div>
  );
}

function RecoPill({ label, n, tone }: { label: string; n: number; tone: "bull" | "bear" | "mute" }) {
  const cls = tone === "bull" ? "bg-bull/10 text-bull border-bull/30"
    : tone === "bear" ? "bg-bear/10 text-bear border-bear/30"
    : "bg-surface-2 text-muted-foreground border-border";
  return (
    <div className={`rounded-md border px-2 py-1 text-[10px] ${cls}`}>
      <div>{label}</div>
      <div className="text-center font-mono font-semibold">{n}</div>
    </div>
  );
}
