"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { formatCoordinates, formatDate, formatTonnes } from "@/components/ui/format";
import { Register, RegisterBody, RegisterCell, RegisterHead, RegisterHeadCell, RegisterRow } from "@/components/ui/register";
import { StatusLabel } from "@/components/ui/status-label";
import { useWasteLots } from "@/hooks/use-waste-lots";

export default function WasteLotsPage() {
  const state = useWasteLots();
  const availableCount = state.status === "success" ? state.wasteLots.filter((lot) => lot.status === "AVAILABLE").length : 0;

  return (
    <div className="shell py-10 sm:py-14">
      <div className="border-b border-border pb-6">
        <h1 className="font-mono text-xs text-foreground-muted">Waste Lots — register</h1>
        <p className="mt-2 max-w-xl text-sm text-foreground-secondary">
          {state.status === "success"
            ? `${state.wasteLots.length} lot${state.wasteLots.length === 1 ? "" : "s"} on record — ${availableCount} available.`
            : "Every waste lot logged in CarbonLoop, regardless of status."}
        </p>
      </div>

      <div className="pt-8">
        {state.status === "loading" && <p className="text-sm text-foreground-secondary">Loading register…</p>}
        {state.status === "error" && (
          <div className="flex flex-wrap items-center gap-4">
            <p className="text-sm text-error">{state.message}</p>
            <Button variant="secondary" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        )}
        {state.status === "success" && state.wasteLots.length === 0 && (
          <p className="text-sm text-foreground-secondary">No waste lots have been logged yet.</p>
        )}

        {state.status === "success" && state.wasteLots.length > 0 && (
          <>
            <div className="hidden sm:block">
              <Register>
                <RegisterHead>
                  <RegisterHeadCell>ID</RegisterHeadCell>
                  <RegisterHeadCell>Waste type</RegisterHeadCell>
                  <RegisterHeadCell align="right">Quantity</RegisterHeadCell>
                  <RegisterHeadCell>Location</RegisterHeadCell>
                  <RegisterHeadCell>Available from</RegisterHeadCell>
                  <RegisterHeadCell>Status</RegisterHeadCell>
                  <RegisterHeadCell align="right">
                    <span className="sr-only">Action</span>
                  </RegisterHeadCell>
                </RegisterHead>
                <RegisterBody>
                  {state.wasteLots.map((lot) => (
                    <RegisterRow key={lot.id}>
                      <RegisterCell mono>
                        <span title={lot.id}>{lot.id.slice(0, 8)}…</span>
                      </RegisterCell>
                      <RegisterCell>{lot.wasteType}</RegisterCell>
                      <RegisterCell align="right" mono>
                        {formatTonnes(lot.quantityTonnes)}
                      </RegisterCell>
                      <RegisterCell mono>{formatCoordinates(lot.location.latitude, lot.location.longitude)}</RegisterCell>
                      <RegisterCell mono>{formatDate(lot.availableFrom)}</RegisterCell>
                      <RegisterCell>
                        <StatusLabel status={lot.status} />
                      </RegisterCell>
                      <RegisterCell align="right">
                        <Link href={`/waste-lots/${lot.id}`} className="font-mono text-xs text-accent hover:underline">
                          Open →
                        </Link>
                      </RegisterCell>
                    </RegisterRow>
                  ))}
                </RegisterBody>
              </Register>
            </div>

            <div className="sm:hidden">
              {state.wasteLots.map((lot) => (
                <Link
                  key={lot.id}
                  href={`/waste-lots/${lot.id}`}
                  className="block border-b border-border py-4 first:pt-0 last:border-b-0 hover:bg-surface"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="font-mono text-xs text-foreground-muted">{lot.id.slice(0, 8)}…</p>
                    <StatusLabel status={lot.status} />
                  </div>
                  <p className="mt-1 text-base text-foreground">{lot.wasteType}</p>
                  <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                    <div>
                      <dt className="text-foreground-muted">Quantity</dt>
                      <dd className="font-mono text-foreground-secondary">{formatTonnes(lot.quantityTonnes)}</dd>
                    </div>
                    <div>
                      <dt className="text-foreground-muted">Available from</dt>
                      <dd className="font-mono text-foreground-secondary">{formatDate(lot.availableFrom)}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-foreground-muted">Location</dt>
                      <dd className="font-mono text-foreground-secondary">
                        {formatCoordinates(lot.location.latitude, lot.location.longitude)}
                      </dd>
                    </div>
                  </dl>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
