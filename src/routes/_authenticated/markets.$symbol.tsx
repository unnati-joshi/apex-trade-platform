import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell/app-shell";
import { MarketDetailPage } from "@/features/markets/market-detail";

export const Route = createFileRoute("/_authenticated/markets/$symbol")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.symbol?.toUpperCase()} — Apex Trade` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Component,
});

function Component() {
  const { symbol } = Route.useParams();
  return (
    <AppShell>
      <MarketDetailPage symbol={symbol} />
    </AppShell>
  );
}
