import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell/app-shell";
import { WatchlistPage } from "@/features/watchlist/watchlist";

export const Route = createFileRoute("/_authenticated/watchlist")({
  head: () => ({ meta: [{ title: "Watchlist — Apex Trade" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <AppShell>
      <WatchlistPage />
    </AppShell>
  ),
});
