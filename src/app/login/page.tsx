"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="shell max-w-sm py-14 sm:py-20">
      <h1 className="font-mono text-xs text-foreground-muted">Sign in</h1>
      <p className="mt-2 text-sm text-foreground-secondary">Access your CarbonLoop account.</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-mono text-xs text-foreground-muted">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="border border-border bg-transparent px-3 py-2 text-sm text-foreground outline-none focus:border-foreground-secondary"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-mono text-xs text-foreground-muted">Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="border border-border bg-transparent px-3 py-2 text-sm text-foreground outline-none focus:border-foreground-secondary"
          />
        </label>

        {status === "error" && <p className="text-sm text-error">{message}</p>}

        <Button type="submit" variant="primary" disabled={status === "loading"} className="mt-2">
          {status === "loading" ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-foreground-secondary">
        Don&rsquo;t have an account?{" "}
        <Link href="/signup" className="text-accent hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
