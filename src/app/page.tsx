"use client";

import { FlowSpine } from "@/components/flow-spine";
import { Button, LinkButton } from "@/components/ui/button";
import { formatCo2e, formatInr, Stat } from "@/components/ui/stat";
import { useCarbonRecords } from "@/hooks/use-carbon-records";

export default function Home() {
  const ledger = useCarbonRecords();

  return (
    <div className="shell py-10 sm:py-14">
      <section aria-labelledby="ledger-state-heading" className="border-b border-border pb-10">
        <h1 id="ledger-state-heading" className="font-mono text-xs text-foreground-muted">
          Ledger state — live
        </h1>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-x-8 gap-y-6">
          <div className="flex flex-wrap gap-x-10 gap-y-4 sm:gap-x-14">
            {ledger.status === "loading" && <p className="text-sm text-foreground-secondary">Loading ledger…</p>}
            {ledger.status === "error" && <p className="text-sm text-error">Ledger data is currently unavailable.</p>}
            {ledger.status === "success" && (
              <>
                <Stat size="large" label="Net CO2e avoided" value={formatCo2e(ledger.totals.totalNetCo2eKg)} />
                <Stat
                  size="large"
                  label="Economic value created"
                  value={formatInr(ledger.totals.totalEconomicValueInr)}
                />
              </>
            )}
          </div>

          <LinkButton href="/waste-lots" variant="primary" className="shrink-0">
            Open Waste Lots
          </LinkButton>
        </div>

        {ledger.status === "error" && (
          <Button variant="secondary" className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        )}

        {ledger.status === "success" && ledger.totals.recordCount === 0 && (
          <p className="mt-4 text-sm text-foreground-secondary">
            No shipments have been completed yet — figures will populate as Carbon Ledger records are created.
          </p>
        )}
      </section>

      <section aria-labelledby="flow-heading" className="border-b border-border py-10">
        <h2 id="flow-heading" className="font-mono text-xs text-foreground-muted">
          How CarbonLoop works
        </h2>
        <FlowSpine />
      </section>

      <section className="max-w-xl pt-8">
        <p className="text-sm text-foreground-secondary">
          {ledger.status === "success"
            ? `Figures are derived from ${ledger.totals.recordCount} completed Carbon Ledger ${
                ledger.totals.recordCount === 1 ? "record" : "records"
              }. `
            : "Figures are derived from completed Carbon Ledger records. "}
          Carbon and economic coefficients are illustrative MVP assumptions, not verified real-world values.
        </p>
      </section>
    </div>
  );
}
