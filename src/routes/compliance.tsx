import { createFileRoute } from "@tanstack/react-router";
import { MarketingLayout, PageHero, Prose } from "@/components/marketing/marketing-layout";

export const Route = createFileRoute("/compliance")({
  head: () => ({
    meta: [
      { title: "Compliance — Apex Trade" },
      { name: "description", content: "Regulatory and compliance posture for Apex Trade." },
      { property: "og:title", content: "Compliance — Apex Trade" },
      { property: "og:description", content: "Regulatory and compliance posture for Apex Trade." },
      { property: "og:url", content: "https://apex-trading-app.lovable.app/compliance" },
    ],
    links: [{ rel: "canonical", href: "https://apex-trading-app.lovable.app/compliance" }],
  }),
  component: CompliancePage,
});

function CompliancePage() {
  return (
    <MarketingLayout>
      <PageHero eyebrow="Legal" title="Compliance" subtitle="Our approach to regulation, licensing, and industry best practice." />
      <Prose>
        <h2>Current status</h2>
        <p>Apex Trade currently offers a paper-trading platform only. No real securities orders are routed, no client assets are custodied, and no brokerage services are provided. As a result, the Service is not currently a registered broker-dealer, investment adviser, or money-services business in any jurisdiction.</p>
        <h2>Data providers</h2>
        <p>Market data displayed on the platform is licensed from Finnhub and other institutional data vendors. Data may be delayed or aggregated depending on the source and asset class.</p>
        <h2>AI-generated content</h2>
        <p>The AI Co-pilot is an assistive tool. It does not constitute personalized investment advice, and its output should not be relied upon as a sole basis for any trading decision.</p>
        <h2>Security & privacy</h2>
        <p>We follow industry-standard controls: TLS, encryption at rest, row-level security on our database, hashed credentials, and audit logging. See our <a href="/security">Security page</a> for details.</p>
        <h2>Sanctions & KYC</h2>
        <p>Because the Service does not custody funds or execute live trades, we do not currently perform full KYC/AML procedures. Should Apex Trade begin offering live brokerage services, comprehensive KYC/AML, sanctions screening, and applicable disclosures will be introduced at that time.</p>
        <h2>Contact</h2>
        <p>For compliance-related questions, email <a href="mailto:compliance@apextrade.com">compliance@apextrade.com</a>.</p>
        <p className="text-xs">This page describes app-visible controls and is maintained by Apex Trade. It is not an independent certification and should not be interpreted as a regulatory license.</p>
      </Prose>
    </MarketingLayout>
  );
}
