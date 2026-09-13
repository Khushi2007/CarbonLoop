"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { formatCo2e, formatInr } from "@/components/ui/stat";
import { useCarbonRecords } from "@/hooks/use-carbon-records";
import { LogoutButton } from "@/components/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_LINKS = [
  { href: "/", label: "Overview" },
  { href: "/waste-lots", label: "Waste Lots" },
  { href: "/ledger", label: "Carbon Ledger" },
];

type CurrentUser = { name: string; role: string } | null;

function LedgerInstrument() {
  const ledger = useCarbonRecords();

  return (
    <p className="font-mono text-xs text-foreground-muted">
      Ledger —{" "}
      {ledger.status === "loading" && "···"}
      {ledger.status === "error" && <span title={ledger.message}>unavailable</span>}
      {ledger.status === "success" && (
        <span className="text-foreground-secondary">
          {formatCo2e(ledger.totals.totalNetCo2eKg)} · {formatInr(ledger.totals.totalEconomicValueInr)}
        </span>
      )}
    </p>
  );
}

export function SiteHeader({ currentUser = null }: { currentUser?: CurrentUser }) {
  const pathname = usePathname();

  return (
    <header className="border-b border-border">
      <div className="shell flex flex-wrap items-center justify-between gap-x-8 gap-y-3 py-4">
        <Link href="/" className="font-serif text-lg font-semibold text-foreground">
          CarbonLoop
        </Link>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 sm:gap-x-6">
            {NAV_LINKS.map((link) => {
              const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`border-b-2 pb-0.5 font-mono text-sm transition-colors duration-150 ${
                    active
                      ? "border-accent text-foreground"
                      : "border-transparent text-foreground-secondary hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <LedgerInstrument />
          <ThemeToggle />
          {currentUser ? (
            <div className="flex items-center gap-x-4">
              <Link href="/dashboard" className="font-mono text-xs text-foreground-secondary hover:text-foreground">
                {currentUser.name} ({currentUser.role})
              </Link>
              <LogoutButton />
            </div>
          ) : (
            <div className="flex items-center gap-x-4">
              <Link href="/login" className="font-mono text-xs text-foreground-secondary hover:text-foreground">
                Log in
              </Link>
              <Link href="/signup" className="font-mono text-xs text-accent hover:underline">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
