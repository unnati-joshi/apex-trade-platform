import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Activity, Brain, Layers, LineChart, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Apex Trade — Institutional Trading Terminal" },
      {
        name: "description",
        content:
          "The trading terminal built for professionals. Real-time data, multi-asset portfolios, AI market intelligence, and enterprise-grade security.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
              <Activity className="h-4 w-4" strokeWidth={2.5} />
            </span>
            <span className="text-base tracking-tight">Apex Trade</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#platform" className="hover:text-foreground">Platform</a>
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#security" className="hover:text-foreground">Security</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/auth" search={{ mode: "signup" }}>
                Get started <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-grid">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 text-center md:py-32">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-surface-1 px-3 py-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-bull" />
            Live markets, real-time execution, AI intelligence
          </div>
          <h1 className="mx-auto mt-6 max-w-3xl text-balance text-4xl font-semibold tracking-tight md:text-6xl">
            The trading terminal built for{" "}
            <span className="text-primary">professionals.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
            Multi-asset portfolios, dockable widgets, and a portfolio-aware AI
            co-pilot. Everything you need to research, execute, and monitor —
            in one institutional-grade workspace.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/auth" search={{ mode: "signup" }}>
                Start trading free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/auth">Sign in</Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Paper accounts by default. No credit card required.
          </p>
        </div>
      </section>

      {/* Feature grid */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Feature
            icon={<LineChart className="h-5 w-5" />}
            title="Real-time markets"
            desc="Live quotes, top movers, heatmaps and charts across equities, ETFs and crypto — with provider fallback."
          />
          <Feature
            icon={<Layers className="h-5 w-5" />}
            title="Dockable workspace"
            desc="Drag, resize, and persist widget layouts. Save multiple layouts per workspace or account."
          />
          <Feature
            icon={<Brain className="h-5 w-5" />}
            title="AI co-pilot"
            desc="Portfolio-aware assistant that explains movement, reviews trades, and generates strategy ideas."
          />
          <Feature
            icon={<Zap className="h-5 w-5" />}
            title="Order management"
            desc="Market, limit, stop, stop-limit, and trailing stops with server-side validation and audit trails."
          />
          <Feature
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Enterprise security"
            desc="Row-level security on every table, hashed API keys, session and login history, RBAC across workspaces."
          />
          <Feature
            icon={<Activity className="h-5 w-5" />}
            title="Broker-ready"
            desc="Architecture for Alpaca, IBKR, Zerodha, Binance and Coinbase — encrypted credentials, health checks, sync."
          />
        </div>
      </section>

      <section id="security" className="border-t border-border bg-surface-1/40">
        <div className="mx-auto max-w-7xl px-6 py-16 text-center">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Ready in seconds. Deployable at scale.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Sign in with email or Google to spin up your workspace.
          </p>
          <div className="mt-6 flex justify-center">
            <Button asChild size="lg">
              <Link to="/auth" search={{ mode: "signup" }}>
                Create your account <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-8 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Apex Trade</span>
          <span>All market data shown is for demonstration only.</span>
        </div>
      </footer>
    </div>
  );
}

function Feature({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="panel p-6 transition-colors hover:border-primary/40">
      <div className="mb-4 inline-grid h-9 w-9 place-items-center rounded-md bg-accent text-accent-foreground">
        {icon}
      </div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}
