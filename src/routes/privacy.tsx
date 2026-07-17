import { createFileRoute } from "@tanstack/react-router";
import { MarketingLayout, PageHero, Prose } from "@/components/marketing/marketing-layout";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Apex Trade" },
      { name: "description", content: "How Apex Trade collects, uses, and protects your personal information." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <MarketingLayout>
      <PageHero eyebrow="Legal" title="Privacy Policy" subtitle={`Last updated ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`} />
      <Prose>
        <p>This Privacy Policy describes how Apex Trade Technologies ("we", "us") collects, uses, and shares information when you use our Service.</p>
        <h2>1. Information we collect</h2>
        <ul>
          <li><strong className="text-foreground">Account information</strong> — your name, email address, and password hash when you register.</li>
          <li><strong className="text-foreground">Trading activity</strong> — the paper orders you place, the watchlists you create, the AI conversations you have.</li>
          <li><strong className="text-foreground">Technical data</strong> — IP address, browser type, and pages visited, for security and analytics.</li>
        </ul>
        <h2>2. How we use it</h2>
        <ul>
          <li>To provide, maintain, and improve the Service.</li>
          <li>To secure your account and detect fraud or abuse.</li>
          <li>To communicate with you about product updates and support.</li>
        </ul>
        <h2>3. How we share it</h2>
        <p>We do not sell your personal information. We share limited data with the following categories of service providers, under contractual obligations to protect it:</p>
        <ul>
          <li>Infrastructure providers (Cloudflare, Supabase) for hosting and database services.</li>
          <li>Market data providers (Finnhub) for the quotes and historical data displayed to you.</li>
          <li>AI providers (via the Lovable AI Gateway) for the AI co-pilot.</li>
        </ul>
        <h2>4. Your rights</h2>
        <p>Depending on your jurisdiction, you may have the right to access, correct, export, or delete your personal information. Contact <a href="mailto:privacy@apextrade.com">privacy@apextrade.com</a> to exercise any of these rights.</p>
        <h2>5. Security</h2>
        <p>We use TLS in transit, encryption at rest, row-level security in the database, and hashed credentials to protect your data. No system is 100% secure; we work to promptly address any vulnerabilities.</p>
        <h2>6. Data retention</h2>
        <p>We retain your account data as long as your account is active. Upon deletion, most data is removed within 30 days, except where retention is required for legal or auditing purposes.</p>
        <h2>7. Children</h2>
        <p>The Service is not directed to children under 18 and we do not knowingly collect personal information from them.</p>
        <h2>8. Changes to this policy</h2>
        <p>We may update this Privacy Policy from time to time. Material changes will be announced in-product and via email where appropriate.</p>
        <h2>9. Contact</h2>
        <p><a href="mailto:privacy@apextrade.com">privacy@apextrade.com</a></p>
      </Prose>
    </MarketingLayout>
  );
}
