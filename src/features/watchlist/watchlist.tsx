import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useQuotes, useSymbolSearch, symbolMeta } from "@/lib/market";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Trash2, X, ListChecks } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatPercent, pctClass } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Watchlist { id: string; name: string; color: string }
interface WLItem { id: string; watchlist_id: string; symbol: string }

export function WatchlistPage() {
  const qc = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [newListName, setNewListName] = useState("");
  const [addSymOpen, setAddSymOpen] = useState(false);
  const [symSearch, setSymSearch] = useState("");

  const { data: lists, isLoading } = useQuery({
    queryKey: ["watchlists"],
    queryFn: async (): Promise<Watchlist[]> => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return [];
      const { data } = await supabase
        .from("watchlists")
        .select("id,name,color")
        .eq("user_id", u.user.id)
        .order("sort_order")
        .order("created_at");
      return (data as Watchlist[]) ?? [];
    },
  });

  const active = useMemo(
    () => lists?.find((l) => l.id === activeId) ?? lists?.[0] ?? null,
    [lists, activeId],
  );

  const { data: items = [] } = useQuery({
    queryKey: ["watchlist_items", active?.id],
    enabled: !!active,
    queryFn: async () => {
      const { data } = await supabase
        .from("watchlist_items")
        .select("id,watchlist_id,symbol")
        .eq("watchlist_id", active!.id)
        .order("sort_order")
        .order("added_at");
      return (data as WLItem[]) ?? [];
    },
  });

  const symbols = items.map((i) => i.symbol);
  const { data: quotes = [] } = useQuotes(symbols);
  const quoteBy = useMemo(() => new Map(quotes.map((q) => [q.symbol, q])), [quotes]);

  const { data: searchResults = [], isFetching: searching } = useSymbolSearch(symSearch);

  const createList = useMutation({
    mutationFn: async (name: string) => {
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase.from("watchlists").insert({ user_id: u.user!.id, name, color: "emerald" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Watchlist created");
      setNewListName("");
      qc.invalidateQueries({ queryKey: ["watchlists"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteList = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("watchlists").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Watchlist deleted");
      setActiveId(null);
      qc.invalidateQueries({ queryKey: ["watchlists"] });
    },
  });

  const addSymbol = useMutation({
    mutationFn: async (symbol: string) => {
      if (!active) return;
      const { error } = await supabase.from("watchlist_items").insert({
        watchlist_id: active.id, symbol, asset_class: "equity" as const,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Symbol added");
      qc.invalidateQueries({ queryKey: ["watchlist_items", active?.id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("watchlist_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["watchlist_items", active?.id] }),
  });

  return (
    <div className="mx-auto max-w-[1600px] p-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Watchlist</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Your markets</h1>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div className="text-sm font-semibold">Lists</div>
          </CardHeader>
          <CardContent className="space-y-1 p-2">
            {isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="mb-1 h-9" />)}
            {(lists?.length ?? 0) === 0 && !isLoading && (
              <div className="p-4 text-center text-xs text-muted-foreground">Create your first watchlist below.</div>
            )}
            {lists?.map((l) => (
              <button
                key={l.id}
                onClick={() => setActiveId(l.id)}
                className={cn(
                  "group flex w-full items-center justify-between rounded-md px-2.5 py-2 text-sm transition-colors",
                  active?.id === l.id ? "bg-accent text-accent-foreground" : "hover:bg-accent/60",
                )}
              >
                <span className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-muted-foreground" /> {l.name}
                </span>
                <X
                  className="h-3.5 w-3.5 opacity-0 transition-opacity hover:text-bear group-hover:opacity-60"
                  onClick={(e) => { e.stopPropagation(); deleteList.mutate(l.id); }}
                />
              </button>
            ))}
            <form
              onSubmit={(e) => { e.preventDefault(); if (newListName.trim()) createList.mutate(newListName.trim()); }}
              className="mt-2 flex gap-1 border-t border-border pt-2"
            >
              <Input value={newListName} onChange={(e) => setNewListName(e.target.value)} placeholder="New list…" className="h-8 text-xs" />
              <Button size="icon" variant="ghost" className="h-8 w-8" type="submit" disabled={createList.isPending}>
                <Plus className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <div className="text-base font-semibold">{active?.name ?? "—"}</div>
              <p className="text-xs text-muted-foreground">{items.length} symbols</p>
            </div>
            <Dialog open={addSymOpen} onOpenChange={setAddSymOpen}>
              <DialogTrigger asChild>
                <Button size="sm" disabled={!active}><Plus className="mr-1 h-4 w-4" /> Add symbol</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add symbol</DialogTitle></DialogHeader>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input value={symSearch} onChange={(e) => setSymSearch(e.target.value)} placeholder="Search AAPL, TSLA, MSFT…" className="pl-9" autoFocus />
                </div>
                <div className="max-h-80 overflow-auto rounded-md border border-border">
                  {symSearch.trim().length === 0 && (
                    <div className="p-6 text-center text-xs text-muted-foreground">Start typing to search real symbols.</div>
                  )}
                  {searching && <div className="p-6 text-center text-xs text-muted-foreground">Searching…</div>}
                  {!searching && symSearch && searchResults.length === 0 && (
                    <div className="p-6 text-center text-xs text-muted-foreground">No matches found.</div>
                  )}
                  {searchResults.map((r) => (
                    <button
                      key={r.symbol}
                      className="flex w-full items-center justify-between border-b border-border px-3 py-2 text-left last:border-b-0 hover:bg-accent"
                      onClick={() => { addSymbol.mutate(r.symbol); setAddSymOpen(false); setSymSearch(""); }}
                    >
                      <div>
                        <div className="font-mono text-sm font-medium">{r.symbol}</div>
                        <div className="truncate text-xs text-muted-foreground">{r.name}</div>
                      </div>
                    </button>
                  ))}
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setAddSymOpen(false)}>Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="p-0">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 p-16 text-center text-sm text-muted-foreground">
                <ListChecks className="h-8 w-8 opacity-50" />
                <div>No symbols yet.</div>
                <div className="text-xs">Add your first ticker to start tracking prices.</div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Sector</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Change</TableHead>
                    <TableHead className="text-right">Day range</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((it) => {
                    const meta = symbolMeta(it.symbol);
                    const q = quoteBy.get(it.symbol);
                    const price = q?.price ?? 0;
                    const changePct = q?.changePct ?? 0;
                    return (
                      <TableRow key={it.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="grid h-7 w-7 place-items-center rounded-md bg-surface-2 text-[10px] font-semibold">{it.symbol.slice(0, 2)}</span>
                            <div>
                              <div className="font-mono text-sm font-medium">{it.symbol}</div>
                              <div className="max-w-[220px] truncate text-xs text-muted-foreground">{meta.name}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell><Badge variant="outline">{meta.sector}</Badge></TableCell>
                        <TableCell className="numeric text-right">{price > 0 ? formatCurrency(price) : <span className="text-muted-foreground">…</span>}</TableCell>
                        <TableCell className={`numeric text-right ${pctClass(changePct)}`}>{price > 0 ? formatPercent(changePct) : "—"}</TableCell>
                        <TableCell className="numeric text-right text-xs text-muted-foreground">
                          {q && q.low > 0 ? `${formatCurrency(q.low)} — ${formatCurrency(q.high)}` : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-bear" onClick={() => removeItem.mutate(it.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
