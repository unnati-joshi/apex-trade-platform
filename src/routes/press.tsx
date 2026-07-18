import { createFileRoute } from "@tanstack/react-router";
import { MarketingLayout, PageHero } from "@/components/marketing/marketing-layout";
import { Download, Mail } from "lucide-react";

export const Route = createFileRoute("/press")({
  head: () => ({
    meta: [
      { title: "Press — Apex Trade" },
      { name: "description", content: "Press kit, brand assets, and media contact for Apex Trade." },
      { property: "og:title", content: "Press — Apex Trade" },
      { property: "og:description", content: "Press kit, brand assets, and media contact for Apex Trade." },
      { property: "og:url", content: "https://apex-trading-app.lovable.app/press" },
    ],
    links: [{ rel: "canonical", href: "https://apex-trading-app.lovable.app/press" }],
  }),
  component: PressPage,
});

function PressPage() {
  return (
    <MarketingLayout>
      <PageHero eyebrow="Press" title="Media & press kit" subtitle="Resources for journalists, analysts, and partners covering Apex Trade." />
      <section className="mx-auto max-w-4xl px-6 py-16 space-y-8">
        <Card title="Company facts">
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><span className="font-medium text-foreground">Founded:</span> 2025</li>
            <li><span className="font-medium text-foreground">Headquarters:</span> Remote-first</li>
            <li><span className="font-medium text-foreground">Product:</span> Institutional-grade trading terminal</li>
            <li><span className="font-medium text-foreground">Category:</span> Financial technology / retail brokerage infrastructure</li>
          </ul>
        </Card>
        <Card title="Boilerplate">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Apex Trade is an institutional-grade trading terminal for independent traders and small desks. The platform combines real-time market data, multi-asset portfolios, margin and short-selling controls, and an AI co-pilot in a single, dense workspace inspired by professional systems like Bloomberg Terminal.
          </p>
        </Card>
        <Card title="Brand assets">
          <p className="mb-4 text-sm text-muted-foreground">Logos, wordmarks, and product screenshots available on request.</p>
          <a href="mailto:press@apextrade.com" className="inline-flex items-center gap-2 rounded-md border border-border bg-surface-2 px-3 py-2 text-sm hover:border-primary/40">
            <Download className="h-4 w-4" /> Request press kit
          </a>
        </Card>
        <Card title="Media contact">
          <a href="mailto:press@apextrade.com" className="inline-flex items-center gap-2 text-primary underline-offset-4 hover:underline">
            <Mail className="h-4 w-4" /> press@apextrade.com
          </a>
        </Card>
      </section>
    </MarketingLayout>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-surface-1/60 p-6">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}
