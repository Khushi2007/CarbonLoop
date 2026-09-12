"use client";

import { Button } from "@/components/ui/button";
import { formatKm, formatTonnes } from "@/components/ui/format";
import { formatCo2e } from "@/components/ui/stat";
import type { CarbonState } from "@/hooks/use-carbon";

const COEFFICIENT_ROWS = [
  { key: "landfillBaseline", label: "Landfill baseline avoided" },
  { key: "carbonStored", label: "Carbon stored" },
  { key: "processEmissions", label: "Process emissions" },
  { key: "transportEmissions", label: "Transport emissions" },
] as const;

/** The carbon calculation presented as an auditable calculation sheet, not a dashboard statistic. */
export function CarbonEvidence({
  hasRoute,
  routeFacilityName,
  state,
  emphasize = true,
  onCalculate,
}: {
  hasRoute: boolean;
  routeFacilityName?: string;
  state: CarbonState;
  /** False once the workflow has moved past this stage (e.g. a shipment already exists) — demotes the action to secondary. */
  emphasize?: boolean;
  onCalculate: () => void;
}) {
  return (
    <section className="mt-8 border-t border-border pt-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-mono text-xs text-foreground-muted">04 — Carbon</h2>
        <Button
          variant={emphasize ? "primary" : "secondary"}
          onClick={onCalculate}
          disabled={!hasRoute || state.status === "loading"}
        >
          {state.status === "loading"
            ? "Calculating…"
            : state.status === "success"
              ? "Recalculate Carbon"
              : "Calculate Carbon"}
        </Button>
      </div>

      {state.status === "idle" && !hasRoute && (
        <p className="mt-4 text-sm text-foreground-secondary">
          Plan a route to a facility above before calculating carbon impact.
        </p>
      )}

      {state.status === "idle" && hasRoute && (
        <p className="mt-4 text-sm text-foreground-secondary">
          Calculate the carbon impact for the route to {routeFacilityName}.
        </p>
      )}

      {state.status === "loading" && <p className="mt-4 text-sm text-foreground-secondary">Calculating carbon impact…</p>}

      {state.status === "error" && (
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <p className="text-sm text-error">{state.message}</p>
          <Button variant="secondary" onClick={onCalculate}>
            Retry
          </Button>
        </div>
      )}

      {state.status === "success" && (
        <div className="mt-4 max-w-2xl">
          <dl className="grid grid-cols-2 gap-x-8 gap-y-3 border-b border-border pb-6">
            <div>
              <dt className="font-mono text-xs text-foreground-muted">Waste lot</dt>
              <dd className="mt-1 text-sm text-foreground">
                {state.result.wasteLot.wasteType} · {formatTonnes(state.result.wasteLot.quantityTonnes)}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-xs text-foreground-muted">Facility</dt>
              <dd className="mt-1 text-sm text-foreground">{state.result.facility.name}</dd>
            </div>
          </dl>

          <div className="mt-6">
            <h3 className="font-mono text-xs text-foreground-muted">Calculation</h3>
            <dl className="mt-3 divide-y divide-border border-y border-border text-sm">
              <div className="flex items-center justify-between py-2">
                <dt className="text-foreground-secondary">Waste quantity</dt>
                <dd className="font-mono text-foreground">{formatTonnes(state.result.carbon.wasteQuantityTonnes)}</dd>
              </div>
              <div className="flex items-center justify-between py-2">
                <dt className="text-foreground-secondary">Conversion pathway</dt>
                <dd className="font-mono text-foreground">{state.result.carbon.conversionPathway}</dd>
              </div>
              <div className="flex items-center justify-between py-2">
                <dt className="text-foreground-secondary">Conversion output</dt>
                <dd className="font-mono text-foreground">{formatTonnes(state.result.carbon.conversionOutputTonnes)}</dd>
              </div>
              <div className="flex items-center justify-between py-2">
                <dt className="text-foreground-secondary">Route distance</dt>
                <dd className="font-mono text-foreground">{formatKm(state.result.carbon.routeDistanceKm)}</dd>
              </div>
            </dl>
          </div>

          <div className="mt-6">
            <h3 className="font-mono text-xs text-foreground-muted">Coefficients</h3>
            <dl className="mt-3 divide-y divide-border border-y border-border text-sm">
              {COEFFICIENT_ROWS.map(({ key, label }) => {
                const coefficient = state.result.carbon.assumptions[key];
                return (
                  <div key={coefficient.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2">
                    <dt className="text-foreground-secondary">
                      {label} <span className="font-mono text-xs text-foreground-muted">({coefficient.assumption})</span>
                    </dt>
                    <dd className="font-mono text-foreground">
                      {coefficient.value.toLocaleString()} {coefficient.unit}
                    </dd>
                  </div>
                );
              })}
            </dl>
            <p className="mt-2 text-xs text-foreground-muted">
              Coefficients are illustrative MVP assumptions, not verified real-world emission factors.
            </p>
          </div>

          <div className="mt-6">
            <h3 className="font-mono text-xs text-foreground-muted">Result</h3>
            <dl className="mt-3 divide-y divide-border border-t border-border text-sm">
              <div className="flex items-center justify-between py-2">
                <dt className="text-foreground-secondary">Avoided landfill emissions</dt>
                <dd className="font-mono text-foreground">+{formatCo2e(state.result.carbon.avoidedLandfillEmissionsKgCo2e)}</dd>
              </div>
              <div className="flex items-center justify-between py-2">
                <dt className="text-foreground-secondary">Carbon stored</dt>
                <dd className="font-mono text-foreground">+{formatCo2e(state.result.carbon.carbonStoredKgCo2e)}</dd>
              </div>
              <div className="flex items-center justify-between py-2">
                <dt className="text-foreground-secondary">Process emissions</dt>
                <dd className="font-mono text-foreground">−{formatCo2e(state.result.carbon.processEmissionsKgCo2e)}</dd>
              </div>
              <div className="flex items-center justify-between py-2">
                <dt className="text-foreground-secondary">Transport emissions</dt>
                <dd className="font-mono text-foreground">−{formatCo2e(state.result.carbon.transportEmissionsKgCo2e)}</dd>
              </div>
              <div className="flex items-center justify-between border-t-2 border-border-strong py-3">
                <dt className="font-mono text-xs text-foreground-muted">Net CO2e benefit</dt>
                <dd className="font-mono text-2xl text-foreground">{formatCo2e(state.result.carbon.netCo2eBenefitKgCo2e)}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </section>
  );
}
