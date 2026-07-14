import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell/app-shell";
import { OrdersPage } from "@/features/orders/orders";

export const Route = createFileRoute("/_authenticated/orders")({
  head: () => ({ meta: [{ title: "Orders — Apex Trade" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <AppShell>
      <OrdersPage />
    </AppShell>
  ),
});
