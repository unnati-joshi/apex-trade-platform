import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingLayout, PageHero } from "@/components/marketing/marketing-layout";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: "Careers — Apex Trade" },
      { name: "description", content: "Join the team building institutional-grade trading infrastructure." },
      { property: "og:title", content: "Careers — Apex Trade" },
      { property: "og:description", content: "Join the team building institutional-grade trading infrastructure." },
      { property: "og:url", content: "https://apex-trading-app.lovable.app/careers" },
    ],
    links: [{ rel: "canonical", href: "https://apex-trading-app.lovable.app/careers" }],
  }),
  component: CareersPage,
});

// When positions open, add entries here.
const OPENINGS: Array<{ title: string; team: string; location: string; type: string }> = [];

function CareersPage() {
  return (
    <MarketingLayout>
      <PageHero
        eyebrow="Careers"
        title="Build the future of trading"
        subtitle="We're a small, senior team building institutional-grade software for professional traders."
      />
      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="rounded-2xl border border-border bg-surface-1/60 p-8">
          <div className="text-xs uppercase tracking-widest text-primary">Open positions</div>
          {OPENINGS.length === 0 ? (
            <div className="mt-6 rounded-lg border border-dashed border-border bg-surface-2/40 p-10 text-center">
              <h2 className="text-lg font-semibold tracking-tight">No open positions at the moment</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                We're not actively hiring right now, but exceptional engineers, quants, and designers are always welcome to introduce themselves.
              </p>
              <Link to="/contact" className="mt-4 inline-block text-sm text-primary underline-offset-4 hover:underline">
                Introduce yourself →
              </Link>
            </div>
          ) : (
            <div className="mt-4 divide-y divide-border">
              {OPENINGS.map((o) => (
                <div key={o.title} className="flex flex-wrap items-center justify-between gap-3 py-4">
                  <div>
                    <div className="font-semibold">{o.title}</div>
                    <div className="text-xs text-muted-foreground">{o.team} · {o.location} · {o.type}</div>
                  </div>
                  <Link to="/contact" className="text-sm text-primary underline-offset-4 hover:underline">Apply →</Link>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Perk title="Ownership" body="Meaningful equity for everyone we hire." />
          <Perk title="Autonomy" body="Small teams, no politics, ship weekly." />
          <Perk title="Compensation" body="Above-market cash, competitive benefits." />
        </div>
      </section>
    </MarketingLayout>
  );
}

function Perk({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface-1/60 p-5">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-1 text-sm text-muted-foreground">{body}</div>
    </div>
  );
}
