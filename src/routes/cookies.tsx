import { createFileRoute } from "@tanstack/react-router";
import { MarketingLayout, PageHero, Prose } from "@/components/marketing/marketing-layout";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Cookie Policy — Apex Trade" },
      { name: "description", content: "How Apex Trade uses cookies and similar technologies." },
    ],
  }),
  component: CookiesPage,
});

function CookiesPage() {
  return (
    <MarketingLayout>
      <PageHero eyebrow="Legal" title="Cookie Policy" subtitle={`Last updated ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`} />
      <Prose>
        <p>This Cookie Policy explains how Apex Trade uses cookies and similar technologies on our website and in our web application.</p>
        <h2>What are cookies?</h2>
        <p>Cookies are small text files that are placed on your device when you visit a website. They allow the website to recognize your device on subsequent visits and store limited information about your interactions.</p>
        <h2>Categories of cookies we use</h2>
        <ul>
          <li><strong className="text-foreground">Strictly necessary</strong> — required for the site and app to function. Includes authentication and session cookies. These cannot be disabled.</li>
          <li><strong className="text-foreground">Preferences</strong> — remember your workspace settings, theme, and layout choices.</li>
          <li><strong className="text-foreground">Analytics</strong> — help us understand how the site is used so we can improve it. Enabled only where we've obtained your consent, if applicable.</li>
        </ul>
        <h2>Third-party cookies</h2>
        <p>Some cookies may be set by third-party services we use, such as authentication providers (Google) or hosting infrastructure. We do not use third-party advertising cookies.</p>
        <h2>Managing cookies</h2>
        <p>Most browsers let you refuse or delete cookies through their settings. Disabling strictly necessary cookies will prevent core parts of the app (such as sign-in) from working correctly.</p>
        <h2>Changes to this policy</h2>
        <p>We may update this Cookie Policy from time to time. Material changes will be announced in-product where appropriate.</p>
        <h2>Contact</h2>
        <p><a href="mailto:privacy@apextrade.com">privacy@apextrade.com</a></p>
      </Prose>
    </MarketingLayout>
  );
}
