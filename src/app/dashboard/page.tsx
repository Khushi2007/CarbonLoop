import Link from "next/link";
import { redirect } from "next/navigation";

import { LogoutButton } from "@/components/logout-button";
import { getCurrentCarbonLoopUser } from "@/lib/auth/session";

const ENTRY_POINTS: Record<string, { label: string; href: string }[]> = {
  GENERATOR: [
    { label: "My Waste Lots", href: "/waste-lots" },
    { label: "Create Waste Lot", href: "/waste-lots/new" },
    { label: "Carbon Ledger", href: "/ledger" },
  ],
  FACILITY: [
    { label: "Compatible Waste Lots", href: "/waste-lots" },
    { label: "Carbon Ledger", href: "/ledger" },
  ],
  ADMIN: [
    { label: "Waste Lots", href: "/waste-lots" },
    { label: "Carbon Ledger", href: "/ledger" },
  ],
};

export default async function DashboardPage() {
  const result = await getCurrentCarbonLoopUser();

  if (!result.ok) {
    if (result.status === 401) redirect("/login?redirect=/dashboard");
    // 404 PROFILE_NOT_FOUND: a Supabase Auth session exists with no matching
    // CarbonLoop profile row (see src/app/api/auth/signup/route.ts).
    return (
      <div className="shell max-w-lg py-14 sm:py-20">
        <h1 className="font-mono text-xs text-foreground-muted">Dashboard</h1>
        <p className="mt-4 text-sm text-error">{result.message}</p>
      </div>
    );
  }

  const { user } = result;
  const entryPoints = ENTRY_POINTS[user.role] ?? [];

  return (
    <div className="shell max-w-lg py-14 sm:py-20">
      <p className="font-mono text-xs text-foreground-muted">Dashboard</p>
      <div className="mt-2 flex flex-wrap items-baseline justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl text-foreground">{user.name}</h1>
          <p className="mt-1 font-mono text-xs text-foreground-muted">
            {user.role}
            {user.organization ? ` · ${user.organization}` : ""}
          </p>
        </div>
        <LogoutButton />
      </div>

      <ul className="mt-6 flex flex-col divide-y divide-border border-b border-border">
        {entryPoints.map((entry) => (
          <li key={entry.href}>
            <Link
              href={entry.href}
              className="flex items-center justify-between py-3 text-sm text-foreground hover:text-accent"
            >
              {entry.label}
              <span aria-hidden>→</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
