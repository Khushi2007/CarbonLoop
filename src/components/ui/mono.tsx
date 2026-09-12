import type { HTMLAttributes } from "react";

/** Inline treatment for IDs, coordinates, coefficients, and other data values outside a register cell. */
export function Mono({ children, className = "", ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={`font-mono tabular-nums ${className}`} {...props}>
      {children}
    </span>
  );
}
