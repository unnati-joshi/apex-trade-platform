import { createFileRoute } from "@tanstack/react-router";
import { MarketingLayout, PageHero } from "@/components/marketing/marketing-layout";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/changelog")({
  head: () => ({
    meta: [
      { title: "Changelog — Apex Trade" },
      { name: "description", content: "Product updates, new features, and improvements shipped in Apex Trade." },
    ],
  }),
  component: ChangelogPage,
});

interface Release { version: string; date: string; tag: "feature" | "improvement" | "fix"; title: string; items: string[] }

const RELEASES: Release[] = [
  {
    version: "1.4.0", date: "July 17, 2026", tag: "feature",
    title: "Live market data + full site navigation",
    items: [
      "Replaced demo market data with real-time Finnhub quotes, candles, and news",
      "Added complete marketing pages: Platform, Features, Security, Docs, API, and legal",
      "AI Co-pilot now renders proper Markdown formatting",
      "Removed 'V2' badge and Pricing section for cleaner launch UX",
    ],
  },
  {
    version: "1.3.0", date: "July 15, 2026", tag: "feature",
    title: "Margin accounts and short selling",
    items: [
      "Cash and margin account types with server-side validation",
      "Short position tracking with realized/unrealized P&L",
      "Server-side atomic order fills via `place_paper_order` RPC",
    ],
  },
  {
    version: "1.2.0", date: "July 14, 2026", tag: "feature",
    title: "AI Co-pilot",
    items: [
      "Portfolio-aware assistant with market intelligence",
      "Conversation history and message persistence",
    ],
  },
  {
    version: "1.1.0", date: "July 12, 2026", tag: "improvement",
    title: "Institutional dark theme",
    items: ["New design system: charcoal palette, mono numerics, ticker tape animations"],
  },
  {
    version: "1.0.0", date: "July 10, 2026", tag: "feature",
    title: "Public beta launch",
    items: ["Dashboard, watchlists, portfolio, order management, and workspace foundation"],
  },
];

function ChangelogPage() {
  return (
    <MarketingLayout>
      <PageHero eyebrow="Changelog" title="What's new in Apex Trade" subtitle="A running log of the improvements we ship. Follow along as the platform evolves." />
      <section className="mx-auto max-w-3xl px-6 py-16 space-y-10">
        {RELEASES.map((r) => (
          <div key={r.version} className="border-l-2 border-border pl-6 relative">
            <div className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full bg-primary shadow-[0_0_12px_var(--color-primary)]" />
            <div className="flex flex-wrap items-baseline gap-3">
              <div className="font-mono text-sm font-semibold">{r.version}</div>
              <div className="text-xs text-muted-foreground">{r.date}</div>
              <Badge variant="outline" className={r.tag === "feature" ? "border-primary/40 text-primary" : r.tag === "improvement" ? "border-info/40 text-info" : "border-warning/40 text-warning"}>
                {r.tag}
              </Badge>
            </div>
            <h3 className="mt-2 text-lg font-semibold tracking-tight">{r.title}</h3>
            <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              {r.items.map((i, idx) => <li key={idx}>· {i}</li>)}
            </ul>
          </div>
        ))}
      </section>
    </MarketingLayout>
  );
}
