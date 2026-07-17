import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useQuotes, useCandles, useTopMovers, UNIVERSE, symbolMeta, type Quote } from "@/lib/market";
import { formatCompact, formatCurrency, formatPercent, pctClass } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip as RTooltip } from "recharts";
import {
  Activity, ArrowDownRight, ArrowUpRight, Briefcase, Percent, TrendingUp, Wallet,
} from "lucide-react";
import { Link } from "@tanstack/react-router";

interface Holding { id: string; symbol: string; quantity: number; avg_cost: number }
interface Portfolio { id: string; name: string; cash_balance: number; base_currency: string }

export function Dashboard() {
  const { data: portfolio } = useQuery({
    queryKey: ["me:portfolio"],
    queryFn: async (): Promise<{ portfolio: Portfolio | null; holdings: Holding[] }> => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return { portfolio: null, holdings: [] };

      let { data: pf } = await supabase
        .from("portfolios")
        .select("id,name,cash_balance,base_currency")
        .eq("user_id", u.user.id)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!pf) {
        const { data: inserted } = await supabase.from("portfolios").insert({
          user_id: u.user.id, name: "Cash Account", base_currency: "USD",
          cash_balance: 100000, is_paper: true, account_type: "cash", margin_multiplier: 1,
        }).select("id,name,cash_balance,base_currency").single();
        pf = inserted;
      }

      const { data: holdings } = await supabase
        .from("holdings").select("id,symbol,quantity,avg_cost")
        .eq("portfolio_id", pf?.id ?? "00000000-0000-0000-0000-000000000000")
        .eq("side", "long");

      return { portfolio: pf as Portfolio | null, holdings: (holdings as Holding[]) ?? [] };
    },
  });

  const holdings = portfolio?.holdings ?? [];
  const pf = portfolio?.portfolio ?? null;

  const heldSymbols = holdings.map((h) => h.symbol);
  const { data: heldQuotes = [] } = useQuotes(heldSymbols);
  const quoteBySymbol = useMemo(() => new Map(heldQuotes.map((q) => [q.symbol, q])), [heldQuotes]);

  const positions = holdings.map((h) => {
    const q = quoteBySymbol.get(h.symbol);
    const price = q?.price ?? 0;
    const change = q?.change ?? 0;
    const mv = price * Number(h.quantity);
    const cost = Number(h.avg_cost) * Number(h.quantity);
    const pnl = mv - cost;
    const pnlPct = cost === 0 ? 0 : (pnl / cost) * 100;
    return { ...h, quote: q, price, change, marketValue: mv, cost, pnl, pnlPct };
  });

  const equity = positions.reduce((s, p) => s + p.marketValue, 0);
  const totalPnl = positions.reduce((s, p) => s + p.pnl, 0);
  const totalCost = positions.reduce((s, p) => s + p.cost, 0);
  const totalPnlPct = totalCost === 0 ? 0 : (totalPnl / totalCost) * 100;
  const buyingPower = (pf?.cash_balance ?? 0) * 2;

  const dayPnl = positions.reduce((s, p) => s + p.change * Number(p.quantity), 0);
  const dayPnlPct = equity === 0 ? 0 : (dayPnl / equity) * 100;

  const { data: spyCandles } = useCandles("SPY", 30);
  const historyData = (spyCandles?.candles ?? []).map((c) => ({
    t: new Date(c.t).toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
    v: c.c,
  }));

  const movers = useTopMovers();
  const loading = !portfolio;

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-6">
      <TickerTape />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Dashboard</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{pf?.name ?? "Paper Portfolio"}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm"><Link to="/watchlist">Watchlist</Link></Button>
          <Button asChild size="sm"><Link to="/orders">New order</Link></Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi label="Portfolio value" value={loading ? undefined : formatCurrency(equity + (pf?.cash_balance ?? 0), pf?.base_currency)} hint={loading ? undefined : `${positions.length} positions`} icon={<Briefcase className="h-4 w-4" />} />
        <Kpi label="Today's P&L" value={loading ? undefined : formatCurrency(dayPnl, pf?.base_currency)} hint={loading ? undefined : formatPercent(dayPnlPct)} hintClass={pctClass(dayPnlPct)} trend={dayPnl >= 0 ? "up" : "down"} icon={<TrendingUp className="h-4 w-4" />} />
        <Kpi label="Total P&L" value={loading ? undefined : formatCurrency(totalPnl, pf?.base_currency)} hint={loading ? undefined : formatPercent(totalPnlPct)} hintClass={pctClass(totalPnlPct)} trend={totalPnl >= 0 ? "up" : "down"} icon={<Percent className="h-4 w-4" />} />
        <Kpi label="Buying power" value={loading ? undefined : formatCurrency(buyingPower, pf?.base_currency)} hint={loading ? undefined : `Cash ${formatCurrency(pf?.cash_balance ?? 0, pf?.base_currency)}`} icon={<Wallet className="h-4 w-4" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Market performance</CardTitle>
              <p className="text-xs text-muted-foreground">SPY · S&P 500 ETF · last 30 sessions</p>
            </div>
            <Badge variant="outline" className="border-primary/30 text-primary">Benchmark</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              {historyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historyData}>
                    <defs>
                      <linearGradient id="gEquity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="t" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} width={50} domain={["auto", "auto"]} />
                    <RTooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} labelStyle={{ color: "var(--muted-foreground)" }} formatter={(v: number) => [formatCurrency(v), "Price"]} />
                    <Area type="monotone" dataKey="v" stroke="var(--color-primary)" strokeWidth={2} fill="url(#gEquity)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Loading historical data…</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Allocation</CardTitle>
            <p className="text-xs text-muted-foreground">By market value</p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8" />)}</div>
            ) : positions.length === 0 ? (
              <EmptyRow text="No holdings yet." />
            ) : (
              <div className="space-y-3">
                {positions.slice().sort((a, b) => b.marketValue - a.marketValue).map((p) => {
                  const pct = equity === 0 ? 0 : (p.marketValue / equity) * 100;
                  return (
                    <div key={p.id}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-mono font-medium">{p.symbol}</span>
                        <span className="numeric text-muted-foreground">{formatCurrency(p.marketValue)} · {pct.toFixed(1)}%</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Positions</CardTitle>
            <Button asChild variant="ghost" size="sm"><Link to="/portfolio">View all</Link></Button>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="mb-2 h-9" />)}</div>
            ) : positions.length === 0 ? (
              <EmptyRow text="You don't hold any positions yet." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Avg cost</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Market value</TableHead>
                    <TableHead className="text-right">P&L</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {positions.map((p) => {
                    const meta = symbolMeta(p.symbol);
                    return (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="grid h-7 w-7 place-items-center rounded-md bg-surface-2 text-[10px] font-semibold">{p.symbol.slice(0, 2)}</span>
                            <div>
                              <div className="font-mono text-sm font-medium">{p.symbol}</div>
                              <div className="max-w-[220px] truncate text-xs text-muted-foreground">{meta.name}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="numeric text-right">{p.quantity}</TableCell>
                        <TableCell className="numeric text-right">{formatCurrency(Number(p.avg_cost))}</TableCell>
                        <TableCell className="numeric text-right">{p.price > 0 ? formatCurrency(p.price) : "—"}</TableCell>
                        <TableCell className="numeric text-right">{formatCurrency(p.marketValue)}</TableCell>
                        <TableCell className={`numeric text-right ${pctClass(p.pnl)}`}>
                          <div>{formatCurrency(p.pnl)}</div>
                          <div className="text-xs opacity-80">{formatPercent(p.pnlPct)}</div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Top movers</CardTitle></CardHeader>
          <CardContent className="p-0">
            {movers.isLoading ? (
              <div className="p-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="mb-2 h-9" />)}</div>
            ) : (
              <Tabs defaultValue="gainers">
                <TabsList className="mx-4 mt-2 grid w-[calc(100%-2rem)] grid-cols-3">
                  <TabsTrigger value="gainers">Gainers</TabsTrigger>
                  <TabsTrigger value="losers">Losers</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                </TabsList>
                <TabsContent value="gainers" className="mt-2"><MoverList items={movers.gainers} /></TabsContent>
                <TabsContent value="losers" className="mt-2"><MoverList items={movers.losers} /></TabsContent>
                <TabsContent value="active" className="mt-2"><MoverList items={movers.active} /></TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Kpi({ label, value, hint, hintClass, icon, trend }: { label: string; value?: string; hint?: string; hintClass?: string; icon: React.ReactNode; trend?: "up" | "down" }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{label}</span>
          <span className="grid h-7 w-7 place-items-center rounded-md bg-surface-2">{icon}</span>
        </div>
        <div className="mt-3 numeric text-2xl font-semibold tracking-tight">{value ?? <Skeleton className="h-8 w-32" />}</div>
        {hint && (
          <div className={`mt-1 flex items-center gap-1 text-xs ${hintClass ?? "text-muted-foreground"}`}>
            {trend === "up" && <ArrowUpRight className="h-3 w-3" />}
            {trend === "down" && <ArrowDownRight className="h-3 w-3" />}
            {hint}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MoverList({ items }: { items: Array<Quote & { name: string; sector: string }> }) {
  if (items.length === 0) return <div className="p-6 text-center text-xs text-muted-foreground">No data available.</div>;
  return (
    <div>
      {items.map((q) => (
        <div key={q.symbol} className="flex items-center justify-between border-t border-border px-4 py-2.5 first:border-t-0">
          <div className="min-w-0">
            <div className="font-mono text-sm font-medium">{q.symbol}</div>
            <div className="truncate text-xs text-muted-foreground">{q.name}</div>
          </div>
          <div className="text-right">
            <div className="numeric text-sm">{formatCurrency(q.price)}</div>
            <div className={`numeric text-xs ${pctClass(q.changePct)}`}>{formatPercent(q.changePct)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return <div className="flex items-center justify-center p-10 text-sm text-muted-foreground">{text}</div>;
}

function TickerTape() {
  const symbols = UNIVERSE.slice(0, 16).map((u) => u.symbol);
  const { data: quotes = [] } = useQuotes(symbols);
  const items = quotes.filter((q) => !q.error && q.price > 0);
  const seq = items.length > 0 ? [...items, ...items] : [];
  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface-1">
      <div className={`flex gap-8 py-2.5 pl-4 whitespace-nowrap ${seq.length > 0 ? "ticker-tape" : ""}`}>
        {seq.length === 0 && <div className="text-sm text-muted-foreground">Loading live tape…</div>}
        {seq.map((q, i) => (
          <div key={`${q.symbol}-${i}`} className="flex items-center gap-2 text-sm">
            <Activity className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-mono font-semibold">{q.symbol}</span>
            <span className="numeric">{formatCurrency(q.price)}</span>
            <span className={`numeric text-xs ${pctClass(q.changePct)}`}>{formatPercent(q.changePct)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Keep import used
void formatCompact;
