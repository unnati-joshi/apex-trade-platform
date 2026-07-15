import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getQuote } from "@/lib/mock-market";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatPercent, pctClass } from "@/lib/format";
import { ArrowDownRight, ArrowUpRight, Briefcase, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Holding {
  id: string; symbol: string; quantity: number; avg_cost: number;
  portfolio_id: string; side: "long" | "short"; realized_pnl: number;
}
interface Portfolio {
  id: string; name: string; cash_balance: number; base_currency: string;
  is_paper: boolean; account_type: "cash" | "margin"; margin_multiplier: number;
}

export function PortfolioPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["portfolios:full"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return { portfolios: [], holdings: [] };
      const [{ data: portfolios }, { data: holdings }] = await Promise.all([
        supabase.from("portfolios").select("id,name,cash_balance,base_currency,is_paper,account_type,margin_multiplier").eq("user_id", u.user.id).order("created_at"),
        supabase.from("holdings").select("id,symbol,quantity,avg_cost,portfolio_id,side,realized_pnl"),
      ]);
      return {
        portfolios: (portfolios as Portfolio[]) ?? [],
        holdings: (holdings as Holding[]) ?? [],
      };
    },
  });

  const portfolios = data?.portfolios ?? [];
  const holdings = data?.holdings ?? [];
  const primary = portfolios[0];

  const longs = holdings.filter((h) => h.side === "long");
  const shorts = holdings.filter((h) => h.side === "short");

  const longEquity = longs.reduce((s, h) => s + getQuote(h.symbol).price * Number(h.quantity), 0);
  const longCost = longs.reduce((s, h) => s + Number(h.avg_cost) * Number(h.quantity), 0);
  const shortLiability = shorts.reduce((s, h) => s + getQuote(h.symbol).price * Number(h.quantity), 0);
  const shortProceeds = shorts.reduce((s, h) => s + Number(h.avg_cost) * Number(h.quantity), 0);

  const totalCash = portfolios.reduce((s, p) => s + Number(p.cash_balance), 0);
  const unrealized = (longEquity - longCost) + (shortProceeds - shortLiability);
  const realized = holdings.reduce((s, h) => s + Number(h.realized_pnl || 0), 0);
  const netEquity = totalCash + longEquity - shortLiability;
  const buyingPower = primary
    ? Number(primary.cash_balance) * Number(primary.margin_multiplier || 1)
    : totalCash;

  const sectors = longs.reduce<Record<string, number>>((acc, h) => {
    const q = getQuote(h.symbol);
    const mv = q.price * Number(h.quantity);
    acc[q.sector] = (acc[q.sector] ?? 0) + mv;
    return acc;
  }, {});

  const toggleMargin = useMutation({
    mutationFn: async () => {
      if (!primary) throw new Error("No account");
      const nextType = primary.account_type === "cash" ? "margin" : "cash";
      const nextMult = nextType === "margin" ? 2 : 1;
      // Cash mode requires no open short positions.
      if (nextType === "cash" && shorts.length > 0) {
        throw new Error("Close all short positions before switching to a cash account.");
      }
      const { error } = await supabase.from("portfolios")
        .update({ account_type: nextType, margin_multiplier: nextMult, name: nextType === "margin" ? "Margin Account" : "Cash Account" })
        .eq("id", primary.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Account updated");
      qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error("Update failed", { description: e.message }),
  });

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Portfolio</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Holdings & performance</h1>
        </div>
        {primary && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleMargin.mutate()}
            disabled={toggleMargin.isPending}
          >
            <ShieldAlert className="mr-2 h-3.5 w-3.5" />
            Switch to {primary.account_type === "cash" ? "Margin (2×)" : "Cash"} account
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <StatCard label="Net equity" value={formatCurrency(netEquity)} loading={isLoading} />
        <StatCard label="Cash" value={formatCurrency(totalCash)} loading={isLoading} />
        <StatCard label="Buying power" value={formatCurrency(buyingPower)} loading={isLoading} />
        <StatCard label="Unrealized" value={formatCurrency(unrealized)} valueClass={pctClass(unrealized)} loading={isLoading} />
        <StatCard label="Realized" value={formatCurrency(realized)} valueClass={pctClass(realized)} loading={isLoading} />
      </div>

      {primary && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-surface-1/60 px-4 py-2.5 text-xs">
          <Badge variant="outline" className={cn(primary.account_type === "margin" ? "border-warning/40 text-warning" : "border-primary/40 text-primary")}>
            {primary.account_type.toUpperCase()} · {primary.margin_multiplier}×
          </Badge>
          <span className="text-muted-foreground">
            {primary.account_type === "cash"
              ? "Long-only. Sells cannot exceed the quantity you hold."
              : "Shorts enabled. Buying power is cash × margin multiplier."}
          </span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <PositionsTable title="Long positions" rows={longs} loading={isLoading} side="long" />
          {shorts.length > 0 && (
            <PositionsTable title="Short positions" rows={shorts} loading={isLoading} side="short" />
          )}
          {longs.length === 0 && shorts.length === 0 && !isLoading && (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 p-16 text-center text-sm text-muted-foreground">
                <Briefcase className="h-8 w-8 opacity-50" />
                No positions yet. Head to Orders to place your first trade.
              </CardContent>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Sector allocation</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(sectors).sort((a, b) => b[1] - a[1]).map(([sector, mv]) => {
              const pct = longEquity === 0 ? 0 : (mv / longEquity) * 100;
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
            {Object.keys(sectors).length === 0 && (
              <div className="text-sm text-muted-foreground">No allocation yet.</div>
            )}
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

function PositionsTable({ title, rows, loading, side }: {
  title: string; rows: Holding[]; loading: boolean; side: "long" | "short";
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">{title}</CardTitle>
        <Badge variant="outline" className={side === "short" ? "border-bear/40 text-bear" : "border-bull/40 text-bull"}>
          {rows.length} {side === "short" ? "short" : "long"}
        </Badge>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-6">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="mb-2 h-9" />)}</div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">None.</div>
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
              {rows.map((h) => {
                const q = getQuote(h.symbol);
                const mv = q.price * Number(h.quantity);
                const cost = Number(h.avg_cost) * Number(h.quantity);
                // Short P&L: proceeds (cost basis) - current liability (mv).
                const pnl = side === "long" ? mv - cost : cost - mv;
                const pnlPct = cost === 0 ? 0 : (pnl / cost) * 100;
                return (
                  <TableRow key={h.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "grid h-6 w-6 place-items-center rounded text-[9px] font-bold",
                          side === "short" ? "bg-bear/20 text-bear" : "bg-bull/20 text-bull",
                        )}>
                          {side === "short" ? "S" : "L"}
                        </span>
                        <div>
                          <div className="font-mono text-sm font-medium">{h.symbol}</div>
                          <div className="max-w-[240px] truncate text-xs text-muted-foreground">{q.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="numeric text-right">{h.quantity}</TableCell>
                    <TableCell className="numeric text-right">{formatCurrency(Number(h.avg_cost))}</TableCell>
                    <TableCell className="numeric text-right">
                      <div className="inline-flex items-center gap-1">
                        {q.changePct >= 0 ? <ArrowUpRight className="h-3 w-3 text-bull" /> : <ArrowDownRight className="h-3 w-3 text-bear" />}
                        {formatCurrency(q.price)}
                      </div>
                    </TableCell>
                    <TableCell className="numeric text-right">{formatCurrency(mv)}</TableCell>
                    <TableCell className={`numeric text-right ${pctClass(pnl)}`}>
                      {formatCurrency(pnl)} <span className="opacity-70">({formatPercent(pnlPct)})</span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
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
