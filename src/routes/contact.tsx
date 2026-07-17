import { createFileRoute } from "@tanstack/react-router";
import { MarketingLayout, PageHero } from "@/components/marketing/marketing-layout";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, MessageSquare, Building } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Apex Trade" },
      { name: "description", content: "Get in touch with the Apex Trade team — sales, support, partnerships, or press." },
    ],
  }),
  component: ContactPage,
});

const ContactSchema = z.object({
  name: z.string().trim().min(2, "Name too short").max(80),
  email: z.string().trim().email("Enter a valid email").max(160),
  subject: z.string().trim().min(3).max(120),
  message: z.string().trim().min(10, "Message too short").max(2000),
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [busy, setBusy] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = ContactSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setBusy(true);
    // Persist locally + acknowledge. Wire to a mailer/webhook when available.
    try {
      const existing = JSON.parse(localStorage.getItem("apex:contact:pending") || "[]");
      existing.push({ ...parsed.data, at: new Date().toISOString() });
      localStorage.setItem("apex:contact:pending", JSON.stringify(existing));
      toast.success("Message received", { description: "We'll reply within one business day." });
      setForm({ name: "", email: "", subject: "", message: "" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <MarketingLayout>
      <PageHero eyebrow="Contact" title="Talk to the team" subtitle="Sales, support, partnerships, press — we read everything." />
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr]">
          <form onSubmit={onSubmit} className="rounded-2xl border border-border bg-surface-1/60 p-8 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Name">
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Trader" required maxLength={80} />
              </Field>
              <Field label="Email">
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@company.com" required maxLength={160} />
              </Field>
            </div>
            <Field label="Subject">
              <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="How can we help?" required maxLength={120} />
            </Field>
            <Field label="Message">
              <Textarea rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us what you're building or trading." required maxLength={2000} />
            </Field>
            <Button type="submit" disabled={busy} className="w-full">Send message</Button>
          </form>
          <div className="space-y-4">
            <ContactCard icon={<Mail className="h-4 w-4" />} label="General" value="hello@apextrade.com" href="mailto:hello@apextrade.com" />
            <ContactCard icon={<MessageSquare className="h-4 w-4" />} label="Support" value="support@apextrade.com" href="mailto:support@apextrade.com" />
            <ContactCard icon={<Building className="h-4 w-4" />} label="Sales" value="sales@apextrade.com" href="mailto:sales@apextrade.com" />
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function ContactCard({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href: string }) {
  return (
    <a href={href} className="block rounded-xl border border-border bg-surface-1/60 p-5 transition-colors hover:border-primary/40">
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">{icon}{label}</div>
      <div className="mt-1.5 text-sm font-medium">{value}</div>
    </a>
  );
}
