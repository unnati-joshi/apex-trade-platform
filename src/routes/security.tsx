import { createFileRoute } from "@tanstack/react-router";
import { MarketingLayout, PageHero } from "@/components/marketing/marketing-layout";
import { ShieldCheck, Lock, Key, FileCheck, Server, Users } from "lucide-react";

export const Route = createFileRoute("/security")({
  head: () => ({
    meta: [
      { title: "Security — Apex Trade" },
      { name: "description", content: "How Apex Trade protects your account, credentials, market data, and trading activity." },
    ],
  }),
  component: SecurityPage,
});

const CONTROLS = [
  { icon: <Lock className="h-5 w-5" />, title: "Encryption at rest and in transit", desc: "All traffic uses TLS 1.3. Data is stored in an encrypted managed Postgres instance." },
  { icon: <Key className="h-5 w-5" />, title: "Hashed API credentials", desc: "Broker API keys are stored as SHA-256 hashes; the plaintext value is never persisted after creation." },
  { icon: <ShieldCheck className="h-5 w-5" />, title: "Row-level security", desc: "Every table enforces Postgres row-level security. Users can only read their own portfolios, orders, and watchlists." },
  { icon: <Users className="h-5 w-5" />, title: "Role-based access control", desc: "Workspace roles (owner, admin, member) gate every privileged action." },
  { icon: <Server className="h-5 w-5" />, title: "Edge infrastructure", desc: "Deployed on Cloudflare's global edge network with server-side secret isolation." },
  { icon: <FileCheck className="h-5 w-5" />, title: "Audit logs", desc: "Every sensitive event — logins, order placement, key rotation — is written to an append-only audit log." },
];

function SecurityPage() {
  return (
    <MarketingLayout>
      <PageHero
        eyebrow="Security"
        title="Built for institutional trust"
        subtitle="Apex Trade applies the security controls you'd expect from a bank — for every user, on every plan."
      />
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {CONTROLS.map((c) => (
            <div key={c.title} className="rounded-xl border border-border bg-surface-1/70 p-6">
              <div className="mb-3 inline-grid h-9 w-9 place-items-center rounded-md border border-primary/30 bg-primary/10 text-primary">{c.icon}</div>
              <h3 className="text-[15px] font-semibold tracking-tight">{c.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{c.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-14 rounded-2xl border border-border bg-surface-1/60 p-8">
          <h2 className="text-xl font-semibold tracking-tight">Reporting a vulnerability</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            We take security seriously. If you've discovered a vulnerability, email us at{" "}
            <a href="mailto:security@apextrade.com" className="text-primary underline-offset-4 hover:underline">security@apextrade.com</a>.
            Please give us reasonable time to investigate and remediate before public disclosure.
          </p>
        </div>
      </section>
    </MarketingLayout>
  );
}
