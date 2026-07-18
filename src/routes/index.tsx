import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight, Activity, Brain, Layers, LineChart as LineChartIcon,
  ShieldCheck, Zap, Check, TrendingUp, TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UNIVERSE, useQuotes, useTopMovers, useCandles, symbolMeta } from "@/lib/market";
import { formatCurrency, formatPercent, pctClass } from "@/lib/format";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import { MarketingNav, MarketingFooter } from "@/components/marketing/marketing-layout";
import { useMemo } from "react";

const FAQS = [
  { q: "Where does market data come from?", a: "Live quotes, candles, and news are served through the Finnhub API. Historical data is available for research and charting." },
  { q: "Is my trading real?", a: "The current product is paper trading only. All orders are simulated with server-side validation; no real capital is at risk." },
  { q: "How is my data protected?", a: "TLS in transit, encryption at rest, row-level security on every table, and hashed credentials. See our Security page for details." },
  { q: "Can I run Apex Trade locally?", a: "Yes — see the Docs. You'll need a Finnhub key and Supabase credentials in your .env file, then bun install and bun dev." },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Apex Trade — Institutional Trading Platform" },
      { name: "description", content: "The institutional trading terminal for professionals. Real-time markets, multi-asset portfolios, margin & shorts, AI intelligence, and enterprise security." },
      { property: "og:title", content: "Apex Trade — Institutional Trading Platform" },
      { property: "og:description", content: "The institutional trading terminal for professionals. Real-time markets, multi-asset portfolios, margin & shorts, AI intelligence, and enterprise security." },
      { property: "og:url", content: "https://apex-trading-app.lovable.app/" },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/4408224a-2da0-4b9a-a020-43d06476307d/id-preview-8e5b7914--05c900f3-ea56-40b7-88f5-b3370ae9a911.lovable.app-1784091101242.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/4408224a-2da0-4b9a-a020-43d06476307d/id-preview-8e5b7914--05c900f3-ea56-40b7-88f5-b3370ae9a911.lovable.app-1784091101242.png" },
    ],
    links: [{ rel: "canonical", href: "https://apex-trading-app.lovable.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <MarketingNav />
      <Hero />
      <LogoStrip />
      <StatsBand />
      <FeatureShowcase />
      <SecuritySection />
      <FAQ />
      <CTASection />
      <MarketingFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(60% 40% at 50% 0%, oklch(0.72 0.16 158 / 0.18), transparent 70%), radial-gradient(50% 50% at 100% 100%, oklch(0.72 0.14 235 / 0.15), transparent 70%)" }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-24 md:py-32 lg:grid-cols-[1.05fr_1fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-1/80 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-bull opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-bull" />
            </span>
            Live markets · AI co-pilot · Margin & shorts
          </div>
          <h1 className="mt-6 text-balance text-5xl font-semibold leading-[1.02] tracking-tight md:text-[64px]">
            The trading terminal
            <br />
            built for{" "}
            <span className="bg-gradient-to-r from-primary via-primary to-info bg-clip-text text-transparent">
              professionals.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-[17px] leading-relaxed text-muted-foreground">
            Multi-asset execution, dockable widgets, real margin & short support,
            and a portfolio-aware AI co-pilot. One institutional-grade workspace
            for research, execution, and monitoring.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="h-11 px-5 shadow-[0_0_24px_-6px_var(--color-primary)]">
              <Link to="/auth">Open a paper account <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-11 px-5">
              <Link to="/platform">Explore the platform</Link>
            </Button>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-bull" /> No credit card</span>
            <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-bull" /> $100k paper cash</span>
            <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-bull" /> Enterprise SSO ready</span>
          </div>
        </div>

        <HeroTerminal />
      </div>

      <TickerRibbon />
    </section>
  );
}

