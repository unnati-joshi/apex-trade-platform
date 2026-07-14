import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Activity, ArrowLeft, Loader2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const search = z.object({
  mode: z.enum(["signin", "signup", "forgot"]).optional(),
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "Sign in — Apex Trade" },
      { name: "description", content: "Sign in to your Apex Trade workspace." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const s = useSearch({ from: "/auth" });
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">(s.mode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [oauthBusy, setOauthBusy] = useState(false);

  // Redirect if already authenticated.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: s.redirect ?? "/dashboard", replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate({ to: s.redirect ?? "/dashboard", replace: true });
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate, s.redirect]);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: window.location.origin + "/auth",
            data: { full_name: name.trim() || undefined },
          },
        });
        if (error) throw error;
        toast.success("Account created", { description: "Welcome to Apex Trade." });
      } else if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: window.location.origin + "/auth/reset",
        });
        if (error) throw error;
        toast.success("Check your email", {
          description: "We sent you a password reset link.",
        });
        setMode("signin");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error("Authentication failed", { description: msg });
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    if (oauthBusy) return;
    setOauthBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/auth",
      });
      if (result.error) {
        toast.error("Google sign-in failed", {
          description: result.error.message ?? "Please try again.",
        });
      }
    } finally {
      setOauthBusy(false);
    }
  }

  const isSignup = mode === "signup";
  const isForgot = mode === "forgot";

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Brand side */}
      <div className="relative hidden overflow-hidden border-r border-border bg-surface-1 lg:block">
        <div className="absolute inset-0 bg-grid opacity-70" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-transparent" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
              <Activity className="h-4 w-4" strokeWidth={2.5} />
            </span>
            Apex Trade
          </Link>
          <div>
            <blockquote className="max-w-md text-2xl font-medium tracking-tight text-foreground">
              &ldquo;Every institutional workflow, in a single terminal.&rdquo;
            </blockquote>
            <p className="mt-4 text-sm text-muted-foreground">
              Multi-asset watchlists, dockable widgets, encrypted broker
              connections, and an AI co-pilot that knows your book.
            </p>
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between p-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 pb-16">
          <div className="w-full max-w-sm">
            <h1 className="text-2xl font-semibold tracking-tight">
              {isForgot
                ? "Reset your password"
                : isSignup
                ? "Create your account"
                : "Welcome back"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isForgot
                ? "Enter your email and we'll send you a reset link."
                : isSignup
                ? "Get a personal workspace in under a minute."
                : "Sign in to your Apex Trade terminal."}
            </p>

            {!isForgot && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-6 w-full"
                  onClick={handleGoogle}
                  disabled={oauthBusy || busy}
                >
                  {oauthBusy ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <GoogleIcon className="mr-2 h-4 w-4" />
                  )}
                  Continue with Google
                </Button>
                <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
                  <Separator className="flex-1" />
                  <span>OR</span>
                  <Separator className="flex-1" />
                </div>
              </>
            )}

            <form onSubmit={handleEmail} className="space-y-4">
              {isSignup && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Trader"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                />
              </div>
              {!isForgot && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    {!isSignup && (
                      <button
                        type="button"
                        onClick={() => setMode("forgot")}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <Input
                    id="password"
                    type="password"
                    autoComplete={isSignup ? "new-password" : "current-password"}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                  />
                </div>
              )}

              <Button type="submit" className="w-full" disabled={busy}>
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isForgot
                  ? "Send reset link"
                  : isSignup
                  ? "Create account"
                  : "Sign in"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              {isForgot ? (
                <button
                  onClick={() => setMode("signin")}
                  className="hover:text-foreground"
                >
                  Back to sign in
                </button>
              ) : isSignup ? (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => setMode("signin")}
                    className="text-foreground hover:underline"
                  >
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  New to Apex?{" "}
                  <button
                    onClick={() => setMode("signup")}
                    className="text-foreground hover:underline"
                  >
                    Create an account
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.5 14.6 2.6 12 2.6 6.8 2.6 2.6 6.8 2.6 12S6.8 21.4 12 21.4c6.9 0 9.6-4.8 9.6-7.4 0-.5 0-.8-.1-1.2H12z"
      />
    </svg>
  );
}

