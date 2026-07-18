import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingLayout, PageHero } from "@/components/marketing/marketing-layout";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Bot, Briefcase, ListChecks, Wallet } from "lucide-react";

export const Route = createFileRoute("/platform")({
  head: () => ({
    meta: [
      { title: "Platform — Apex Trade" },
      { name: "description", content: "The Apex Trade terminal: dashboard, watchlists, portfolio, order management, and AI co-pilot in one workspace." },
      { property: "og:title", content: "Platform — Apex Trade" },
      { property: "og:description", content: "The Apex Trade terminal: dashboard, watchlists, portfolio, order management, and AI co-pilot in one workspace." },
      { property: "og:url", content: "https://apex-trading-app.lovable.app/platform" },
    ],
    links: [{ rel: "canonical", href: "https://apex-trading-app.lovable.app/platform" }],
  }),
  component: PlatformPage,
});

const MODULES = [
  { icon: <BarChart3 className="h-5 w-5" />, title: "Dashboard", desc: "Real-time market ticker, KPIs, equity curve, allocation, and top movers.", to: "/dashboard" },
  { icon: <ListChecks className="h-5 w-5" />, title: "Watchlist", desc: "Multiple lists with live quotes, sector tags, and quick-add search.", to: "/watchlist" },
  { icon: <Briefcase className="h-5 w-5" />, title: "Portfolio", desc: "Long and short positions, realized/unrealized P&L, buying power, sector allocation.", to: "/portfolio" },
  { icon: <Wallet className="h-5 w-5" />, title: "Orders", desc: "Full order ticket: market, limit, stop, stop-limit, trailing-stop.", to: "/orders" },
  { icon: <Bot className="h-5 w-5" />, title: "AI Co-pilot", desc: "Portfolio-aware assistant with market intelligence and strategy support.", to: "/ai" },
];

function PlatformPage() {
  return (
    <MarketingLayout>
      <PageHero eyebrow="Platform" title="One institutional workspace" subtitle="Five deeply integrated modules covering research, execution, monitoring, and intelligence." />
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-4 md:grid-cols-2">
          {MODULES.map((m) => (
            <Link key={m.to} to={m.to} className="group rounded-xl border border-border bg-surface-1/70 p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40">
              <div className="mb-3 inline-grid h-9 w-9 place-items-center rounded-md border border-primary/30 bg-primary/10 text-primary">{m.icon}</div>
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-lg font-semibold tracking-tight">{m.title}</h2>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{m.desc}</p>
            </Link>
          ))}
        </div>
        <div className="mt-14 flex justify-center">
          <Button asChild size="lg" className="h-11 px-6">
            <Link to="/auth">Open your workspace <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </MarketingLayout>
  );
}
