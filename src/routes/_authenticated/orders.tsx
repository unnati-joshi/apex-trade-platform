import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { AppShell } from "@/components/app-shell/app-shell";
import { OrdersPage } from "@/features/orders/orders";

const OrdersSearch = z.object({
  symbol: z.string().optional(),
  side: z.enum(["buy", "sell"]).optional(),
});

export const Route = createFileRoute("/_authenticated/orders")({
  head: () => ({ meta: [{ title: "Orders — Apex Trade" }, { name: "robots", content: "noindex" }] }),
  validateSearch: (s) => OrdersSearch.parse(s),
  component: Component,
});

function Component() {
  const { symbol, side } = Route.useSearch();
  return (
    <AppShell>
      <OrdersPage initialSymbol={symbol} initialSide={side} />
    </AppShell>
  );
}
