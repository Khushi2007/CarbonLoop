import type { ReactNode } from "react";

/**
 * Register/table primitives shared by the Waste Lot register and the Carbon
 * Ledger — real <table> markup with hairline rules instead of a card grid.
 */

export function Register({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full min-w-max border-collapse text-left text-sm">{children}</table>
    </div>
  );
}

export function RegisterHead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b border-border-strong">
      <tr>{children}</tr>
    </thead>
  );
}

export function RegisterHeadCell({
  children,
  align = "left",
  className = "",
}: {
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={`px-4 py-3 font-mono text-xs font-medium text-foreground-muted first:pl-0 last:pr-0 ${
        align === "right" ? "text-right" : "text-left"
      } ${className}`}
    >
      {children}
    </th>
  );
}

export function RegisterBody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function RegisterRow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <tr className={`border-b border-border last:border-b-0 hover:bg-surface ${className}`}>{children}</tr>;
}

export function RegisterCell({
  children,
  align = "left",
  mono = false,
  className = "",
}: {
  children: ReactNode;
  align?: "left" | "right";
  mono?: boolean;
  className?: string;
}) {
  return (
    <td
      className={`px-4 py-3 align-middle first:pl-0 last:pr-0 ${align === "right" ? "text-right" : "text-left"} ${
        mono ? "font-mono text-[0.9em] tabular-nums" : ""
      } ${className}`}
    >
      {children}
    </td>
  );
}
