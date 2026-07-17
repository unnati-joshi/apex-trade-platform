import { Link } from "@tanstack/react-router";
import { Activity, ArrowRight, Twitter, Github, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface NavLink { to: string; label: string }

const NAV: NavLink[] = [
  { to: "/platform", label: "Platform" },
  { to: "/features", label: "Features" },
  { to: "/security", label: "Security" },
  { to: "/docs", label: "Docs" },
  { to: "/about", label: "About" },
];

export function MarketingLayout({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <MarketingNav />
      <main className={cn("relative", className)}>{children}</main>
      <MarketingFooter />
    </div>
  );
}

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3.5">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-[0_0_16px_-2px_var(--color-primary)]">
            <Activity className="h-4 w-4" strokeWidth={2.75} />
          </span>
          <span className="text-[15px] tracking-tight">Apex Trade</span>
        </Link>
        <nav className="hidden items-center gap-8 text-[13px] text-muted-foreground md:flex">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="transition-colors hover:text-foreground" activeProps={{ className: "text-foreground" }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/auth">Sign in</Link>
          </Button>
          <Button asChild size="sm" className="shadow-[0_0_20px_-6px_var(--color-primary)]">
            <Link to="/auth">
              Open account <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

export function MarketingFooter() {
  const cols: Array<{ heading: string; items: Array<{ to: string; label: string }> }> = [
    { heading: "Product", items: [
      { to: "/platform", label: "Platform" },
      { to: "/features", label: "Features" },
      { to: "/security", label: "Security" },
    ]},
    { heading: "Company", items: [
      { to: "/about", label: "About" },
      { to: "/careers", label: "Careers" },
      { to: "/press", label: "Press" },
      { to: "/contact", label: "Contact" },
    ]},
    { heading: "Resources", items: [
      { to: "/docs", label: "Docs" },
      { to: "/api", label: "API" },
      { to: "/changelog", label: "Changelog" },
      { to: "/status", label: "Status" },
    ]},
    { heading: "Legal", items: [
      { to: "/terms", label: "Terms" },
      { to: "/privacy", label: "Privacy" },
      { to: "/compliance", label: "Compliance" },
      { to: "/cookies", label: "Cookies" },
    ]},
  ];
  return (
    <footer className="border-t border-border/60 bg-surface-1/40">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <span className="grid h-8 w-8 place-items-center rounded-md bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
                <Activity className="h-4 w-4" strokeWidth={2.75} />
              </span>
              <span>Apex Trade</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              An institutional trading terminal for professionals — real markets, real execution, real risk controls.
            </p>
            <div className="mt-5 flex items-center gap-3 text-muted-foreground">
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="transition-colors hover:text-foreground" aria-label="Twitter"><Twitter className="h-4 w-4" /></a>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="transition-colors hover:text-foreground" aria-label="GitHub"><Github className="h-4 w-4" /></a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="transition-colors hover:text-foreground" aria-label="LinkedIn"><Linkedin className="h-4 w-4" /></a>
            </div>
          </div>
          {cols.map((col) => (
            <div key={col.heading}>
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{col.heading}</div>
              <ul className="mt-4 space-y-2.5 text-sm">
                {col.items.map((i) => (
                  <li key={i.to}>
                    <Link to={i.to} className="text-muted-foreground transition-colors hover:text-foreground">{i.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} Apex Trade Technologies. All rights reserved.</div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-bull" />
            <Link to="/status" className="hover:text-foreground">All systems operational</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function PageHero({ eyebrow, title, subtitle, children }: { eyebrow?: string; title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(60% 40% at 50% 0%, oklch(0.72 0.16 158 / 0.16), transparent 70%)" }}
      />
      <div className="relative mx-auto max-w-4xl px-6 py-20 text-center md:py-28">
        {eyebrow && <div className="text-xs uppercase tracking-[0.2em] text-primary">{eyebrow}</div>}
        <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight md:text-5xl">{title}</h1>
        {subtitle && <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-muted-foreground">{subtitle}</p>}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}

export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_p]:mb-4 [&_p]:leading-relaxed [&_p]:text-muted-foreground [&_ul]:my-4 [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_ul]:list-disc [&_li]:text-muted-foreground [&_a]:text-primary [&_a]:underline-offset-4 hover:[&_a]:underline">
      {children}
    </div>
  );
}
