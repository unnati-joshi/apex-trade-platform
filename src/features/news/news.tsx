import { useState } from "react";
import { useMarketNews } from "@/lib/market";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink } from "lucide-react";

type Category = "general" | "crypto" | "forex" | "merger";

export function NewsPage() {
  const [cat, setCat] = useState<Category>("general");
  const { data: news = [], isLoading } = useMarketNews(cat);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Newsroom</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Market news</h1>
        </div>
        <div className="flex gap-1 rounded-md border border-border p-0.5">
          {(["general", "crypto", "forex", "merger"] as Category[]).map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded px-3 py-1.5 text-xs capitalize ${cat === c ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >{c}</button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className="h-72" />)}
        </div>
      ) : news.length === 0 ? (
        <Card><CardContent className="p-16 text-center text-sm text-muted-foreground">No news available.</CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {news.map((n) => (
            <a key={n.id} href={n.url} target="_blank" rel="noreferrer"
               className="group overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/40">
              {n.image ? (
                <div className="aspect-video w-full overflow-hidden bg-surface-2">
                  <img src={n.image} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                </div>
              ) : <div className="aspect-video w-full bg-surface-2" />}
              <div className="space-y-2 p-4">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                  <Badge variant="outline" className="text-[10px]">{n.category || cat}</Badge>
                  <span>{n.source}</span>
                  <span>·</span>
                  <span>{formatDistanceToNow(new Date(n.datetime), { addSuffix: true })}</span>
                </div>
                <h2 className="line-clamp-2 text-sm font-semibold">{n.headline}</h2>
                <p className="line-clamp-3 text-xs text-muted-foreground">{n.summary}</p>
                <div className="flex items-center gap-1 pt-1 text-[11px] text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Read <ExternalLink className="h-3 w-3" />
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
