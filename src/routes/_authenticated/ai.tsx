import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell/app-shell";
import { AiPage } from "@/features/ai/ai";

export const Route = createFileRoute("/_authenticated/ai")({
  head: () => ({ meta: [{ title: "AI Co-pilot — Apex Trade" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <AppShell>
      <AiPage />
    </AppShell>
  ),
});
