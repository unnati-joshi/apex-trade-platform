import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Bot,
  Briefcase,
  ChevronsLeft,
  ChevronsRight,
  ListChecks,
  Newspaper,
  Search,
  Settings,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Item {
  to: string;
  label: string;
  icon: React.ReactNode;
  hint?: string;
}

const ITEMS: Item[] = [
  { to: "/dashboard", label: "Dashboard", icon: <BarChart3 className="h-4 w-4" />, hint: "G D" },
  { to: "/watchlist", label: "Watchlist", icon: <ListChecks className="h-4 w-4" />, hint: "G W" },
  { to: "/portfolio", label: "Portfolio", icon: <Briefcase className="h-4 w-4" />, hint: "G P" },
  { to: "/orders", label: "Orders", icon: <Wallet className="h-4 w-4" />, hint: "G O" },
  { to: "/news", label: "News", icon: <Newspaper className="h-4 w-4" />, hint: "G N" },
  { to: "/ai", label: "AI Co-pilot", icon: <Bot className="h-4 w-4" />, hint: "G A" },
];

export function Sidebar({
  onOpenPalette,
}: {
  onOpenPalette: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all",
        collapsed ? "w-16" : "w-56",
      )}
    >
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-3">
        <button
          onClick={() => navigate({ to: "/dashboard" })}
          className="flex items-center gap-2 font-semibold"
        >
          <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
            <Activity className="h-4 w-4" strokeWidth={2.5} />
          </span>
          {!collapsed && <span className="text-sm tracking-tight">Apex Trade</span>}
        </button>
      </div>

      <div className="p-2">
        <button
          onClick={onOpenPalette}
          className={cn(
            "group flex w-full items-center gap-2 rounded-md border border-sidebar-border bg-sidebar-accent/50 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-sidebar-accent",
            collapsed && "justify-center",
          )}
        >
          <Search className="h-3.5 w-3.5" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">Search…</span>
              <kbd className="rounded border border-sidebar-border bg-sidebar px-1 text-[10px] text-muted-foreground">
                ⌘K
              </kbd>
            </>
          )}
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 px-2">
        {ITEMS.map((item) => {
          const active =
            location.pathname === item.to ||
            location.pathname.startsWith(item.to + "/");
          const linkEl = (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                collapsed && "justify-center",
              )}
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
          if (collapsed) {
            return (
              <Tooltip key={item.to}>
                <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            );
          }
          return linkEl;
        })}
      </nav>

      <div className="border-t border-sidebar-border p-2">
        <Link
          to="/settings"
          className={cn(
            "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            collapsed && "justify-center",
          )}
        >
          <Settings className="h-4 w-4" />
          {!collapsed && <span>Settings</span>}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="mt-1 h-8 w-full text-muted-foreground"
          onClick={() => setCollapsed((c) => !c)}
        >
          {collapsed ? (
            <ChevronsRight className="h-4 w-4" />
          ) : (
            <ChevronsLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </aside>
  );
}
