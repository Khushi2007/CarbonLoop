import { Mono } from "@/components/ui/mono";

export default function Home() {
  return (
    <div className="shell py-16">
      <p className="font-mono text-xs text-foreground-muted">
        <Mono>Overview</Mono> — foundation preview
      </p>
      <h1 className="mt-3 max-w-2xl text-4xl sm:text-5xl">CarbonLoop</h1>
      <p className="mt-4 max-w-xl text-foreground-secondary">
        GIS-powered waste-to-carbon-value chain tracker. This page is a placeholder for the
        Overview — it will carry the process explainer and live ledger totals.
      </p>
      <hr className="mt-10 border-border" />
    </div>
  );
}
