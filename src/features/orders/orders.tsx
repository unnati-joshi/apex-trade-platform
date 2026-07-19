import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useQuote, useSymbolSearch, symbolMeta } from "@/lib/market";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { formatCurrency, formatPercent, pctClass } from "@/lib/format";
import { formatDistanceToNow } from "date-fns";
import { ArrowDown, ArrowUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const OrderSchema = z.object({
  symbol: z.string().min(1).max(12),
  side: z.enum(["buy", "sell"]),
  type: z.enum(["market", "limit", "stop", "stop_limit", "trailing_stop"]),
  tif: z.enum(["day", "gtc", "ioc", "fok"]),
  quantity: z.number().positive().max(1_000_000),
  limit_price: z.number().positive().optional(),
  stop_price: z.number().positive().optional(),
});

interface Order {
  id: string; symbol: string; side: "buy" | "sell"; type: string; status: string;
  quantity: number; filled_qty: number; limit_price: number | null; stop_price: number | null;
  avg_fill_price: number | null; tif: string; created_at: string; submitted_at: string | null;
}

export function OrdersPage() {
  const qc = useQueryClient();
  const [symbol, setSymbol] = useState("AAPL");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [type, setType] = useState<"market" | "limit" | "stop" | "stop_limit" | "trailing_stop">("market");
  const [tif, setTif] = useState<"day" | "gtc" | "ioc" | "fok">("day");
  const [qty, setQty] = useState("10");
  const [limit, setLimit] = useState("");
  const [stop, setStop] = useState("");

  const { data: quote } = useQuote(symbol);
  const { data: searchResults = [] } = useSymbolSearch(symbol.length >= 1 && symbol.length <= 5 ? symbol : "");
  const price = quote?.price ?? 0;
  const changePct = quote?.changePct ?? 0;
  const displayName = symbolMeta(symbol).name;
  const est = Number(qty || 0) * (Number(limit || price));
  const fee = est * 0.0005;

  const { data: portfolioId } = useQuery({
    queryKey: ["orders:pf"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const { data } = await supabase.from("portfolios").select("id").eq("user_id", u.user.id).limit(1).maybeSingle();
      return data?.id ?? null;
    },
  });

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders:list"],
    queryFn: async () => {
      const { data } = await supabase.from("orders")
        .select("id,symbol,side,type,status,quantity,filled_qty,limit_price,stop_price,avg_fill_price,tif,created_at,submitted_at")
        .order("created_at", { ascending: false }).limit(100);
      return (data as Order[]) ?? [];
    },
    refetchInterval: 15_000,
  });

  const place = useMutation({
    mutationFn: async () => {
      const parsed = OrderSchema.safeParse({
        symbol: symbol.toUpperCase().trim(),
        side, type, tif,
        quantity: Number(qty),
        limit_price: limit ? Number(limit) : undefined,
        stop_price: stop ? Number(stop) : undefined,
      });
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid order");
      if ((type === "limit" || type === "stop_limit") && !parsed.data.limit_price) throw new Error("Limit price required");
      if ((type === "stop" || type === "stop_limit" || type === "trailing_stop") && !parsed.data.stop_price) throw new Error("Stop price required");
      if (!portfolioId) throw new Error("No portfolio found. Reload the page.");

      // Server-side atomic placement + validation via RPC.
      // Blocks selling more than held (cash accounts) and enforces buying power on margin.
      const { data, error } = await supabase.rpc("place_paper_order", {
        _portfolio_id: portfolioId,
        _symbol: parsed.data.symbol,
        _side: parsed.data.side,
        _type: parsed.data.type,
        _tif: parsed.data.tif,
        _quantity: parsed.data.quantity,
        _limit_price: (parsed.data.limit_price ?? null) as unknown as number,
        _stop_price: (parsed.data.stop_price ?? null) as unknown as number,
        _mark_price: price,
      });
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      toast.success(`${side === "buy" ? "Bought" : "Sold"} ${qty} ${symbol.toUpperCase()}`);
      qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error("Order rejected", { description: e.message }),
  });

  const cancel = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("orders")
        .update({ status: "cancelled", cancelled_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Order cancelled"); qc.invalidateQueries({ queryKey: ["orders:list"] }); },
  });

  const openOrders = orders.filter(o => ["open","pending","partially_filled","draft"].includes(o.status));
  const history = orders.filter(o => !["open","pending","partially_filled","draft"].includes(o.status));

  return (
    <div className="mx-auto max-w-[1600px] p-6">
      <div className="mb-6">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Orders</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Order management</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        {/* Order ticket */}
        <Card>
          <CardHeader><CardTitle className="text-base">New order</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-1 rounded-md border border-border bg-surface-2 p-1">
              <button
                onClick={() => setSide("buy")}
                className={cn("rounded px-3 py-2 text-sm font-semibold transition-colors",
                  side === "buy" ? "bg-bull text-bull-foreground" : "text-muted-foreground hover:text-foreground")}
              ><ArrowUp className="mr-1 inline h-3.5 w-3.5" />Buy</button>
              <button
                onClick={() => setSide("sell")}
                className={cn("rounded px-3 py-2 text-sm font-semibold transition-colors",
                  side === "sell" ? "bg-bear text-bear-foreground" : "text-muted-foreground hover:text-foreground")}
              ><ArrowDown className="mr-1 inline h-3.5 w-3.5" />Sell</button>
            </div>

            <div className="space-y-2">
              <Label>Symbol</Label>
              <Input value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} placeholder="AAPL" list="symbols" />
              <datalist id="symbols">
                {searchResults.map((s) => <option key={s.symbol} value={s.symbol}>{s.name}</option>)}
              </datalist>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="truncate">{displayName}</span>
                <span className="numeric">
                  {formatCurrency(price)} <span className={pctClass(changePct)}>{formatPercent(changePct)}</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={type} onValueChange={(v: typeof type) => setType(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="market">Market</SelectItem>
                    <SelectItem value="limit">Limit</SelectItem>
                    <SelectItem value="stop">Stop</SelectItem>
                    <SelectItem value="stop_limit">Stop-limit</SelectItem>
                    <SelectItem value="trailing_stop">Trailing stop</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Time in force</Label>
                <Select value={tif} onValueChange={(v: typeof tif) => setTif(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Day</SelectItem>
                    <SelectItem value="gtc">GTC</SelectItem>
                    <SelectItem value="ioc">IOC</SelectItem>
                    <SelectItem value="fok">FOK</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input inputMode="decimal" value={qty} onChange={(e) => setQty(e.target.value)} />
            </div>
            {(type === "limit" || type === "stop_limit") && (
              <div className="space-y-2">
                <Label>Limit price</Label>
                <Input inputMode="decimal" value={limit} onChange={(e) => setLimit(e.target.value)} placeholder={String(price)} />
              </div>
            )}
            {(type === "stop" || type === "stop_limit" || type === "trailing_stop") && (
              <div className="space-y-2">
                <Label>Stop price</Label>
                <Input inputMode="decimal" value={stop} onChange={(e) => setStop(e.target.value)} placeholder={String(price)} />
              </div>
            )}

            <div className="rounded-md border border-border bg-surface-2 p-3 text-xs">
              <Row label="Estimated total" value={formatCurrency(est)} />
              <Row label="Est. commission" value={formatCurrency(fee)} />
              <Row label="Est. cash impact" value={formatCurrency(side === "buy" ? -(est + fee) : est - fee)}
                   valueClass={side === "buy" ? "text-bear" : "text-bull"} />
            </div>

            <Button
              className={cn("w-full font-semibold", side === "buy" ? "bg-bull text-bull-foreground hover:opacity-90" : "bg-bear text-bear-foreground hover:opacity-90")}
              disabled={place.isPending}
              onClick={() => place.mutate()}
            >
              {place.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Review & submit {side === "buy" ? "buy" : "sell"} order
            </Button>
            <p className="text-center text-[11px] text-muted-foreground">
              Paper trading — no real capital at risk.
            </p>
          </CardContent>
        </Card>

        {/* Orders list */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">All orders</CardTitle>
            <Badge variant="outline">{orders.length}</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="open">
              <TabsList className="mx-6 mt-2 grid w-[240px] grid-cols-2">
                <TabsTrigger value="open">Open ({openOrders.length})</TabsTrigger>
                <TabsTrigger value="history">History ({history.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="open">
                <OrderTable orders={openOrders} loading={isLoading} onCancel={(id) => cancel.mutate(id)} allowCancel />
              </TabsContent>
              <TabsContent value="history">
                <OrderTable orders={history} loading={isLoading} onCancel={() => {}} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-muted-foreground">{label}</span>
      <span className={`numeric ${valueClass ?? ""}`}>{value}</span>
    </div>
  );
}

function statusColor(s: string) {
  if (s === "filled") return "text-bull";
  if (s === "rejected" || s === "cancelled" || s === "expired") return "text-bear";
  if (s === "open" || s === "pending" || s === "partially_filled") return "text-warning";
  return "text-muted-foreground";
}

function OrderTable({ orders, loading, onCancel, allowCancel }: {
  orders: Order[]; loading: boolean; onCancel: (id: string) => void; allowCancel?: boolean;
}) {
  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  }
  if (orders.length === 0) {
    return <div className="p-16 text-center text-sm text-muted-foreground">No orders.</div>;
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Time</TableHead>
          <TableHead>Symbol</TableHead>
          <TableHead>Side</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="text-right">Qty</TableHead>
          <TableHead className="text-right">Filled</TableHead>
          <TableHead className="text-right">Price</TableHead>
          <TableHead>Status</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((o) => (
          <TableRow key={o.id}>
            <TableCell className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(o.created_at), { addSuffix: true })}
            </TableCell>
            <TableCell className="font-mono text-sm font-medium">{o.symbol}</TableCell>
            <TableCell>
              <Badge variant="outline" className={o.side === "buy" ? "border-bull/40 text-bull" : "border-bear/40 text-bear"}>
                {o.side.toUpperCase()}
              </Badge>
            </TableCell>
            <TableCell className="text-xs capitalize">{o.type.replace("_"," ")}</TableCell>
            <TableCell className="numeric text-right">{o.quantity}</TableCell>
            <TableCell className="numeric text-right">{o.filled_qty}</TableCell>
            <TableCell className="numeric text-right">
              {o.avg_fill_price ? formatCurrency(Number(o.avg_fill_price)) : o.limit_price ? formatCurrency(Number(o.limit_price)) : "—"}
            </TableCell>
            <TableCell><span className={`text-xs font-medium capitalize ${statusColor(o.status)}`}>{o.status.replace("_"," ")}</span></TableCell>
            <TableCell className="text-right">
              {allowCancel && ["open","pending","partially_filled","draft"].includes(o.status) && (
                <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-bear" onClick={() => onCancel(o.id)}>
                  Cancel
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
