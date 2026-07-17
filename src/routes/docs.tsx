import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingLayout, PageHero } from "@/components/marketing/marketing-layout";
import { Book, Code2, KeyRound, Zap, HelpCircle } from "lucide-react";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Docs — Apex Trade" },
      { name: "description", content: "Get started with Apex Trade — installation, authentication, market data, orders, and more." },
    ],
  }),
  component: DocsPage,
});

const SECTIONS = [
  { icon: <Zap className="h-4 w-4" />, title: "Quickstart", desc: "Create an account, place your first paper trade, and understand the workspace in five minutes." },
  { icon: <KeyRound className="h-4 w-4" />, title: "Authentication", desc: "Email/password, Google sign-in, and session management with Supabase-backed auth." },
  { icon: <Book className="h-4 w-4" />, title: "Market data", desc: "Live quotes, historical candles, symbol search, and market news — powered by Finnhub." },
  { icon: <Code2 className="h-4 w-4" />, title: "API reference", desc: "Every endpoint the app calls, with request/response examples.", href: "/api" },
  { icon: <HelpCircle className="h-4 w-4" />, title: "FAQ", desc: "Rate limits, supported markets, paper vs. live, data provenance." },
];

function DocsPage() {
  return (
    <MarketingLayout>
      <PageHero eyebrow="Documentation" title="Build with Apex Trade" subtitle="Everything you need to run the platform locally or extend it in your own workspace." />
      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="grid gap-3 md:grid-cols-2">
          {SECTIONS.map((s) => (
            s.href ? (
              <Link key={s.title} to={s.href} className="group rounded-xl border border-border bg-surface-1/70 p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40">
                <SectionInner {...s} />
              </Link>
            ) : (
              <div key={s.title} className="rounded-xl border border-border bg-surface-1/70 p-5">
                <SectionInner {...s} />
              </div>
            )
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-20 space-y-10">
        <Doc title="Installation" body={
          <>
            <p className="mb-3 text-muted-foreground">Clone the repository and install dependencies:</p>
            <Code>{`git clone https://github.com/your-org/apex-trade\ncd apex-trade\nbun install`}</Code>
            <p className="mt-4 mb-3 text-muted-foreground">Copy the environment template and fill in your keys:</p>
            <Code>{`cp .env.example .env\n# add FINNHUB_API_KEY and Supabase credentials\nbun dev`}</Code>
          </>
        } />
        <Doc title="Environment variables" body={
          <ul className="space-y-2 text-sm">
            <li><Kbd>FINNHUB_API_KEY</Kbd> — server-side market data provider key (never exposed to the browser).</li>
            <li><Kbd>SUPABASE_URL</Kbd> / <Kbd>VITE_SUPABASE_URL</Kbd> — backend URL.</li>
            <li><Kbd>SUPABASE_PUBLISHABLE_KEY</Kbd> / <Kbd>VITE_SUPABASE_PUBLISHABLE_KEY</Kbd> — anon key used by RLS-protected reads.</li>
            <li><Kbd>LOVABLE_API_KEY</Kbd> — server-side AI gateway key (auto-provisioned).</li>
          </ul>
        } />
        <Doc title="Rate limits" body={
          <p className="text-muted-foreground">
            Finnhub's free tier allows 60 calls/minute. The client throttles quote refreshes to every 30s and caches historical candles for 60s. If the provider returns 429, the UI surfaces a rate-limit error instead of falling back to fake data.
          </p>
        } />
      </section>
    </MarketingLayout>
  );
}

function SectionInner({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <>
      <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">{icon}{title}</div>
      <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
    </>
  );
}

function Doc({ title, body }: { title: string; body: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-3 text-xl font-semibold tracking-tight">{title}</h2>
      {body}
    </div>
  );
}

function Code({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-border bg-surface-2 p-4 text-[13px] leading-relaxed"><code className="font-mono">{children}</code></pre>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return <code className="rounded border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-xs">{children}</code>;
}
