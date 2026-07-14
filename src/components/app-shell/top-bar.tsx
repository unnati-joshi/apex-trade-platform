import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Bell, Check, LogOut, Menu, Search, Settings, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { initials } from "@/lib/format";

interface Profile {
  full_name: string | null;
  email: string;
  avatar_url: string | null;
}

interface Notif {
  id: string;
  title: string;
  body: string | null;
  kind: string;
  read_at: string | null;
  created_at: string;
}

export function TopBar({ onOpenPalette }: { onOpenPalette: () => void }) {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ["me:profile"],
    queryFn: async (): Promise<Profile | null> => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const { data } = await supabase
        .from("profiles")
        .select("full_name,email,avatar_url")
        .eq("id", u.user.id)
        .maybeSingle();
      return (data as Profile | null) ?? { full_name: null, email: u.user.email ?? "", avatar_url: null };
    },
  });

  const { data: notifs = [] } = useQuery({
    queryKey: ["me:notifications"],
    queryFn: async (): Promise<Notif[]> => {
      const { data } = await supabase
        .from("notifications")
        .select("id,title,body,kind,read_at,created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      return (data as Notif[]) ?? [];
    },
    refetchInterval: 30_000,
  });

  const unread = notifs.filter((n) => !n.read_at).length;

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  }

  async function markAllRead() {
    const ids = notifs.filter((n) => !n.read_at).map((n) => n.id);
    if (!ids.length) return;
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .in("id", ids);
    qc.invalidateQueries({ queryKey: ["me:notifications"] });
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/70 px-4 backdrop-blur">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => {}}
        aria-label="Menu"
      >
        <Menu className="h-4 w-4" />
      </Button>

      <button
        onClick={onOpenPalette}
        className="group flex h-9 flex-1 max-w-md items-center gap-2 rounded-md border border-border bg-surface-1 px-3 text-sm text-muted-foreground transition-colors hover:bg-surface-2"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Search symbols, actions…</span>
        <kbd className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px]">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-1">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-bear" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-96 p-0">
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <div className="text-sm font-semibold">Notifications</div>
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllRead}
                disabled={unread === 0}
                className="h-7 text-xs"
              >
                <Check className="mr-1 h-3 w-3" /> Mark all read
              </Button>
            </div>
            <ScrollArea className="h-96">
              {notifs.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 p-10 text-center text-sm text-muted-foreground">
                  <Bell className="h-6 w-6 opacity-50" />
                  <div>You're all caught up.</div>
                </div>
              ) : (
                notifs.map((n) => (
                  <div
                    key={n.id}
                    className="flex gap-3 border-b border-border px-4 py-3 last:border-b-0"
                  >
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" style={{ opacity: n.read_at ? 0.2 : 1 }} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="truncate text-sm font-medium">{n.title}</div>
                        <Badge variant="outline" className="shrink-0 text-[10px]">
                          {n.kind}
                        </Badge>
                      </div>
                      {n.body && (
                        <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                          {n.body}
                        </div>
                      )}
                      <div className="mt-1 text-[11px] text-muted-foreground">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 gap-2 px-2">
              <Avatar className="h-7 w-7">
                {profile?.avatar_url && <AvatarImage src={profile.avatar_url} />}
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {initials(profile?.full_name, profile?.email)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm md:inline">
                {profile?.full_name ?? profile?.email?.split("@")[0] ?? "You"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col">
              <span className="text-sm">{profile?.full_name ?? "Account"}</span>
              <span className="truncate text-xs font-normal text-muted-foreground">
                {profile?.email}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => navigate({ to: "/settings" })}>
              <User className="mr-2 h-4 w-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => navigate({ to: "/settings" })}>
              <Settings className="mr-2 h-4 w-4" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={signOut} className="text-bear focus:text-bear">
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
