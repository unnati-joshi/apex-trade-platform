import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingLayout, PageHero } from "@/components/marketing/marketing-layout";
import { Building2, Target, Users, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Apex Trade" },
      { name: "description", content: "The team building the institutional trading terminal for the next generation of professionals." },
      { property: "og:title", content: "About — Apex Trade" },
      { property: "og:description", content: "The team building the institutional trading terminal for the next generation of professionals." },
      { property: "og:url", content: "https://apex-trading-app.lovable.app/about" },
    ],
    links: [{ rel: "canonical", href: "https://apex-trading-app.lovable.app/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <MarketingLayout>
      <PageHero
        eyebrow="Our story"
        title="Trading infrastructure for the next generation"
        subtitle="Apex Trade was founded by former quant traders and platform engineers frustrated with the trade-off between institutional depth and modern software."
      />
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-2">
          <Card icon={<Target className="h-5 w-5" />} title="Our mission">
            Give independent traders and small desks the same execution quality, risk tooling, and market intelligence that historically only sat inside Tier‑1 banks.
          </Card>
          <Card icon={<Building2 className="h-5 w-5" />} title="Our approach">
            Every surface — from the order ticket to the portfolio ledger — is built from primitives an institutional trader would recognize. No toy widgets, no fake data.
          </Card>
          <Card icon={<Users className="h-5 w-5" />} title="Our team">
            A small, senior group across engineering, market structure, and design — with combined experience at exchanges, market-making firms, and top consumer fintechs.
          </Card>
          <Card icon={<TrendingUp className="h-5 w-5" />} title="Where we're going">
            Broker integrations, options and futures, portfolio margin, and a public API. All built on the same foundation you see today.
          </Card>
        </div>
        <div className="mt-14 rounded-2xl border border-border bg-surface-1/60 p-8 md:p-12">
          <div className="text-xs uppercase tracking-widest text-primary">Backed by operators</div>
          <p className="mt-3 text-lg leading-relaxed">
            We're building Apex Trade with input from active portfolio managers, prop-desk traders, and market-microstructure engineers. If you're a professional trader with feedback, we'd love to hear from you — <Link to="/contact" className="text-primary underline-offset-4 hover:underline">get in touch</Link>.
          </p>
        </div>
      </section>
    </MarketingLayout>
  );
}

function Card({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-surface-1/60 p-6">
      <div className="mb-3 inline-grid h-9 w-9 place-items-center rounded-md border border-primary/30 bg-primary/10 text-primary">{icon}</div>
      <h2 className="text-[15px] font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}
