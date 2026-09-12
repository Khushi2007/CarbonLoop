export function formatCo2e(kg: number): string {
  if (Math.abs(kg) >= 1000) {
    return `${(kg / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })} t CO2e`;
  }
  return `${kg.toLocaleString(undefined, { maximumFractionDigits: 0 })} kg CO2e`;
}

export function formatInr(value: number): string {
  return value.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
}

export function Stat({
  label,
  value,
  size = "compact",
  className = "",
}: {
  label: string;
  value: string;
  size?: "compact" | "large";
  className?: string;
}) {
  return (
    <div className={className}>
      <p className={`font-mono tabular-nums text-foreground ${size === "large" ? "text-3xl sm:text-4xl" : "text-sm"}`}>
        {value}
      </p>
      <p className="mt-1 font-mono text-xs text-foreground-muted">{label}</p>
    </div>
  );
}
