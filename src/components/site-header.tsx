"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Overview" },
  { href: "/waste-lots", label: "Waste Lots" },
  { href: "/ledger", label: "Carbon Ledger" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-border">
      <div className="shell flex flex-wrap items-center justify-between gap-x-8 gap-y-3 py-4">
        <Link href="/" className="font-serif text-lg font-semibold text-foreground">
          CarbonLoop
        </Link>
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
      </div>
    </header>
  );
}
