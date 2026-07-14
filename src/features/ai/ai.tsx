import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { chatAi, listConversations, getMessages } from "@/lib/ai.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot, Loader2, MessageSquare, Plus, Send, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export function AiPage() {
  const qc = useQueryClient();
  const [convId, setConvId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const chat = useServerFn(chatAi);
  const listConv = useServerFn(listConversations);
  const getMsgs = useServerFn(getMessages);

  const { data: convs = [] } = useQuery({ queryKey: ["ai:conv"], queryFn: () => listConv() });
  const { data: messages = [] } = useQuery({
    queryKey: ["ai:msgs", convId],
    enabled: !!convId,
    queryFn: () => getMsgs({ data: { conversationId: convId! } }),
  });

  const send = useMutation({
    mutationFn: async (message: string) => {
      return chat({ data: { conversationId: convId ?? undefined, message } });
    },
    onSuccess: (res) => {
      setConvId(res.conversationId);
      qc.invalidateQueries({ queryKey: ["ai:conv"] });
      qc.invalidateQueries({ queryKey: ["ai:msgs", res.conversationId] });
    },
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, send.isPending]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || send.isPending) return;
    send.mutate(input.trim());
    setInput("");
  }

  return (
    <div className="mx-auto flex h-full max-w-[1600px] gap-6 p-6">
      <Card className="w-64 shrink-0">
        <CardContent className="p-2">
          <Button className="mb-2 w-full" size="sm" onClick={() => { setConvId(null); }}>
            <Plus className="mr-1 h-4 w-4" /> New chat
          </Button>
          <ScrollArea className="h-[calc(100vh-14rem)]">
            {convs.map((c) => (
              <button
                key={c.id}
                onClick={() => setConvId(c.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors",
                  convId === c.id ? "bg-accent" : "hover:bg-accent/60",
                )}
              >
                <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium">{c.title}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(c.updated_at), { addSuffix: true })}
                  </div>
                </div>
              </button>
            ))}
            {convs.length === 0 && (
              <div className="p-6 text-center text-xs text-muted-foreground">No conversations yet.</div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="flex flex-1 flex-col overflow-hidden">
        <div className="border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
              <Bot className="h-4 w-4" />
            </span>
            <div>
              <div className="text-sm font-semibold">Apex Co-pilot</div>
              <div className="text-xs text-muted-foreground">Portfolio-aware market intelligence</div>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="mx-auto max-w-3xl space-y-6 px-6 py-8">
            {messages.length === 0 && !send.isPending && (
              <EmptyState onExample={(t) => setInput(t)} />
            )}
            {messages.map((m) => (
              <div key={m.id} className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}>
                <div className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-md",
                  m.role === "user" ? "bg-secondary" : "bg-primary text-primary-foreground",
                )}>
                  {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={cn(
                  "max-w-[85%] whitespace-pre-wrap rounded-lg px-4 py-2.5 text-sm",
                  m.role === "user" ? "bg-secondary" : "panel-inset",
                )}>
                  {m.content}
                </div>
              </div>
            ))}
            {send.isPending && (
              <div className="flex gap-3">
                <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="panel-inset flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
        </ScrollArea>

        <form onSubmit={onSubmit} className="border-t border-border p-4">
          <div className="mx-auto flex max-w-3xl gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSubmit(e); }
              }}
              placeholder="Ask about a symbol, review your book, or draft a strategy…"
              rows={2}
              className="min-h-[52px] resize-none"
            />
            <Button type="submit" size="icon" className="h-[52px] w-12" disabled={send.isPending || !input.trim()}>
              {send.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-muted-foreground">
            Not investment advice. AI can be inaccurate — verify critical decisions.
          </p>
        </form>
      </Card>
    </div>
  );
}

function EmptyState({ onExample }: { onExample: (t: string) => void }) {
  const examples = [
    "Summarize the risk in my portfolio",
    "Explain why NVDA has been volatile this quarter",
    "Draft a mean-reversion strategy for SPY",
    "What macro events should I watch this week?",
  ];
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-md bg-primary text-primary-foreground">
        <Bot className="h-5 w-5" />
      </div>
      <h2 className="mt-4 text-lg font-semibold">How can I help you trade today?</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        I have context on your book, watchlists, and market movement.
      </p>
      <div className="mt-8 grid grid-cols-1 gap-2 md:grid-cols-2">
        {examples.map((t) => (
          <button
            key={t}
            onClick={() => onExample(t)}
            className="panel p-3 text-left text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
