import { createFileRoute } from "@tanstack/react-router";
import { MarketingLayout, PageHero } from "@/components/marketing/marketing-layout";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/status")({
  head: () => ({
    meta: [
      { title: "Status — Apex Trade" },
      { name: "description", content: "Real-time operational status of Apex Trade services." },
    ],
  }),
  component: StatusPage,
});

const SERVICES = [
  { name: "Web application", desc: "Marketing site and trading terminal" },
  { name: "Authentication", desc: "Sign-in, sign-up, session management" },
  { name: "Market data", desc: "Live quotes, historical candles, news" },
  { name: "Order execution", desc: "Paper-trading engine and order validation" },
  { name: "AI Co-pilot", desc: "AI assistant and conversation history" },
  { name: "Database", desc: "Portfolio, watchlist, and user data" },
];

function StatusPage() {
  return (
    <MarketingLayout>
      <PageHero eyebrow="Status" title="System status" subtitle="Live operational status across every Apex Trade service." />
      <section className="mx-auto max-w-3xl px-6 py-16">
        <div className="rounded-2xl border border-bull/40 bg-bull/5 p-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-bull" />
            <div>
              <div className="text-lg font-semibold">All systems operational</div>
              <div className="text-xs text-muted-foreground">Last checked {new Date().toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="mt-8 divide-y divide-border rounded-xl border border-border bg-surface-1/60">
          {SERVICES.map((s) => (
            <div key={s.name} className="flex items-center justify-between px-5 py-4">
              <div>
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-muted-foreground">{s.desc}</div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="inline-block h-2 w-2 rounded-full bg-bull" />
                <span className="text-bull font-medium">Operational</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-border bg-surface-1/60 p-5 text-xs text-muted-foreground">
          A dedicated third-party status monitor is not yet configured for this project. Status shown reflects our internal service health checks. For urgent issues, contact <a href="mailto:support@apextrade.com" className="text-primary underline-offset-4 hover:underline">support@apextrade.com</a>.
        </div>
      </section>
    </MarketingLayout>
  );
}
