import { createFileRoute } from "@tanstack/react-router";
import { MarketingLayout, PageHero } from "@/components/marketing/marketing-layout";
import { Activity, Brain, Layers, LineChart, ShieldCheck, Zap, Bell, Database, Globe, Lock, Cpu, Workflow } from "lucide-react";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — Apex Trade" },
      { name: "description", content: "Every feature Apex Trade ships — real-time markets, margin, shorts, AI co-pilot, workspaces, and enterprise security." },
    ],
  }),
  component: FeaturesPage,
});

const FEATURES = [
  { icon: <LineChart className="h-5 w-5" />, title: "Real-time market data", desc: "Live quotes and OHLC candles powered by Finnhub across US equities, ETFs, forex, and crypto." },
  { icon: <Layers className="h-5 w-5" />, title: "Dockable workspaces", desc: "Persist multiple layouts per strategy, account, or asset class." },
  { icon: <Brain className="h-5 w-5" />, title: "AI Co-pilot", desc: "Portfolio-aware assistant that explains movement, reviews trades, and drafts strategy notes." },
  { icon: <Zap className="h-5 w-5" />, title: "Margin & short selling", desc: "Cash and margin accounts with buying-power checks, short opens, and buy-to-cover." },
  { icon: <ShieldCheck className="h-5 w-5" />, title: "Enterprise security", desc: "Row-level security, hashed API keys, session and login history." },
  { icon: <Bell className="h-5 w-5" />, title: "Price alerts", desc: "Threshold, % change, and technical alerts across your watchlists." },
  { icon: <Database className="h-5 w-5" />, title: "Historical data", desc: "Multi-year candles with intraday resolutions for research and backtesting." },
  { icon: <Workflow className="h-5 w-5" />, title: "Order workflow", desc: "Market, limit, stop, stop-limit, and trailing-stop with TIF controls." },
  { icon: <Activity className="h-5 w-5" />, title: "Live P&L", desc: "Realized and unrealized P&L, per position and per account, in real time." },
  { icon: <Globe className="h-5 w-5" />, title: "Global coverage", desc: "US equities, major ETFs, top crypto — with more asset classes coming." },
  { icon: <Lock className="h-5 w-5" />, title: "Role-based access", desc: "Owner, admin, and member roles across workspaces with audit trails." },
  { icon: <Cpu className="h-5 w-5" />, title: "Low latency", desc: "Edge-served UI with sub-second data refresh and streaming order updates." },
];

function FeaturesPage() {
  return (
    <MarketingLayout>
      <PageHero eyebrow="Features" title="Everything a serious trader needs" subtitle="A dense, precise, and fast platform — built with the depth of Bloomberg and the polish of Linear." />
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="group rounded-xl border border-border bg-surface-1/70 p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40">
              <div className="mb-3 inline-grid h-9 w-9 place-items-center rounded-md border border-primary/30 bg-primary/10 text-primary">{f.icon}</div>
              <h3 className="text-[15px] font-semibold tracking-tight">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </MarketingLayout>
  );
}
