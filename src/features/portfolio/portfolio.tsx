import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getQuote } from "@/lib/mock-market";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatPercent, pctClass } from "@/lib/format";
import { Briefcase } from "lucide-react";

interface Holding { id: string; symbol: string; quantity: number; avg_cost: number; portfolio_id: string; }
interface Portfolio { id: string; name: string; cash_balance: number; base_currency: string; is_paper: boolean; }

export function PortfolioPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["portfolios:full"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return { portfolios: [], holdings: [] };
      const [{ data: portfolios }, { data: holdings }] = await Promise.all([
        supabase.from("portfolios").select("id,name,cash_balance,base_currency,is_paper").eq("user_id", u.user.id).order("created_at"),
        supabase.from("holdings").select("id,symbol,quantity,avg_cost,portfolio_id"),
      ]);
      return { portfolios: (portfolios as Portfolio[]) ?? [], holdings: (holdings as Holding[]) ?? [] };
    },
  });

  const portfolios = data?.portfolios ?? [];
  const holdings = data?.holdings ?? [];

  const totalEquity = holdings.reduce((s, h) => s + getQuote(h.symbol).price * Number(h.quantity), 0);
  const totalCost = holdings.reduce((s, h) => s + Number(h.avg_cost) * Number(h.quantity), 0);
  const totalPnl = totalEquity - totalCost;
  const totalCash = portfolios.reduce((s, p) => s + Number(p.cash_balance), 0);

  const sectors = holdings.reduce<Record<string, number>>((acc, h) => {
    const q = getQuote(h.symbol);
    const mv = q.price * Number(h.quantity);
    acc[q.sector] = (acc[q.sector] ?? 0) + mv;
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-6">
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Portfolio</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Holdings & performance</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Net worth" value={formatCurrency(totalEquity + totalCash)} loading={isLoading} />
        <StatCard label="Equity" value={formatCurrency(totalEquity)} loading={isLoading} />
        <StatCard label="Cash" value={formatCurrency(totalCash)} loading={isLoading} />
        <StatCard label="Unrealized P&L" value={formatCurrency(totalPnl)} valueClass={pctClass(totalPnl)} loading={isLoading} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader><CardTitle className="text-base">All holdings</CardTitle></CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="mb-2 h-9" />)}</div>
            ) : holdings.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-16 text-center text-sm text-muted-foreground">
                <Briefcase className="h-8 w-8 opacity-50" />
                No positions yet. Place an order to start building your book.
              </div>
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
                    <TableHead className="text-right">Day %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {holdings.map((h) => {
                    const q = getQuote(h.symbol);
                    const mv = q.price * Number(h.quantity);
                    const cost = Number(h.avg_cost) * Number(h.quantity);
                    const pnl = mv - cost;
                    const pnlPct = cost === 0 ? 0 : (pnl / cost) * 100;
                    return (
                      <TableRow key={h.id}>
                        <TableCell>
                          <div className="font-mono text-sm font-medium">{h.symbol}</div>
                          <div className="max-w-[240px] truncate text-xs text-muted-foreground">{q.name}</div>
                        </TableCell>
                        <TableCell className="numeric text-right">{h.quantity}</TableCell>
                        <TableCell className="numeric text-right">{formatCurrency(Number(h.avg_cost))}</TableCell>
                        <TableCell className="numeric text-right">{formatCurrency(q.price)}</TableCell>
                        <TableCell className="numeric text-right">{formatCurrency(mv)}</TableCell>
                        <TableCell className={`numeric text-right ${pctClass(pnl)}`}>
                          {formatCurrency(pnl)} <span className="opacity-70">({formatPercent(pnlPct)})</span>
                        </TableCell>
                        <TableCell className={`numeric text-right ${pctClass(q.changePct)}`}>{formatPercent(q.changePct)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Sector allocation</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(sectors).sort((a,b)=>b[1]-a[1]).map(([sector, mv]) => {
              const pct = totalEquity === 0 ? 0 : (mv/totalEquity)*100;
              return (
                <div key={sector}>
                  <div className="flex items-center justify-between text-sm">
                    <span>{sector}</span>
                    <span className="numeric text-muted-foreground">{formatCurrency(mv)} · {pct.toFixed(1)}%</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {portfolios.length > 0 && (
              <div className="mt-6 border-t border-border pt-4">
                <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Accounts</div>
                {portfolios.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-1.5 text-sm">
                    <span className="flex items-center gap-2">
                      {p.name}
                      {p.is_paper && <Badge variant="outline" className="text-[10px]">Paper</Badge>}
                    </span>
                    <span className="numeric">{formatCurrency(Number(p.cash_balance), p.base_currency)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ label, value, valueClass, loading }: { label: string; value: string; valueClass?: string; loading?: boolean }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="text-xs text-muted-foreground">{label}</div>
        {loading ? <Skeleton className="mt-3 h-8 w-28" /> : (
          <div className={`mt-3 numeric text-2xl font-semibold tracking-tight ${valueClass ?? ""}`}>{value}</div>
        )}
      </CardContent>
    </Card>
  );
}
