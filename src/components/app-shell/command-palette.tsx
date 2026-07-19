import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator,
} from "@/components/ui/command";
import {
  BarChart3, Bot, Briefcase, ListChecks, LogOut, Settings, TrendingUp, Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSymbolSearch } from "@/lib/market";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export function CommandPalette({ open, setOpen }: { open: boolean; setOpen: (o: boolean) => void }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const { data: results = [] } = useSymbolSearch(q);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !isFormField(e.target))) {
        e.preventDefault();
        setOpen(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  function go(to: string) { setOpen(false); navigate({ to }); }
  function goSymbol(sym: string) {
    setOpen(false);
    navigate({ to: "/markets/$symbol", params: { symbol: sym } });
  }

  async function signOut() {
    setOpen(false);
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search symbols, actions…" value={q} onValueChange={setQ} />
      <CommandList>
        <CommandEmpty>{q.trim().length === 0 ? "Type to search symbols…" : "No matching symbols."}</CommandEmpty>
        {results.length > 0 && (
          <CommandGroup heading="Symbols">
            {results.map((r) => (
              <CommandItem
                key={r.symbol}
                value={`sym-${r.symbol}-${r.name}`}
                onSelect={() => goSymbol(r.symbol)}
              >
                <TrendingUp className="mr-2 h-4 w-4 text-muted-foreground" />
                <div className="flex flex-1 items-center gap-3">
                  <span className="w-16 font-mono text-sm font-semibold">{r.symbol}</span>
                  <span className="truncate text-sm text-muted-foreground">{r.name}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        <CommandSeparator />
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => go("/dashboard")}><BarChart3 className="mr-2 h-4 w-4" /> Dashboard</CommandItem>
          <CommandItem onSelect={() => go("/watchlist")}><ListChecks className="mr-2 h-4 w-4" /> Watchlist</CommandItem>
          <CommandItem onSelect={() => go("/portfolio")}><Briefcase className="mr-2 h-4 w-4" /> Portfolio</CommandItem>
          <CommandItem onSelect={() => go("/orders")}><Wallet className="mr-2 h-4 w-4" /> Orders</CommandItem>
          <CommandItem onSelect={() => go("/ai")}><Bot className="mr-2 h-4 w-4" /> AI Co-pilot</CommandItem>
          <CommandItem onSelect={() => go("/settings")}><Settings className="mr-2 h-4 w-4" /> Settings</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Account">
          <CommandItem onSelect={signOut}><LogOut className="mr-2 h-4 w-4" /> Sign out</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

function isFormField(t: EventTarget | null): boolean {
  const el = t as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
}
