import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Activity,
  Brain,
  Layers,
  LineChart as LineChartIcon,
  ShieldCheck,
  Zap,
  Check,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { listUniverse, candles, topMovers } from "@/lib/mock-market";
import { formatCurrency, formatPercent, pctClass } from "@/lib/format";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Apex Trade — Institutional Trading Platform" },
      {
        name: "description",
        content:
          "The institutional trading terminal for professionals. Real-time markets, multi-asset portfolios, margin & shorts, AI intelligence, and enterprise security.",
      },
      { property: "og:title", content: "Apex Trade — Institutional Trading Platform" },
      {
        property: "og:description",
        content: "Bloomberg-grade terminal. Multi-asset execution, margin support, AI co-pilot.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <NavBar />
      <Hero />
      <LogoStrip />
      <StatsBand />
      <FeatureShowcase />
      <DashboardPreview />
      <SecuritySection />
      <Pricing />
      <FAQ />
      <CTASection />
      <Footer />
    </div>
  );
}

function NavBar() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3.5">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-[0_0_16px_-2px_var(--color-primary)]">
            <Activity className="h-4 w-4" strokeWidth={2.75} />
          </span>
          <span className="text-[15px] tracking-tight">Apex Trade</span>
          <span className="ml-1 rounded border border-border/70 bg-surface-1 px-1.5 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
            v2
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-[13px] text-muted-foreground md:flex">
          <a href="#platform" className="transition-colors hover:text-foreground">Platform</a>
          <a href="#features" className="transition-colors hover:text-foreground">Features</a>
          <a href="#pricing" className="transition-colors hover:text-foreground">Pricing</a>
          <a href="#security" className="transition-colors hover:text-foreground">Security</a>
          <a href="#faq" className="transition-colors hover:text-foreground">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/auth">Sign in</Link>
          </Button>
          <Button asChild size="sm" className="shadow-[0_0_20px_-6px_var(--color-primary)]">
            <Link to="/auth" search={{ mode: "signup" }}>
              Open account <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 40% at 50% 0%, oklch(0.72 0.16 158 / 0.18), transparent 70%), radial-gradient(50% 50% at 100% 100%, oklch(0.72 0.14 235 / 0.15), transparent 70%)",
        }}
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
              <Link to="/auth" search={{ mode: "signup" }}>
                Open a paper account <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-11 px-5">
              <a href="#platform">Explore the platform</a>
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
  const gainers = useMemo(() => topMovers().gainers.slice(0, 4), []);
  const chart = useMemo(
    () =>
      candles("SPY", 60).map((c, i) => ({
        i,
        v: c.c,
      })),
    [],
  );

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute -inset-6 rounded-3xl blur-2xl"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 50%, oklch(0.72 0.16 158 / 0.20), transparent 70%)",
        }}
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
          {/* Chart card */}
          <div className="panel-inset overflow-hidden p-4">
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  SPY · S&amp;P 500 ETF
                </div>
                <div className="mt-1 numeric text-2xl font-semibold">
                  {formatCurrency(chart.at(-1)?.v ?? 520)}
                </div>
              </div>
              <div className="inline-flex items-center gap-1 rounded-md bg-bull-soft px-2 py-1 text-xs font-semibold text-bull">
                <TrendingUp className="h-3 w-3" /> +1.24%
              </div>
            </div>
            <div className="mt-3 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chart}>
                  <defs>
                    <linearGradient id="heroG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.55} />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke="var(--color-primary)"
                    strokeWidth={1.75}
                    fill="url(#heroG)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Movers */}
          <div className="panel-inset p-3">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Top gainers
              </span>
              <span className="text-[10px] text-muted-foreground">Live</span>
            </div>
            <div className="space-y-1">
              {gainers.map((g) => (
                <div
                  key={g.symbol}
                  className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-surface-3/60"
                >
                  <div className="min-w-0">
                    <div className="font-mono text-[13px] font-semibold">{g.symbol}</div>
                    <div className="truncate text-[11px] text-muted-foreground">{g.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="numeric text-[13px]">{formatCurrency(g.price)}</div>
                    <div className={cn("numeric text-[11px]", pctClass(g.changePct))}>
                      {formatPercent(g.changePct)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order ticket preview */}
        <div className="border-t border-border/70 bg-surface-2/40 p-4">
          <div className="grid grid-cols-4 gap-3 text-[11px]">
            <StatMini label="Equity" value="$142,318" tone="up" />
            <StatMini label="Day P&L" value="+$1,842" tone="up" />
            <StatMini label="Buying pwr" value="$78,410" />
            <StatMini label="Positions" value="12" />
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
      <div
        className={cn(
          "numeric mt-0.5 text-sm font-semibold",
          tone === "up" && "text-bull",
          tone === "down" && "text-bear",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function TickerRibbon() {
  const symbols = useMemo(() => listUniverse().slice(0, 18), []);
  const seq = [...symbols, ...symbols];
  return (
    <div className="relative border-t border-border/70 bg-surface-1/60 backdrop-blur">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />
      <div className="ticker-tape flex gap-10 py-2.5 pl-4 whitespace-nowrap">
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
            <div
              key={n}
              className="text-center font-mono text-sm tracking-[0.3em] text-muted-foreground/80"
            >
              {n}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsBand() {
  const stats = [
    { v: "12.4M", l: "Paper trades executed" },
    { v: "18k+", l: "Symbols across markets" },
    { v: "34ms", l: "Median order latency" },
    { v: "99.99%", l: "API uptime SLA" },
  ];
  return (
    <section id="platform" className="border-b border-border/60 bg-surface-1/40">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-14 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.l}>
            <div className="numeric text-3xl font-semibold tracking-tight md:text-4xl">
              {s.v}
            </div>
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
        <Feature icon={<LineChartIcon className="h-5 w-5" />} title="Real-time markets" desc="Live quotes, heatmaps, and multi-asset charts across equities, ETFs, and crypto." />
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
        <div className="mb-4 inline-grid h-9 w-9 place-items-center rounded-md border border-primary/30 bg-primary/10 text-primary">
          {icon}
        </div>
        <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

function DashboardPreview() {
  const universe = useMemo(() => listUniverse().slice(0, 24), []);
  return (
    <section className="border-y border-border/60 bg-surface-1/30">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs uppercase tracking-[0.2em] text-primary">Terminal</div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Bloomberg-grade density, without the friction
          </h2>
          <p className="mt-3 text-muted-foreground">
            Every panel is a first-class primitive — no dead widgets, no fake data.
          </p>
        </div>

        {/* Market heatmap */}
        <div className="panel mt-12 overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="text-sm font-medium">Market heatmap</div>
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
              % change · 24h
            </span>
          </div>
          <div className="grid grid-cols-4 gap-px bg-border sm:grid-cols-6 lg:grid-cols-8">
            {universe.map((q) => {
              const bg = q.changePct >= 0
                ? `oklch(0.30 0.10 155 / ${Math.min(0.85, 0.15 + Math.abs(q.changePct) / 8)})`
                : `oklch(0.30 0.15 22 / ${Math.min(0.85, 0.15 + Math.abs(q.changePct) / 8)})`;
              return (
                <div
                  key={q.symbol}
                  className="flex flex-col justify-between p-3 transition-transform hover:z-10 hover:scale-[1.02]"
                  style={{ backgroundColor: bg }}
                >
                  <div className="font-mono text-[12px] font-semibold">{q.symbol}</div>
                  <div className={cn("numeric mt-1 text-[13px] font-semibold", pctClass(q.changePct))}>
                    {formatPercent(q.changePct)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function SecuritySection() {
  const items = [
    "Row-level security on every table",
    "SHA-256 hashed broker API keys",
    "Google OAuth + email/password",
    "Full session & login audit trail",
    "RBAC across workspaces",
    "Server-side order validation",
  ];
  return (
    <section id="security" className="mx-auto max-w-7xl px-6 py-24">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-primary">Security</div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Trust encoded into every layer
          </h2>
          <p className="mt-3 text-muted-foreground">
            Apex Trade is engineered like the systems it competes with. Data is
            partitioned per user, orders are validated on the server, and
            credentials never live in the client.
          </p>
          <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {items.map((i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-primary/15 text-primary">
                  <Check className="h-3 w-3" />
                </span>
                {i}
              </li>
            ))}
          </ul>
        </div>
        <div className="panel overflow-hidden p-0">
          <div className="border-b border-border bg-surface-2/60 px-4 py-2.5 text-[11px] uppercase tracking-widest text-muted-foreground">
            policy · orders · production
          </div>
          <pre className="overflow-x-auto p-5 text-[12.5px] leading-relaxed">
{`create policy "own_orders" on public.orders
  for all using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );

-- server-side atomic execution
select public.place_paper_order(
  _portfolio_id := :pid,
  _symbol       := 'AAPL',
  _side         := 'sell',
  _quantity     := 25,
  _mark_price   := 187.42
);
-- ERROR: cash accounts cannot short-sell.`}
          </pre>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const tiers = [
    {
      name: "Starter",
      price: "Free",
      sub: "For individuals learning the ropes.",
      features: ["Paper account", "Watchlists & alerts", "AI co-pilot (limited)", "1 workspace"],
      cta: "Start free",
      highlight: false,
    },
    {
      name: "Professional",
      price: "$29",
      sub: "For active traders scaling their book.",
      features: [
        "Cash + margin accounts",
        "Shorts & buy-to-cover",
        "Unlimited AI co-pilot",
        "Real-time L1 quotes",
        "Broker connections",
      ],
      cta: "Upgrade",
      highlight: true,
    },
    {
      name: "Institutional",
      price: "Custom",
      sub: "For desks and multi-user firms.",
      features: [
        "SSO + SAML",
        "Team workspaces & RBAC",
        "L2 depth-of-book",
        "SLA-backed uptime",
        "Dedicated support",
      ],
      cta: "Contact sales",
      highlight: false,
    },
  ];
  return (
    <section id="pricing" className="border-y border-border/60 bg-surface-1/30">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs uppercase tracking-[0.2em] text-primary">Pricing</div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Simple pricing that scales with you
          </h2>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={cn(
                "relative rounded-xl border p-6",
                t.highlight
                  ? "border-primary/50 bg-gradient-to-b from-primary/[0.08] to-transparent shadow-[0_0_40px_-15px_var(--color-primary)]"
                  : "border-border bg-surface-1/70",
              )}
            >
              {t.highlight && (
                <div className="absolute -top-2.5 left-6 rounded-full border border-primary/40 bg-primary/20 px-2 py-0.5 text-[10px] uppercase tracking-widest text-primary">
                  Most popular
                </div>
              )}
              <div className="text-sm font-semibold">{t.name}</div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="numeric text-4xl font-semibold tracking-tight">{t.price}</span>
                {t.price !== "Free" && t.price !== "Custom" && (
                  <span className="text-xs text-muted-foreground">/ mo</span>
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{t.sub}</p>
              <ul className="mt-5 space-y-2 text-sm">
                {t.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-bull" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className="mt-6 w-full"
                variant={t.highlight ? "default" : "outline"}
              >
                <Link to="/auth" search={{ mode: "signup" }}>
                  {t.cta}
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const qs = [
    {
      q: "Is Apex Trade a real broker?",
      a: "Apex Trade is a paper-trading terminal today. The architecture supports broker connections (Alpaca, IBKR, Zerodha, Binance, Coinbase) via encrypted, hashed credentials — enable them when you're ready to route real orders.",
    },
    {
      q: "Do I need a credit card to start?",
      a: "No. Every account starts with a $100k paper cash balance. Upgrade only when you outgrow the free tier.",
    },
    {
      q: "How do margin and short-selling work?",
      a: "Switch your account to margin in Settings. Sells that exceed your long position open a short (up to your buying power). Buys that exceed an open short cover first, then open a long. Cash accounts are long-only and reject invalid sells server-side.",
    },
    {
      q: "Where does market data come from?",
      a: "The terminal ships with a deterministic mock feed for demos and paper trading. Enable live L1/L2 data by adding a provider key (Finnhub, Polygon, Twelve Data) in Settings.",
    },
    {
      q: "Is my data secure?",
      a: "Yes. Every table has row-level security scoped to auth.uid(). Broker keys are hashed with SHA-256 before storage. Nothing is trusted from the client.",
    },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="mx-auto max-w-3xl px-6 py-24">
      <div className="text-center">
        <div className="text-xs uppercase tracking-[0.2em] text-primary">FAQ</div>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
          Frequently asked questions
        </h2>
      </div>
      <div className="mt-10 divide-y divide-border rounded-xl border border-border bg-surface-1/60">
        {qs.map((item, i) => (
          <button
            key={item.q}
            onClick={() => setOpen(open === i ? null : i)}
            className="block w-full px-5 py-4 text-left transition-colors hover:bg-surface-2/50"
          >
            <div className="flex items-center justify-between gap-4">
              <span className="text-[15px] font-medium">{item.q}</span>
              <span className={cn("text-lg text-muted-foreground transition-transform", open === i && "rotate-45")}>
                +
              </span>
            </div>
            {open === i && (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="relative overflow-hidden border-y border-border">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 50%, oklch(0.72 0.16 158 / 0.16), transparent 70%)",
        }}
      />
      <div className="relative mx-auto max-w-4xl px-6 py-20 text-center">
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Ready in seconds. Deployable at scale.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Sign in with email or Google. Your workspace, watchlists, and paper
          portfolio are provisioned instantly.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="h-11 px-6 shadow-[0_0_24px_-6px_var(--color-primary)]">
            <Link to="/auth" search={{ mode: "signup" }}>
              Open your account <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-11 px-6">
            <Link to="/auth">Sign in</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const cols: Record<string, string[]> = {
    Product: ["Platform", "Features", "Pricing", "Security"],
    Company: ["About", "Careers", "Press", "Contact"],
    Resources: ["Docs", "API", "Changelog", "Status"],
    Legal: ["Terms", "Privacy", "Compliance", "Cookies"],
  };
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(4,1fr)]">
          <div>
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <span className="grid h-8 w-8 place-items-center rounded-md bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
                <Activity className="h-4 w-4" strokeWidth={2.75} />
              </span>
              Apex Trade
            </Link>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              The institutional trading terminal for professionals, prop shops,
              and independent traders.
            </p>
          </div>
          {Object.entries(cols).map(([h, items]) => (
            <div key={h}>
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {h}
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                {items.map((l) => (
                  <li key={l}>
                    <a className="text-muted-foreground transition-colors hover:text-foreground" href="#">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Apex Trade Systems, Inc.</span>
          <span>All market data shown is for demonstration only.</span>
        </div>
      </div>
    </footer>
  );
}
