import { createFileRoute } from "@tanstack/react-router";
import { MarketingLayout, PageHero, Prose } from "@/components/marketing/marketing-layout";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Apex Trade" },
      { name: "description", content: "The terms of service governing use of Apex Trade." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <MarketingLayout>
      <PageHero eyebrow="Legal" title="Terms of Service" subtitle={`Last updated ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`} />
      <Prose>
        <p>These Terms of Service ("Terms") govern your access to and use of the Apex Trade platform, website, and services (collectively, the "Service"). By creating an account or otherwise using the Service, you agree to be bound by these Terms.</p>
        <h2>1. Eligibility</h2>
        <p>You must be at least 18 years old and legally capable of entering into a binding contract to use the Service. By using the Service, you represent and warrant that you meet these requirements.</p>
        <h2>2. Not investment advice</h2>
        <p>The Service, including any market data, analytics, AI-generated commentary, and portfolio metrics, is provided for informational purposes only. Nothing on the Service constitutes investment, financial, legal, or tax advice, and you should not rely on it as such. Consult a qualified professional before making any trading or investment decision.</p>
        <h2>3. Paper trading</h2>
        <p>The current Service supports paper (simulated) trading only. Simulated results do not reflect the effect of real market impact, slippage, liquidity constraints, taxes, or fees. Past simulated performance does not guarantee future results.</p>
        <h2>4. Your account</h2>
        <ul>
          <li>You are responsible for maintaining the confidentiality of your credentials.</li>
          <li>You are responsible for all activity that occurs under your account.</li>
          <li>You must notify us immediately of any unauthorized use.</li>
        </ul>
        <h2>5. Acceptable use</h2>
        <p>You agree not to reverse-engineer the Service, use it to build a competing product, scrape data at abusive rates, or use it in violation of any applicable law or regulation.</p>
        <h2>6. Intellectual property</h2>
        <p>All content on the Service — including software, design, text, and graphics — is owned by Apex Trade Technologies or its licensors and is protected by intellectual property laws.</p>
        <h2>7. Disclaimers</h2>
        <p>THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE DISCLAIM ALL IMPLIED WARRANTIES, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</p>
        <h2>8. Limitation of liability</h2>
        <p>To the maximum extent permitted by law, Apex Trade shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the Service.</p>
        <h2>9. Termination</h2>
        <p>We may suspend or terminate your access to the Service at any time for any reason, including violation of these Terms. You may terminate your account at any time from the Settings page.</p>
        <h2>10. Changes</h2>
        <p>We may modify these Terms from time to time. Continued use of the Service after such changes constitutes acceptance of the new Terms.</p>
        <h2>11. Contact</h2>
        <p>Questions about these Terms? Email <a href="mailto:legal@apextrade.com">legal@apextrade.com</a>.</p>
      </Prose>
    </MarketingLayout>
  );
}
