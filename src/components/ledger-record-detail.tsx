"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { formatDateTime, formatDuration, formatKm, formatTonnes } from "@/components/ui/format";
import { formatCo2e, formatInr } from "@/components/ui/stat";
import { StatusLabel } from "@/components/ui/status-label";
import { useCarbonRecord } from "@/hooks/use-carbon-records";

/** A permanent, persisted record. Never recalculates anything — only ever displays what GET /api/carbon-records/[id] returns. */
export function LedgerRecordDetail({ id }: { id: string }) {
  const state = useCarbonRecord(id);
  const record = state.status === "success" ? state.record : undefined;

  return (
    <div className="shell py-10 sm:py-14">
      <p className="font-mono text-xs text-foreground-muted">
        <Link href="/ledger" className="hover:underline">
          Carbon Ledger
        </Link>{" "}
        / Record
      </p>

      {state.status === "loading" && <p className="mt-4 text-sm text-foreground-secondary">Loading record…</p>}

      {state.status === "error" && (
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <p className="text-sm text-error">{state.message}</p>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      )}

      {state.status === "not-found" && (
        <p className="mt-4 text-sm text-foreground-secondary">
          No ledger record found with this ID.{" "}
          <Link href="/ledger" className="text-accent hover:underline">
            Return to the ledger
          </Link>
          .
        </p>
      )}

      {record && (
        <>
          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-4 border-b border-border pb-6">
            <div>
              <h1 className="text-2xl text-foreground sm:text-3xl">{record.waste.type}</h1>
              <p className="mt-1 font-mono text-xs text-foreground-muted">{record.id}</p>
            </div>
            <StatusLabel status={record.logistics.shipmentStatus} className="text-sm" />
          </div>

          <div className="mt-6 border-b border-border pb-8">
            <p className="font-mono text-xs text-foreground-muted">Record identity</p>
            <dl className="mt-3 divide-y divide-border border-y border-border text-sm">
              <div className="flex items-center justify-between py-2">
                <dt className="text-foreground-secondary">Shipment ID</dt>
                <dd className="font-mono text-foreground">{record.shipmentId}</dd>
              </div>
              <div className="flex items-center justify-between py-2">
                <dt className="text-foreground-secondary">Waste lot ID</dt>
                <dd className="font-mono text-foreground">{record.waste.id}</dd>
              </div>
              <div className="flex items-center justify-between py-2">
                <dt className="text-foreground-secondary">Finalized</dt>
                <dd className="font-mono text-foreground">{formatDateTime(record.createdAt)}</dd>
              </div>
            </dl>
          </div>

          <div className="mt-8 border-b border-border pb-8">
            <p className="font-mono text-xs text-foreground-muted">Operational context</p>
            <dl className="mt-3 divide-y divide-border border-y border-border text-sm">
              <div className="flex items-center justify-between py-2">
                <dt className="text-foreground-secondary">Waste quantity</dt>
                <dd className="font-mono text-foreground">{formatTonnes(record.waste.quantityTonnes)}</dd>
              </div>
              <div className="flex items-center justify-between py-2">
                <dt className="text-foreground-secondary">Generator</dt>
                <dd className="font-mono text-foreground">
                  {record.waste.generator.name}
                  {record.waste.generator.organization ? ` · ${record.waste.generator.organization}` : ""}
                </dd>
              </div>
              <div className="flex items-center justify-between py-2">
                <dt className="text-foreground-secondary">Facility</dt>
                <dd className="font-mono text-foreground">
                  {record.conversion.facility.name} ({record.conversion.facility.facilityType})
                </dd>
              </div>
              <div className="flex items-center justify-between py-2">
                <dt className="text-foreground-secondary">Conversion pathway</dt>
                <dd className="font-mono text-foreground">{record.conversion.pathway}</dd>
              </div>
              <div className="flex items-center justify-between py-2">
                <dt className="text-foreground-secondary">Conversion output</dt>
                <dd className="font-mono text-foreground">{formatTonnes(record.conversion.outputTonnes)}</dd>
              </div>
              <div className="flex items-center justify-between py-2">
                <dt className="text-foreground-secondary">Route</dt>
                <dd className="font-mono text-foreground">
                  {formatKm(record.logistics.distanceKm)} · {formatDuration(record.logistics.durationMinutes)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-8 border-b border-border pb-8">
            <p className="font-mono text-xs text-foreground-muted">Carbon result</p>
            <dl className="mt-3 divide-y divide-border border-t border-border text-sm">
              <div className="flex items-center justify-between py-2">
                <dt className="text-foreground-secondary">Avoided landfill emissions</dt>
                <dd className="font-mono text-foreground">+{formatCo2e(record.carbon.avoidedLandfillEmissionsKgCo2e)}</dd>
              </div>
              <div className="flex items-center justify-between py-2">
                <dt className="text-foreground-secondary">Carbon stored</dt>
                <dd className="font-mono text-foreground">+{formatCo2e(record.carbon.carbonStoredKgCo2e)}</dd>
              </div>
              <div className="flex items-center justify-between py-2">
                <dt className="text-foreground-secondary">Process emissions</dt>
                <dd className="font-mono text-foreground">−{formatCo2e(record.carbon.processEmissionsKgCo2e)}</dd>
              </div>
              <div className="flex items-center justify-between py-2">
                <dt className="text-foreground-secondary">Transport emissions</dt>
                <dd className="font-mono text-foreground">−{formatCo2e(record.carbon.transportEmissionsKgCo2e)}</dd>
              </div>
              <div className="flex items-center justify-between border-t-2 border-border-strong py-3">
                <dt className="font-mono text-xs text-foreground-muted">Net CO2e benefit</dt>
                <dd className="font-mono text-2xl text-foreground">{formatCo2e(record.carbon.netCo2eBenefitKgCo2e)}</dd>
              </div>
            </dl>
            <p className="mt-2 text-xs text-foreground-muted">
              Carbon coefficients are illustrative MVP assumptions, not verified real-world emission factors.
            </p>
          </div>

          <div className="mt-8">
            <p className="font-mono text-xs text-foreground-muted">Economic value</p>
            <dl className="mt-3 divide-y divide-border border-t border-border text-sm">
              <div className="flex items-center justify-between py-2">
                <dt className="text-foreground-secondary">Transport cost</dt>
                <dd className="font-mono text-foreground">−{formatInr(record.economics.transportCostInr)}</dd>
              </div>
              <div className="flex items-center justify-between py-2">
                <dt className="text-foreground-secondary">Avoided landfill value</dt>
                <dd className="font-mono text-foreground">+{formatInr(record.economics.avoidedLandfillValueInr)}</dd>
              </div>
              <div className="flex items-center justify-between py-2">
                <dt className="text-foreground-secondary">Conversion output value</dt>
                <dd className="font-mono text-foreground">+{formatInr(record.economics.conversionOutputValueInr)}</dd>
              </div>
              <div className="flex items-center justify-between py-2">
                <dt className="text-foreground-secondary">Carbon-related value</dt>
                <dd className="font-mono text-foreground">+{formatInr(record.economics.carbonRelatedValueInr)}</dd>
              </div>
              <div className="flex items-center justify-between border-t-2 border-border-strong py-3">
                <dt className="font-mono text-xs text-foreground-muted">Estimated economic value</dt>
                <dd className="font-mono text-2xl text-foreground">{formatInr(record.economics.estimatedEconomicValueInr)}</dd>
              </div>
            </dl>
          </div>
        </>
      )}
    </div>
  );
}
