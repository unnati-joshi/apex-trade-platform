import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell/app-shell";
import { PortfolioPage } from "@/features/portfolio/portfolio";

export const Route = createFileRoute("/_authenticated/portfolio")({
  head: () => ({ meta: [{ title: "Portfolio — Apex Trade" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <AppShell>
      <PortfolioPage />
    </AppShell>
  ),
});
