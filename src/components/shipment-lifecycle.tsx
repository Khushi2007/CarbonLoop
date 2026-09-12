"use client";

import { motion, useReducedMotion } from "motion/react";

import { Button, LinkButton } from "@/components/ui/button";
import { formatDateTime } from "@/components/ui/format";
import { StatusLabel } from "@/components/ui/status-label";
import type { ShipmentState } from "@/hooks/use-shipment";

/**
 * The shipment lifecycle: creating a shipment and completing it are two
 * distinct, explicit operations. Once completed, this intentionally does
 * NOT repeat the Phase 5 calculation sheet — it gives a concise confirmation
 * and a direct route into the permanent Carbon Ledger record.
 */
export function ShipmentLifecycle({
  hasCarbon,
  onCreate,
  state,
  onComplete,
}: {
  hasCarbon: boolean;
  onCreate: () => void;
  state: ShipmentState;
  onComplete: () => void;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="mt-8 border-t border-border pt-8">
      <h2 className="font-mono text-xs text-foreground-muted">05 — Shipment</h2>

      {state.status === "idle" && !hasCarbon && (
        <p className="mt-4 text-sm text-foreground-secondary">
          Calculate carbon impact above before creating a shipment.
        </p>
      )}

      {state.status === "idle" && hasCarbon && (
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <p className="text-sm text-foreground-secondary">Create a shipment for this waste lot and facility.</p>
          <Button variant="primary" onClick={onCreate}>
            Create Shipment
          </Button>
        </div>
      )}

      {state.status === "creating" && <p className="mt-4 text-sm text-foreground-secondary">Creating shipment…</p>}

      {state.status === "error" && (
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <p className="text-sm text-error">{state.message}</p>
          <Button variant="secondary" onClick={state.stage === "create" ? onCreate : onComplete}>
            Retry
          </Button>
        </div>
      )}

      {(state.status === "created" || state.status === "completing") && (
        <div className="mt-4">
          <dl className="flex flex-wrap items-baseline gap-x-8 gap-y-2">
            <div>
              <dt className="font-mono text-xs text-foreground-muted">Shipment</dt>
              <dd className="mt-1 font-mono text-sm text-foreground" title={state.shipment.id}>
                {state.shipment.id.slice(0, 8)}…
              </dd>
            </div>
            <div>
              <dt className="font-mono text-xs text-foreground-muted">Status</dt>
              <dd className="mt-1">
                <StatusLabel status={state.shipment.status} />
              </dd>
            </div>
            {state.shipment.scheduledAt && (
              <div>
                <dt className="font-mono text-xs text-foreground-muted">Scheduled</dt>
                <dd className="mt-1 font-mono text-sm text-foreground">{formatDateTime(state.shipment.scheduledAt)}</dd>
              </div>
            )}
          </dl>
          <Button variant="primary" className="mt-4" onClick={onComplete} disabled={state.status === "completing"}>
            {state.status === "completing" ? "Completing…" : "Complete Shipment"}
          </Button>
          <p className="mt-2 text-xs text-foreground-muted">
            Completing this shipment finalizes the operational record and generates a permanent Carbon Ledger entry.
          </p>
        </div>
      )}

      {state.status === "completed" && (
        <motion.div
          className="mt-4"
          initial={reduceMotion ? undefined : { opacity: 0, y: 6 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <p className="font-mono text-xs text-success">Completed</p>
          <p className="mt-1 font-mono text-sm text-foreground" title={state.shipment.id}>
            Shipment {state.shipment.id.slice(0, 8)}…
          </p>
          {state.shipment.completedAt && (
            <p className="mt-1 text-sm text-foreground-secondary">
              Completed {formatDateTime(state.shipment.completedAt)}
            </p>
          )}
          <p className="mt-1 text-sm text-foreground-secondary">Carbon record generated.</p>
          <LinkButton href={`/ledger/${state.carbonRecordId}`} variant="primary" className="mt-4">
            View ledger record →
          </LinkButton>
        </motion.div>
      )}
    </section>
  );
}
