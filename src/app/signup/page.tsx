"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type Role = "GENERATOR" | "FACILITY";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [role, setRole] = useState<Role>("GENERATOR");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "confirm-email">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name, role, organization: organization || undefined }),
    });
    const body = await response.json();

    if (!response.ok) {
      setStatus("error");
      setMessage(typeof body?.error === "string" ? body.error : "Unable to create account.");
      return;
    }

    if (body.emailConfirmationRequired) {
      setStatus("confirm-email");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  if (status === "confirm-email") {
    return (
      <div className="shell max-w-sm py-14 sm:py-20">
        <h1 className="font-mono text-xs text-foreground-muted">Check your email</h1>
        <p className="mt-4 text-sm text-foreground-secondary">
          Your account was created. Confirm your email address, then{" "}
          <Link href="/login" className="text-accent hover:underline">
            sign in
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="shell max-w-sm py-14 sm:py-20">
      <h1 className="font-mono text-xs text-foreground-muted">Create an account</h1>
      <p className="mt-2 text-sm text-foreground-secondary">Join CarbonLoop as a generator or facility.</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <fieldset className="flex flex-col gap-1.5 text-sm">
          <legend className="font-mono text-xs text-foreground-muted">I am a…</legend>
          <div className="mt-1 flex gap-4">
            {(["GENERATOR", "FACILITY"] as const).map((option) => (
              <label key={option} className="flex items-center gap-2 text-sm text-foreground">
                <input type="radio" name="role" checked={role === option} onChange={() => setRole(option)} />
                {option === "GENERATOR" ? "Waste Generator" : "Facility"}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-mono text-xs text-foreground-muted">Name</span>
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="border border-border bg-transparent px-3 py-2 text-sm text-foreground outline-none focus:border-foreground-secondary"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-mono text-xs text-foreground-muted">Organization (optional)</span>
          <input
            value={organization}
            onChange={(event) => setOrganization(event.target.value)}
            className="border border-border bg-transparent px-3 py-2 text-sm text-foreground outline-none focus:border-foreground-secondary"
          />
        </label>

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
          <span className="font-mono text-xs text-foreground-muted">Password (min. 8 characters)</span>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="border border-border bg-transparent px-3 py-2 text-sm text-foreground outline-none focus:border-foreground-secondary"
          />
        </label>

        {status === "error" && <p className="text-sm text-error">{message}</p>}

        <Button type="submit" variant="primary" disabled={status === "loading"} className="mt-2">
          {status === "loading" ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-foreground-secondary">
        Already have an account?{" "}
        <Link href="/login" className="text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