function HeroTerminal() {
  const { gainers } = useTopMovers();
  const { data: candlesData } = useCandles("SPY", 60);
  const chart = useMemo(
    () => (candlesData?.candles ?? []).map((c, i) => ({ i, v: c.c })),
    [candlesData],
  );
  const { data: spyQuote } = useQuotes(["SPY"]);
  const spy = spyQuote?.[0];
  const top4 = gainers.slice(0, 4);

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute -inset-6 rounded-3xl blur-2xl"
        style={{ background: "radial-gradient(60% 60% at 50% 50%, oklch(0.72 0.16 158 / 0.20), transparent 70%)" }}
      />
      <div className="panel relative overflow-hidden rounded-2xl">
        <div className="flex items-center justify-between border-b border-border/70 bg-surface-2/60 px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-bear/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-bull/70" />
            <span className="ml-3 text-[11px] uppercase tracking-widest text-muted-foreground">
              apex-trade / terminal
            </span>
          </div>
          <div className="numeric text-[11px] text-muted-foreground">
            {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · NYSE
          </div>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-[1.35fr_1fr]">
          <div className="panel-inset overflow-hidden p-4">
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  SPY · S&amp;P 500 ETF
                </div>
                <div className="mt-1 numeric text-2xl font-semibold">
                  {spy?.price ? formatCurrency(spy.price) : "—"}
                </div>
              </div>
              {spy && spy.price > 0 && (
                <div className={cn("inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold", spy.changePct >= 0 ? "bg-bull-soft text-bull" : "bg-bear-soft text-bear")}>
                  {spy.changePct >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />} {formatPercent(spy.changePct)}
                </div>
              )}
            </div>
            <div className="mt-3 h-32">
              {chart.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chart}>
                    <defs>
                      <linearGradient id="heroG" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.55} />
                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="v" stroke="var(--color-primary)" strokeWidth={1.75} fill="url(#heroG)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Loading market data…</div>
              )}
            </div>
          </div>

          <div className="panel-inset p-3">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-[11px] uppercase tracking-widest text-muted-foreground">Top gainers</span>
              <span className="text-[10px] text-muted-foreground">Live</span>
            </div>
            <div className="space-y-1">
              {top4.length === 0 && (
                <div className="p-4 text-center text-xs text-muted-foreground">Loading…</div>
              )}
              {top4.map((g) => (
                <div key={g.symbol} className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-surface-3/60">
                  <div className="min-w-0">
                    <div className="font-mono text-[13px] font-semibold">{g.symbol}</div>
                    <div className="truncate text-[11px] text-muted-foreground">{g.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="numeric text-[13px]">{formatCurrency(g.price)}</div>
                    <div className={cn("numeric text-[11px]", pctClass(g.changePct))}>{formatPercent(g.changePct)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-border/70 bg-surface-2/40 p-4">
          <div className="grid grid-cols-4 gap-3 text-[11px]">
            <StatMini label="Markets" value="Live" tone="up" />
            <StatMini label="Latency" value="<50ms" />
            <StatMini label="Coverage" value="24 syms" />
            <StatMini label="Uptime" value="99.99%" tone="up" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatMini({ label, value, tone }: { label: string; value: string; tone?: "up" | "down" }) {
  return (
    <div className="rounded-md border border-border/60 bg-surface-1 px-2.5 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("numeric mt-0.5 text-sm font-semibold", tone === "up" && "text-bull", tone === "down" && "text-bear")}>{value}</div>
    </div>
  );
}

function TickerRibbon() {
  const symbols = UNIVERSE.slice(0, 18).map((u) => u.symbol);
  const { data: quotes = [] } = useQuotes(symbols);
  const enriched = quotes.filter((q) => !q.error && q.price > 0).map((q) => ({ ...q, ...symbolMeta(q.symbol) }));
  const seq = enriched.length > 0 ? [...enriched, ...enriched] : [];
  return (
    <div className="relative border-t border-border/70 bg-surface-1/60 backdrop-blur">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />
      <div className={cn("flex gap-10 py-2.5 pl-4 whitespace-nowrap", seq.length > 0 && "ticker-tape")}>
        {seq.length === 0 && <div className="text-xs text-muted-foreground">Loading live tape…</div>}
        {seq.map((q, i) => (
          <div key={`${q.symbol}-${i}`} className="flex items-center gap-2 text-xs">
            <span className="font-mono font-semibold tracking-tight">{q.symbol}</span>
            <span className="numeric text-muted-foreground">{formatCurrency(q.price)}</span>
            <span className={cn("numeric flex items-center gap-0.5", pctClass(q.changePct))}>
              {q.changePct >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {formatPercent(q.changePct)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LogoStrip() {
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="text-center text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Trusted by desks, prop shops, and independent traders worldwide
        </div>
        <div className="mt-6 grid grid-cols-2 items-center gap-6 opacity-60 sm:grid-cols-3 md:grid-cols-6">
          {["MERIDIAN", "AXIS CAPITAL", "NORTHWIND", "PARALLEL", "SIGMA", "HELIX"].map((n) => (
            <div key={n} className="text-center font-mono text-sm tracking-[0.3em] text-muted-foreground/80">{n}</div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsBand() {
  const stats = [
    { v: "Live", l: "Real-time market data" },
    { v: "24+", l: "Symbols across markets" },
    { v: "<50ms", l: "Median UI latency" },
    { v: "99.99%", l: "Target uptime SLA" },
  ];
  return (
    <section className="border-b border-border/60 bg-surface-1/40">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-14 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.l}>
            <div className="numeric text-3xl font-semibold tracking-tight md:text-4xl">{s.v}</div>
            <div className="mt-1 text-xs text-muted-foreground">{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeatureShowcase() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <div className="text-xs uppercase tracking-[0.2em] text-primary">Platform</div>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
          Everything a serious trader needs, in one workspace
        </h2>
        <p className="mt-3 text-muted-foreground">
          Built with the density of Bloomberg, the minimalism of Linear, and the polish of Stripe.
        </p>
      </div>

      <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Feature icon={<LineChartIcon className="h-5 w-5" />} title="Real-time markets" desc="Live quotes and OHLC candles from Finnhub across equities, ETFs, and crypto." />
        <Feature icon={<Layers className="h-5 w-5" />} title="Dockable workspace" desc="Drag, resize, and persist widget layouts — one per strategy or account." />
        <Feature icon={<Brain className="h-5 w-5" />} title="AI co-pilot" desc="Portfolio-aware assistant that explains movement, reviews trades, and drafts strategy notes." />
        <Feature icon={<Zap className="h-5 w-5" />} title="Margin & shorts" desc="Cash and margin accounts with proper buying-power checks, short opens, and buy-to-cover." />
        <Feature icon={<ShieldCheck className="h-5 w-5" />} title="Enterprise security" desc="Row-level security, hashed API keys, session and login history, RBAC across workspaces." />
        <Feature icon={<Activity className="h-5 w-5" />} title="Broker-ready" desc="Architecture for Alpaca, IBKR, Zerodha, Binance, and Coinbase — encrypted credentials, health checks." />
      </div>
    </section>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-surface-1/70 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-surface-1">
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/5 blur-2xl transition-opacity duration-300 group-hover:bg-primary/10" />
      <div className="relative">
        <div className="mb-4 inline-grid h-9 w-9 place-items-center rounded-md border border-primary/30 bg-primary/10 text-primary">{icon}</div>
        <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

function SecuritySection() {
  return (
    <section id="security" className="border-y border-border/60 bg-surface-1/30">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-2 lg:items-center">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-primary">Security</div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Institutional-grade controls, by default
          </h2>
          <p className="mt-3 max-w-lg text-muted-foreground">
            Row-level security, hashed credentials, encrypted transport, and audit logging — the same controls you'd expect from a bank, applied to every account.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              "TLS 1.3 in transit, encrypted at rest",
              "SHA-256 hashed API credentials",
              "Row-level security on every table",
              "Full audit trail for privileged actions",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2 text-muted-foreground">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-bull" /> {t}
              </li>
            ))}
          </ul>
          <Button asChild variant="outline" className="mt-8">
            <Link to="/security">Read security overview <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="panel p-6">
          <pre className="overflow-x-auto text-[13px] leading-relaxed"><code className="font-mono text-muted-foreground">{`-- Every table has RLS
create policy "own portfolios only"
on portfolios for all
using (auth.uid() = user_id);

-- API keys stored as SHA-256
insert into api_keys (user_id, key_hash)
values (uid, encode(digest(raw, 'sha256'), 'hex'));`}</code></pre>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const faqs = [
    { q: "Where does market data come from?", a: "Live quotes, candles, and news are served through the Finnhub API. Historical data is available for research and charting." },
    { q: "Is my trading real?", a: "The current product is paper trading only. All orders are simulated with server-side validation; no real capital is at risk." },
    { q: "How is my data protected?", a: "TLS in transit, encryption at rest, row-level security on every table, and hashed credentials. See our Security page for details." },
    { q: "Can I run Apex Trade locally?", a: "Yes — see the Docs. You'll need a Finnhub key and Supabase credentials in your .env file, then bun install and bun dev." },
  ];
  return (
    <section id="faq" className="mx-auto max-w-4xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <div className="text-xs uppercase tracking-[0.2em] text-primary">FAQ</div>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">Frequently asked</h2>
      </div>
      <div className="mt-10 divide-y divide-border rounded-xl border border-border bg-surface-1/60">
        {faqs.map((f) => (
          <details key={f.q} className="group px-6 py-5">
            <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold marker:content-none">
              {f.q}
              <span className="text-muted-foreground transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="border-t border-border/60">
      <div className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h2 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
          Start trading like a professional today
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Open a free paper account. No credit card. Real markets, real controls.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild size="lg" className="h-11 px-6 shadow-[0_0_24px_-6px_var(--color-primary)]">
            <Link to="/auth">Open your workspace <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-11 px-6">
            <Link to="/docs">Read the docs</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
