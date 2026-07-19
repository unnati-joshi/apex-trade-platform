import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell/app-shell";
import { NewsPage } from "@/features/news/news";

export const Route = createFileRoute("/_authenticated/news")({
  head: () => ({ meta: [{ title: "News — Apex Trade" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <AppShell>
      <NewsPage />
    </AppShell>
  ),
});
