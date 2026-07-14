import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { KeyRound, Loader2, Shield, Trash2, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Profile {
  full_name: string | null; display_name: string | null; email: string;
  country: string; base_currency: string; timezone: string; locale: string;
  risk_profile: string; bio: string | null; phone: string | null;
}
interface Prefs { theme: string; accent: string; compact_mode: boolean; reduced_motion: boolean;
  notification_prefs: Record<string, boolean>;
}
interface ApiKey { id: string; label: string; prefix: string; scopes: string[]; last_used_at: string | null; created_at: string; }
interface Workspace { id: string; name: string; slug: string; is_personal: boolean; owner_id: string; }

export function SettingsPage() {
  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Settings</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Preferences & security</h1>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
          <TabsTrigger value="workspaces">Workspaces</TabsTrigger>
        </TabsList>

        <TabsContent value="profile"><ProfileSection /></TabsContent>
        <TabsContent value="preferences"><PrefsSection /></TabsContent>
        <TabsContent value="security"><SecuritySection /></TabsContent>
        <TabsContent value="api"><ApiKeysSection /></TabsContent>
        <TabsContent value="workspaces"><WorkspacesSection /></TabsContent>
      </Tabs>
    </div>
  );
}

function ProfileSection() {
  const qc = useQueryClient();
  const { data: profile, isLoading } = useQuery({
    queryKey: ["settings:profile"],
    queryFn: async (): Promise<Profile | null> => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const { data } = await supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle();
      return data as Profile | null;
    },
  });
  const [form, setForm] = useState<Partial<Profile>>({});
  useEffect(() => { if (profile) setForm(profile); }, [profile]);

  const save = useMutation({
    mutationFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase.from("profiles").update({
        full_name: form.full_name, display_name: form.display_name,
        country: form.country, base_currency: form.base_currency,
        timezone: form.timezone, locale: form.locale,
        risk_profile: form.risk_profile as "conservative" | "moderate" | "aggressive" | "speculative" | undefined,
        bio: form.bio, phone: form.phone,
      }).eq("id", u.user!.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Profile updated"); qc.invalidateQueries({ queryKey: ["settings:profile"] }); qc.invalidateQueries({ queryKey: ["me:profile"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading…</div>;

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Personal information</CardTitle></CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Full name"><Input value={form.full_name ?? ""} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></Field>
          <Field label="Display name"><Input value={form.display_name ?? ""} onChange={(e) => setForm({ ...form, display_name: e.target.value })} /></Field>
          <Field label="Email"><Input value={form.email ?? ""} disabled /></Field>
          <Field label="Phone"><Input value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field label="Country"><Input value={form.country ?? ""} onChange={(e) => setForm({ ...form, country: e.target.value })} /></Field>
          <Field label="Base currency">
            <Select value={form.base_currency ?? "USD"} onValueChange={(v) => setForm({ ...form, base_currency: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["USD","EUR","GBP","JPY","INR","CAD","AUD","CHF"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Timezone"><Input value={form.timezone ?? ""} onChange={(e) => setForm({ ...form, timezone: e.target.value })} /></Field>
          <Field label="Risk profile">
            <Select value={form.risk_profile ?? "moderate"} onValueChange={(v) => setForm({ ...form, risk_profile: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["conservative","moderate","aggressive","speculative"].map(r => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <div className="flex justify-end">
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PrefsSection() {
  const qc = useQueryClient();
  const { data: prefs } = useQuery({
    queryKey: ["settings:prefs"],
    queryFn: async (): Promise<Prefs | null> => {
      const { data: u } = await supabase.auth.getUser();
      const { data } = await supabase.from("user_preferences").select("*").eq("user_id", u.user!.id).maybeSingle();
      return data as Prefs | null;
    },
  });
  const [local, setLocal] = useState<Partial<Prefs>>({});
  useEffect(() => { if (prefs) setLocal(prefs); }, [prefs]);

  const save = useMutation({
    mutationFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase.from("user_preferences").update({
        theme: local.theme, accent: local.accent,
        compact_mode: local.compact_mode, reduced_motion: local.reduced_motion,
        notification_prefs: local.notification_prefs,
      }).eq("user_id", u.user!.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Preferences saved"); qc.invalidateQueries({ queryKey: ["settings:prefs"] }); },
  });

  const n = local.notification_prefs ?? { email: true, push: true, in_app: true, price_alerts: true, news: true };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Appearance</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <ToggleRow label="Compact mode" description="Tighter spacing and denser tables."
            checked={!!local.compact_mode} onChange={(v) => setLocal({ ...local, compact_mode: v })} />
          <ToggleRow label="Reduce motion" description="Disable ticker animations and transitions."
            checked={!!local.reduced_motion} onChange={(v) => setLocal({ ...local, reduced_motion: v })} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Notifications</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {[
            ["email", "Email digests"],
            ["push", "Push notifications"],
            ["in_app", "In-app alerts"],
            ["price_alerts", "Price alerts"],
            ["news", "Market news"],
          ].map(([k, label]) => (
            <ToggleRow key={k} label={label} checked={!!n[k]}
              onChange={(v) => setLocal({ ...local, notification_prefs: { ...n, [k]: v } })} />
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => save.mutate()} disabled={save.isPending}>
          {save.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save preferences
        </Button>
      </div>
    </div>
  );
}

function SecuritySection() {
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  async function changePw() {
    if (pw.length < 8) return toast.error("Password must be at least 8 characters");
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pw });
      if (error) throw error;
      toast.success("Password updated");
      setPw("");
    } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  }
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base"><Shield className="mr-2 inline h-4 w-4" />Change password</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Field label="New password"><Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="At least 8 characters" /></Field>
          <div className="flex justify-end">
            <Button onClick={changePw} disabled={busy || !pw}>
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Update password
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Two-factor authentication</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            TOTP and passkeys are supported at the platform level. Contact your
            workspace admin to enforce 2FA for all members.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function ApiKeysSection() {
  const qc = useQueryClient();
  const [label, setLabel] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);

  const { data: keys = [] } = useQuery({
    queryKey: ["settings:apikeys"],
    queryFn: async (): Promise<ApiKey[]> => {
      const { data } = await supabase.from("api_keys").select("id,label,prefix,scopes,last_used_at,created_at")
        .is("revoked_at", null).order("created_at", { ascending: false });
      return (data as ApiKey[]) ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      if (!label.trim()) throw new Error("Enter a label");
      // Generate a client-side key. In production a server fn would mint + hash.
      const raw = "apx_" + crypto.randomUUID().replaceAll("-", "");
      const prefix = raw.slice(0, 12);
      const hash = await sha256(raw);
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase.from("api_keys").insert({
        user_id: u.user!.id, label: label.trim(), prefix, key_hash: hash, scopes: ["read"],
      });
      if (error) throw error;
      return raw;
    },
    onSuccess: (raw) => { setNewKey(raw); setLabel(""); qc.invalidateQueries({ queryKey: ["settings:apikeys"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const revoke = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("api_keys").update({ revoked_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Key revoked"); qc.invalidateQueries({ queryKey: ["settings:apikeys"] }); },
  });

  return (
    <Card>
      <CardHeader><CardTitle className="text-base"><KeyRound className="mr-2 inline h-4 w-4" />API keys</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input placeholder="Key label (e.g. Trading bot)" value={label} onChange={(e) => setLabel(e.target.value)} />
          <Button onClick={() => create.mutate()} disabled={create.isPending}>
            {create.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create key
          </Button>
        </div>
        {newKey && (
          <div className="rounded-md border border-warning/40 bg-warning/10 p-3 text-sm">
            <div className="font-semibold text-warning">Copy your key now — you won't see it again.</div>
            <code className="mt-2 block break-all rounded bg-background p-2 font-mono text-xs">{newKey}</code>
          </div>
        )}
        {keys.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No API keys yet.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>Prefix</TableHead>
                <TableHead>Scopes</TableHead>
                <TableHead>Last used</TableHead>
                <TableHead>Created</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((k) => (
                <TableRow key={k.id}>
                  <TableCell className="font-medium">{k.label}</TableCell>
                  <TableCell><code className="font-mono text-xs">{k.prefix}…</code></TableCell>
                  <TableCell>{k.scopes.map((s) => <Badge key={s} variant="outline" className="mr-1">{s}</Badge>)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {k.last_used_at ? formatDistanceToNow(new Date(k.last_used_at), { addSuffix: true }) : "Never"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(k.created_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-bear" onClick={() => revoke.mutate(k.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function WorkspacesSection() {
  const { data: workspaces = [] } = useQuery({
    queryKey: ["settings:workspaces"],
    queryFn: async (): Promise<Workspace[]> => {
      const { data: u } = await supabase.auth.getUser();
      const { data } = await supabase.from("workspaces").select("id,name,slug,is_personal,owner_id");
      return (data as Workspace[]) ?? [];
    },
  });
  return (
    <Card>
      <CardHeader><CardTitle className="text-base"><Users className="mr-2 inline h-4 w-4" />Your workspaces</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {workspaces.map((w) => (
          <div key={w.id} className="flex items-center justify-between rounded-md border border-border p-3">
            <div>
              <div className="text-sm font-semibold">{w.name}</div>
              <div className="text-xs text-muted-foreground">{w.slug}</div>
            </div>
            <div className="flex items-center gap-2">
              {w.is_personal && <Badge variant="outline">Personal</Badge>}
            </div>
          </div>
        ))}
        <p className="pt-2 text-xs text-muted-foreground">
          Team workspaces, invites, and RBAC roles are provisioned on Team & Enterprise plans.
        </p>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>;
}
function ToggleRow({ label, description, checked, onChange }: {
  label: string; description?: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {description && <div className="text-xs text-muted-foreground">{description}</div>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

async function sha256(s: string): Promise<string> {
  const enc = new TextEncoder().encode(s);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
